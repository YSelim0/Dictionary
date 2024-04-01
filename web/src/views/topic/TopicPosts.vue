<template>
  <div class="topics">
    <div class="topic-posts">
      <h1>{{ topic.topicTitle }}</h1>

      <div class="post" v-for="(post, key) in topic.posts" :key="key">
        <div class="post-content">
          <pre>{{ post.message }}</pre>

          <div class="line"></div>

          <div class="post-author">
            <div
              class="delete-post"
              v-if="
                currentUserUsername != '' &&
                currentUserUsername == post.username
              "
              @click="deletePost(post.postId)"
            >
              <i class="fa-solid fa-trash-can"></i>
            </div>

            <div class="author-info">
              <div class="author-name">
                <router-link :to="`/u/${post.username}`">{{
                  post.username
                }}</router-link>
              </div>

              <div class="author-date">
                <span>{{ post.createDate.replaceAll("-", "/") }}</span>
              </div>
            </div>

            <div class="author-avatar">
              <img :src="post.photoUrl" alt="avatar" />
            </div>
          </div>
        </div>

        <div class="like">
          <div
            :class="post.isUserLiked == 1 ? 'liked' : ''"
            @click="toggleLike(post)"
          >
            <i class="fa-solid fa-chevron-up"></i>
            <span>{{ post.likesCount }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="right-sidebar">
      <div class="create-post" v-if="currentUserId">
        <h3>Send Message</h3>

        <textarea
          name="create-post"
          id="create-post"
          cols="30"
          rows="10"
          placeholder="Your Message..."
          v-model="messageInput"
        ></textarea>
        <div class="row">
          <button @click="sendMessage()">Send</button>
        </div>

        <MobileAppModal />
      </div>

      <div class="login" v-else>
        <LoginModal />

        <MobileAppModal />
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/api-service";
import { mapGetters, mapActions } from "vuex";
import cookies from "js-cookie";

import MobileAppModal from "@/components/MobileAppModal.vue";
import LoginModal from "@/components/LoginModal.vue";

export default {
  name: "TopicPostsView",
  components: {
    MobileAppModal,
    LoginModal,
  },
  data() {
    return {
      topic: {
        topicId: "",
        topicTitle: "",
        posts: [],
      },
      currentUserId: "",
      currentUserUsername: "",
      messageInput: "",
    };
  },
  computed: {
    ...mapGetters(["getUser"]),
  },
  async created() {
    await this.getTopicDetails();
    this.currentUserUsername = await this.getUser.username;

    document.title = `${this.topic.topicTitle} - Dictionary`;
  },
  watch: {
    async "$route.params.slug"() {
      await this.getTopicDetails();

      document.title = `${this.topic.topicTitle} - Dictionary`;
    },
  },
  methods: {
    ...mapActions(["addSnackbarItemAction"]),
    async getTopicDetails() {
      this.currentUserId = this.getUser.id || cookies.get("user-id");
      let result;

      if (!this.currentUserId) {
        result = await ApiService.getPostsOfTopic(this.$route.params.slug);
      } else if (this.currentUserId) {
        result = await ApiService.getPostsOfTopic(
          this.$route.params.slug,
          this.currentUserId
        );
      }

      this.topic = result.topic;
    },
    async toggleLike(post) {
      if (!cookies.get("user-id") || !this.getUser.id) {
        this.addSnackbarItemAction({
          text: "You must be logged in to like a post.",
          type: "error",
        });
        return;
      }

      const result = await ApiService.toggleLikePost(
        post.postId,
        this.getUser.id
      );

      if (!result.success) {
        this.addSnackbarItemAction({
          text: result.message,
          type: "error",
        });
        return;
      }

      post.isUserLiked = result.isUserLiked;

      if (result.isUserLiked) {
        post.likesCount++;
      } else {
        post.likesCount--;
      }

      this.topic.posts = this.topic.posts.map((p) => {
        if (p.postId === post.postId) {
          return post;
        }

        return p;
      });

      this.addSnackbarItemAction({
        text: result.message,
        type: "success",
      });
    },
    async sendMessage() {
      if (!cookies.get("user-id") || !this.getUser.id) {
        this.addSnackbarItemAction({
          text: "You must be logged in to send a message.",
          type: "error",
        });
        return;
      }

      const result = await ApiService.createPost({
        userId: this.currentUserId,
        topic: this.topic.topicTitle,
        message: this.messageInput,
      });

      if (!result.success) {
        this.addSnackbarItemAction({
          text: result.message,
          type: "error",
        });
        return;
      }

      this.topic.posts.push(result.createdPost);
      this.messageInput = "";

      this.addSnackbarItemAction({
        text: "Message Sent.",
        type: "success",
      });

      window.scrollTo(0, document.body.offsetHeight - window.innerHeight);
    },
    async deletePost(postId) {
      const result = await ApiService.deletePost(postId, this.currentUserId);

      if (!result.success) {
        return this.addSnackbarItemAction({
          text: result.message,
          type: "error",
        });
      }

      this.topic.posts = this.topic.posts.filter((p) => p.postId != postId);

      this.addSnackbarItemAction({
        text: result.message,
        type: "success",
      });
    },
  },
};
</script>

<style scoped>
.topics {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 500px;
}

.topic-posts {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-inline: 50px;
}

.topic > h1 {
  margin-bottom: 50px;
}

.post {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 50px;
}

.post::not(:last-child) {
  margin-bottom: 50px;
}

.post-content {
  padding: 25px;
}

.post-content pre {
  text-wrap: wrap;
}

.post .like {
  display: grid;
  place-items: center;
}

.post .like > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 25px;
  cursor: pointer;
}

.post .like > div.liked {
  color: var(--link-color);
}

.post .line {
  width: 100%;
  height: 1px;
  background-color: var(--secondary-color);
  margin-block: 20px;
}

.post .post-author {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.author-info {
  text-align: right;
}

.post .post-author .author-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 10px;
}

.author-name a {
  color: var(--link-color);
  text-decoration: none;
}

.author-name a:hover {
  text-decoration: underline;
}

.author-date {
  font-size: 12px;
}

.right-sidebar {
  display: flex;
  flex-direction: column;
  position: relative;
}

.create-post {
  position: sticky;
  top: 130px;
  border-radius: 5px;
}

.create-post h3 {
  margin-bottom: 25px;
}

.create-post textarea {
  width: 100%;
  height: 200px;
  border: none;
  border-radius: 5px;
  padding: 10px;
  resize: none;
  outline: none;
  font-size: 16px;
}

.create-post .row {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
}

.create-post button {
  padding: 10px 25px;
  border: none;
  border-radius: 5px;
  background-color: var(--link-color);
  color: var(--white-color);
  cursor: pointer;
  outline: none;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.create-post button:hover {
  background-color: var(--link-color-hover);
}

.login {
  position: sticky;
  top: 130px;
}

.delete-post {
  color: red;
  margin-right: 15px;
  font-size: 25px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-post:hover {
  color: rgba(255, 0, 0, 0.658);
}

@media screen and (max-width: 1560px) {
  .topics {
    grid-template-columns: 1fr 300px;
  }
}

@media screen and (max-width: 1250px) {
  .topics {
    grid-template-columns: 1fr;
  }

  .right-sidebar {
    padding-inline: 50px;
  }
}

@media screen and (max-width: 450px) {
  .topic-posts,
  .right-sidebar {
    padding: 0px;
  }
}

@media screen and (max-width: 375px) {
  /* edit textarea input */
}
</style>
