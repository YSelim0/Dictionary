<template>
  <div class="popular-topics">
    <h3>Popular Topics of Week</h3>

    <router-link
      class="topic"
      v-for="(topic, key) in popularTopics"
      :key="key"
      :to="`/topic/${topic.slug}`"
    >
      <span>
        {{ topic.title }}
      </span>
      <span>
        {{ topic.count }}
      </span>
    </router-link>

    <div class="topic-btn">
      <router-link to="/explore">
        <span>See All Topics</span>

        <div class="icon">
          <i class="fas fa-arrow-right"></i>
        </div>
      </router-link>
    </div>

    <div class="topic-btn">
      <router-link to="/create-topic">
        <span>Create Topic</span>

        <div class="icon">
          <i class="fas fa-plus"></i>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import ApiService from "@/services/api-service";

export default {
  name: "PopularTopicsComponent",
  data() {
    return {
      popularTopics: [],
    };
  },
  async created() {
    const result = await ApiService.getTopicsSorted();

    if (!result.success) {
      return;
    }

    this.popularTopics = result.topics;
  },
};
</script>

<style scoped>
.popular-topics {
  width: 300px;
  height: 100%;
  position: fixed;
  top: 130px;
  background-color: var(--quaternary-color);
  transition: transform 0.3s ease;
  z-index: 800;
}

.popular-topics h3 {
  font-weight: 500;
  margin-bottom: 20px;
  padding-inline: 10px;
}

.topic {
  display: grid;
  grid-template-columns: 1fr auto;
  padding: 10px 10px;
  cursor: pointer;
  color: black;
  text-decoration: none;
}

.topic:hover {
  background-color: var(--tertiary-color);
  border-radius: 999px;
}

.topic-btn a {
  display: grid;
  grid-template-columns: 1fr 15px;
  padding: 10px 10px;
  cursor: pointer;
  margin-block: 10px;
  border: 1px solid var(--link-color);
  border-radius: 10px;
  color: var(--link-color);
  text-decoration: none;
  transition: all 0.3s ease;
}

.topic-btn a:hover {
  background-color: var(--link-color-hover);
  color: white;
}

@media screen and (max-width: 800px) {
}
</style>
