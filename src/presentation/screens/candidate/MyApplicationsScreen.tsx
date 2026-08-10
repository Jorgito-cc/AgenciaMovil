import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { LISTAR_POSTULACIONES_POR_CANDIDATO } from '../../../data/datasources/graphql/queries';
import { useAuth } from '../../../core/context/AuthContext';

export default function MyApplicationsScreen() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery<any>(LISTAR_POSTULACIONES_POR_CANDIDATO, {
    variables: { candidatoId: user?.id },
    context: { clientName: 'springboot' },
    skip: !user?.id,
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error al cargar postulaciones</Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  // Read pre-filtered candidate applications from server
  const myApplications = data?.listarPostulacionesPorCandidato || [];

  const getPhaseColor = (fase: string) => {
    switch (fase?.toLowerCase()) {
      case 'recibido': return Colors.info;
      case 'entrevista': return Colors.warning;
      case 'aceptado': return Colors.success;
      case 'rechazado': return Colors.error;
      default: return Colors.textTertiary;
    }
  };

  return (
    <View style={styles.container}>
      {myApplications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyText}>Aún no tienes postulaciones activas.</Text>
        </View>
      ) : (
        <FlatList
          data={myApplications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.oferta?.titulo}</Text>
                <View style={[styles.badge, { backgroundColor: getPhaseColor(item.fase_alcanzada) + '20' }]}>
                  <Text style={[styles.badgeText, { color: getPhaseColor(item.fase_alcanzada) }]}>
                    {item.fase_alcanzada}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.companyName}>
                <Ionicons name="business" size={14} color={Colors.textSecondary} /> {item.oferta?.reclutador?.empresa?.nombre_comercial || 'Empresa'}
              </Text>

              <View style={styles.detailsRow}>
                <Text style={styles.detailText}>
                  <Ionicons name="cash-outline" size={14} /> ${item.oferta?.sueldo}
                </Text>
                <Text style={styles.detailText}>
                  <Ionicons name="calendar-outline" size={14} /> {item.fecha}
                </Text>
              </View>

              <View style={styles.blockchainSeal}>
                <Ionicons name="shield-checkmark" size={14} color="#16a34a" />
                <Text style={styles.blockchainText}>Auditoría Blockchain Activa</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
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
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  errorText: {
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  retryBtn: {
    padding: Spacing.sm,
    backgroundColor: Colors.primaryFaded,
    borderRadius: BorderRadius.sm,
  },
  retryText: {
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.md,
    color: Colors.textTertiary,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  blockchainSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  blockchainText: {
    fontSize: FontSize.xs,
    color: '#16a34a',
    fontWeight: 'bold',
  }
});
