import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { registerForPushNotificationsAsync, sendTokenToBackend } from '../services/pushNotificationService';

export type UserRole = 'candidato' | 'reclutador' | 'administrador' | null;

interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const userStr = await SecureStore.getItemAsync('auth_user');
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (userStr && token) {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        
        // Registrar token para notificaciones
        registerForPushNotificationsAsync().then((pushToken) => {
          if (pushToken) {
            sendTokenToBackend(parsedUser.id, parsedUser.email, pushToken);
          }
        });
      }
    } catch (e) {
      console.error('Error loading session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, user: User) => {
    try {
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
      setUser(user);
      
      // Registrar token al iniciar sesión
      registerForPushNotificationsAsync().then((pushToken) => {
        if (pushToken) {
          sendTokenToBackend(user.id, user.email, pushToken);
        }
      });
    } catch (e) {
      console.error('Error saving session:', e);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
      setUser(null);
    } catch (e) {
      console.error('Error removing session:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
