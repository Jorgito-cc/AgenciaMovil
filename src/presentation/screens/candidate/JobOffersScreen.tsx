import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Alert, TextInput, ScrollView } from 'react-native';
import { useQuery, useMutation } from '@apollo/client/react';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../../core/config/theme';
import { LISTAR_OFERTAS, LISTAR_CATEGORIAS } from '../../../data/datasources/graphql/queries';
import { CREAR_POSTULACION } from '../../../data/datasources/graphql/mutations';
import { useAuth } from '../../../core/context/AuthContext';
import { NESTJS_URL } from '../../../core/config/apollo';

export default function JobOffersScreen() {
  const { user } = useAuth();
  
  // Queries
  const { data, loading, error, refetch } = useQuery<any>(LISTAR_OFERTAS, {
    context: { clientName: 'springboot' },
  });

  const { data: categoriesData } = useQuery<any>(LISTAR_CATEGORIAS, {
    context: { clientName: 'springboot' },
  });

  const [crearPostulacion] = useMutation<any, any>(CREAR_POSTULACION, {
    context: { clientName: 'springboot' },
  });

  // State
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const handleApply = async (ofertaId: string) => {
    try {
      // 1. Pick PDF
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const fileAsset = result.assets[0];
      setUploadingId(ofertaId);

      // 2. Upload to NestJS via FileSystem.uploadAsync (bypasses fetch FormData bugs)
      const operations = {
        query: `mutation SubirDocumento($file: Upload!, $usuarioId: String!) { subirDocumento(file: $file, usuarioId: $usuarioId) { id } }`,
        variables: {
          file: null,
          usuarioId: user?.id
        }
      };
      
      const response = await FileSystem.uploadAsync(NESTJS_URL, fileAsset.uri, {
        fieldName: '0',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        parameters: {
          operations: JSON.stringify(operations),
          map: JSON.stringify({ '0': ['variables.file'] }),
        },
        headers: {
          'apollo-require-preflight': 'true',
        },
      });

      const responseData = JSON.parse(response.body);
      
      if (responseData.errors) {
        throw new Error(responseData.errors[0].message);
      }

      const cvId = responseData.data.subirDocumento.id;

      // 3. Create Postulacion in Spring Boot
      await crearPostulacion({
        variables: {
          faseAlcanzada: 'Recibido',
          idCv: cvId,
          candidatoId: user?.id,
          ofertaId: ofertaId
        }
      });

      Alert.alert('¡Éxito!', 'Te has postulado correctamente.');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'No se pudo completar la postulación: ' + err.message);
    } finally {
      setUploadingId(null);
    }
  };

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
        <Text style={styles.errorText}>Error al cargar ofertas</Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  const rawOfertas = data?.listarOfertas || [];
  const categorias = categoriesData?.listarCategorias || [];

  const ofertas = rawOfertas.filter((item: any) => {
    const matchesSearch = !searchText.trim() || 
      item.titulo?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.reclutador?.empresa?.nombre_comercial?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = !selectedCategoryId || item.categoria?.id === selectedCategoryId;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: Spacing.xs }} />
        <TextInput 
          style={styles.searchInput} 
          value={searchText} 
          onChangeText={setSearchText} 
          placeholder="Buscar vacante o empresa..."
          placeholderTextColor={Colors.textTertiary}
        />
        {searchText.length > 0 && (
          <Pressable onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          <Pressable 
            style={[styles.categoryChip, !selectedCategoryId && styles.categoryChipActive]} 
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text style={[styles.categoryChipText, !selectedCategoryId && styles.categoryChipTextActive]}>Todas</Text>
          </Pressable>
          {categorias.map((cat: any) => (
            <Pressable 
               key={cat.id}
               style={[styles.categoryChip, selectedCategoryId === cat.id && styles.categoryChipActive]} 
               onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={[styles.categoryChipText, selectedCategoryId === cat.id && styles.categoryChipTextActive]}>{cat.nombre}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={ofertas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.titulo}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.modalidad_trabajo}</Text>
              </View>
            </View>
            
            <Text style={styles.companyName}>
              <Ionicons name="business" size={14} color={Colors.textSecondary} /> {item.reclutador?.empresa?.nombre_comercial || 'Empresa Anónima'}
            </Text>
            
            <Text style={styles.description} numberOfLines={3}>
              {item.descripcion}
            </Text>
            
            <View style={styles.footer}>
              <Text style={styles.salary}>
                <Ionicons name="cash-outline" size={16} /> ${item.sueldo}
              </Text>
              
              <Pressable 
                style={[styles.applyButton, uploadingId === item.id && styles.applyingButton]}
                onPress={() => handleApply(item.id)}
                disabled={uploadingId === item.id}
              >
                {uploadingId === item.id ? (
                  <ActivityIndicator color={Colors.textWhite} size="small" />
                ) : (
                  <>
                    <Ionicons name="document-attach-outline" size={16} color={Colors.textWhite} />
                    <Text style={styles.applyText}>Aplicar con CV</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}
      />
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
    backgroundColor: Colors.primaryFaded,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  salary: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.success,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  applyingButton: {
    opacity: 0.7,
  },
  applyText: {
    color: Colors.textWhite,
    fontWeight: '600',
    fontSize: FontSize.sm,
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: 4,
  },
  categoriesContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: Colors.textWhite,
  }
});
