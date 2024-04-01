import HttpRequestService from "./http-request";

const httpRequestService = new HttpRequestService(
  "http://localhost/dictionary/server/"
);

const ApiRoutes = {
  auth: {
    login: "auth/login.php",
    register: "auth/register.php",
  },
  user: {
    getById: "user/get-user.php",
    getUserProfile: "user/get-user-profile.php",
    updateProfile: "user/update-profile.php",
    updateProfilePhoto: "user/update-photo.php",
    changePassword: "user/change-password.php",
  },
  topic: {
    getSorted: "topic/get-topics-sorted.php",
    getPopular: "topic/get-popular-topics.php",
    getPosts: "topic/get-posts-of-topic.php",
  },
  post: {
    toggleLike: "post/toggle-like-post.php",
    create: "post/create-post.php",
    delete: "post/delete-post.php",
  },
};

export default class ApiService {
  static async login(user) {
    return await httpRequestService.post(ApiRoutes.auth.login, user);
  }

  static async register(user) {
    return await httpRequestService.post(ApiRoutes.auth.register, user);
  }

  static async getUserById(userId) {
    return await httpRequestService.post(ApiRoutes.user.getById, { userId });
  }

  static async getTopicsSorted() {
    return await httpRequestService.get(ApiRoutes.topic.getSorted);
  }

  static async getPopularTopics() {
    return await httpRequestService.get(ApiRoutes.topic.getPopular);
  }

  static async getPostsOfTopic(slug, userId = null) {
    return await httpRequestService.get(
      `${ApiRoutes.topic.getPosts}?slug=${slug}${
        userId ? `&userId=${userId}` : ""
      }`
    );
  }

  static async toggleLikePost(postId, userId) {
    return await httpRequestService.post(ApiRoutes.post.toggleLike, {
      postId,
      userId,
    });
  }

  static async createPost(post) {
    return await httpRequestService.post(ApiRoutes.post.create, post);
  }

  static async deletePost(postId, userId) {
    return await httpRequestService.post(ApiRoutes.post.delete, {
      postId,
      userId,
    });
  }

  static async updateProfile(user) {
    return await httpRequestService.post(ApiRoutes.user.updateProfile, user);
  }

  static async changePassword(userId, oldPassword, newPassword) {
    return await httpRequestService.post(ApiRoutes.user.changePassword, {
      userId,
      oldPassword,
      newPassword,
    });
  }

  static async updateProfilePhoto(formData) {
    return await httpRequestService.postFormData(
      ApiRoutes.user.updateProfilePhoto,
      formData
    );
  }

  static async getUserProfile(username) {
    return await httpRequestService.get(
      `${ApiRoutes.user.getUserProfile}?username=${username}`
    );
  }
}
