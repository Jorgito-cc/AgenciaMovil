import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useQuery, useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { LISTAR_OFERTAS, LISTAR_CATEGORIAS } from '../../../data/datasources/graphql/queries';
import { CREAR_OFERTA, ELIMINAR_OFERTA, CLASIFICAR_OFERTA_ML } from '../../../data/datasources/graphql/mutations';
import { useAuth } from '../../../core/context/AuthContext';

export default function RecruiterDashboardScreen() {
  const { user } = useAuth();
  
  const { data, loading, error, refetch } = useQuery<any>(LISTAR_OFERTAS, {
    context: { clientName: 'springboot' },
    fetchPolicy: 'network-only'
  });

  const { data: categoriesData } = useQuery<any>(LISTAR_CATEGORIAS, {
    context: { clientName: 'springboot' }
  });

  const [crearOferta, { loading: creating }] = useMutation<any, any>(CREAR_OFERTA, {
    context: { clientName: 'springboot' }
  });
  
  const [eliminarOferta] = useMutation<any, any>(ELIMINAR_OFERTA, {
    context: { clientName: 'springboot' }
  });

  const [clasificarOferta] = useMutation<any, any>(CLASIFICAR_OFERTA_ML, {
    context: { clientName: 'springboot' }
  });

  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sueldo, setSueldo] = useState('');
  const [modalidadTrabajo, setModalidadTrabajo] = useState('Presencial');
  const [contrato, setContrato] = useState('Indefinido');
  const [requisitos, setRequisitos] = useState('');
  const [experienciaTiempo, setExperienciaTiempo] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [estado, setEstado] = useState('ACTIVO');

  // Filter offers by recruiter ID (or fallback if reclutador is null)
  const myOffers = data?.listarOfertas?.filter((o: any) => 
    !o.reclutador || 
    !o.reclutador.id || 
    o.reclutador.id === user?.id
  ) || [];

  const handleCreate = async () => {
    if (!titulo || !descripcion || !sueldo || !categoriaId) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios (Título, Descripción, Sueldo y Categoría)');
      return;
    }
    
    try {
      const res = await crearOferta({
        variables: {
          titulo,
          descripcion,
          sueldo: parseFloat(sueldo) || 0,
          modalidadTrabajo,
          estado,
          contrato: contrato || null,
          requisitos: requisitos || null,
          experienciaTiempo: parseInt(experienciaTiempo) || 0,
          categoriaId: categoriaId || null,
          reclutadorId: user?.id
        }
      });
      
      const newId = res.data?.crearOferta?.id;
      
      // Reset form
      setTitulo('');
      setDescripcion('');
      setSueldo('');
      setModalidadTrabajo('Presencial');
      setContrato('Indefinido');
      setRequisitos('');
      setExperienciaTiempo('');
      setCategoriaId('');
      setEstado('ACTIVO');
      setModalVisible(false);
      
      if (newId) {
        try {
          const classifRes = await clasificarOferta({ variables: { id: newId } });
          const cluster = classifRes.data?.clasificarOferta;
          Alert.alert('Éxito', `Vacante creada y clasificada automáticamente en el Clúster ${cluster !== null && cluster !== undefined ? cluster : 'Pendiente'}`);
        } catch (err) {
          Alert.alert('Éxito', 'Vacante creada con éxito (clasificación de clúster pendiente)');
        }
      } else {
        Alert.alert('Éxito', 'Vacante creada con éxito');
      }
      refetch();
    } catch(e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar Oferta', '¿Seguro que deseas eliminar esta oferta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await eliminarOferta({ variables: { id } });
          refetch();
          Alert.alert('Éxito', 'Oferta eliminada con éxito');
        } catch(e: any) {
          Alert.alert('Error', e.message);
        }
      }}
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const categoriesList = categoriesData?.listarCategorias || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Ofertas ({myOffers.length})</Text>
        <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={Colors.textWhite} />
        </Pressable>
      </View>

      <FlatList
        data={myOffers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Header with Title and Actions */}
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.title}>{item.titulo}</Text>
                {item.categoria?.nombre && (
                  <Text style={styles.categoryBadge}>{item.categoria.nombre}</Text>
                )}
              </View>
              <View style={styles.headerRight}>
                <View style={[styles.statusBadge, item.estado === 'ACTIVO' ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusBadgeText, item.estado === 'ACTIVO' ? styles.statusActiveText : styles.statusInactiveText]}>
                    {item.estado || 'INACTIVO'}
                  </Text>
                </View>
                <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </Pressable>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description} numberOfLines={3}>{item.descripcion}</Text>
            
            {/* Requirements */}
            {item.requisitos ? (
              <View style={styles.requisitosContainer}>
                <Text style={styles.sectionTitle}>Requisitos:</Text>
                <Text style={styles.requisitosText} numberOfLines={2}>{item.requisitos}</Text>
              </View>
            ) : null}

            {/* Detail Grid */}
            <View style={styles.detailGrid}>
              <View style={styles.gridItem}>
                <Ionicons name="cash-outline" size={14} color={Colors.textSecondary} style={styles.gridIcon} />
                <Text style={styles.gridText}>${item.sueldo || '0'} USD</Text>
              </View>
              <View style={styles.gridItem}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} style={styles.gridIcon} />
                <Text style={styles.gridText}>{item.modalidad_trabajo || 'No especificada'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Ionicons name="document-text-outline" size={14} color={Colors.textSecondary} style={styles.gridIcon} />
                <Text style={styles.gridText}>{item.contrato || 'No especificado'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Ionicons name="briefcase-outline" size={14} color={Colors.textSecondary} style={styles.gridIcon} />
                <Text style={styles.gridText}>{item.experiencia_tiempo ? `${item.experiencia_tiempo} años exp.` : 'Sin exp.'}</Text>
              </View>
            </View>

            {/* ML Segment Cluster */}
            <View style={styles.mlSegment}>
              <Ionicons name="flash-outline" size={14} color="#6366F1" style={{ marginRight: 6 }} />
              <Text style={styles.mlSegmentText}>
                Clúster IA: <Text style={{ fontWeight: 'bold' }}>{item.cluster_id !== null && item.cluster_id !== undefined ? `Clúster ${item.cluster_id}` : 'Pendiente'}</Text>
              </Text>
            </View>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Oferta</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>
            
            <ScrollView style={{width: '100%'}} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
              <Text style={styles.inputLabel}>Título de la Vacante *</Text>
              <TextInput style={styles.input} placeholder="Ej: Desarrollador React Native" value={titulo} onChangeText={setTitulo} />
              
              <Text style={styles.inputLabel}>Descripción Detallada *</Text>
              <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} placeholder="Detalla las responsabilidades..." multiline value={descripcion} onChangeText={setDescripcion} />

              <Text style={styles.inputLabel}>Requisitos Clave</Text>
              <TextInput style={[styles.input, {height: 60, textAlignVertical: 'top'}]} placeholder="Ej: 3 años de experiencia en JS, GraphQL..." multiline value={requisitos} onChangeText={setRequisitos} />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: Spacing.xs }}>
                  <Text style={styles.inputLabel}>Sueldo Mensual (USD) *</Text>
                  <TextInput style={styles.input} placeholder="Ej: 1500" keyboardType="numeric" value={sueldo} onChangeText={setSueldo} />
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.xs }}>
                  <Text style={styles.inputLabel}>Tipo de Contrato</Text>
                  <TextInput style={styles.input} placeholder="Ej: Indefinido" value={contrato} onChangeText={setContrato} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: Spacing.xs }}>
                  <Text style={styles.inputLabel}>Experiencia (Años)</Text>
                  <TextInput style={styles.input} placeholder="Ej: 2" keyboardType="numeric" value={experienciaTiempo} onChangeText={setExperienciaTiempo} />
                </View>
                <View style={{ flex: 1, marginLeft: Spacing.xs }}>
                  <Text style={styles.inputLabel}>Modalidad</Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
                      {['Presencial', 'Remoto', 'Hibrido'].map(mod => (
                        <Pressable key={mod} onPress={() => setModalidadTrabajo(mod)} style={[styles.selectorBtn, modalidadTrabajo === mod && styles.selectorBtnActive]}>
                          <Text style={[styles.selectorBtnText, modalidadTrabajo === mod && styles.selectorBtnTextActive]}>{mod}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Categoría *</Text>
              <View style={styles.pickerContainer}>
                {categoriesList.length === 0 ? (
                  <Text style={{ color: Colors.textSecondary, padding: Spacing.sm }}>Cargando categorías...</Text>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
                    {categoriesList.map((cat: any) => (
                      <Pressable key={cat.id} onPress={() => setCategoriaId(cat.id)} style={[styles.selectorBtn, categoriaId === cat.id && styles.selectorBtnActive]}>
                        <Text style={[styles.selectorBtnText, categoriaId === cat.id && styles.selectorBtnTextActive]}>{cat.nombre}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>

              <Text style={styles.inputLabel}>Estado de Publicación</Text>
              <View style={styles.selectorRow}>
                {['ACTIVO', 'INACTIVO'].map(est => (
                  <Pressable key={est} onPress={() => setEstado(est)} style={[styles.selectorBtn, { flex: 1 }, estado === est && styles.selectorBtnActive]}>
                    <Text style={[styles.selectorBtnText, estado === est && styles.selectorBtnTextActive]}>{est === 'ACTIVO' ? 'Activo (Visible)' : 'Inactivo (Oculto)'}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, {backgroundColor: Colors.border}]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, {backgroundColor: Colors.primary}]} onPress={handleCreate} disabled={creating}>
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={[styles.btnText, {color: '#fff'}]}>Publicar Oferta</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.textPrimary },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40, height: 40,
    borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    ...Shadows.sm
  },
  list: { padding: Spacing.md, gap: Spacing.md },
  card: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xs },
  title: { fontSize: FontSize.md, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 2 },
  categoryBadge: {
    fontSize: FontSize.xs - 2,
    color: Colors.primary,
    backgroundColor: Colors.primaryFaded,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    overflow: 'hidden'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: FontSize.xs - 2,
    fontWeight: 'bold',
  },
  statusActive: {
    backgroundColor: '#DEF7EC',
  },
  statusActiveText: {
    color: '#03543F',
  },
  statusInactive: {
    backgroundColor: '#FDE8E8',
  },
  statusInactiveText: {
    color: '#9B1C1C',
  },
  deleteBtn: { padding: Spacing.xs },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, marginVertical: Spacing.sm },
  
  requisitosContainer: {
    backgroundColor: '#F9FAFB',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  requisitosText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  detailGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: Spacing.sm, 
    marginBottom: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gridIcon: {
    marginRight: 4,
  },
  gridText: { 
    fontSize: FontSize.xs, 
    color: Colors.textSecondary, 
    fontWeight: '600' 
  },
  mlSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignSelf: 'flex-start',
  },
  mlSegmentText: {
    fontSize: FontSize.xs,
    color: '#4F46E5',
  },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: { fontSize: FontSize.xl, fontWeight: 'bold' },
  closeBtn: {
    padding: Spacing.xs,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: FontSize.md,
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    marginBottom: Spacing.sm,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  selectorBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaded,
  },
  selectorBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  selectorBtnTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.lg },
  btn: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', marginHorizontal: Spacing.xs },
  btnText: { fontWeight: 'bold', fontSize: FontSize.md }
});
