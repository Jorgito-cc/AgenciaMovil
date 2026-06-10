import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { LISTAR_OFERTAS, LISTAR_POSTULACIONES } from '../../../data/datasources/graphql/queries';
import { useAuth } from '../../../core/context/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();

  const { data: offersData, loading: offersLoading } = useQuery<any>(LISTAR_OFERTAS, {
    context: { clientName: 'springboot' },
    fetchPolicy: 'network-only'
  });

  const { data: postulationsData, loading: postulationsLoading } = useQuery<any>(LISTAR_POSTULACIONES, {
    context: { clientName: 'springboot' },
    fetchPolicy: 'network-only'
  });

  if (offersLoading || postulationsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Filter offers by this recruiter
  const myOffers = offersData?.listarOfertas?.filter((o: any) => 
    !o.reclutador || !o.reclutador.id || o.reclutador.id === user?.id
  ) || [];

  // Filter postulations by this recruiter's offers
  const myPostulations = postulationsData?.listarPostulaciones?.filter((p: any) => 
    !p.oferta?.reclutador || !p.oferta?.reclutador?.id || p.oferta?.reclutador?.id === user?.id
  ) || [];

  // Stats calculation
  const activeOffersCount = myOffers.filter((o: any) => o.estado === 'ACTIVO' || o.estado === 'Abierto').length;
  const totalPostulationsCount = myPostulations.length;
  const hiresCount = myPostulations.filter((p: any) => p.fase_alcanzada === 'Aceptado' || p.fase_alcanzada === 'Contratado').length;

  // Funnel calculation
  const phaseCounts = {
    Recibido: myPostulations.filter((p: any) => !p.fase_alcanzada || p.fase_alcanzada === 'Recibido').length,
    Entrevista: myPostulations.filter((p: any) => p.fase_alcanzada === 'Entrevista').length,
    Evaluacion: myPostulations.filter((p: any) => p.fase_alcanzada === 'Prueba Técnica' || p.fase_alcanzada === 'Evaluación').length,
    Contratado: hiresCount
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Panel de Reclutamiento</Text>
      <Text style={styles.subtitle}>Administración de ofertas y postulantes</Text>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {/* Card 1: Offers */}
        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="document-text" size={24} color="#9333EA" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>MIS OFERTAS ACTIVAS</Text>
            <Text style={styles.statValue}>{activeOffersCount}</Text>
          </View>
        </View>

        {/* Card 2: Postulations */}
        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="people" size={24} color="#2563EB" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>POSTULACIONES RECIBIDAS</Text>
            <Text style={styles.statValue}>{totalPostulationsCount}</Text>
          </View>
        </View>

        {/* Card 3: Hired */}
        <View style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>CONTRATACIONES</Text>
            <Text style={styles.statValue}>{hiresCount}</Text>
          </View>
        </View>
      </View>

      {/* ATS Funnel Section */}
      <Text style={styles.sectionTitle}>Embudo de Postulaciones (ATS)</Text>
      <Text style={styles.sectionSubtitle}>Flujo de candidatos activos a través del proceso de selección</Text>

      <View style={styles.funnelContainer}>
        {/* Step 1 */}
        <View style={[styles.funnelStep, { borderLeftColor: '#6B7280' }]}>
          <View style={styles.funnelStepHeader}>
            <Text style={styles.funnelStepName}>Recibido</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{phaseCounts.Recibido}</Text></View>
          </View>
          <Text style={styles.funnelStepDesc}>{phaseCounts.Recibido === 1 ? '1 candidato pendiente de revisar' : `${phaseCounts.Recibido} candidatos pendientes de revisar`}</Text>
        </View>

        {/* Step 2 */}
        <View style={[styles.funnelStep, { borderLeftColor: '#3B82F6' }]}>
          <View style={styles.funnelStepHeader}>
            <Text style={styles.funnelStepName}>Entrevista</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{phaseCounts.Entrevista}</Text></View>
          </View>
          <Text style={styles.funnelStepDesc}>{phaseCounts.Entrevista === 1 ? '1 candidato en entrevista' : `${phaseCounts.Entrevista} candidatos en entrevista`}</Text>
        </View>

        {/* Step 3 */}
        <View style={[styles.funnelStep, { borderLeftColor: '#F59E0B' }]}>
          <View style={styles.funnelStepHeader}>
            <Text style={styles.funnelStepName}>Evaluación</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{phaseCounts.Evaluacion}</Text></View>
          </View>
          <Text style={styles.funnelStepDesc}>{phaseCounts.Evaluacion === 1 ? '1 candidato en prueba técnica' : `${phaseCounts.Evaluacion} candidatos en prueba técnica`}</Text>
        </View>

        {/* Step 4 */}
        <View style={[styles.funnelStep, { borderLeftColor: '#10B981' }]}>
          <View style={styles.funnelStepHeader}>
            <Text style={styles.funnelStepName}>Contratado</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{phaseCounts.Contratado}</Text></View>
          </View>
          <Text style={styles.funnelStepDesc}>{phaseCounts.Contratado === 1 ? '1 contratación exitosa' : `${phaseCounts.Contratado} contrataciones exitosas`}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg, marginTop: 2 },
  statsContainer: { gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md
  },
  statInfo: { flex: 1 },
  statLabel: { fontSize: FontSize.xs - 2, fontWeight: 'bold', color: Colors.textTertiary, letterSpacing: 0.5 },
  statValue: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 2 },

  sectionTitle: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.textPrimary },
  sectionSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md, marginTop: 2 },
  funnelContainer: { gap: Spacing.sm },
  funnelStep: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm
  },
  funnelStepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  funnelStepName: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  badge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
    color: Colors.textSecondary
  },
  funnelStepDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary
  }
});
