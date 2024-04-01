<template>
  <div class="profile">
    <div class="profile-content">
      <div class="user">
        <div class="photo">
          <img :src="user.photoUrl" alt="profile-photo" />
        </div>

        <div class="information">
          <h2>{{ user.username }}</h2>
          <p>{{ user.biography }}</p>
        </div>
      </div>

      <div class="post-container">
        <div class="post" v-for="(post, key) in user.posts" :key="key">
          <div class="post-content">
            <router-link class="topic-link" :to="`/topic/${post.slug}`">
              <h2>{{ post.title }}</h2>
            </router-link>

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
        </div>
      </div>
    </div>

    <div class="right-sidebar">
      <LoginModal />

      <MobileAppModal />
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/api-service";
import { mapGetters } from "vuex";
import cookies from "js-cookie";

import MobileAppModal from "@/components/MobileAppModal.vue";
import LoginModal from "@/components/LoginModal.vue";

export default {
  name: "ProfileView",
  data() {
    return {
      user: {},
      currentUserId: "",
      currentUserUsername: "",
    };
  },
  components: {
    MobileAppModal,
    LoginModal,
  },
  computed: {
    ...mapGetters(["getUser"]),
  },
  async mounted() {
    this.currentUserUsername = await this.getUser.username;

    const result = await ApiService.getUserProfile(this.$route.params.username);

    if (!result.success) {
      this.$store.dispatch("addSnackbarItemAction", {
        text: result.message,
        type: "error",
      });
      return;
    }

    delete result.success;
    delete result.message;
    this.user = result;
  },
  methods: {
    async deletePost(postId) {
      this.currentUserId = this.getUser.id || cookies.get("user-id");

      const result = await ApiService.deletePost(postId, this.currentUserId);

      if (!result.success) {
        return this.$store.dispatch("addSnackbarItemAction", {
          text: result.message,
          type: "error",
        });
      }

      this.user.posts = this.user.posts.filter((p) => p.postId != postId);

      this.$store.dispatch("addSnackbarItemAction", {
        text: result.message,
        type: "success",
      });
    },
  },
};
</script>

<style scoped>
.profile {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 500px;
}

.profile-content {
  width: 100%;
  height: 100%;
  padding-inline: 50px;
}

.user {
  width: 100%;
  display: grid;
  grid-template-columns: 300px 1fr;
  column-gap: 25px;
  margin-bottom: 50px;
}

.user .photo {
  width: 300px;
  height: 300px;
}

.user .photo img {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 50%;
}

.user .information h2 {
  margin-bottom: 20px;
}

.post {
  width: 100%;
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

.topic-link {
  text-decoration: none;
}

.topic-link:hover {
  text-decoration: underline;
}

.topic-link h2 {
  color: var(--link-color);
  margin-bottom: 15px;
}

@media screen and (max-width: 1560px) {
  .profile {
    grid-template-columns: 1fr 300px;
  }
}

@media screen and (max-width: 1350px) {
  .profile {
    grid-template-columns: 1fr;
  }

  .right-sidebar {
    padding-inline: 50px;
  }

  .user {
    grid-template-columns: 200px 1fr;
  }

  .user .photo img,
  .user .photo {
    width: 200px;
    height: 200px;
  }

  @media screen and (max-width: 1000px) {
    .user {
      grid-template-columns: 1fr;
      place-items: center;
      row-gap: 25px;
      text-align: center;
    }
  }

  @media screen and (max-width: 800px) {
    .profile-content,
    .right-sidebar {
      padding-inline: 0px;
    }

    .post-content {
      padding-inline: 0px;
    }
  }
}
</style>
