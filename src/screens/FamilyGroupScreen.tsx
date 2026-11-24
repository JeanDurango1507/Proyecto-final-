import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal, 
  TextInput, 
  Alert 
} from 'react-native';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'Administrador' | 'Miembro';
}

export default function FamilyGroupScreen() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const handleAddMember = () => {
    if (!nameInput.trim() || !emailInput.trim()) {
      Alert.alert("Campos incompletos", "Por favor ingresa el nombre y el correo electrónico.");
      return;
    }

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: nameInput.trim(),
      email: emailInput.trim(),
      role: members.length === 0 ? 'Administrador' : 'Miembro',
    };

    setMembers((prevMembers) => [...prevMembers, newMember]);
    setNameInput('');
    setEmailInput('');
    setModalVisible(false);
    Alert.alert("Éxito", "Invitación enviada y miembro agregado correctamente.");
  };

  const handleRemoveMember = (id: string, name: string) => {
    Alert.alert(
      "Eliminar miembro",
      `¿Estás seguro de que deseas eliminar a ${name} del grupo familiar?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: () => {
            setMembers((prevMembers) => prevMembers.filter((item) => item.id !== id));
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Administración de Grupo Familiar</Text>
      </View>

      {members.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay miembros en el grupo familiar.</Text>
          <Text style={styles.emptySubText}>Pulsa el botón de abajo para invitar a un nuevo miembro.</Text>
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberEmail}>{item.email}</Text>
                <Text style={[styles.memberRole, item.role === 'Administrador' ? styles.adminText : styles.memberText]}>
                  {item.role}
                </Text>
              </View>

              {/* Botón explícito para eliminar */}
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleRemoveMember(item.id, item.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.inviteButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.inviteButtonText}>+ Invitar miembro de la familia</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para ingresar los datos del nuevo miembro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invitar Familiar</Text>
            <Text style={styles.modalSubtitle}>Ingresa los datos del nuevo integrante:</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#888"
              value={nameInput}
              onChangeText={setNameInput}
            />

            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailInput}
              onChangeText={setEmailInput}
            />

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleAddMember}
              >
                <Text style={styles.confirmButtonText}>Enviar Invitación</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  memberInfo: {
    flex: 1,
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  memberRole: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  adminText: {
    color: '#007AFF',
  },
  memberText: {
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  deleteButtonText: {
    color: '#c62828',
    fontSize: 13,
    fontWeight: 'bold',
  },
  footerContainer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  inviteButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 22,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
    color: '#333',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#28a745',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});