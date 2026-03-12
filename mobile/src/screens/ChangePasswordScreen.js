import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function ChangePasswordScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Yeni şifreniz uyuşmuyor.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const currentUserId = user?.userId || user?.id;
      const response = await ApiService.changePassword(currentUserId, oldPassword, newPassword);

      if (response && response.success) {
        Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Hata', response?.message || 'Şifre değiştirilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Hata', 'Teknik bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Spacing.xl + Spacing.sm + insets.top / 2 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şifre Değiştir</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Eski Şifre</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Mevcut şifreniz"
                placeholderTextColor={Colors.textLight}
                secureTextEntry={!showOldPassword}
                value={oldPassword}
                onChangeText={setOldPassword}
              />
              <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                <Ionicons name={showOldPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Yeni şifreniz"
                placeholderTextColor={Colors.textLight}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons name={showNewPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Yeni şifrenizi doğrulayın"
                placeholderTextColor={Colors.textLight}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textOnPrimary} />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color={Colors.textOnPrimary} />
                <Text style={styles.submitButtonText}>Şifreyi Güncelle</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl + Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.primary + '80',
  },
  submitButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
});
