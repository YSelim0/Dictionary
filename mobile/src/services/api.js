import axios from 'axios';

// Create an axios instance with default headers to prevent Cloudflare blocks
// React Native's default fetch/axios sometimes lacks a User-Agent, causing 403s on Cloudflare
const apiClient = axios.create({
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'DictionaryApp/1.0.0 (Android; React Native)',
  },
});

// Interceptor to ensure Content-Type is set for FormData
apiClient.interceptors.request.use(
  (config) => {
    // If not FormData, ensure we send JSON
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to log detailed errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`[API Error] Request failed:`, error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('Error Data:', error.response.data);
      console.log('Error Status:', error.response.status);
      console.log('Error Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('Error Request Details:', error.request);
    }
    return Promise.reject(error);
  }
);

// ============================================================
// API Routes - All endpoint URLs organized by domain
// Usage: ApiRoutes.baseUrl + ApiRoutes.auth.login
// ============================================================
export const ApiRoutes = {
  baseUrl: 'https://dictionary.yavuzsen.com/server',

  auth: {
    register: '/auth/register.php',
    login: '/auth/login.php',
  },

  user: {
    updateProfile: '/user/update-profile.php',
    changePassword: '/user/change-password.php',
    updatePhoto: '/user/update-photo.php',
    getUser: '/user/get-user.php',
    getUserProfile: '/user/get-user-profile.php',
  },

  post: {
    create: '/post/create-post.php',
    edit: '/post/edit-post.php',
    delete: '/post/delete-post.php',
    toggleLike: '/post/toggle-like-post.php',
  },

  topic: {
    getAll: '/topic/get-all-topics.php',
    getPosts: '/topic/get-posts-of-topic.php',
    getPopular: '/topic/get-popular-topics.php',
    getSorted: '/topic/get-topics-sorted.php',
  },
};

// Helper to build full URL
const buildUrl = (path) => ApiRoutes.baseUrl + path;

// ============================================================
// API Service - Handles all HTTP requests
// Each method sends the request and returns the response data
// ============================================================
class ApiService {

  // ---------------------- Auth ----------------------

  async register(username, password, biography = '') {
    const payload = { username, password };
    if (biography) payload.biography = biography;

    const response = await apiClient.post(buildUrl(ApiRoutes.auth.register), payload);
    return response.data;
  }

  async login(username, password) {
    const payload = { username, password };
    const response = await apiClient.post(buildUrl(ApiRoutes.auth.login), payload);
    return response.data;
  }

  // ---------------------- User ----------------------

  async updateProfile(userId, username, biography) {
    const payload = { userId };
    if (username) payload.username = username;
    if (biography) payload.biography = biography;

    const response = await apiClient.post(buildUrl(ApiRoutes.user.updateProfile), payload);
    return response.data;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const payload = { userId, oldPassword, newPassword };
    const response = await apiClient.post(buildUrl(ApiRoutes.user.changePassword), payload);
    return response.data;
  }

  async updateProfilePhoto(userId, photo) {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('photo', {
      uri: photo.uri,
      type: photo.type || 'image/jpeg',
      name: photo.fileName || 'photo.jpg',
    });

    const response = await apiClient.post(buildUrl(ApiRoutes.user.updatePhoto), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getUser(userId) {
    const payload = { userId };
    const response = await apiClient.post(buildUrl(ApiRoutes.user.getUser), payload);
    return response.data;
  }

  async getUserProfile(username) {
    const response = await apiClient.get(buildUrl(ApiRoutes.user.getUserProfile), {
      params: { username },
    });
    return response.data;
  }

  // ---------------------- Post ----------------------

  async createPost(userId, topic, message) {
    const payload = { userId, topic, message };
    const response = await apiClient.post(buildUrl(ApiRoutes.post.create), payload);
    return response.data;
  }

  async editPost(postId, userId, message) {
    const payload = { postId, userId, message };
    const response = await apiClient.post(buildUrl(ApiRoutes.post.edit), payload);
    return response.data;
  }

  async deletePost(userId, postId) {
    const payload = { userId, postId };
    const response = await apiClient.post(buildUrl(ApiRoutes.post.delete), payload);
    return response.data;
  }

  async toggleLikePost(userId, postId) {
    const payload = { userId, postId };
    const response = await apiClient.post(buildUrl(ApiRoutes.post.toggleLike), payload);
    return response.data;
  }

  // ---------------------- Topic ----------------------

  async getAllTopics() {
    const response = await apiClient.get(buildUrl(ApiRoutes.topic.getAll));
    return response.data;
  }

  async getPostsOfTopic(slug, userId = null) {
    const params = { slug };
    if (userId) params.userId = userId;

    const response = await apiClient.get(buildUrl(ApiRoutes.topic.getPosts), { params });
    return response.data;
  }

  async getPopularTopics() {
    const response = await apiClient.get(buildUrl(ApiRoutes.topic.getPopular));
    return response.data;
  }

  async getTopicsSorted() {
    const response = await apiClient.get(buildUrl(ApiRoutes.topic.getSorted));
    return response.data;
  }
}

export default new ApiService();
