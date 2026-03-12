import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';

export default function HomeScreen() {
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
});
