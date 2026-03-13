import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiService, { ApiRoutes } from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function PublicProfileScreen({ route, navigation }) {
  const { username } = route.params; // Expecting username from navigation
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [username])
  );

  const fetchProfile = async () => {
    try {
      const data = await ApiService.getUserProfile(username);
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return ApiRoutes.baseUrl + photo;
  };

  const renderPostItem = ({ item }) => {
    const dateFormatted = item.createDate ? item.createDate.split(' ')[0] : '';
    return (
      <View style={styles.postCard}>
        <TouchableOpacity
          style={styles.postHeader}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('TopicDetail', { slug: item.topicSlug || item.slug })}
        >
          <Text style={styles.postTitle} numberOfLines={1}>
            {item.topicTitle || item.title || 'Başlık'}
          </Text>
          {dateFormatted ? <Text style={styles.postDate}>{dateFormatted}</Text> : null}
        </TouchableOpacity>
        <Text style={styles.postMessage}>{item.message}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Ionicons name="person-circle-outline" size={64} color={Colors.textLight} />
        <Text style={styles.errorText}>Kullanıcı bulunamadı.</Text>
        <TouchableOpacity style={styles.backBtnFallback} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnFallbackText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Define posts specifically depending on API payload design. Usually it's inside `profile.posts`
  const posts = profile.posts || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Spacing.xl + Spacing.sm + insets.top / 2 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>@{profile.username || username}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item, index) => item.postId ? item.postId.toString() : index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                activeOpacity={0.8}
                onPress={() => setAvatarModalVisible(true)}
              >
                {profile.photoUrl ? (
                  <Image
                    source={{ uri: getPhotoUrl(profile.photoUrl) }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={60} color={Colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.username}>@{profile.username || username}</Text>
              {profile.biography ? (
                <Text style={styles.biography}>{profile.biography}</Text>
              ) : (
                <Text style={styles.biographyEmpty}>Henüz bir biyografi eklenmemiş</Text>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.postCount || posts.length || 0}</Text>
                <Text style={styles.statLabel}>Gönderi</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.totalLike ?? 0}</Text>
                <Text style={styles.statLabel}>Beğeni</Text>
              </View>
            </View>
            
            <Text style={styles.postsHeader}>Kullanıcının Gönderileri</Text>
          </>
        }
        renderItem={renderPostItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>Bu kullanıcı henüz gönderi paylaşmamış.</Text>
          </View>
        }
      />

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
            {profile.photoUrl ? (
              <Image
                source={{ uri: getPhotoUrl(profile.photoUrl) }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: Spacing.xxl,
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
    marginBottom: Spacing.xl,
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
    height: '100%',
  },
  postsHeader: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  postCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  postTitle: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  postDate: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  postMessage: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  backBtnFallback: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  backBtnFallbackText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '700',
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
