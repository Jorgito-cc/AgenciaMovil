import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../../core/context/AuthContext';
import AuthNavigator from './AuthNavigator';
import CandidateTabNavigator from './CandidateTabNavigator';
import RecruiterTabNavigator from './RecruiterTabNavigator';
import { Colors } from '../../core/config/theme';

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  console.log('[DEBUG ROOT NAVIGATOR] user:', JSON.stringify(user, null, 2), 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  if (user.rol === 'candidato') {
    return <CandidateTabNavigator />;
  }

  if (user.rol === 'reclutador') {
    return <RecruiterTabNavigator />;
  }

  // Fallback for administrators in mobile (or unknown roles)
  return <AuthNavigator />;
}
