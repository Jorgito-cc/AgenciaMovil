import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
  Animated,
  ViewToken,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  accentColor: string;
}

const SLIDES: SlideItem[] = [
  {
    id: '1',
    icon: 'briefcase-outline',
    title: 'Ofertas relevantes',
    description: 'Descubre oportunidades laborales que se ajustan a tu perfil profesional y expectativas.',
    accentColor: Colors.primary,
  },
  {
    id: '2',
    icon: 'paper-plane-outline',
    title: 'Postula fácilmente',
    description: 'Envía tu hoja de vida en segundos con un solo toque y accede a las mejores ofertas.',
    accentColor: Colors.primaryLight,
  },
  {
    id: '3',
    icon: 'shield-checkmark-outline',
    title: 'Verificación biométrica',
    description: 'Accede de forma segura con reconocimiento facial avanzado. Tu identidad, protegida.',
    accentColor: Colors.primaryDark,
  },
];

interface Props {
  navigation?: any;
}

export default function WelcomeScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goToSlide = (index: number) => {
    if (index >= 0 && index < SLIDES.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  };

  const handleGetStarted = () => {
    if (navigation) {
      navigation.navigate('Register');
    }
  };

  const handleLogin = () => {
    if (navigation) {
      navigation.navigate('Login');
    }
  };

  const renderSlide = ({ item, index }: { item: SlideItem; index: number }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slideContainer}>
        <Animated.View style={[styles.slideCard, { transform: [{ scale }], opacity }]}>
          {/* Icono con fondo circular degradado */}
          <View style={[styles.iconWrapper, { backgroundColor: item.accentColor + '12' }]}>
            <View style={[styles.iconInner, { backgroundColor: item.accentColor + '20' }]}>
              <Ionicons name={item.icon} size={36} color={item.accentColor} />
            </View>
          </View>

          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDescription}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="briefcase" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.logoText}>AgencyApp</Text>
        </View>
        <Text style={styles.versionTag}>v1.0</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Bienvenido</Text>
        <Text style={styles.heroSubtitle}>
          Encuentra el empleo que impulsa tu futuro profesional
        </Text>
      </View>

      {/* Slider */}
      <View style={styles.sliderSection}>
        <Animated.FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
          bounces={false}
        />

        {/* Navigation arrows + dots */}
        <View style={styles.sliderNav}>
          {/* Left arrow */}
          <Pressable
            onPress={() => goToSlide(currentIndex - 1)}
            style={[styles.arrowButton, currentIndex === 0 && styles.arrowDisabled]}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentIndex === 0 ? Colors.dotInactive : Colors.primary}
            />
          </Pressable>

          {/* Dots */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((_, i) => {
              const dotWidth = scrollX.interpolate({
                inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              const dotOpacity = scrollX.interpolate({
                inputRange: [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity: dotOpacity,
                      backgroundColor: Colors.primary,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Right arrow */}
          <Pressable
            onPress={() => goToSlide(currentIndex + 1)}
            style={[styles.arrowButton, currentIndex === SLIDES.length - 1 && styles.arrowDisabled]}
            disabled={currentIndex === SLIDES.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentIndex === SLIDES.length - 1 ? Colors.dotInactive : Colors.primary}
            />
          </Pressable>
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomSection}>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={handleGetStarted}
        >
          <Text style={styles.primaryButtonText}>Comenzar</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textWhite} />
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <Pressable onPress={handleLogin}>
            <Text style={styles.loginLink}>Iniciar sesión</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  versionTag: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  // Hero
  heroSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
  },
  heroTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.8,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    maxWidth: '85%',
  },
  // Slider
  sliderSection: {
    flex: 1,
    justifyContent: 'center',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.md,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  slideDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.base,
  },
  // Navigation
  sliderNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.lg,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  arrowDisabled: {
    opacity: 0.4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  // Bottom
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.base,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    ...Shadows.button,
  },
  primaryButtonPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: Colors.textWhite,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
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
});
