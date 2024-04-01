<template>
  <div class="home">
    <div class="welcome-section">
      <h1>Welcome to <span>Dictionary</span></h1>
      <h4>This is a platform where you can freely express your ideas!</h4>
      <div class="line"></div>
      <p>
        Welcome to <span>Dictionary</span>, a platform designed to foster open
        discussions and exploration of diverse topics. Users initiate
        conversations on subjects they're passionate about, inviting others to
        share their perspectives.
      </p>
      <p>
        <span>Dictionary</span> is a space dedicated to cultivating engaging
        conversations. Users can create threads covering a wide array of topics,
        encouraging a community where diverse thoughts intersect. Here,
        individuals can express their unique viewpoints, learn from each other,
        and collectively expand their understanding of the world.
      </p>
      <p>
        Join us at <span>Dictionary</span> and be part of an inclusive community
        where every voice matters. Together, let's delve into the fascinating
        world of discussions.
      </p>

      <div class="line"></div>

      <h3>Take a look at the most popular topics of recent days!</h3>

      <div class="topics">
        <router-link
          class="topic"
          v-for="(topic, key) in popularTopicsOf3Days"
          :key="key"
          :to="`/topic/${topic.slug}`"
        >
          <span>
            {{ topic.title.slice(0, 20) }}
            {{ topic.title.length > 20 ? "..." : "" }}
          </span>
          <span>
            {{ topic.count }}
          </span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/api-service";

export default {
  name: "HomeView",
  data() {
    return {
      popularTopicsOf3Days: [],
    };
  },
  async created() {
    document.title = "Dictionary";

    const result = await ApiService.getPopularTopics();

    if (!result.success) {
      return;
    }

    this.popularTopicsOf3Days = result.topics;
  },
};
</script>

<style scoped>
.welcome-section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 25px;
}

.welcome-section h1 {
  font-size: 50px;
  margin-bottom: 20px;
  font-weight: 500;
}

.welcome-section span {
  color: var(--link-color);
  font-weight: bolder;
}

.welcome-section .line {
  margin-block: 20px;
  width: 50%;
  height: 1px;
  background-color: var(--secondary-color);
}

.welcome-section p {
  max-width: 50%;
  margin-bottom: 25px;
  text-align: center;
}

h3 {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 20px;
}

.topics {
  display: flex;
  flex-direction: column;
}

.topics a {
  color: black;
  text-decoration: none;
  display: grid;
  grid-template-columns: 1fr auto;
  min-width: 300px;
  padding: 5px 10px;
  font-weight: lighter;
}

.topics a:hover {
  background-color: var(--tertiary-color);
  border-radius: 999px;
}

@media screen and (max-width: 1000px) {
  .welcome-section {
    padding: 0px;
    text-align: center;
  }

  .welcome-section .line {
    width: 75%;
  }

  .welcome-section h1 {
    font-size: 30px;
  }

  .welcome-section h4 {
    font-size: 12px;
  }

  .welcome-section p {
    max-width: 100%;
  }
}
</style>
