import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { LISTAR_CATEGORIAS } from '../../../data/datasources/graphql/queries';
import { CREAR_CATEGORIA, ELIMINAR_CATEGORIA } from '../../../data/datasources/graphql/mutations';

export default function CategoriasScreen() {
  const { data, loading, refetch } = useQuery<any>(LISTAR_CATEGORIAS, {
    context: { clientName: 'springboot' },
    fetchPolicy: 'network-only'
  });

  const [crearCategoria, { loading: creating }] = useMutation<any, any>(CREAR_CATEGORIA, {
    context: { clientName: 'springboot' }
  });

  const [eliminarCategoria] = useMutation<any, any>(ELIMINAR_CATEGORIA, {
    context: { clientName: 'springboot' }
  });

  const [nombre, setNombre] = useState('');

  const handleCreate = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es obligatorio');
      return;
    }

    try {
      await crearCategoria({
        variables: { nombre: nombre.trim() }
      });
      setNombre('');
      Alert.alert('Éxito', 'Categoría registrada con éxito');
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = (id: string, catNombre: string) => {
    Alert.alert(
      'Eliminar Categoría',
      `¿Seguro que deseas eliminar la categoría "${catNombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarCategoria({ variables: { id } });
              Alert.alert('Éxito', 'Categoría eliminada');
              refetch();
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const list = data?.listarCategorias || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Categorías</Text>
      <Text style={styles.subtitle}>Crea y administra las categorías de empleo disponibles</Text>

      {/* Form Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Registrar Nueva Categoría</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Tecnología, Ventas, Salud"
          value={nombre}
          onChangeText={setNombre}
        />
        <Pressable
          style={[styles.btn, creating && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Guardar Categoría</Text>
          )}
        </Pressable>
      </View>

      {/* List */}
      <Text style={styles.listTitle}>Categorías Registradas ({list.length})</Text>
      
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.nombre}</Text>
            <Pressable
              onPress={() => handleDelete(item.id, item.nombre)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay categorías registradas todavía.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.lg, marginTop: 2 },
  
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Shadows.sm
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    backgroundColor: '#FFFFFF',
    marginBottom: Spacing.md
  },
  btn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnDisabled: {
    backgroundColor: Colors.border
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: FontSize.md
  },

  listTitle: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm
  },
  list: {
    gap: Spacing.xs
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemName: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: '600'
  },
  deleteBtn: {
    padding: Spacing.xs
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textTertiary,
    marginTop: Spacing.xl,
    fontSize: FontSize.sm
  }
});
