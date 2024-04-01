<template>
  <div>
    <Header />

    <div class="container">
      <div>
        <PopularTopics
          class="popular-topics-modal"
          :class="showPopularTopicsModal ? 'show' : 'hide'"
        />

        <div
          class="toggle-popular-topics-modal"
          @click="togglePopularTopicsModal"
        >
          <i class="fas fa-bars"></i>
        </div>
      </div>
      <div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Header from "./../components/Header.vue";
import PopularTopics from "@/components/PopularTopics.vue";

export default {
  name: "DefaultLayout",
  data() {
    return {
      showPopularTopicsModal: false,
    };
  },
  components: {
    Header,
    PopularTopics,
  },
  mounted() {
    // window.addEventListener("resize", this.chechWindowSize);
  },
  methods: {
    togglePopularTopicsModal() {
      if (window.innerWidth <= 800) {
        this.showPopularTopicsModal = !this.showPopularTopicsModal;
      }
    },
    chechWindowSize() {
      if (window.innerWidth <= 800) {
        this.showPopularTopicsModal = false;
      }
      this.showPopularTopicsModal = true;
    },
  },
  watch: {
    $route() {
      this.showPopularTopicsModal = false;
    },
  },
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: calc(100vh - 80px);
  padding: 50px;
  display: grid;
  grid-template-columns: 300px 1fr;
}

.toggle-popular-topics-modal {
  background-color: white;
  color: var(--link-color);
  position: fixed;
  top: 130px;
  left: 0px;
  width: 50px;
  height: 50px;
  font-size: 20px;
  cursor: pointer;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  display: none;
  place-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

@media screen and (max-width: 800px) {
  .container {
    grid-template-columns: 1fr;
  }

  .popular-topics-modal {
    transform: translateX(-300%);
    padding-right: 20px;
    box-shadow: 20px 20px 10px rgba(0, 0, 0, 0.1);
  }

  .toggle-popular-topics-modal {
    display: grid;
  }

  .show {
    transform: translateX(0);
  }

  .hide {
    transform: translateX(-300%);
  }
}
</style>
