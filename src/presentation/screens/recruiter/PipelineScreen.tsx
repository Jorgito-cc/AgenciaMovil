import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Alert, Linking, ScrollView } from 'react-native';
import { useQuery, useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { LISTAR_POSTULACIONES } from '../../../data/datasources/graphql/queries';
import { ACTUALIZAR_POSTULACION, PREDECIR_EXITO_POSTULACION } from '../../../data/datasources/graphql/mutations';
import { useAuth } from '../../../core/context/AuthContext';
import { apolloClient } from '../../../core/config/apollo';
import { gql } from '@apollo/client';

const OBTENER_LINK_DOCUMENTO = gql`
  query ObtenerLinkDocumento($documentoId: String!, $usuarioId: String!) {
    obtenerLinkDocumento(documentoId: $documentoId, usuarioId: $usuarioId)
  }
`;

type TabType = 'Recibido' | 'Entrevista' | 'Evaluación' | 'Contratado' | 'Rechazado';

export default function PipelineScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('Recibido');
  const [predictingId, setPredictingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data, loading, refetch } = useQuery<any>(LISTAR_POSTULACIONES, {
    context: { clientName: 'springboot' },
    fetchPolicy: 'network-only'
  });

  const [actualizarPostulacion] = useMutation<any, any>(ACTUALIZAR_POSTULACION, {
    context: { clientName: 'springboot' }
  });

  const [predecirExito, { loading: predicting }] = useMutation<any, any>(PREDECIR_EXITO_POSTULACION, {
    context: { clientName: 'springboot' }
  });

  // Filter applications by offers that belong to this recruiter
  const myApplicants = data?.listarPostulaciones?.filter((p: any) => 
    !p.oferta?.reclutador || 
    !p.oferta?.reclutador?.id || 
    p.oferta?.reclutador?.id === user?.id
  ) || [];

  // Get phase count for tab headers
  const getPhaseCount = (tab: TabType): number => {
    return myApplicants.filter((p: any) => {
      const phase = p.fase_alcanzada || 'Recibido';
      if (tab === 'Recibido') return phase === 'Recibido';
      if (tab === 'Entrevista') return phase === 'Entrevista';
      if (tab === 'Evaluación') return phase === 'Prueba Técnica' || phase === 'Evaluación';
      if (tab === 'Contratado') return phase === 'Contratado' || phase === 'Aceptado';
      if (tab === 'Rechazado') return phase === 'Rechazado';
      return false;
    }).length;
  };

  // Filter candidates specifically in the active tab/stage
  const activeApplicants = myApplicants.filter((p: any) => {
    const phase = p.fase_alcanzada || 'Recibido';
    if (activeTab === 'Recibido') return phase === 'Recibido';
    if (activeTab === 'Entrevista') return phase === 'Entrevista';
    if (activeTab === 'Evaluación') return phase === 'Prueba Técnica' || phase === 'Evaluación';
    if (activeTab === 'Contratado') return phase === 'Contratado' || phase === 'Aceptado';
    if (activeTab === 'Rechazado') return phase === 'Rechazado';
    return false;
  });

  const handleUpdatePhase = (postulacion: any) => {
    const phaseOptions = [
      { label: 'Recibido', value: 'Recibido' },
      { label: 'Entrevista', value: 'Entrevista' },
      { label: 'Evaluación (Prueba Técnica)', value: 'Prueba Técnica' },
      { label: 'Contratado', value: 'Contratado' },
      { label: 'Rechazado', value: 'Rechazado' }
    ];
    
    Alert.alert(
      'Mover Candidato',
      `Selecciona la nueva etapa de selección para ${postulacion.candidato?.nombre || 'el candidato'}`,
      [
        ...phaseOptions.map(opt => ({
          text: opt.label,
          onPress: async () => {
            try {
              await actualizarPostulacion({
                variables: {
                  id: postulacion.id,
                  faseAlcanzada: opt.value,
                  idCv: postulacion.id_cv,
                  candidatoId: postulacion.candidato?.id,
                  ofertaId: postulacion.oferta?.id
                }
              });
              refetch();
              Alert.alert('Éxito', `Candidato movido a la etapa de ${opt.label}`);
            } catch(e: any) {
              Alert.alert('Error', e.message);
            }
          }
        })),
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handlePredict = async (postulacionId: string) => {
    setPredictingId(postulacionId);
    try {
      const { data } = await predecirExito({ variables: { id: postulacionId } });
      Alert.alert('Predicción de IA', `El resultado de Random Forest es: ${data.predecirExitoPostulacion}`);
    } catch(e: any) {
      Alert.alert('Error de IA', e.message);
    } finally {
      setPredictingId(null);
    }
  };

  const handleDownloadCv = async (cvId: string) => {
    if (!cvId) {
      Alert.alert('Error', 'El candidato no adjuntó un CV.');
      return;
    }
    
    setDownloadingId(cvId);
    try {
      const { data } = await apolloClient.query<any>({
        query: OBTENER_LINK_DOCUMENTO,
        variables: { documentoId: cvId, usuarioId: user?.id },
        context: { clientName: 'nestjs' },
        fetchPolicy: 'network-only'
      });
      
      const link = data?.obtenerLinkDocumento;
      if (link) {
        Linking.openURL(link);
      } else {
        throw new Error("Link no generado");
      }
    } catch(e: any) {
      Alert.alert('Error Descarga', 'No se pudo obtener el link del CV de NestJS/S3. ' + e.message);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  const tabs: TabType[] = ['Recibido', 'Entrevista', 'Evaluación', 'Contratado', 'Rechazado'];

  return (
    <View style={styles.container}>
      {/* Funnel Segment Tab Bar */}
      <View style={styles.tabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {tabs.map((tab) => {
            const count = getPhaseCount(tab);
            const isActive = activeTab === tab;
            return (
              <Pressable 
                key={tab} 
                onPress={() => setActiveTab(tab)} 
                style={[styles.tabButton, isActive && styles.tabButtonActive, getTabColorBorder(tab, isActive)]}
              >
                <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive, getTabColorText(tab, isActive)]}>
                  {tab} <Text style={styles.tabCountText}>({count})</Text>
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Candidate List in current stage */}
      <FlatList
        data={activeApplicants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.title}>{item.candidato?.nombre} {item.candidato?.apellido}</Text>
                <Text style={styles.subtitle}>Aplica a: {item.oferta?.titulo}</Text>
              </View>
              <Pressable onPress={() => handleUpdatePhase(item)} style={styles.moveBadge}>
                <Ionicons name="git-compare-outline" size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.moveBadgeText}>Mover etapa</Text>
              </Pressable>
            </View>

            {/* Candidate Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={14} color={Colors.textSecondary} style={styles.detailIcon} />
                <Text style={styles.detailText}>{item.candidato?.email || 'No especificado'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="school-outline" size={14} color={Colors.textSecondary} style={styles.detailIcon} />
                <Text style={styles.detailText}>Estudios: {item.candidato?.nivel_educativo || 'No especificado'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={14} color={Colors.textSecondary} style={styles.detailIcon} />
                <Text style={styles.detailText}>Pretensión: ${item.candidato?.sueldo_esperado || '0'} USD</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="briefcase-outline" size={14} color={Colors.textSecondary} style={styles.detailIcon} />
                <Text style={styles.detailText}>Modalidad: {item.candidato?.modalidad_preferida || 'No especificada'}</Text>
              </View>
            </View>

            {/* Actions: CV & Match Prediction */}
            <View style={styles.actions}>
              <Pressable 
                style={[styles.actionBtn, styles.downloadBtn]}
                onPress={() => handleDownloadCv(item.id_cv)}
                disabled={downloadingId === item.id_cv}
              >
                {downloadingId === item.id_cv ? <ActivityIndicator size="small" color={Colors.textWhite} /> : (
                  <>
                    <Ionicons name="document-text" size={16} color={Colors.textWhite} />
                    <Text style={styles.btnTextWhite}>Ver CV</Text>
                  </>
                )}
              </Pressable>

              <Pressable 
                style={[styles.actionBtn, styles.aiBtn]}
                onPress={() => handlePredict(item.id)}
                disabled={predictingId === item.id}
              >
                {predictingId === item.id ? <ActivityIndicator size="small" color={Colors.textWhite} /> : (
                  <>
                    <Ionicons name="flash" size={16} color={Colors.textWhite} />
                    <Text style={styles.btnTextWhite}>Predecir Match</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons 
                name={activeTab === 'Contratado' ? "checkmark-circle-outline" : "folder-open-outline"} 
                size={48} 
                color={Colors.textTertiary} 
              />
            </View>
            <Text style={styles.emptyText}>
              {activeTab === 'Contratado' ? 'Sin contrataciones' : 'Sin postulantes'}
            </Text>
            <Text style={styles.emptySubtext}>
              No hay candidatos en la etapa de {activeTab.toLowerCase()} en este momento.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const getTabColorBorder = (tab: TabType, isActive: boolean) => {
  if (!isActive) return {};
  switch (tab) {
    case 'Recibido': return { borderBottomColor: '#6B7280' };
    case 'Entrevista': return { borderBottomColor: '#3B82F6' };
    case 'Evaluación': return { borderBottomColor: '#F59E0B' };
    case 'Contratado': return { borderBottomColor: '#10B981' };
    case 'Rechazado': return { borderBottomColor: '#EF4444' };
  }
};

const getTabColorText = (tab: TabType, isActive: boolean) => {
  if (!isActive) return {};
  switch (tab) {
    case 'Recibido': return { color: '#374151' };
    case 'Entrevista': return { color: '#2563EB' };
    case 'Evaluación': return { color: '#D97706' };
    case 'Contratado': return { color: '#059669' };
    case 'Rechazado': return { color: '#DC2626' };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  tabBarContainer: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tabScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.xs,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderBottomWidth: 3,
  },
  tabButtonText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    fontWeight: 'bold',
  },
  tabCountText: {
    fontSize: FontSize.xs,
    opacity: 0.7,
  },

  list: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  card: { backgroundColor: Colors.card, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#E5E7EB', ...Shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  title: { fontSize: FontSize.md, fontWeight: 'bold', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  
  moveBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primaryFaded, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border
  },
  moveBadgeText: { fontSize: FontSize.xs - 2, fontWeight: 'bold', color: Colors.primary },
  
  detailsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 8,
    width: 16,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },

  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.sm, borderRadius: BorderRadius.md, gap: 6 },
  downloadBtn: { backgroundColor: Colors.info },
  aiBtn: { backgroundColor: Colors.warning },
  btnTextWhite: { color: Colors.textWhite, fontWeight: 'bold', fontSize: FontSize.sm },

  // Empty funnel styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md + 2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  }
});
