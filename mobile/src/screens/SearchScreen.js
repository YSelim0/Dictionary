import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiService, { ApiRoutes } from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [allTopics, setAllTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User Search States
  const [searchedUser, setSearchedUser] = useState(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [userSearchError, setUserSearchError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchAllTopics();
    }, [])
  );

  // Effect to handle both Topic filtering and User searching
  useEffect(() => {
    let isActive = true;

    if (query.trim() === '') {
      setFilteredTopics(allTopics);
      setSearchedUser(null);
      setUserSearchError(null);
      setIsSearchingUser(false);
      return;
    }

    if (query.startsWith('@')) {
      // User Search Mode
      const usernameQuery = query.substring(1).trim();
      if (usernameQuery.length > 0) {
        setIsSearchingUser(true);
        setUserSearchError(null);

        const delayDebounceFn = setTimeout(async () => {
          if (!isActive) return;
          try {
            const data = await ApiService.getUserProfile(usernameQuery);
            if (!isActive) return; // Prevent old requests overriding new ones
            
            if (data && data.success !== false) {
              setSearchedUser(data);
              setUserSearchError(null);
            } else {
              setSearchedUser(null);
              setUserSearchError('Kullanıcı bulunamadı');
            }
          } catch (error) {
            if (!isActive) return;
            console.error('Failed to search user:', error);
            setSearchedUser(null);
            setUserSearchError('Arama sırasında hata oluştu');
          } finally {
            if (isActive) setIsSearchingUser(false);
          }
        }, 500); // 500ms wait time (debounce)

        return () => {
          isActive = false;
          clearTimeout(delayDebounceFn);
        };
      } else {
        setSearchedUser(null);
        setUserSearchError(null);
        setIsSearchingUser(false);
      }
    } else {
      // Topic Search Mode
      setSearchedUser(null);
      setUserSearchError(null);
      setIsSearchingUser(false);

      const lowerQuery = query.toLowerCase();
      const filtered = allTopics.filter((topic) => {
        const name = (topic.topic || topic.title || topic.name || '').toLowerCase();
        return name.includes(lowerQuery);
      });
      setFilteredTopics(filtered);
    }

    return () => {
      isActive = false;
    };
  }, [query, allTopics]);

  const fetchAllTopics = async () => {
    try {
      const data = await ApiService.getAllTopics();
      if (data && data.success && Array.isArray(data.topics)) {
        setAllTopics(data.topics);
        setFilteredTopics(data.topics);
      } else if (data && Array.isArray(data)) {
        // Fallback backward compatibility
        setAllTopics(data);
        setFilteredTopics(data);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTopicItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.topicItem} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('TopicDetail', { slug: item.slug })}
    >
      <View style={styles.topicIcon}>
        <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
      </View>
      <View style={styles.topicInfo}>
        <Text style={styles.topicName} numberOfLines={1}>
          {item.topic || item.title || item.name}
        </Text>
        {item.postCount !== undefined && (
          <Text style={styles.topicCount}>{item.postCount} gönderi</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
    </TouchableOpacity>
  );

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return ApiRoutes.baseUrl + photo;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    if (query.startsWith('@')) {
      const usernameQuery = query.substring(1).trim();
      
      if (usernameQuery.length === 0) {
        return (
          <View style={styles.centered}>
            <Ionicons name="person-search-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>Kullanıcı adı yazmaya başlayın...</Text>
          </View>
        );
      }

      if (isSearchingUser) {
        return (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.emptyText, { marginTop: Spacing.md }]}>@{usernameQuery} aranıyor...</Text>
          </View>
        );
      }

      if (userSearchError || !searchedUser) {
        return (
          <View style={styles.centered}>
            <Ionicons name="person-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>
              {userSearchError || 'Kullanıcı bulunamadı'}
            </Text>
          </View>
        );
      }

      // Render User Card
      const photoDisplay = getPhotoUrl(searchedUser.photoUrl);
      return (
        <View style={styles.list}>
          <TouchableOpacity 
            style={styles.userCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PublicProfile', { username: searchedUser.username })}
          >
            {photoDisplay ? (
              <Image source={{ uri: photoDisplay }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Ionicons name="person" size={24} color={Colors.primary} />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>@{searchedUser.username}</Text>
              {searchedUser.biography ? (
                <Text style={styles.userBio} numberOfLines={1}>{searchedUser.biography}</Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      );
    }

    // Default Topic Listing
    if (filteredTopics.length === 0) {
      return (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={64} color={Colors.textLight} />
          <Text style={styles.emptyText}>
            {query ? 'Sonuç bulunamadı' : 'Henüz başlık yok'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredTopics}
        keyExtractor={(item, index) => (item.id || index).toString()}
        renderItem={renderTopicItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Spacing.xl + insets.top / 2 }]}>
        <Text style={styles.headerTitle}>Ara</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Başlık veya @kullanıcı adı ara..."
            placeholderTextColor={Colors.textLight}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderContent()}
    </View>
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
    marginBottom: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    height: 42,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: Spacing.md,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  topicCount: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userBio: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
