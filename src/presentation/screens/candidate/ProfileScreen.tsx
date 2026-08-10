import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal, SafeAreaView, Dimensions } from 'react-native';
import { useMutation, useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as SecureStore from 'expo-secure-store';
import { apolloClient } from '../../../core/config/apollo';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { OBTENER_CANDIDATO } from '../../../data/datasources/graphql/queries';
import { ACTUALIZAR_CANDIDATO, READ_CV_FROM_IMAGE } from '../../../data/datasources/graphql/mutations';
import { useAuth } from '../../../core/context/AuthContext';

export default function ProfileScreen() {
  const { user } = useAuth();
  const client = apolloClient;
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
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

  // States de control de cámara y escaneo
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [aiDetectedNotification, setAiDetectedNotification] = useState(false);

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
      setAiDetectedNotification(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      refetch();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    }
  };

  // Función para abrir la cámara solicitando permisos
  const handleOpenScanner = async () => {
    if (!cameraPermission?.granted) {
      const permissionResult = await requestCameraPermission();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permiso Denegado', 
          'Se requiere acceso a la cámara para poder tomar una foto de la hoja de vida.'
        );
        return;
      }
    }
    setShowCamera(true);
  };

  // Capturar foto y enviar a FastAPI
  const captureAndExtract = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: false
      });

      setIsCapturing(false);
      setShowCamera(false);

      if (photo?.base64) {
        setIsExtracting(true);
        const token = await SecureStore.getItemAsync('auth_token');

        if (!token) {
          Alert.alert('Error', 'Sesión no válida. Inicia sesión de nuevo.');
          setIsExtracting(false);
          return;
        }

        // Llamar a FastAPI pasando el Base64 y el token JWT
        const base64Data = `data:image/jpeg;base64,${photo.base64}`;
        
        const { data: extractionData } = await client.mutate<any, any>({
          mutation: READ_CV_FROM_IMAGE,
          variables: {
            imageBase64: base64Data,
            token: token
          }
        });

        setIsExtracting(false);

        const result = extractionData?.readCvFromImage;
        if (result && result.success) {
          // Autocompletar estados de Datos Personales
          if (result.nombre) setNombre(result.nombre);
          if (result.apellido) setApellido(result.apellido);
          if (result.email) setEmail(result.email);
          if (result.sueldoEsperado) setSueldoEsperado(String(result.sueldoEsperado));
          if (result.modalidadPreferida) setModalidadPreferida(result.modalidadPreferida);
          if (result.nivelEducativo) setNivelEducativo(result.nivelEducativo);
          if (result.nacionalidad) setNacionalidad(result.nacionalidad);

          setAiDetectedNotification(true);
          Alert.alert('Escaneo Exitoso', 'La IA ha extraído los datos de tu hoja de vida. Revisa y edita los campos antes de guardar.');
        } else {
          Alert.alert('Error en extracción', result?.message || 'No se pudieron extraer datos del CV.');
        }
      } else {
        Alert.alert('Error', 'No se pudo obtener la captura de la cámara.');
      }
    } catch (err: any) {
      console.error(err);
      setIsCapturing(false);
      setIsExtracting(false);
      Alert.alert('Error', 'Error al procesar la imagen con el servicio de IA.');
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
        
        {/* Tarjeta del Asistente de IA */}
        <View style={styles.scannerHeaderCard}>
          <View style={styles.scannerCardInfo}>
            <Ionicons name="sparkles" size={28} color="#E2E8F0" />
            <View style={styles.scannerTextContainer}>
              <Text style={styles.scannerCardTitle}>Asistente de IA</Text>
              <Text style={styles.scannerCardDesc}>Escanea una foto de tu CV impreso o en papel para autocompletar tu perfil con un toque de IA.</Text>
            </View>
          </View>
          <Pressable 
            style={({ pressed }) => [styles.scanBtn, pressed && styles.scanBtnPressed]}
            onPress={handleOpenScanner}
          >
            <Ionicons name="camera" size={20} color={Colors.textWhite} style={{ marginRight: Spacing.xs }} />
            <Text style={styles.scanBtnText}>Escanear CV</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Personales</Text>

          {aiDetectedNotification && (
            <View style={styles.aiNotification}>
              <Ionicons name="sparkles" size={16} color={Colors.primary} />
              <Text style={styles.aiNotificationText}>La IA rellenó los datos de la hoja de vida. ¿Deseas guardarlos?</Text>
            </View>
          )}
          
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

      {/* Modal Visor de Cámara */}
      <Modal visible={showCamera} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <Pressable style={styles.closeCameraButton} onPress={() => setShowCamera(false)} disabled={isCapturing}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
            <Text style={styles.cameraTitle}>Escaneo de CV</Text>
            <View style={{ width: 40 }} />
          </View>

          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            mode="picture"
          />

          {/* Guía rectangular del documento */}
          <View style={styles.cameraOverlay} pointerEvents="none">
            <View style={styles.documentGuide} />
            <Text style={styles.guideText}>Encuadra tu hoja de vida dentro del marco</Text>
          </View>

          <View style={styles.cameraFooter}>
            <Pressable
              style={styles.recordButton}
              onPress={captureAndExtract}
              disabled={isCapturing}
            >
              <View style={styles.recordInner} />
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal de Carga de IA */}
      <Modal visible={isExtracting} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingOverlayText}>Procesando currículum con Inteligencia Artificial...</Text>
            <Text style={styles.loadingOverlaySubtext}>Extrayendo datos de la imagen Base64</Text>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

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
  },
  // Asistente IA / Scanner Styles
  scannerHeaderCard: {
    backgroundColor: '#1E293B', // Dark charcoal/slate
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#334155',
    ...Shadows.md,
  },
  scannerCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scannerTextContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  scannerCardTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  scannerCardDesc: {
    fontSize: FontSize.xs,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
  scanBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    ...Shadows.button,
  },
  scanBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  scanBtnText: {
    color: Colors.textWhite,
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  aiNotification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryFaded,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },
  aiNotificationText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    fontWeight: '600',
    flex: 1,
  },
  // Camera Modal Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: Spacing.xl + (Platform.OS === 'ios' ? 20 : 0),
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 20,
  },
  closeCameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTitle: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  camera: {
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  documentGuide: {
    width: '92%',
    height: '76%',
    borderWidth: 2.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent',
  },
  guideText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: Spacing.md,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 20,
  },
  recordButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  // Loading overlay
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '80%',
    ...Shadows.lg,
  },
  loadingOverlayText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  loadingOverlaySubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  }
});
