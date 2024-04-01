<template>
  <div class="download-app">
    <h3>Download Mobile App!</h3>

    <div class="button-row">
      <button>
        <i class="fab fa-apple"></i>
        <span>App Store</span>
      </button>
      <button>
        <i class="fab fa-google-play"></i>
        <span>Google Play</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "MobileAppModal",
};
</script>

<style scoped>
.download-app {
  width: 100%;
  border-radius: 5px;
  background-color: white;
  padding: 25px;
  text-align: center;
  margin-top: 25px;
}

.download-app .button-row {
  display: flex;
  justify-content: center;
  margin-top: 25px;
  column-gap: 20px;
}

.download-app button i {
  margin-right: 10px;
}

.download-app button {
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

.download-app button:hover {
  background-color: var(--link-color-hover);
}
</style>
