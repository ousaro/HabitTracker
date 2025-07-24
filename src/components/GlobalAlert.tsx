// components/GlobalAlert.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const COLORS = {
  success: { bg: '#d1fae5', text: '#065f46' }, // green-100 / green-700
  error: { bg: '#fee2e2', text: '#991b1b' },   // red-100 / red-700
  confirm: { bg: '#fef3c7', text: '#78350f' }, // yellow-100 / yellow-700
  info: { bg: '#dbeafe', text: '#1e40af' },    // blue-100 / blue-700
};

type AlertType = 'success' | 'error' | 'confirm' | 'info';

interface GlobalAlertProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: AlertType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const GlobalAlert = ({
  visible,
  onClose,
  onConfirm,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
}: GlobalAlertProps) => {
  const colors = COLORS[type];

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={[styles.alertContainer, { backgroundColor: colors.bg }]}>
          {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>

          <View style={styles.buttonRow}>
            {(type === 'confirm' || type === 'error') && (
              <TouchableOpacity onPress={onClose} style={styles.button}>
                <Text style={[styles.cancelText]}> {cancelText} </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onConfirm} style={styles.button}>
              <Text style={[styles.confirmText, { color: colors.text }]}> {confirmText} </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: 300,
    borderRadius: 12,
    padding: 20,
    // backgroundColor: dynamic based on type
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12, // React Native <0.71 does not support gap; you can use margin instead
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280', // gray-500
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
