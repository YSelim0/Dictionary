import Vue from "vue";
import VueRouter from "vue-router";
import middlewareLoader from "./middlewares";

import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Home from "@/views/Home.vue";
import TopicPosts from "@/views/topic/TopicPosts.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import Login from "@/views/auth/Login.vue";
import Register from "@/views/auth/Register.vue";
import Profile from "@/views/profile/Profile.vue";
import EditProfile from "@/views/profile/EditProfile.vue";
import CreateTopic from "@/views/topic/CreateTopic.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {
        path: "",
        name: "home",
        component: Home,
      },
      {
        path: "topic/:slug",
        name: "topic-posts",
        component: TopicPosts,
      },
      {
        path: "u/:username",
        name: "u",
        component: Profile,
      },
      {
        path: "edit-profile",
        name: "edit-profile",
        component: EditProfile,
        meta: {
          authGuard: true,
        },
      },
      {
        path: "create-topic",
        name: "create-topic",
        component: CreateTopic,
        meta: {
          authGuard: true,
        },
      },
    ],
  },
  {
    path: "/auth",
    name: "auth",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "login",
        component: Login,
        meta: {
          authGuard: true,
        },
      },
      {
        path: "register",
        name: "register",
        component: Register,
        meta: {
          authGuard: true,
        },
      },
    ],
  },
  {
    path: "/:catchAll(.*)",
    redirect: { name: "home" },
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

middlewareLoader(router);

export default router;
