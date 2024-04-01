<template>
  <header>
    <div class="logo">
      <router-link to="/">Dictionary</router-link>
    </div>

    <div class="search">
      <div class="search-input">
        <input type="text" placeholder="Search..." />
        <button>
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>

    <div class="user">
      <div class="auth-user" v-if="!isUserLoggedIn">
        <router-link to="/auth/login">Login</router-link>
        <router-link class="sign-up" to="/auth/register">Register</router-link>
      </div>

      <div class="user-profile" v-else>
        <h4>{{ username }}</h4>
        <img class="user-image" :src="userPhotoUrl" alt="Profile" />

        <div class="dropdown-menu">
          <div class="row">
            <img class="user-image" :src="userPhotoUrl" alt="Profile" />

            <h4>{{ username }}</h4>
          </div>
          <div class="row">
            <router-link :to="`/u/${username}`">
              <button>Profile</button>
            </router-link>
          </div>
          <div class="row">
            <router-link to="/edit-profile">
              <button>Edit Profile</button>
            </router-link>
          </div>
          <div class="row">
            <button @click="logout()">Log out</button>
          </div>
        </div>
      </div>
    </div>

    <div class="header-hamburger" @click="toggleHamburgerContainer">
      <i class="fas fa-bars"></i>
    </div>

    <div class="hamburger-container" :class="hamburgerMenu ? 'show' : ''">
      <div class="close">
        <div class="logo">
          <router-link to="/">Dictionary</router-link>
        </div>

        <i class="fas fa-times" @click="toggleHamburgerContainer"></i>
      </div>

      <div class="search">
        <div class="search-input">
          <input type="text" placeholder="Search..." />
          <button>
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>

      <div class="hamburger-auth">
        <div class="auth-user" v-if="!isUserLoggedIn">
          <router-link to="/auth/login">Login</router-link>
          <router-link class="sign-up" to="/auth/register"
            >Register</router-link
          >
        </div>

        <div class="user-profile" v-else>
          <img class="user-image" :src="userPhotoUrl" alt="Profile" />
          <h4>{{ username }}</h4>

          <div class="row">
            <router-link :to="`/u/${username}`">
              <button>Profile</button>
            </router-link>
          </div>
          <div class="row">
            <router-link to="/edit-profile">
              <button>Edit Profile</button>
            </router-link>
          </div>
          <div class="row">
            <button @click="logout()">Log out</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import ApiService from "@/services/api-service";
import cookies from "js-cookie";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "HeaderComponent",
  data() {
    return {
      isUserLoggedIn: false,
      username: "",
      userPhotoUrl: "",
      hamburgerMenu: false,
    };
  },
  computed: {
    ...mapGetters(["getUser"]),
  },
  async created() {
    await this.checkAuth();
  },
  methods: {
    ...mapActions(["setUserAction", "addSnackbarItemAction"]),
    async checkAuth() {
      const userId = cookies.get("user-id");

      if (!userId || userId === undefined) {
        this.isUserLoggedIn = false;
      } else {
        this.isUserLoggedIn = true;

        const result = await ApiService.getUserById(userId);

        if (!result.success) {
          this.isUserLoggedIn = false;
          return;
        }

        this.setUserAction({ id: userId, ...result.user });
        this.username = this.getUser.username;
        this.userPhotoUrl = this.getUser.photoUrl;
      }
    },
    logout() {
      cookies.remove("user-id");
      this.isUserLoggedIn = false;
      this.setUserAction({});

      this.addSnackbarItemAction({
        text: "You have been logged out!",
        type: "success",
      });
    },
    toggleHamburgerContainer() {
      this.hamburgerMenu = !this.hamburgerMenu;

      if (this.hamburgerMenu) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    },
  },
  watch: {
    $route() {
      this.hamburgerMenu = false;
      document.body.style.overflow = "auto";
    },
  },
};
</script>

<style scoped>
header {
  width: 100%;
  height: 80px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding-inline: 60px;
  border-bottom: 1px solid var(--secondary-color);
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: var(--quaternary-color);
}

.logo {
  justify-self: start;
}

.logo a {
  font-size: 2rem;
  font-weight: 700;
  color: var(--link-color);
  text-decoration: none;
}

.search {
  justify-self: center;
}

.search-input {
  width: 300px;
  position: relative;
}

.search input {
  width: 100%;
  padding: 10px 15px;
  border-radius: 999px;
  border: none;
  outline: none;
  transition: all 0.3s ease;
  font-size: 18px;
}

.search button {
  position: absolute;
  right: 3px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  outline: none;
  cursor: pointer;
  background-color: var(--link-color);
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  transition: all 0.1s ease;
  font-size: 16px;
}

.search button:hover {
  filter: opacity(0.8);
}

.user {
  justify-self: end;
}

.user .user-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 5px 5px 5px 20px;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 10px;
}

.user .user-profile:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

.user .user-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 20px;
}

.auth-user {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 5px;
}

.auth-user a {
  color: var(--link-color);
  font-size: 18px;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.auth-user a.sign-up {
  border: 1px solid var(--link-color);
}

.auth-user a:hover {
  filter: opacity(0.8);
}

.dropdown-menu {
  display: none;
  width: 250px;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  position: absolute;
  top: 100%;
  right: 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  cursor: default;
  flex-direction: column;
  row-gap: 10px;
}

.dropdown-menu:hover,
.user-profile:hover .dropdown-menu {
  display: flex;
}

.dropdown-menu .row,
.hamburger-auth .row {
  width: 100%;
  display: flex;
  align-items: center;
}

.dropdown-menu .row img {
  margin: 0 10px 0 0;
}

.dropdown-menu a,
.hamburger-auth a {
  width: 100%;
  color: black;
  text-decoration: none;
}

.dropdown-menu button,
.hamburger-auth button {
  width: 100%;
  padding: 10px 15px;
  border: none;
  font-size: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 5px;
  background-color: var(--quaternary-color);
}

.dropdown-menu button:hover,
.hamburger-auth button:hover {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

.header-hamburger {
  font-size: 30px;
  cursor: pointer;
  color: var(--link-color);
  display: none;
}

.hamburger-container {
  width: 100vw;
  height: 100vh;
  background-color: var(--quaternary-color);
  position: fixed;
  top: 0px;
  right: 0px;
  transition: transform 0.3s ease;
  transform: translateX(100%);
  padding: 25px;
  display: flex;
  flex-direction: column;
  row-gap: 25px;
}

.hamburger-container .close {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hamburger-container .close i {
  font-size: 30px;
  cursor: pointer;
  color: var(--link-color);
}

.hamburger-container.show {
  transform: translateX(0);
}

.hamburger-auth {
  text-align: center;
}

.hamburger-auth .user-profile {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 15px;
  place-items: center;
}

.hamburger-auth img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.hamburger-auth button {
  background-color: white;
}

@media screen and (max-width: 800px) {
  header > .search,
  header > .user {
    display: none;
  }

  header {
    grid-template-columns: 1fr auto;
  }

  .header-hamburger {
    display: block;
  }

  .hamburger-container .search {
    justify-self: normal;
  }

  .hamburger-container .search .search-input {
    width: 100% !important;
  }
}

@media screen and (max-width: 350px) {
  header {
    padding-inline: 20px;
  }
}
</style>
