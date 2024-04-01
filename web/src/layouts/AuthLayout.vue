<template>
  <div>
    <div class="auth-layout">
      <div class="auth-form">
        <router-view />
      </div>

      <div class="auth-gif">
        <img src="./../assets/img/auth.gif" alt="auth" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AuthLayout",
  data() {
    return {};
  },
};
</script>

<style>
@import url("./../assets/css/auth.css");
</style>
