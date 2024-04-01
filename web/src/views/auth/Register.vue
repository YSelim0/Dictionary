<template>
  <div class="form">
    <h1>Join The Chat!</h1>

    <input type="text" placeholder="Username" v-model="username" />
    <input type="password" placeholder="Password" v-model="password" />
    <input
      type="password"
      placeholder="Password Again"
      v-model="passwordConfirmation"
    />

    <div class="row">
      <button @click="register">
        Sign Up <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <div class="navigate">
      <span>
        Already have an account?
        <router-link to="/auth/login">Sign In</router-link>
      </span>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/api-service";
import cookies from "js-cookie";
import { mapActions } from "vuex";

export default {
  name: "RegisterView",
  data() {
    return {
      username: "",
      password: "",
      passwordConfirmation: "",
    };
  },
  created() {
    if (cookies.get("user-id")) {
      this.$router.push({ name: "home" });
      return;
    }

    document.title = "Register - Dictionary";
  },
  methods: {
    ...mapActions(["addSnackbarItemAction"]),
    async register() {
      if (!this.checkFormValidity()) {
        return;
      }

      if (!this.isPasswordsMatch()) {
        this.addSnackbarItemAction({
          text: "Passwords do not match",
          type: "error",
        });
        return;
      }

      const result = await ApiService.register({
        username: this.username,
        password: this.password,
      });

      if (result.success) {
        this.addSnackbarItemAction({
          text: result.message,
          type: "success",
        });

        setTimeout(() => {
          cookies.set("user-id", result.user.id, { sameSite: "strict" });

          this.$router.push({ name: "home" });
        }, 1500);
      } else {
        this.addSnackbarItemAction({
          text: result.message,
          type: "error",
        });
      }
    },
    isPasswordsMatch() {
      return this.password === this.passwordConfirmation;
    },
    checkFormValidity() {
      if (
        this.username === "" ||
        this.password === "" ||
        this.passwordConfirmation === ""
      ) {
        this.addSnackbarItemAction({
          text: "Please fill all fields.",
          type: "error",
        });
        return false;
      }

      return true;
    },
  },
};
</script>
