import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ListRenderItem } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, FamilyMember } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'FamilyGroup'>;

const FamilyGroupScreen: React.FC<Props> = () => {
  const familyMembers: FamilyMember[] = [
    { id: '1', name: 'John Doe', role: 'Admin' },
    { id: '2', name: 'Jane Doe', role: 'Member' },
  ];

  const renderMemberItem: ListRenderItem<FamilyMember> = ({ item }) => (
    <View style={styles.memberCard}>
      <Text style={styles.memberName}>{item.name}</Text>
      <Text style={styles.memberRole}>{item.role}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de grupos familiares</Text>

      <FlatList
        data={familyMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderMemberItem}
      />

      <TouchableOpacity style={styles.inviteButton}>
        <Text style={styles.inviteButtonText}>+ Invitar a un miembro de la familia</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  memberCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF', borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  memberName: { fontSize: 16, fontWeight: '500' },
  memberRole: { fontSize: 14, color: '#666' },
  inviteButton: { backgroundColor: '#28A745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  inviteButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default FamilyGroupScreen;