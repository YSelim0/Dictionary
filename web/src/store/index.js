import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    snackbarItems: [],
  },
  getters: {
    getUser(state) {
      return state.user;
    },
    getSnackbarItems(state) {
      return state.snackbarItems;
    },
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    addSnackbarItem(state, snackbarItem) {
      const currentItemId = Math.random();
      state.snackbarItems.push({ ...snackbarItem, id: currentItemId });

      setTimeout(() => {
        state.snackbarItems = state.snackbarItems.filter(
          (item) => item.id !== currentItemId
        );
      }, 3000);
    },
  },
  actions: {
    setUserAction({ commit }, user) {
      commit("setUser", user);
    },
    addSnackbarItemAction({ commit }, snackbarItem) {
      commit("addSnackbarItem", snackbarItem);
    },
  },
  modules: {},
});
