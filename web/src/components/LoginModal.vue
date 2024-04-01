<template>
  <div class="login-modal" v-if="!isUserLoggedIn">
    <h3>You should login to join chat!</h3>
    <router-link to="/auth/login">
      <button>Login Now!</button>
    </router-link>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import cookies from "js-cookie";

export default {
  name: "LoginModal",
  data() {
    return {
      isUserLoggedIn: false,
    };
  },
  computed: {
    ...mapGetters(["getUser"]),
  },
  mounted() {
    const currentUserId = this.getUser.id || cookies.get("user-id");

    if (currentUserId) {
      this.isUserLoggedIn = true;
    }
  },
};
</script>

<style>
.login-modal {
  width: 100%;
  border-radius: 5px;
  background-color: white;
  padding: 25px;
  text-align: center;
}

.login-modal h3 {
  margin-bottom: 25px;
}

.login-modal a {
  text-decoration: none;
  color: white;
}

.login-modal button {
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
</style>
