<template>
  <div class="form">
    <h1>Welcome Back!</h1>

    <input type="text" placeholder="Username" v-model="username" />
    <input type="password" placeholder="Password" v-model="password" />

    <div class="row">
      <button @click="login">Sign In <i class="fas fa-arrow-right"></i></button>
    </div>

    <div class="navigate">
      <span>
        New to Dictionary?
        <router-link to="/auth/register">Create an account</router-link>
      </span>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/api-service";
import cookies from "js-cookie";
import { mapActions } from "vuex";

export default {
  name: "LoginView",
  data() {
    return {
      username: "",
      password: "",
    };
  },
  created() {
    if (cookies.get("user-id")) {
      this.$router.push({ name: "home" });
      return;
    }

    document.title = "Login - Dictionary";
  },
  methods: {
    ...mapActions(["addSnackbarItemAction"]),
    async login() {
      const result = await ApiService.login({
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
        }, 3000);
      } else {
        this.addSnackbarItemAction({
          text: result.message,
          type: "error",
        });
      }
    },
  },
};
</script>

<style>
@import url("../../assets/css/auth.css");
</style>
