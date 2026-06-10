import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, TextInput, Alert } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { LISTAR_POSTULACIONES } from '../../../data/datasources/graphql/queries';
import { useAuth } from '../../../core/context/AuthContext';

export default function PostulacionesScreen() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, refetch } = useQuery<any>(LISTAR_POSTULACIONES, {
    context: { clientName: 'springboot' },
    fetchPolicy: 'network-only'
  });

  // Filter postulations by this recruiter's offers
  const allPostulations = data?.listarPostulaciones?.filter((p: any) => 
    !p.oferta?.reclutador || !p.oferta?.reclutador?.id || p.oferta?.reclutador?.id === user?.id
  ) || [];

  // Apply search filter (by candidate name or offer title)
  const filteredPostulations = allPostulations.filter((p: any) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const name = `${p.candidato?.nombre || ''} ${p.candidato?.apellido || ''}`.toLowerCase();
    const title = (p.oferta?.titulo || '').toLowerCase();
    return name.includes(term) || title.includes(term);
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Postulaciones Recibidas</Text>
      <Text style={styles.subtitle}>Historial y seguimiento de todos los candidatos aplicados</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por candidato o vacante..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm ? (
          <Pressable onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {/* List */}
      <FlatList
        data={filteredPostulations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.candidateName}>{item.candidato?.nombre} {item.candidato?.apellido}</Text>
                <Text style={styles.offerTitle}>Vacante: {item.oferta?.titulo}</Text>
              </View>
              <View style={[styles.phaseBadge, getPhaseStyle(item.fase_alcanzada)]}>
                <Text style={[styles.phaseBadgeText, getPhaseTextStyle(item.fase_alcanzada)]}>
                  {item.fase_alcanzada || 'Recibido'}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.infoText}>
                  Fecha: {item.fecha ? new Date(item.fecha).toLocaleDateString() : 'No especificada'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.candidato?.email}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No se encontraron postulaciones.</Text>
        }
      />
    </View>
  );
}

const getPhaseStyle = (phase: string) => {
  switch (phase) {
    case 'Aceptado':
    case 'Contratado':
      return { backgroundColor: '#DEF7EC' };
    case 'Rechazado':
      return { backgroundColor: '#FDE8E8' };
    case 'Entrevista':
      return { backgroundColor: '#E1F5FE' };
    case 'Prueba Técnica':
    case 'Evaluación':
      return { backgroundColor: '#FEF3C7' };
    default:
      return { backgroundColor: '#F3F4F6' };
  }
};

const getPhaseTextStyle = (phase: string) => {
  switch (phase) {
    case 'Aceptado':
    case 'Contratado':
      return { color: '#03543F' };
    case 'Rechazado':
      return { color: '#9B1C1C' };
    case 'Entrevista':
      return { color: '#0288D1' };
    case 'Prueba Técnica':
    case 'Evaluación':
      return { color: '#D97706' };
    default:
      return { color: '#4B5563' };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg, marginTop: 2 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    height: 48,
    ...Shadows.sm
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  list: { gap: Spacing.md, paddingBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md
  },
  candidateName: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.textPrimary
  },
  offerTitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2
  },
  phaseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  phaseBadgeText: {
    fontSize: FontSize.xs - 2,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textTertiary,
    marginTop: Spacing.xl,
    fontSize: FontSize.sm
  }
});
