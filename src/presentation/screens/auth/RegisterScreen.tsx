import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client/react';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { REGISTER_USER_WITH_VIDEO } from '../../../data/datasources/graphql/mutations';

interface Props {
  navigation?: any;
}

export default function RegisterScreen({ navigation }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 2;

  // Form fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Biometric capture state
  const [videoCaptured, setVideoCaptured] = useState(false);
  const [videoBase64, setVideoBase64] = useState('');
  const [videoFrames, setVideoFrames] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // GraphQL
  const [registerUser, { loading }] = useMutation<any, any>(REGISTER_USER_WITH_VIDEO);

  const validateStep1 = (): boolean => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Ingresa tu nombre');
      return false;
    }
    if (!apellido.trim()) {
      Alert.alert('Error', 'Ingresa tu apellido');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    if (!telefono.trim()) {
      Alert.alert('Error', 'Ingresa tu número de teléfono');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCaptureVideo = async () => {
    if (!cameraPermission?.granted) {
      await requestCameraPermission();
    }

    if (cameraPermission?.granted) {
      setShowCamera(true);
    } else {
      Alert.alert('Permisos requeridos', 'Necesitamos acceso a la cámara para la verificación facial.');
    }
  };

  const startCapturing = async () => {
    if (!cameraRef.current) return;
    try {
      setIsRecording(true);
      setCaptureProgress(0);

      // Iniciar grabación de video de 3 segundos
      const videoRecordPromise = cameraRef.current.recordAsync({
        maxDuration: 3,
      });

      // Simular progreso de 3 segundos en UI
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCaptureProgress(i + 1);
      }

      const videoData = await videoRecordPromise;
      setIsRecording(false);
      setShowCamera(false);

      if (videoData?.uri) {
        // Leer el archivo de video y convertirlo a Base64
        const base64Video = await FileSystem.readAsStringAsync(videoData.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // En la opción B mandamos el video en videoBase64 y frames vacíos
        setVideoBase64(base64Video);
        setVideoFrames([]);
        setVideoCaptured(true);
        Alert.alert('Éxito', 'Video de verificación grabado con éxito.');
      } else {
        Alert.alert('Error', 'No se pudo obtener el archivo de video. Intenta de nuevo.');
      }
    } catch (e: any) {
      console.error("Error grabando video:", e);
      setIsRecording(false);
      Alert.alert('Error', `No se pudo grabar el video: ${e?.message || e}`);
    }
  };

  const handleRegister = async () => {
    if (!videoCaptured) {
      Alert.alert('Error', 'Debes grabar el video de verificación facial antes de registrarte');
      return;
    }

    try {
      const { data } = await registerUser({
        variables: {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          password,
          telefono: telefono.trim(),
          videoBase64,
          videoFramesBase64: videoFrames,
        },
      });

      const result = data?.registerUserWithVideo;
      if (result?.success) {
        Alert.alert(
          '¡Registro exitoso!',
          result.message || 'Tu cuenta ha sido creada correctamente.',
          [
            {
              text: 'Ir a iniciar sesión',
              onPress: () => {
                if (navigation) {
                  navigation.navigate('Login');
                }
              },
            },
          ],
        );
      } else {
        Alert.alert('Error en el registro', result?.message || 'Ocurrió un error al registrar');
      }
    } catch (error: any) {
      Alert.alert(
        'Error de conexión',
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      );
      console.error('Register error:', error);
    }
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      handlePrevStep();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const handleGoToLogin = () => {
    if (navigation) {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </Pressable>

            {/* Step indicator */}
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>
                Paso {currentStep} de {TOTAL_STEPS}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentStep / TOTAL_STEPS) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <View style={styles.titleIconContainer}>
              <Ionicons
                name={currentStep === 1 ? 'person-add-outline' : 'videocam-outline'}
                size={28}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.title}>
              {currentStep === 1 ? 'Crear cuenta' : 'Verificación facial'}
            </Text>
            <Text style={styles.subtitle}>
              {currentStep === 1
                ? 'Completa tus datos personales para comenzar'
                : 'Graba un video corto para verificar tu identidad de forma segura'}
            </Text>
          </View>

          {/* Step Content */}
          {currentStep === 1 ? (
            /* Step 1: Personal Data */
            <View style={styles.formSection}>
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Nombre</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Juan"
                      placeholderTextColor={Colors.textTertiary}
                      value={nombre}
                      onChangeText={setNombre}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Apellido</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Pérez"
                      placeholderTextColor={Colors.textTertiary}
                      value={apellido}
                      onChangeText={setApellido}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Correo electrónico</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor={Colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={Colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.textTertiary}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={Colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                  />
                  <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                    <Ionicons
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.textTertiary}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+591 70000000"
                    placeholderTextColor={Colors.textTertiary}
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
                onPress={handleNextStep}
              >
                <Text style={styles.primaryButtonText}>Siguiente</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.textWhite} />
              </Pressable>
            </View>
          ) : (
            /* Step 2: Biometric Video Capture */
            <View style={styles.formSection}>
              {/* Instructions Card */}
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>Instrucciones</Text>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet}>
                    <Text style={styles.instructionBulletText}>1</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Ubica tu rostro frente a la cámara frontal
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet}>
                    <Text style={styles.instructionBulletText}>2</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    No uses gafas, gorros ni cubrebocas
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet}>
                    <Text style={styles.instructionBulletText}>3</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    Mantén buena iluminación durante la grabación
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet}>
                    <Text style={styles.instructionBulletText}>4</Text>
                  </View>
                  <Text style={styles.instructionText}>
                    El video durará aprox. 3 segundos (10 frames)
                  </Text>
                </View>
              </View>

              {/* Capture Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.captureButton,
                  pressed && styles.captureButtonPressed,
                  videoCaptured && styles.captureButtonSuccess,
                ]}
                onPress={handleCaptureVideo}
              >
                <View style={styles.captureIconContainer}>
                  <Ionicons
                    name={videoCaptured ? 'checkmark-circle' : 'videocam'}
                    size={32}
                    color={videoCaptured ? Colors.success : Colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.captureButtonText,
                    videoCaptured && styles.captureButtonTextSuccess,
                  ]}
                >
                  {videoCaptured ? 'Video capturado ✓' : 'Grabar video de verificación'}
                </Text>
                {videoCaptured && (
                  <Text style={styles.captureSubtext}>
                    Toca para volver a grabar
                  </Text>
                )}
              </Pressable>

              {/* Register Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                  loading && styles.buttonDisabled,
                  !videoCaptured && styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={loading || !videoCaptured}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.textWhite} size="small" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textWhite} />
                    <Text style={styles.primaryButtonText}>Registrarse</Text>
                  </>
                )}
              </Pressable>

              {loading && (
                <Text style={styles.loadingText}>
                  Procesando tu video y creando tu cuenta...
                </Text>
              )}
            </View>
          )}

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <Pressable onPress={handleGoToLogin}>
              <Text style={styles.loginLink}>Iniciar sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <Pressable style={styles.closeCameraButton} onPress={() => setShowCamera(false)} disabled={isRecording}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
            <Text style={styles.cameraTitle}>
              {isRecording ? `Grabando... ${captureProgress}/3s` : 'Verificación Facial'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            mode="video"
            mute={true}
          />
          <View style={styles.cameraOverlay} pointerEvents="none">
            <View style={styles.faceGuide} />
          </View>

          <View style={styles.cameraFooter}>
            <Text style={styles.cameraInstructions}>
              Ubica tu rostro en el óvalo y presiona grabar. Se grabará un video de 3 segundos automáticamente.
            </Text>
            <Pressable
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={startCapturing}
              disabled={isRecording}
            >
              <View style={[styles.recordInner, isRecording && styles.recordInnerActive]} />
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stepIndicator: {
    backgroundColor: Colors.primaryFaded,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  stepText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  // Progress
  progressContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  // Title
  titleSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  titleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    maxWidth: '90%',
  },
  // Form
  formSection: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    height: 52,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: Spacing.sm,
    marginRight: -Spacing.sm,
  },
  // Buttons
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    ...Shadows.button,
  },
  primaryButtonPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: Colors.textWhite,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Instructions
  instructionsCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  instructionsTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  instructionBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryFaded15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionBulletText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  instructionText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  // Capture button
  captureButton: {
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.primaryFaded,
  },
  captureButtonPressed: {
    backgroundColor: Colors.primaryFaded15,
  },
  captureButtonSuccess: {
    borderColor: Colors.success + '30',
    backgroundColor: Colors.success + '08',
  },
  captureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  captureButtonText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.primary,
  },
  captureButtonTextSuccess: {
    color: Colors.success,
  },
  captureSubtext: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Login link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  loginText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Camera Modal
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
    zIndex: 10,
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
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  faceGuide: {
    width: 250,
    height: 350,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cameraInstructions: {
    color: '#FFF',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontSize: FontSize.sm,
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    borderColor: 'red',
  },
  recordInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'red',
  },
  recordInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
});
