import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Family, FamilyMember, RootStackParamList } from '../types';
import { createFamily, listFamilies, listFamilyMembers } from '../services/familyService';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyGroup'>;

const FamilyGroupScreen: React.FC<Props> = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState('');
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMembers = useCallback(async (familyId: string) => {
    setSelectedFamilyId(familyId);
    setMembers(await listFamilyMembers(familyId));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);

      listFamilies()
        .then(async (result) => {
          if (!active) {
            return;
          }
          setFamilies(result);
          const selected = result.find((family) => family.id === selectedFamilyId) ?? result[0];
          if (selected) {
            const familyMembers = await listFamilyMembers(selected.id);
            if (active) {
              setSelectedFamilyId(selected.id);
              setMembers(familyMembers);
            }
          } else {
            setSelectedFamilyId('');
            setMembers([]);
          }
        })
        .catch((error: unknown) => {
          if (active) {
            Alert.alert(
              'No se pudieron cargar los grupos',
              error instanceof Error ? error.message : 'Verifica la conexión con Supabase.',
            );
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }, [selectedFamilyId]),
  );

  const handleCreate = async (): Promise<void> => {
    const name = familyName.trim();
    if (name.length < 2 || name.length > 100) {
      Alert.alert('Nombre inválido', 'Escribe un nombre de entre 2 y 100 caracteres.');
      return;
    }

    setSaving(true);
    try {
      const family = await createFamily(name);
      setFamilyName('');
      const updatedFamilies = await listFamilies();
      setFamilies(updatedFamilies);
      await loadMembers(family.id);
      Alert.alert('Grupo creado', `“${family.name}” ya está guardado en Supabase.`);
    } catch (error: unknown) {
      Alert.alert(
        'No se pudo completar la operación',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grupos familiares</Text>
      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del grupo"
          placeholderTextColor="#6B7280"
          value={familyName}
          onChangeText={setFamilyName}
          maxLength={100}
        />
        <TouchableOpacity
          style={[styles.createButton, saving && styles.disabled]}
          onPress={handleCreate}
          disabled={saving}
        >
          <Text style={styles.createButtonText}>{saving ? '...' : 'Crear'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Mis grupos</Text>
          <FlatList
            horizontal
            data={families}
            keyExtractor={(family) => family.id}
            ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes grupos.</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.familyChip, selectedFamilyId === item.id && styles.selectedChip]}
                onPress={() => {
                  loadMembers(item.id).catch((error: unknown) => {
                    Alert.alert(
                      'No se pudieron cargar los integrantes',
                      error instanceof Error ? error.message : 'Inténtalo de nuevo.',
                    );
                  });
                }}
              >
                <Text style={[styles.familyName, selectedFamilyId === item.id && styles.selectedText]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          {selectedFamilyId ? (
            <>
              <Text style={styles.sectionTitle}>Integrantes</Text>
              <FlatList
                data={members}
                keyExtractor={(member) => member.id}
                ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron integrantes.</Text>}
                renderItem={({ item }) => (
                  <View style={styles.memberCard}>
                    <Text style={styles.memberName}>{item.name}</Text>
                    <Text style={styles.memberRole}>
                      {item.role === 'Admin' ? 'Administrador' : 'Integrante'}
                    </Text>
                  </View>
                )}
              />
            </>
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8F9FA' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  createRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    padding: 12,
    borderRadius: 8,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  createButton: { backgroundColor: '#28A745', paddingHorizontal: 18, justifyContent: 'center', borderRadius: 8 },
  createButtonText: { color: '#FFF', fontWeight: 'bold' },
  disabled: { opacity: 0.6 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 8 },
  familyChip: { borderWidth: 1, borderColor: '#007AFF', padding: 12, borderRadius: 20, marginRight: 8 },
  selectedChip: { backgroundColor: '#007AFF' },
  familyName: { color: '#007AFF', fontWeight: '600' },
  selectedText: { color: '#FFF' },
  emptyText: { color: '#666', marginVertical: 12 },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 10,
  },
  memberName: { fontSize: 16, fontWeight: '500' },
  memberRole: { fontSize: 14, color: '#666' },
});

export default FamilyGroupScreen;
