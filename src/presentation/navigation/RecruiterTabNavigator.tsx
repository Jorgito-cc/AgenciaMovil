import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated, Dimensions, SafeAreaView, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../core/config/theme';
import { useAuth } from '../../core/context/AuthContext';

// Import Screens/Views
import DashboardScreen from '../screens/recruiter/DashboardScreen';
import PipelineScreen from '../screens/recruiter/PipelineScreen';
import RecruiterDashboardScreen from '../screens/recruiter/RecruiterDashboardScreen'; // acts as Offers CRUD
import CategoriasScreen from '../screens/recruiter/CategoriasScreen';
import PostulacionesScreen from '../screens/recruiter/PostulacionesScreen';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78; // 78% of screen width

type ViewType = 'dashboard' | 'pipeline' | 'ofertas' | 'categorias' | 'postulaciones';

export default function RecruiterTabNavigator() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  // Animation value for sliding drawer
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  const navigateTo = (view: ViewType) => {
    setCurrentView(view);
    closeDrawer();
  };

  const handleLogout = async () => {
    closeDrawer();
    await logout();
  };

  // Render the currently selected screen view
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'pipeline':
        return <PipelineScreen />;
      case 'ofertas':
        return <RecruiterDashboardScreen />;
      case 'categorias':
        return <CategoriasScreen />;
      case 'postulaciones':
        return <PostulacionesScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  // Get view title for header
  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'AgenciaWeb';
      case 'pipeline':
        return 'Pipeline ATS';
      case 'ofertas':
        return 'Mis Ofertas';
      case 'categorias':
        return 'Categorías';
      case 'postulaciones':
        return 'Postulaciones';
      default:
        return 'AgenciaWeb';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <Pressable onPress={openDrawer} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={28} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{getViewTitle()}</Text>
        <View style={styles.headerRight}>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>
              {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'R'}
            </Text>
          </View>
        </View>
      </View>

      {/* Main body content */}
      <View style={styles.mainContent}>
        {renderContent()}
      </View>

      {/* Custom sliding left drawer modal */}
      <Modal
        transparent={true}
        visible={drawerVisible}
        onRequestClose={closeDrawer}
        animationType="none"
      >
        <View style={styles.drawerOverlay}>
          {/* Transparent clickable backdrop to close the drawer */}
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Animated drawer body */}
          <Animated.View style={[styles.drawerBody, { transform: [{ translateX: slideAnim }] }]}>
            <SafeAreaView style={{ flex: 1 }}>
              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <View style={styles.logoRow}>
                  <Ionicons name="briefcase" size={22} color={Colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.drawerLogoText}>AgenciaWeb</Text>
                  <View style={styles.recruiterBadge}><Text style={styles.recruiterBadgeText}>RECLUTADOR</Text></View>
                </View>
                <Pressable onPress={closeDrawer} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </Pressable>
              </View>

              {/* Drawer Items */}
              <View style={styles.menuItemsContainer}>
                {/* Dashboard */}
                <Pressable 
                  style={[styles.menuItem, currentView === 'dashboard' && styles.menuItemActive]} 
                  onPress={() => navigateTo('dashboard')}
                >
                  <Ionicons 
                    name={currentView === 'dashboard' ? "grid" : "grid-outline"} 
                    size={20} 
                    color={currentView === 'dashboard' ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={[styles.menuItemText, currentView === 'dashboard' && styles.menuItemTextActive]}>
                    Panel Reclutamiento
                  </Text>
                </Pressable>

                {/* Pipeline */}
                <Pressable 
                  style={[styles.menuItem, currentView === 'pipeline' && styles.menuItemActive]} 
                  onPress={() => navigateTo('pipeline')}
                >
                  <Ionicons 
                    name={currentView === 'pipeline' ? "people" : "people-outline"} 
                    size={20} 
                    color={currentView === 'pipeline' ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={[styles.menuItemText, currentView === 'pipeline' && styles.menuItemTextActive]}>
                    Pipeline ATS
                  </Text>
                </Pressable>

                {/* Offers */}
                <Pressable 
                  style={[styles.menuItem, currentView === 'ofertas' && styles.menuItemActive]} 
                  onPress={() => navigateTo('ofertas')}
                >
                  <Ionicons 
                    name={currentView === 'ofertas' ? "document-text" : "document-text-outline"} 
                    size={20} 
                    color={currentView === 'ofertas' ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={[styles.menuItemText, currentView === 'ofertas' && styles.menuItemTextActive]}>
                    Mis Ofertas
                  </Text>
                </Pressable>

                {/* Categories */}
                <Pressable 
                  style={[styles.menuItem, currentView === 'categorias' && styles.menuItemActive]} 
                  onPress={() => navigateTo('categorias')}
                >
                  <Ionicons 
                    name={currentView === 'categorias' ? "folder" : "folder-outline"} 
                    size={20} 
                    color={currentView === 'categorias' ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={[styles.menuItemText, currentView === 'categorias' && styles.menuItemTextActive]}>
                    Categorías
                  </Text>
                </Pressable>

                {/* Postulations */}
                <Pressable 
                  style={[styles.menuItem, currentView === 'postulaciones' && styles.menuItemActive]} 
                  onPress={() => navigateTo('postulaciones')}
                >
                  <Ionicons 
                    name={currentView === 'postulaciones' ? "list" : "list-outline"} 
                    size={20} 
                    color={currentView === 'postulaciones' ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={[styles.menuItemText, currentView === 'postulaciones' && styles.menuItemTextActive]}>
                    Postulaciones
                  </Text>
                </Pressable>
              </View>

              {/* Drawer Footer Account Section */}
              <View style={styles.drawerFooter}>
                <View style={styles.userInfoRow}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'R'}
                    </Text>
                  </View>
                  <View style={styles.userMeta}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user?.nombre} {user?.apellido}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {user?.email}
                    </Text>
                  </View>
                </View>

                <Pressable onPress={handleLogout} style={styles.logoutButton}>
                  <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerRight: {
    padding: Spacing.xs,
  },
  profileBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: FontSize.sm,
  },
  mainContent: {
    flex: 1,
  },
  
  // Drawer styles
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerBody: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: Colors.card,
    borderTopRightRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadows.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerLogoText: {
    fontSize: FontSize.md + 2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  recruiterBadge: {
    marginLeft: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recruiterBadgeText: {
    fontSize: FontSize.xs - 3,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  menuItemsContainer: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  menuItemActive: {
    backgroundColor: Colors.primaryFaded,
  },
  menuItemText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  menuItemTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  drawerFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: Spacing.md,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FDE8E8',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  logoutText: {
    color: Colors.error,
    fontWeight: 'bold',
    fontSize: FontSize.md,
  }
});
