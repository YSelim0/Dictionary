import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import { ApiRoutes } from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [user.username])
  );

  const fetchProfile = async () => {
    try {
      const data = await ApiService.getUserProfile(user.username);
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ]
    );
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return ApiRoutes.baseUrl + photo;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const displayUser = profile || user;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: Spacing.xl + insets.top / 2 }]}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <TouchableOpacity 
          style={styles.avatarContainer}
          activeOpacity={0.8}
          onPress={() => setAvatarModalVisible(true)}
        >
          {displayUser.photoUrl ? (
            <Image
              source={{ uri: getPhotoUrl(displayUser.photoUrl) }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color={Colors.primary} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.username}>@{displayUser.username}</Text>
        {displayUser.biography ? (
          <Text style={styles.biography}>{displayUser.biography}</Text>
        ) : (
          <Text style={styles.biographyEmpty}>Henüz bir biyografi eklenmemiş</Text>
        )}
      </View>

      {/* Stats */}
      {profile && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.postCount || profile.posts?.length || 0}</Text>
            <Text style={styles.statLabel}>Gönderi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.totalLike ?? 0}</Text>
            <Text style={styles.statLabel}>Beğeni</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.actionItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('MyPosts', { posts: profile?.posts || [] })}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="documents-outline" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>Postlarım</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionItem} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('EditProfile', { 
            initialBiography: displayUser.biography,
            currentPhotoUrl: displayUser.photoUrl 
          })}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>Profili Düzenle</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionItem} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.actionText}>Şifre Değiştir</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionItem, styles.logoutItem]}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <View style={[styles.actionIcon, styles.logoutIcon]}>
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          </View>
          <Text style={[styles.actionText, styles.logoutText]}>Çıkış Yap</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Avatar Enlargement Modal */}
      <Modal
        visible={isAvatarModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <TouchableOpacity 
            style={styles.modalDismissArea} 
            activeOpacity={1} 
            onPress={() => setAvatarModalVisible(false)} 
          />
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={() => setAvatarModalVisible(false)}
            >
              <Ionicons name="close" size={32} color={Colors.textOnPrimary} />
            </TouchableOpacity>
            {displayUser.photoUrl ? (
              <Image
                source={{ uri: getPhotoUrl(displayUser.photoUrl) }}
                style={styles.modalAvatar}
              />
            ) : (
              <View style={styles.modalAvatarPlaceholder}>
                <Ionicons name="person" size={120} color={Colors.primary} />
              </View>
            )}
          </View>
        </View>
      </Modal>

    </ScrollView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: Colors.card,
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 135,
    height: 135,
    borderRadius: 67.5,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 135,
    height: 135,
    borderRadius: 67.5,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primary + '30',
  },
  username: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  biography: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  biographyEmpty: {
    fontSize: FontSizes.md,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  actionsSection: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  actionText: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIcon: {
    backgroundColor: Colors.error + '15',
  },
  logoutText: {
    color: Colors.error,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: -60,
    right: -40,
    padding: Spacing.md,
    zIndex: 10,
  },
  modalAvatar: {
    width: 300,
    height: 300,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  modalAvatarPlaceholder: {
    width: 300,
    height: 300,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
});
