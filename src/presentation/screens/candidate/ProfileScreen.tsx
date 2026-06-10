import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { OBTENER_CANDIDATO } from '../../../data/datasources/graphql/queries';
import { ACTUALIZAR_CANDIDATO } from '../../../data/datasources/graphql/mutations';
import { useAuth } from '../../../core/context/AuthContext';

export default function ProfileScreen() {
  const { user } = useAuth();
  
  const { data, loading, error, refetch } = useQuery<any>(OBTENER_CANDIDATO, {
    variables: { id: user?.id },
    context: { clientName: 'springboot' },
    skip: !user?.id
  });

  const [actualizarCandidato, { loading: updating }] = useMutation<any, any>(ACTUALIZAR_CANDIDATO, {
    context: { clientName: 'springboot' }
  });

  // State
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [sueldoEsperado, setSueldoEsperado] = useState('');
  const [modalidadPreferida, setModalidadPreferida] = useState('');
  const [nivelEducativo, setNivelEducativo] = useState('');
  const [nacionalidad, setNacionalidad] = useState('');

  useEffect(() => {
    if (data?.obtenerCandidato) {
      const c = data.obtenerCandidato;
      setNombre(c.nombre || '');
      setApellido(c.apellido || '');
      setEmail(c.email || '');
      setSueldoEsperado(c.sueldo_esperado ? String(c.sueldo_esperado) : '');
      setModalidadPreferida(c.modalidad_preferida || '');
      setNivelEducativo(c.nivel_educativo || '');
      setNacionalidad(c.nacionalidad || '');
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await actualizarCandidato({
        variables: {
          id: user?.id,
          nombre,
          apellido,
          email,
          sueldoEsperado: parseFloat(sueldoEsperado) || 0,
          modalidadPreferida,
          nivelEducativo,
          nacionalidad,
          estado: 'Activo'
        }
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      refetch();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error al cargar el perfil</Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Personales</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput style={styles.input} value={apellido} onChangeText={setApellido} />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nacionalidad</Text>
            <TextInput style={styles.input} value={nacionalidad} onChangeText={setNacionalidad} placeholder="Ej. Boliviano" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expectativas Laborales</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sueldo Esperado (USD)</Text>
            <TextInput style={styles.input} value={sueldoEsperado} onChangeText={setSueldoEsperado} keyboardType="numeric" placeholder="Ej. 1500" />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modalidad Preferida</Text>
            <TextInput style={styles.input} value={modalidadPreferida} onChangeText={setModalidadPreferida} placeholder="Remoto, Híbrido, Presencial" />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nivel Educativo</Text>
            <TextInput style={styles.input} value={nivelEducativo} onChangeText={setNivelEducativo} placeholder="Ej. Licenciatura, Maestría" />
          </View>
        </View>

        <Pressable 
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
          onPress={handleSave}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <Text style={styles.saveText}>Guardar Cambios</Text>
          )}
        </Pressable>
        
        {/* Placeholder for Skills Management */}
        <View style={styles.skillsBanner}>
          <Ionicons name="code-working" size={24} color={Colors.primary} />
          <View style={{flex: 1, marginLeft: Spacing.sm}}>
            <Text style={styles.skillsTitle}>Mis Habilidades</Text>
            <Text style={styles.skillsDesc}>Añade tus destrezas técnicas para mejorar tu nivel de compatibilidad con las ofertas.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.button,
  },
  saveBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  saveText: {
    color: Colors.textWhite,
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  retryBtn: {
    padding: Spacing.sm,
    backgroundColor: Colors.primaryFaded,
    borderRadius: BorderRadius.sm,
  },
  retryText: {
    color: Colors.primary,
  },
  skillsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryFaded,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  skillsTitle: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  skillsDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  }
});
