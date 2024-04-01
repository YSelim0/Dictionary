<template>
  <div class="snackbar" v-if="getSnackbarItems.length != 0">
    <span
      v-for="item in getSnackbarItems"
      :key="item.id"
      :class="`${item.type}`"
      >{{ item.text }}</span
    >
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "SnackbarComponent",
  computed: {
    ...mapGetters(["getSnackbarItems"]),
  },
};
</script>

<style scoped>
.snackbar {
  position: fixed;
  bottom: 10px;
  left: 50%;
  z-index: 1000;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  row-gap: 10px;
}

.snackbar span {
  padding: 10px 20px;
  color: white;
  border-radius: 5px;
  font-size: 17px;
}

.snackbar span.success {
  background-color: var(--link-color);
}

.snackbar span.error {
  background-color: var(--error-color);
}
</style>
