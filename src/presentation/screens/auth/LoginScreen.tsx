import React, { useState, useRef } from 'react';
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
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@apollo/client/react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { LOGIN_WITH_PASSWORD, LOGIN_WITH_IMAGE } from '../../../data/datasources/graphql/mutations';
import { GET_USER_BY_EMAIL } from '../../../data/datasources/graphql/queries';
import { apolloClient } from '../../../core/config/apollo';
import { useAuth, UserRole } from '../../../core/context/AuthContext';

type AuthTab = 'password' | 'biometric';

interface Props {
  navigation?: any;
}

export default function LoginScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<AuthTab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [biometricEmail, setBiometricEmail] = useState('');
  const tabIndicator = useRef(new Animated.Value(0)).current;

  // Biometric camera states
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const { login } = useAuth();

  // GraphQL Mutations
  const [loginWithPassword, { loading: loadingPassword }] = useMutation<any, any>(LOGIN_WITH_PASSWORD);
  const [loginWithImage, { loading: loadingBiometric }] = useMutation<any, any>(LOGIN_WITH_IMAGE);

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    Animated.spring(tabIndicator, {
      toValue: tab === 'password' ? 0 : 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  const handlePasswordLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresa tu correo electrónico');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Ingresa tu contraseña');
      return;
    }

    try {
      const { data } = await loginWithPassword({
        variables: { email: email.trim(), password },
      });

      const result = data?.loginUserWithPassword;
      if (result?.success) {
        // Fetch user data from Spring Boot using the new token
        const { data: userData } = await apolloClient.query<any>({
          query: GET_USER_BY_EMAIL,
          variables: { email: email.trim() },
          context: {
            clientName: 'springboot',
            headers: {
              authorization: `Bearer ${result.token}`,
            },
          },
          fetchPolicy: 'network-only',
        });

        const fetchedUser = userData?.getUserByEmail;
        console.log('[DEBUG LOGIN] fetchedUser from Spring Boot (Password):', JSON.stringify(fetchedUser, null, 2));
        if (fetchedUser) {
          const rolNombre = fetchedUser.rolObj?.nombre?.toLowerCase() || 'candidato';
          console.log('[DEBUG LOGIN] rolNombre (Password):', rolNombre);
          let parsedRol: UserRole = null;
          if (rolNombre === 'candidato') parsedRol = 'candidato';
          else if (rolNombre === 'reclutador') parsedRol = 'reclutador';
          else if (rolNombre === 'administrador') parsedRol = 'administrador';

          console.log('[DEBUG LOGIN] parsedRol (Password):', parsedRol);

          const authUser = {
            id: fetchedUser.id,
            nombre: fetchedUser.nombre,
            apellido: fetchedUser.apellido,
            email: fetchedUser.email,
            rol: parsedRol,
          };

          console.log('[DEBUG LOGIN] authUser (Password) being saved:', JSON.stringify(authUser, null, 2));

          // Save globally and navigate implicitly by RootNavigator
          await login(result.token, authUser);
          Alert.alert('¡Éxito!', `Inicio de sesión exitoso. Rol: ${parsedRol}`);
        } else {
          Alert.alert('Error', 'No se pudo obtener la información del usuario.');
        }
      } else {
        Alert.alert('Error', result?.message || 'Credenciales incorrectas');
      }
    } catch (error: any) {
      Alert.alert('Error de conexión', 'No se pudo conectar con el servidor. Verifica tu conexión.');
      console.error('Login error:', error);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricEmail.trim()) {
      Alert.alert('Error', 'Ingresa tu correo electrónico para el login biométrico');
      return;
    }

    if (!cameraPermission?.granted) {
      const permissionResult = await requestCameraPermission();
      if (!permissionResult.granted) {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a la cámara para el reconocimiento facial.');
        return;
      }
    }

    setShowCamera(true);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: false,
      });

      setIsCapturing(false);
      setShowCamera(false);

      if (photo?.base64) {
        // Proceder al login enviando el base64 limpio
        await processBiometricLogin(photo.base64);
      } else {
        Alert.alert('Error', 'No se pudo capturar la foto. Intenta nuevamente.');
      }
    } catch (e: any) {
      console.error("Error al capturar foto:", e);
      setIsCapturing(false);
      Alert.alert('Error', `No se pudo tomar la foto: ${e?.message || e}`);
    }
  };

  const processBiometricLogin = async (base64Image: string) => {
    try {
      // Intentar login con imagen biométrica en FastAPI
      const { data } = await loginWithImage({
        variables: {
          email: biometricEmail.trim(),
          imageBase64: base64Image,
        },
      });

      const result = data?.loginUserWithImage;
      if (result?.success) {
        // Obtener detalles del usuario de Spring Boot con el nuevo token
        const { data: userData } = await apolloClient.query<any>({
          query: GET_USER_BY_EMAIL,
          variables: { email: biometricEmail.trim() },
          context: {
            clientName: 'springboot',
            headers: {
              authorization: `Bearer ${result.token}`,
            },
          },
          fetchPolicy: 'network-only',
        });

        const fetchedUser = userData?.getUserByEmail;
        console.log('[DEBUG LOGIN] fetchedUser from Spring Boot (Biometric):', JSON.stringify(fetchedUser, null, 2));
        if (fetchedUser) {
          const rolNombre = fetchedUser.rolObj?.nombre?.toLowerCase() || 'candidato';
          console.log('[DEBUG LOGIN] rolNombre (Biometric):', rolNombre);
          let parsedRol: UserRole = null;
          if (rolNombre === 'candidato') parsedRol = 'candidato';
          else if (rolNombre === 'reclutador') parsedRol = 'reclutador';
          else if (rolNombre === 'administrador') parsedRol = 'administrador';

          console.log('[DEBUG LOGIN] parsedRol (Biometric):', parsedRol);

          const authUser = {
            id: fetchedUser.id,
            nombre: fetchedUser.nombre,
            apellido: fetchedUser.apellido,
            email: fetchedUser.email,
            rol: parsedRol,
          };

          console.log('[DEBUG LOGIN] authUser (Biometric) being saved:', JSON.stringify(authUser, null, 2));

          // Guardar token y usuario globalmente (redirigirá automáticamente según rol)
          await login(result.token, authUser);
          Alert.alert('¡Éxito!', `¡Bienvenido ${fetchedUser.nombre}! Inicio de sesión exitoso. Rol: ${parsedRol}`);
        } else {
          Alert.alert('Error', 'No se pudo obtener la información del usuario.');
        }
      } else {
        Alert.alert('Fallo de Verificación', result?.message || 'El rostro no coincide con el guardado en el sistema.');
      }
    } catch (error: any) {
      Alert.alert(
        'Fallo de Reconocimiento',
        error?.message?.includes('USER_NOT_FOUND') 
          ? 'Usuario no registrado para login biométrico' 
          : 'Error al conectar con el servidor facial.'
      );
      console.error('Biometric login error:', error);
    }
  };

  const handleGoToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    }
  };

  const handleGoBack = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const tabTranslateX = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1], // Will be calculated based on layout
  });

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
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <View style={styles.titleIconContainer}>
              <Ionicons name="log-in-outline" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Iniciar sesión</Text>
            <Text style={styles.subtitle}>
              Accede a tu cuenta para explorar las mejores oportunidades laborales
            </Text>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <View style={styles.tabBackground}>
              <Pressable
                style={[styles.tab, activeTab === 'password' && styles.tabActive]}
                onPress={() => switchTab('password')}
              >
                <Ionicons
                  name="key-outline"
                  size={16}
                  color={activeTab === 'password' ? Colors.primary : Colors.textTertiary}
                />
                <Text
                  style={[styles.tabText, activeTab === 'password' && styles.tabTextActive]}
                >
                  Contraseña
                </Text>
              </Pressable>

              <Pressable
                style={[styles.tab, activeTab === 'biometric' && styles.tabActive]}
                onPress={() => switchTab('biometric')}
              >
                <Ionicons
                  name="scan-outline"
                  size={16}
                  color={activeTab === 'biometric' ? Colors.primary : Colors.textTertiary}
                />
                <Text
                  style={[styles.tabText, activeTab === 'biometric' && styles.tabTextActive]}
                >
                  Biométrico
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {activeTab === 'password' ? (
              /* Password Login Form */
              <View style={styles.form}>
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
                      placeholder="••••••••"
                      placeholderTextColor={Colors.textTertiary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={Colors.textTertiary}
                      />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                    loadingPassword && styles.buttonDisabled,
                  ]}
                  onPress={handlePasswordLogin}
                  disabled={loadingPassword}
                >
                  {loadingPassword ? (
                    <ActivityIndicator color={Colors.textWhite} size="small" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
                      <Ionicons name="arrow-forward" size={18} color={Colors.textWhite} />
                    </>
                  )}
                </Pressable>
              </View>
            ) : (
              /* Biometric Login Form */
              <View style={styles.form}>
                <View style={styles.biometricBanner}>
                  <View style={styles.biometricIconLarge}>
                    <Ionicons name="scan" size={48} color={Colors.primary} />
                  </View>
                  <Text style={styles.biometricTitle}>Reconocimiento facial</Text>
                  <Text style={styles.biometricDescription}>
                    Ingresa tu correo y luego captura tu rostro para verificar tu identidad de forma segura.
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Correo electrónico</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="ejemplo@correo.com"
                      placeholderTextColor={Colors.textTertiary}
                      value={biometricEmail}
                      onChangeText={setBiometricEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    styles.biometricButton,
                    pressed && styles.primaryButtonPressed,
                    loadingBiometric && styles.buttonDisabled,
                  ]}
                  onPress={handleBiometricLogin}
                  disabled={loadingBiometric}
                >
                  {loadingBiometric ? (
                    <ActivityIndicator color={Colors.textWhite} size="small" />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={20} color={Colors.textWhite} />
                      <Text style={styles.primaryButtonText}>Abrir cámara</Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <Pressable onPress={handleGoToRegister}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Camera Modal for Biometric Login */}
      <Modal visible={showCamera} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <Pressable style={styles.closeCameraButton} onPress={() => setShowCamera(false)} disabled={isCapturing}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
            <Text style={styles.cameraTitle}>Reconocimiento Facial</Text>
            <View style={{ width: 40 }} />
          </View>

          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
            mode="picture"
            mirror={true}
          />
          <View style={styles.cameraOverlay} pointerEvents="none">
            <View style={styles.faceGuide} />
          </View>

          <View style={styles.cameraFooter}>
            <Text style={styles.cameraInstructions}>
              Ubica tu rostro en el óvalo y presiona capturar para iniciar sesión.
            </Text>
            <Pressable
              style={styles.recordButton}
              onPress={capturePhoto}
              disabled={isCapturing}
            >
              <View style={styles.recordInner} />
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
  // Tabs
  tabContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.background,
    ...Shadows.sm,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  // Form
  formSection: {
    paddingHorizontal: Spacing.xl,
  },
  form: {
    gap: Spacing.base,
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
    opacity: 0.7,
  },
  primaryButtonText: {
    color: Colors.textWhite,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  biometricButton: {
    backgroundColor: Colors.primaryLight,
  },
  // Biometric Banner
  biometricBanner: {
    backgroundColor: Colors.primaryFaded,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '15',
    marginBottom: Spacing.sm,
  },
  biometricIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  biometricTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  biometricDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Register link
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  registerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
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
  recordInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF',
  },
});
