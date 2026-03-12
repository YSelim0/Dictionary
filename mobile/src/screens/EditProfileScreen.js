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
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ApiService, { ApiRoutes } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function EditProfileScreen({ route, navigation }) {
  const { user, updateUser } = useAuth();
  // Pass the initial biography via route params from ProfileScreen for immediate binding
  const { initialBiography, currentPhotoUrl } = route.params || {};

  const [username, setUsername] = useState(user?.username || '');
  const [biography, setBiography] = useState(initialBiography || user?.biography || '');
  const [photoUri, setPhotoUri] = useState(null); // Local camera roll URI
  
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return ApiRoutes.baseUrl + photo;
  };

  const handlePickImage = async () => {
    // Request permission first
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Fotoğraf yükleyebilmek için galeri erişim iznine ihtiyacımız var.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square avatar
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      
      // We can trigger the upload immediately or save it alongside text. We'll upload right away for better UX.
      uploadPhoto(asset);
    }
  };

  const uploadPhoto = async (asset) => {
    setIsPhotoUploading(true);
    try {
      const currentUserId = user?.userId || user?.id;
      
      const photoPayload = {
        uri: asset.uri,
        type: 'image/jpeg',
        fileName: asset.fileName || 'profile.jpg',
      };

      const response = await ApiService.updateProfilePhoto(currentUserId, photoPayload);
      if (response && response.success) {
        Alert.alert('Başarılı', 'Profil fotoğrafınız güncellendi.');
        // Optionally update global auth context so the new photo flows down
        if (response.photoUrl) {
           updateUser({ photoUrl: response.photoUrl });
        }
      } else {
        Alert.alert('Hata', response?.message || 'Fotoğraf yüklenemedi.');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert('Hata', 'Fotoğraf yüklenirken bir ağ hatası oluştu.');
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    const trimmedUsername = username.trim();
    const trimmedBio = biography.trim();

    if (!trimmedUsername) {
      Alert.alert('Hata', 'Kullanıcı adı boş bırakılamaz.');
      return;
    }

    if (trimmedUsername.length > 30) {
      Alert.alert('Hata', 'Kullanıcı adı 30 karakterden uzun olamaz.');
      return;
    }

    // RegEx checking: only a-z, A-Z, 0-9, underscores, and dots (no spaces, no TR characters)
    const validUsernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!validUsernameRegex.test(trimmedUsername)) {
      Alert.alert(
        'Geçersiz Kullanıcı Adı', 
        'Kullanıcı adı boşluk içeremez. Türkçe karakter (ş, ğ, ç, ö, ü, ı vb.) kullanılamaz. Sadece İngilizce harfler, rakamlar, alt tire (_) ve nokta (.) kullanabilirsiniz.'
      );
      return;
    }

    setIsSaving(true);
    try {
      const currentUserId = user?.userId || user?.id;

      // Check if username changed
      if (trimmedUsername !== user?.username) {
        // Verify if it's already taken
        const checkUser = await ApiService.getUserProfile(trimmedUsername);
        if (checkUser && checkUser.success) {
          Alert.alert('Hata', 'Bu kullanıcı adı zaten alınmış. Lütfen başka bir tane seçin.');
          setIsSaving(false);
          return;
        }
      }

      // Proceed to update
      const response = await ApiService.updateProfile(currentUserId, trimmedUsername, trimmedBio);

      if (response && response.success) {
        Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.', [
          { text: 'Tamam', onPress: () => {
              updateUser({ username: trimmedUsername, biography: trimmedBio });
              navigation.goBack();
          }}
        ]);
      } else {
        Alert.alert('Hata', response?.message || 'Profil güncellenirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const displayPhoto = photoUri || getPhotoUrl(currentPhotoUrl || user?.photoUrl);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity 
          style={styles.headerSaveButton}
          onPress={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.saveText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.photoSection}>
            <TouchableOpacity 
              style={styles.avatarContainer} 
              activeOpacity={0.8}
              onPress={handlePickImage}
              disabled={isPhotoUploading}
            >
              {displayPhoto ? (
                <Image source={{ uri: displayPhoto }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={48} color={Colors.primary} />
                </View>
              )}
              
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color={Colors.textOnPrimary} />
              </View>

              {isPhotoUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color={Colors.textOnPrimary} size="large" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoHintText}>Değiştirmek için dokunun</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputText}
                placeholder="Kullanıcı adınızı girin"
                placeholderTextColor={Colors.textLight}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Biyografi</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Kendinizden bahsedin..."
                placeholderTextColor={Colors.textLight}
                value={biography}
                onChangeText={setBiography}
                multiline
                maxLength={300}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{biography.length}/300</Text>
            </View>
          </View>

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
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerSaveButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  saveText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.primary,
  },
  content: {
    padding: Spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginVertical: Spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoHintText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  textAreaContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  textArea: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    minHeight: 120,
  },
  charCount: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
  },
});
