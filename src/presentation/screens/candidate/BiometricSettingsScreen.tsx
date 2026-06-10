import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { LINK_BIOMETRIC_WITH_VIDEO } from '../../../data/datasources/graphql/mutations';
import { useAuth } from '../../../core/context/AuthContext';

export default function BiometricSettingsScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [linkBiometricWithVideo] = useMutation<any, any>(LINK_BIOMETRIC_WITH_VIDEO, {
    context: { clientName: 'fastapi' }
  });

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: 'center', marginBottom: Spacing.md }}>
          Necesitamos tu permiso para usar la cámara y grabar el video biométrico.
        </Text>
        <Pressable onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Otorgar Permiso</Text>
        </Pressable>
      </View>
    );
  }

  const handleRecord = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsRecording(true);
      // Grabar video corto de prueba de vida
      const video = await cameraRef.current.recordAsync({ maxDuration: 5 });
      setIsRecording(false);
      
      if (video && video.uri) {
        setIsProcessing(true);
        // Convertir video a Base64
        const videoBase64 = await FileSystem.readAsStringAsync(video.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Simulamos extraer frames en base64 del video. 
        // En un entorno real, FastAPI debería decodificar el videoBase64.
        const framesPlaceholder = [videoBase64.substring(0, 1000)];

        const { data } = await linkBiometricWithVideo({
          variables: {
            email: user?.email,
            videoBase64: videoBase64,
            videoFramesBase64: framesPlaceholder
          }
        });

        const result = data?.linkBiometricWithVideo;
        if (result?.success) {
          Alert.alert('Completado', 'Se ha enlazado tu biometría exitosamente. Ahora podrás iniciar sesión con tu rostro.');
        } else {
          Alert.alert('Error Biomético', result?.error || 'No se pudo validar el video.');
        }
      }
    } catch (e: any) {
      console.error(e);
      setIsRecording(false);
      Alert.alert('Error', 'Hubo un problema al grabar el video.');
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isProcessing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.processingText}>Analizando biometría y encriptando video en FastAPI...</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Ionicons name="scan-circle" size={32} color={Colors.primary} />
            <Text style={styles.title}>Veridad de Identidad</Text>
            <Text style={styles.subtitle}>
              Graba un pequeño video mostrando tu rostro para habilitar el login facial y validar tu cuenta como real (Proof of Life).
            </Text>
          </View>
          
          <View style={styles.cameraContainer}>
            <CameraView 
              style={styles.camera} 
              facing="front" 
              mode="video"
              ref={cameraRef}
            />
            {isRecording && (
              <View style={styles.recordingBadge}>
                <View style={styles.redDot} />
                <Text style={styles.recordingText}>Grabando</Text>
              </View>
            )}
          </View>

          <View style={styles.controls}>
            <Pressable 
              style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
              onPress={isRecording ? stopRecording : handleRecord}
            >
              <Ionicons 
                name={isRecording ? "stop" : "videocam"} 
                size={32} 
                color={Colors.textWhite} 
              />
            </Pressable>
            <Text style={styles.instructionText}>
              {isRecording ? "Presiona para detener" : "Presiona para grabar 5 seg"}
            </Text>
          </View>
        </>
      )}
    </SafeAreaView>
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
    padding: Spacing.xl,
  },
  header: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    marginTop: Spacing.sm,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  recordingBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  recordingText: {
    color: Colors.textWhite,
    fontSize: FontSize.xs,
    fontWeight: 'bold',
  },
  controls: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  recordBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  recordBtnActive: {
    backgroundColor: Colors.error,
  },
  instructionText: {
    marginTop: Spacing.md,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  btnText: {
    color: Colors.textWhite,
    fontWeight: 'bold',
  },
  processingText: {
    marginTop: Spacing.lg,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontWeight: '600',
  }
});
