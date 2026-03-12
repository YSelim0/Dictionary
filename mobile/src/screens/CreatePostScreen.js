import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function CreatePostScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!topic.trim()) {
      Alert.alert('Hata', 'Başlık alanı boş bırakılamaz.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Hata', 'Mesaj alanı boş bırakılamaz.');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.createPost(user.id, topic.trim(), message.trim());
      if (response && response.success) {
        Alert.alert('Başarılı', 'Gönderi oluşturuldu!', [
          { 
          text: 'Tamam', 
          onPress: () => {
              // The response could return a slug,
              // but we still generate a slug from the title we have and navigate to that page
              const slug = topic.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              
              setTopic('');
              setMessage('');
              navigation.navigate('TopicDetail', { slug: slug });
            }
          }
        ]);
      } else {
        Alert.alert('Hata', response?.message || 'Gönderi oluşturulamadı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Create post error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: Spacing.xl + insets.top / 2 }]}>
        <Text style={styles.headerTitle}>Yeni Gönderi</Text>
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Başlık</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="pricetag-outline" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Başlık girin..."
              placeholderTextColor={Colors.textLight}
              value={topic}
              onChangeText={setTopic}
              maxLength={100}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mesaj</Text>
          <View style={[styles.inputContainer, styles.messageContainer]}>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Düşüncelerinizi paylaşın..."
              placeholderTextColor={Colors.textLight}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.charCount}>{message.length} karakter</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color={Colors.textOnPrimary} />
          <Text style={styles.submitButtonText}>
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  messageContainer: {
    height: 160,
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  messageInput: {
    height: '100%',
  },
  charCount: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 50,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.textOnPrimary,
  },
});
