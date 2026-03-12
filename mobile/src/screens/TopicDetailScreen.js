import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiService, { ApiRoutes } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function TopicDetailScreen({ route, navigation }) {
  const { slug } = route.params;
  const { user } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [topicInfo, setTopicInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Post Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTopicPosts();
  }, [slug]);

  const fetchTopicPosts = async () => {
    try {
      const currentUserId = user?.userId || user?.id;
      // The backend returns { success: true, topic: { topicId, topicTitle, posts: [...] } }
      const data = await ApiService.getPostsOfTopic(slug, currentUserId);
      if (data && data.success && data.topic) {
        setPosts(data.topic.posts || []);
        setTopicInfo(data.topic);
      } else if (data && Array.isArray(data)) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch topic posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return ApiRoutes.baseUrl + photo;
  };

  const handleToggleLike = async (postId, currentLikeStatus) => {
    if (!user) {
      Alert.alert('Giriş Yapmalısınız', 'Postları beğenmek için giriş yapmalısınız.');
      return;
    }
    
    // Optimistic UI update
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.postId === postId) {
          const isCurrentlyLiked = post.isUserLiked === "1" || post.isUserLiked === 1 || post.isUserLiked === true;
          const newLikeCount = parseInt(post.likesCount || 0) + (isCurrentlyLiked ? -1 : 1);
          return {
            ...post,
            isUserLiked: isCurrentlyLiked ? "0" : "1",
            likesCount: Math.max(0, newLikeCount).toString()
          };
        }
        return post;
      })
    );

    try {
      const currentUserId = user?.userId || user?.id;
      const response = await ApiService.toggleLikePost(currentUserId, postId);
      if (!response?.success) {
        // Revert on error - simplified for brevity, ideally would revert to exact previous state
        console.warn('Toggle like api returned unsuccessful:', response);
      }
    } catch (error) {
      console.error('Like toggle error:', error);
    }
  };

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
    const dateFormatted = item.createDate ? item.createDate.split(' ')[0] : '';
    const hasPhoto = !!item.photoUrl;
    const isOwner = user?.username === item.username;
    
    // The API might return "1", 1, or true for liked status
    const isLiked = item.isUserLiked === "1" || item.isUserLiked === 1 || item.isUserLiked === true;

    return (
      <View style={styles.postCard}>
        {/* User Info Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.userInfo} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PublicProfile', { username: item.username })}
          >
            {hasPhoto ? (
              <Image source={{ uri: getPhotoUrl(item.photoUrl) }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={16} color={Colors.primary} />
              </View>
            )}
            <View>
              <Text style={styles.username}>@{item.username}</Text>
              {dateFormatted ? (
                <Text style={styles.postDate}>{dateFormatted}</Text>
              ) : null}
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {isOwner && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeletePost(item.postId)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.upvoteContainer}
              onPress={() => handleToggleLike(item.postId, isLiked)}
              activeOpacity={0.6}
            >
              <Ionicons 
                name={isLiked ? "chevron-up" : "chevron-up-outline"} 
                size={24} 
                color={isLiked ? Colors.primary : Colors.textSecondary} 
              />
              <Text style={[styles.upvoteCount, isLiked && styles.upvoteCountActive]}>
                {item.likesCount || 0}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.postMessage}>{item.message}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Use the title from the first post if topicInfo is missing, or topicTitle from topicInfo
  const displayTitle = topicInfo?.topicTitle || (posts.length > 0 ? posts[0].title : 'Konu Detayı');

  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert('Giriş Yapmalısınız', 'Mesaj göndermek için giriş yapmalısınız.');
      setModalVisible(false);
      return;
    }
    if (!newMessage.trim()) {
      Alert.alert('Hata', 'Mesaj boş bırakılamaz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentUserId = user?.userId || user?.id;
      // We pass the string title of the topic, just like the web app payload
      const response = await ApiService.createPost(currentUserId, displayTitle, newMessage.trim());
      
      if (response && response.success) {
        setNewMessage('');
        setModalVisible(false);
        // Refresh the posts to show the newly added one
        fetchTopicPosts();
      } else {
        Alert.alert('Hata', response?.message || 'Mesaj gönderilemedi.');
      }
    } catch (error) {
      console.error('Create post error:', error);
      Alert.alert('Hata', 'Teknik bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
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
        <Text style={styles.headerTitle} numberOfLines={1}>{displayTitle}</Text>
        {user ? (
          <TouchableOpacity 
            style={styles.headerRightButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="create-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Post List */}
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyText}>Bu başlıkta henüz bir post yok.</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item, index) => item.postId ? item.postId.toString() : index.toString()}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Reply Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)} 
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bu başlığa yanıt yaz</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Düşüncelerinizi paylaşın..."
              placeholderTextColor={Colors.textLight}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              autoFocus
              textAlignVertical="top"
            />

            <TouchableOpacity 
              style={[styles.modalSubmitButton, isSubmitting && styles.modalSubmitButtonDisabled]}
              onPress={handleCreatePost}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.textOnPrimary} size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color={Colors.textOnPrimary} />
                  <Text style={styles.modalSubmitText}>Gönder</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  headerRightButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
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
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  username: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  postDate: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  upvoteContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  upvoteCount: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: -4,
  },
  upvoteCountActive: {
    color: Colors.primary,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl + Spacing.md : Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    minHeight: 120,
    marginBottom: Spacing.md,
  },
  modalSubmitButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: Colors.primary + '80',
  },
  modalSubmitText: {
    color: Colors.textOnPrimary,
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
});
