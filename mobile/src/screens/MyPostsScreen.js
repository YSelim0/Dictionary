import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function MyPostsScreen({ route, navigation }) {
  const { user } = useAuth();
  const { posts: initialPosts = [] } = route.params || {};
  const [posts, setPosts] = useState(initialPosts);

  const handleDeletePost = (postId) => {
    Alert.alert(
      'Postu Sil',
      'Bu postu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentUserId = user?.userId || user?.id;
              const response = await ApiService.deletePost(currentUserId, postId);
              if (response && response.success) {
                // Remove from local state
                setPosts((prevPosts) => prevPosts.filter((p) => p.postId !== postId));
              } else {
                Alert.alert('Hata', response?.message || 'Post silinirken bir hata oluştu.');
              }
            } catch (error) {
              console.error('Delete post error:', error);
              Alert.alert('Hata', 'Bir ağ hatası oluştu.');
            }
          },
        },
      ]
    );
  };

  const renderPostItem = ({ item }) => {
    // Format the date simply (e.g., extracting just the date part or leaving as is)
    const dateFormatted = item.createDate ? item.createDate.split(' ')[0] : '';
    
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.titleContainer}
            activeOpacity={0.6}
            onPress={() => navigation.navigate('TopicDetail', { slug: item.slug })}
          >
            <Text style={styles.postTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            {dateFormatted ? (
              <Text style={styles.postDate}>{dateFormatted}</Text>
            ) : null}
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeletePost(item.postId)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.postMessage}>
          {item.message}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Postlarım</Text>
        <View style={{ width: 40 }} /* spacer for centering */ />
      </View>

      {/* Post List */}
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="documents-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyText}>Henüz bir post paylaşmadın.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId?.toString()}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    fontSize: FontSizes.title,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  postCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  postTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deleteButton: {
    padding: 2,
  },
  postDate: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  postMessage: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
