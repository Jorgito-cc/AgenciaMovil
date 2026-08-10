import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../core/config/theme';
import { useAuth } from '../../core/context/AuthContext';

import JobOffersScreen from '../screens/candidate/JobOffersScreen';
import MyApplicationsScreen from '../screens/candidate/MyApplicationsScreen';
import ProfileScreen from '../screens/candidate/ProfileScreen';
import BiometricsScreen from '../screens/candidate/BiometricSettingsScreen';
import ChatbotScreen from '../screens/candidate/ChatbotScreen';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export default function CandidateTabNavigator() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeScreen, setActiveScreen] = useState<'Offers' | 'MyApplications' | 'Profile' | 'Biometrics' | 'Chatbot'>('Offers');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const toggleDrawer = (open: boolean) => {
    if (open) {
      setIsDrawerOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0.5,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsDrawerOpen(false);
      });
    }
  };

  const selectScreen = (screen: 'Offers' | 'MyApplications' | 'Profile' | 'Biometrics' | 'Chatbot') => {
    setActiveScreen(screen);
    toggleDrawer(false);
  };

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'Offers': return 'Explorar';
      case 'MyApplications': return 'Mis Postulaciones';
      case 'Profile': return 'Mi Perfil';
      case 'Biometrics': return 'Biometría';
      case 'Chatbot': return 'Consultas AI';
    }
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'Offers': return <JobOffersScreen />;
      case 'MyApplications': return <MyApplicationsScreen />;
      case 'Profile': return <ProfileScreen />;
      case 'Biometrics': return <BiometricsScreen />;
      case 'Chatbot': return <ChatbotScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.card} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <Pressable onPress={() => toggleDrawer(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        {renderActiveScreen()}
      </View>

      {/* Backdrop */}
      {isDrawerOpen && (
        <Animated.View 
          style={[styles.backdrop, { top: 0, opacity: backdropAnim }]}
          onTouchStart={() => toggleDrawer(false)}
        />
      )}

      {/* Drawer Sidebar */}
      <Animated.View style={[styles.drawer, { top: 0, transform: [{ translateX: slideAnim }] }]}>
        <View style={[styles.drawerContainer, { paddingBottom: insets.bottom }]}>
          {/* User Info Header */}
          <View style={[styles.userInfoSection, { paddingTop: insets.top + Spacing.lg }]}>
            <Pressable 
              onPress={() => toggleDrawer(false)} 
              style={[styles.closeDrawerButton, { top: insets.top + 12 }]}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.userName}>{user?.nombre} {user?.apellido}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          {/* Navigation Items */}
          <View style={styles.drawerItems}>
            <Pressable 
              style={[styles.drawerItem, activeScreen === 'Offers' && styles.drawerItemActive]} 
              onPress={() => selectScreen('Offers')}
            >
              <Ionicons 
                name={activeScreen === 'Offers' ? 'briefcase' : 'briefcase-outline'} 
                size={22} 
                color={activeScreen === 'Offers' ? Colors.primary : Colors.textSecondary} 
              />
              <Text style={[styles.drawerItemText, activeScreen === 'Offers' && styles.drawerItemTextActive]}>Explorar</Text>
            </Pressable>

            <Pressable 
              style={[styles.drawerItem, activeScreen === 'MyApplications' && styles.drawerItemActive]} 
              onPress={() => selectScreen('MyApplications')}
            >
              <Ionicons 
                name={activeScreen === 'MyApplications' ? 'document-text' : 'document-text-outline'} 
                size={22} 
                color={activeScreen === 'MyApplications' ? Colors.primary : Colors.textSecondary} 
              />
              <Text style={[styles.drawerItemText, activeScreen === 'MyApplications' && styles.drawerItemTextActive]}>Mis Postulaciones</Text>
            </Pressable>

            <Pressable 
              style={[styles.drawerItem, activeScreen === 'Profile' && styles.drawerItemActive]} 
              onPress={() => selectScreen('Profile')}
            >
              <Ionicons 
                name={activeScreen === 'Profile' ? 'person' : 'person-outline'} 
                size={22} 
                color={activeScreen === 'Profile' ? Colors.primary : Colors.textSecondary} 
              />
              <Text style={[styles.drawerItemText, activeScreen === 'Profile' && styles.drawerItemTextActive]}>Mi Perfil</Text>
            </Pressable>

            <Pressable 
              style={[styles.drawerItem, activeScreen === 'Biometrics' && styles.drawerItemActive]} 
              onPress={() => selectScreen('Biometrics')}
            >
              <Ionicons 
                name={activeScreen === 'Biometrics' ? 'scan' : 'scan-outline'} 
                size={22} 
                color={activeScreen === 'Biometrics' ? Colors.primary : Colors.textSecondary} 
              />
              <Text style={[styles.drawerItemText, activeScreen === 'Biometrics' && styles.drawerItemTextActive]}>Biometría</Text>
            </Pressable>

            <Pressable 
              style={[styles.drawerItem, activeScreen === 'Chatbot' && styles.drawerItemActive]} 
              onPress={() => selectScreen('Chatbot')}
            >
              <Ionicons 
                name={activeScreen === 'Chatbot' ? 'chatbubbles' : 'chatbubbles-outline'} 
                size={22} 
                color={activeScreen === 'Chatbot' ? Colors.primary : Colors.textSecondary} 
              />
              <Text style={[styles.drawerItemText, activeScreen === 'Chatbot' && styles.drawerItemTextActive]}>Consultas AI</Text>
            </Pressable>
          </View>

          {/* Footer / Log out */}
          <View style={styles.drawerFooter}>
            <Pressable style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={22} color={Colors.error} />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  menuButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginRight: 28, // Offset the menuButton size to center title perfectly
  },
  headerRightPlaceholder: {
    width: 28,
  },
  content: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
    zIndex: 99,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.card,
    zIndex: 100,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  drawerContainer: {
    flex: 1,
  },
  userInfoSection: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.primaryFaded,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  drawerItems: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: 4,
  },
  drawerItemActive: {
    backgroundColor: Colors.primaryFaded,
  },
  drawerItemText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    fontWeight: '500',
  },
  drawerItemTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  drawerFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FDE8E8', // Premium red background
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logoutButtonText: {
    fontSize: FontSize.md,
    color: Colors.error,
    fontWeight: 'bold',
  },
  closeDrawerButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 6,
    zIndex: 10,
  },
});
