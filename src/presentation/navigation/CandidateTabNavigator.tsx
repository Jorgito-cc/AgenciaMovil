import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../core/config/theme';
import { View, Text } from 'react-native';

import JobOffersScreen from '../screens/candidate/JobOffersScreen';
import MyApplicationsScreen from '../screens/candidate/MyApplicationsScreen';
import ProfileScreen from '../screens/candidate/ProfileScreen';
import BiometricsScreen from '../screens/candidate/BiometricSettingsScreen';

export type CandidateTabParamList = {
  Offers: undefined;
  MyApplications: undefined;
  Profile: undefined;
  Biometrics: undefined;
};

const Tab = createBottomTabNavigator<CandidateTabParamList>();

export default function CandidateTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';

          if (route.name === 'Offers') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'MyApplications') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Biometrics') iconName = focused ? 'scan' : 'scan-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        headerShown: true,
        headerStyle: { backgroundColor: Colors.card },
        headerTitleStyle: { color: Colors.textPrimary, fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Offers" component={JobOffersScreen} options={{ title: 'Explorar' }} />
      <Tab.Screen name="MyApplications" component={MyApplicationsScreen} options={{ title: 'Mis Postulaciones' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
      <Tab.Screen name="Biometrics" component={BiometricsScreen} options={{ title: 'Biometría' }} />
    </Tab.Navigator>
  );
}
