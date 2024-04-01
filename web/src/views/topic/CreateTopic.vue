<template>
  <div class="create-topic">
    <div class="inputs">
      <h1>Create Topic</h1>

      <div class="title-input">
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Starts the discussion..."
          v-model="title"
        />

        <div class="character-limit">
          <span :class="title.length > 70 ? 'warning' : ''"
            >{{ title.length }}/70</span
          >
        </div>
      </div>

      <div class="message-input">
        <textarea
          name="message"
          id="message"
          cols="30"
          rows="10"
          placeholder="Message..."
          v-model="message"
        ></textarea>

        <div class="character-limit">
          <span :class="message.length > 250 ? 'warning' : ''"
            >{{ message.length }}/250</span
          >
        </div>
      </div>

      <div class="row">
        <button
          :disabled="title == '' || message == '' ? true : false"
          @click="createTopic"
        >
          Send
        </button>
      </div>
    </div>

    <div class="right-sidebar">
      <div class="login">
        <LoginModal />

        <MobileAppModal />
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/api-service";
import { mapGetters } from "vuex";
import cookies from "js-cookie";

import LoginModal from "@/components/LoginModal.vue";
import MobileAppModal from "@/components/MobileAppModal.vue";

export default {
  name: "CreateTopicView",
  components: {
    LoginModal,
    MobileAppModal,
  },
  data() {
    return {
      title: "",
      message: "",
    };
  },
  mounted() {
    document.title = "Create Topic - Dictionary";
  },
  computed: {
    ...mapGetters(["getUser"]),
  },
  methods: {
    validateForm() {
      if (this.title.length > 70) {
        this.$store.dispatch("addSnackbarItemAction", {
          text: "Topic title must be 70 characters or less.",
          type: "error",
        });
        return false;
      }

      if (this.message.length > 250) {
        this.$store.dispatch("addSnackbarItemAction", {
          text: "Topic title must be 70 characters or less.",
          type: "error",
        });
        return false;
      }

      if (this.message == "" || this.title == "") {
        this.$store.dispatch("addSnackbarItemAction", {
          text: "Please don't leave any free space.",
          type: "error",
        });
        return false;
      }

      if (!cookies.get("user-id") || !this.getUser.id) {
        this.addSnackbarItemAction({
          text: "You must be logged in to like a post.",
          type: "error",
        });
        return false;
      }

      return true;
    },

    async createTopic() {
      if (!this.validateForm()) {
        return;
      }

      this.currentUserId = this.getUser.id || cookies.get("user-id");

      const result = await ApiService.createPost({
        userId: this.currentUserId,
        topic: this.title,
        message: this.message,
      });

      this.$store.dispatch("addSnackbarItemAction", {
        text: result.message,
        type: result.success ? "success" : "error",
      });

      if (!result.success) {
        return false;
      }

      this.$router.push(`/topic/${result.createdPost.topicSlug}`);
    },
  },
};
</script>

<style scoped>
.create-topic {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 500px;
}

.title-input,
.message-input {
  position: relative;
  width: fit-content;
}

.character-limit {
  position: absolute;
  right: 5px;
  top: 5px;
  color: var(--link-color);
}

.character-limit .warning {
  color: red;
}

.inputs {
  width: 100%;
  padding: 25px;
  display: flex;
  flex-direction: column;
  row-gap: 20px;
}

.inputs input,
.inputs textarea {
  width: 600px;
  background-color: white;
  border-radius: 5px;
  font-size: 17px;
  padding: 5px 10px;
  resize: none;
  border: none;
}

.inputs input,
.inputs textarea {
  padding-right: 65px;
}

.character-limit .warning {
  color: red;
}

.inputs button {
  width: fit-content;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: var(--link-color);
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.inputs button:disabled {
  background-color: rgba(0, 0, 0, 0.247);
  cursor: not-allowed;
}

@media screen and (max-width: 1550px) {
  .create-topic {
    grid-template-columns: 1fr 300px;
  }
}

@media screen and (max-width: 1350px) {
  .create-topic {
    grid-template-columns: 1fr;
  }

  .right-sidebar {
    padding: 25px;
  }
}

@media screen and (max-width: 1025px) {
  .inputs .title-input,
  .inputs .message-input,
  .inputs input,
  .inputs textarea {
    width: 100%;
  }
}
</style>
