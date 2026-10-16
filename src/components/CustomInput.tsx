import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface CustomInputProps extends TextInputProps {
  label: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({ label, ...props }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={styles.input} 
        placeholderTextColor="#888"
        {...props} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15, width: '100%' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#CCC', padding: 12, borderRadius: 8, fontSize: 16, backgroundColor: '#FFF' },
});