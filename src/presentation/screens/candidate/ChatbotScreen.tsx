import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  FlatList, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { CHATBOT_CONSULTAR } from '../../../data/datasources/graphql/mutations';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  isAudio?: boolean;
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu asistente de Inteligencia Artificial. ¿En qué te puedo ayudar hoy? Puedes preguntarme por las ofertas de trabajo disponibles usando texto o enviándome un mensaje de voz.',
      isUser: false,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const [chatbotConsultar, { loading }] = useMutation(CHATBOT_CONSULTAR);

  useEffect(() => {
    // Pedir permisos de audio al cargar la pantalla
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesita permiso para acceder al micrófono');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri) {
        // Leer el archivo como base64
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Enviar a la mutación
        handleSendAudio(base64Audio);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    
    const textToSend = inputText;
    setInputText('');
    
    // Add user message to UI
    const newMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
    };
    setMessages(prev => [...prev, newMessage]);
    
    try {
      const response = await chatbotConsultar({
        variables: {
          mensajeTexto: textToSend
        }
      });
      
      if (response.data?.chatbotConsultar?.success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: response.data.chatbotConsultar.respuesta,
          isUser: false,
        }]);
      } else {
        throw new Error(response.data?.chatbotConsultar?.error || 'Error desconocido');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Lo siento, hubo un problema al comunicarme con el servidor.',
        isUser: false,
      }]);
    }
  };

  const handleSendAudio = async (base64Audio: string) => {
    // Add audio loading indicator to UI
    const audioMessageId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: audioMessageId,
      text: '🎙️ Mensaje de voz enviado...',
      isUser: true,
      isAudio: true,
    }]);
    
    try {
      const response = await chatbotConsultar({
        variables: {
          audioBase64: base64Audio
        }
      });
      
      if (response.data?.chatbotConsultar?.success) {
        // Update user message with transcription
        setMessages(prev => prev.map(msg => 
          msg.id === audioMessageId 
            ? { ...msg, text: `🎙️ "${response.data.chatbotConsultar.transcripcion}"` } 
            : msg
        ));
        
        // Add AI response
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: response.data.chatbotConsultar.respuesta,
          isUser: false,
        }]);
      } else {
        throw new Error(response.data?.chatbotConsultar?.error || 'Error desconocido');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Lo siento, no pude procesar tu mensaje de voz.',
        isUser: false,
      }]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.isUser ? styles.userBubble : styles.aiBubble
    ]}>
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userText : styles.aiText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        inverted={false}
      />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>La IA está pensando...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Pregúntame algo..."
          placeholderTextColor={Colors.textTertiary}
          multiline
        />
        
        {inputText.trim().length > 0 ? (
          <Pressable style={styles.sendButton} onPress={handleSendText}>
            <Ionicons name="send" size={20} color={Colors.textWhite} />
          </Pressable>
        ) : (
          <Pressable 
            style={[styles.micButton, isRecording && styles.micButtonRecording]} 
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Ionicons name="mic" size={24} color={isRecording ? Colors.error : Colors.textWhite} />
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messageList: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  messageText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  userText: {
    color: Colors.textWhite,
  },
  aiText: {
    color: Colors.textPrimary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    alignSelf: 'flex-start',
  },
  loadingText: {
    marginLeft: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.md,
    maxHeight: 100,
    color: Colors.textPrimary,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  micButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  micButtonRecording: {
    backgroundColor: Colors.primaryFaded,
    transform: [{ scale: 1.1 }],
  }
});
