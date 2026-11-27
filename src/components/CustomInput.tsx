import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface CustomInputProps extends TextInputProps {
  label: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  style,
  placeholderTextColor = '#6B7280',
  selectionColor = '#2563EB',
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={placeholderTextColor}
        selectionColor={selectionColor}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15, width: '100%' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
});
