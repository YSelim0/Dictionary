import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ApiService, { ApiRoutes } from '../services/api';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return ApiRoutes.baseUrl + photo;
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await ApiService.getTopicsSorted();
      if (data && data.success && Array.isArray(data.topics)) {
        setTopics(data.topics);
      }
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>
          Welcome to <Text style={styles.heroTitleAccent}>Dictionary</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          This is a platform where you can freely express your ideas!
        </Text>
      </View>

      {/* Description Section */}
      <View style={styles.descriptionSection}>
        <Text style={styles.paragraph}>
          Welcome to <Text style={styles.boldText}>Dictionary</Text>, a platform
          designed to foster open discussions and exploration of diverse topics.
          Users initiate conversations on subjects they're passionate about,
          inviting others to share their perspectives.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.accentText}>Dictionary</Text> is a space dedicated
          to cultivating engaging conversations. Users can create threads covering
          a wide array of topics, encouraging a community where diverse thoughts
          intersect. Here, individuals can express their unique viewpoints, learn
          from each other, and collectively expand their understanding of the world.
        </Text>

        <Text style={styles.paragraph}>
          Join us at <Text style={styles.accentText}>Dictionary</Text> and be part
          of an inclusive community where every voice matters. Together, let's delve
          into the fascinating world of discussions.
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Popular Topics Banner */}
      <View style={styles.bannerSection}>
        <Text style={styles.bannerText}>
          Take a look at the most popular topics of recent days!
        </Text>
      </View>

      {/* Sorted Topics List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <View style={styles.topicsList}>
          {topics.map((topic, index) => (
            <TouchableOpacity
              key={topic.slug || index}
              style={styles.topicCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TopicDetail', { slug: topic.slug })}
            >
              {topic.message && topic.message.user && (
                <View style={styles.topicHeader}>
                  <TouchableOpacity
                    style={styles.userInfo}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate('PublicProfile', {
                        username: topic.message.user.username,
                      })
                    }
                  >
                    {topic.message.user.photoUrl ? (
                      <Image
                        source={{ uri: getPhotoUrl(topic.message.user.photoUrl) }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={16} color={Colors.primary} />
                      </View>
                    )}
                    <View>
                      <Text style={styles.username}>
                        @{topic.message.user.username}
                      </Text>
                      {topic.message.createDate && (
                        <Text style={styles.postDate}>
                          {topic.message.createDate.split(' ')[0]}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.topicTitle} numberOfLines={2}>
                {topic.title}
              </Text>
              {topic.message && topic.message.text ? (
                <Text style={styles.topicMessage} numberOfLines={3}>
                  {topic.message.text}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  heroSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + Spacing.lg,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  heroTitleAccent: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  descriptionSection: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  paragraph: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
    textDecorationLine: 'underline',
  },
  accentText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
  },
  bannerSection: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  topicsList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  topicCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  topicMessage: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
