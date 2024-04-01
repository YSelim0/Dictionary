<template>
  <div id="app">
    <router-view />

    <Snackbar />
  </div>
</template>

<script>
import Snackbar from "@/components/Snackbar.vue";

export default {
  name: "App",
  components: {
    Snackbar,
  },
  created() {
    document.title = "Dictionary";
  },
};
</script>

<style>
@import url("./assets/css/style.css");
</style>
