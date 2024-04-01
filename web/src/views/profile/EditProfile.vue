<template>
  <div class="edit-profile">
    <div class="container">
      <div class="profile-content">
        <h1>Edit Profile</h1>

        <div class="user">
          <div class="photo">
            <img :src="user.photoUrl" alt="" />

            <div class="controls">
              <button @click="() => (changeProfilePhotoModal = true)">
                Change Photo
              </button>
            </div>
          </div>
          <div class="info">
            <div class="input-row">
              <input
                type="text"
                name="username"
                id="username"
                :disabled="!changeUsername"
                v-model="user.username"
              />

              <div
                class="edit"
                @click="() => (changeUsername = !changeUsername)"
              >
                <i class="fa-regular fa-pen-to-square"></i>
              </div>
            </div>

            <div class="input-row">
              <textarea
                name="biography"
                id="biography"
                cols="30"
                rows="10"
                :disabled="!changeBiography"
                v-model="user.biography"
              >
              </textarea>

              <div
                class="edit"
                @click="() => (changeBiography = !changeBiography)"
              >
                <i class="fa-regular fa-pen-to-square"></i>
              </div>
            </div>

            <div class="button-row">
              <button @click="() => (changePasswordModal = true)">
                Change Password
              </button>

              <button
                :disabled="
                  this.changeBiography || this.changeUsername ? false : true
                "
                @click="saveProfileChanges"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="change-profile-photo" v-if="changeProfilePhotoModal">
      <div class="change-profile-photo-content">
        <h1>Change Profile Photo</h1>

        <img :src="user.photoUrl" alt="profile-photo" />
        <input type="file" name="photo" id="photo" @change="handleFileChange" />

        <button
          :disabled="updatedPhoto == null ? true : false"
          @click="changeProfilePhoto"
        >
          Upload
        </button>

        <div class="close" @click="closeChangeProfilePhotoModal">
          <i class="fa-solid fa-xmark"></i>
        </div>
      </div>
    </div>

    <div class="change-password" v-if="changePasswordModal">
      <div class="change-password-content">
        <h1>Change Password</h1>

        <input
          type="password"
          name="oldPassword"
          id="oldPassword"
          placeholder="Old Password"
          v-model="oldPassword"
        />
        <input
          type="password"
          name="newPassword"
          id="newPassword"
          placeholder="New Password"
          v-model="newPassword"
        />
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder="Confirm Password"
          v-model="confirmPassword"
        />

        <div class="button-row">
          <button
            @click="changePassword"
            :disabled="
              oldPassword === '' || newPassword === '' || confirmPassword === ''
                ? true
                : false
            "
          >
            Change
          </button>
        </div>

        <div class="close" @click="() => (changePasswordModal = false)">
          <i class="fa-solid fa-xmark"></i>
        </div>
      </div>
    </div>

    <div class="right-sidebar">
      <div class="sidebar-items">
        <MobileAppModal />
      </div>
    </div>
  </div>
</template>

<script>
import MobileAppModal from "@/components/MobileAppModal.vue";
import { mapGetters } from "vuex";
import ApiService from "@/services/api-service";

export default {
  name: "EditProfileView",
  data() {
    return {
      user: {},
      changeUsername: false,
      changeBiography: false,
      saveChanges: false,
      changeProfilePhotoModal: false,
      updatedPhoto: null,
      oldPhotoUrl: "",
      changePasswordModal: false,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  },
  components: {
    MobileAppModal,
  },
  computed: {
    ...mapGetters(["getUser"]),
  },
  async mounted() {
    document.title = "Edit Profile - Dictionary";

    setTimeout(() => {
      this.user = this.getUser;
    }, 100);
  },
  methods: {
    async saveProfileChanges() {
      if (this.user.username === "") {
        this.$store.dispatch("addSnackbarItemAction", {
          text: "Username cannot be empty.",
          type: "error",
        });
        return;
      }

      if (this.user.userId === "") {
        this.$store.dispatch("addSnackbarItemAction", {
          text: "User ID cannot be empty.",
          type: "error",
        });
        return;
      }

      const updatedUser = {
        userId: this.user.id,
      };

      if (this.changeUsername) {
        updatedUser.username = this.user.username;
      }

      if (this.changeBiography) {
        updatedUser.biography = this.user.biography;
      }

      const result = await ApiService.updateProfile(updatedUser);

      if (result.success) {
        this.$store.dispatch("addSnackbarItemAction", {
          text: "Profile updated successfully.",
          type: "success",
        });

        this.$store.dispatch("setUserAction", this.user);

        this.changeUsername = false;
        this.changeBiography = false;
      } else {
        this.$store.dispatch("addSnackbarItemAction", {
          text: result.message,
          type: "error",
        });
      }
    },
    handleFileChange(e) {
      this.updatedPhoto = e.target.files[0];

      this.oldPhotoUrl = this.user.photoUrl;
      this.user.photoUrl = URL.createObjectURL(this.updatedPhoto);
    },
    closeChangeProfilePhotoModal() {
      if (this.updatedPhoto) {
        this.user.photoUrl = this.oldPhotoUrl;
      }

      this.changeProfilePhotoModal = false;
    },
    async changeProfilePhoto() {
      if (this.updatedPhoto === null) {
        this.$store.dispatch("addSnackbarItemAction", {
          text: "Please select a photo.",
          type: "error",
        });
        return;
      }

      const formData = new FormData();
      formData.append("photo", this.updatedPhoto);
      formData.append("userId", this.user.id);
      const result = await ApiService.updateProfilePhoto(formData);

      if (result.success) {
        this.$store.dispatch("addSnackbarItemAction", {
          text: "Profile photo updated successfully.",
          type: "success",
        });

        this.$store.dispatch("setUserAction", this.user);

        this.changeProfilePhotoModal = false;
      } else {
        this.$store.dispatch("addSnackbarItemAction", {
          text: result.message,
          type: "error",
        });
      }
    },
    async changePassword() {
      if (this.newPassword != this.confirmPassword) {
        return this.$store.dispatch("addSnackbarItemAction", {
          text: "New passwords are doesn't match.",
          type: "error",
        });
      }

      if (this.newPassword.length < 6) {
        return this.$store.dispatch("addSnackbarItemAction", {
          text: "New password must be longer than 6 characters.",
          type: "error",
        });
      }

      const result = await ApiService.changePassword(
        this.user.id,
        this.oldPassword,
        this.newPassword
      );

      if (!result.success) {
        return this.$store.dispatch("addSnackbarItemAction", {
          text: result.message,
          type: "error",
        });
      }

      this.changePasswordModal = false;

      return this.$store.dispatch("addSnackbarItemAction", {
        text: result.message,
        type: "success",
      });
    },
  },
};
</script>

<style scoped>
.edit-profile {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 500px;
}

.sidebar {
  position: relative;
}

.sidebar-items {
  position: sticky;
  top: 155px;
}

.profile-content {
  padding-inline: 50px;
}

.profile-content h1 {
  margin-bottom: 35px;
}

.user {
  display: grid;
  grid-template-columns: 300px 1fr;
  column-gap: 20px;
}

.user .photo {
  width: 300px;
}

.user .photo img {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 50%;
}

.user .photo button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: var(--link-color);
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.user .photo button:hover {
  background-color: var(--link-color-hover);
}

.info {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 5px;
}

.info input,
.info textarea {
  border: none;
  font-size: 1.7em;
  padding: 7px 10px;
  border-radius: 5px;
  resize: none;
  width: 100%;
  background-color: white;
}

.info input:disabled,
.info textarea:disabled {
  background-color: rgba(255, 255, 255, 0.247);
}

.info textarea {
  height: 200px;
}

.info .input-row {
  width: 100%;
  position: relative;
}

.info .input-row .edit {
  position: absolute;
  top: 5px;
  right: 5px;
  color: var(--link-color);
  cursor: pointer;
  font-size: 23px;
}

.info .button-row {
  display: flex;
  justify-content: space-between;
}

.info .button-row button {
  padding: 10px 20px;
  background-color: var(--link-color);
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: fit-content;
}

.info .button-row button:disabled {
  background-color: rgba(0, 0, 0, 0.247);
  cursor: not-allowed;
}

.change-profile-photo {
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
}

.change-profile-photo .change-profile-photo-content {
  width: 500px;
  height: fit-content;
  background-color: var(--quaternary-color);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 10px;
  padding: 20px;
  position: relative;
}

.change-profile-photo-content img {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 50%;
}

.change-profile-photo-content button {
  padding: 10px 20px;
  background-color: var(--link-color);
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-profile-photo-content button:disabled {
  background-color: rgba(0, 0, 0, 0.247);
  cursor: not-allowed;
}

.change-profile-photo-content .close {
  position: absolute;
  top: 0px;
  right: 10px;
  color: var(--link-color);
  cursor: pointer;
  font-size: 40px;
}

.change-password {
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
}

.change-password-content {
  width: 500px;
  height: fit-content;
  padding: 20px;
  background-color: var(--quaternary-color);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 20px;
  position: relative;
}

.change-password-content h1 {
  margin-bottom: 20px;
}

.change-password-content input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 18px;
}

.change-password-content .button-row {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.change-password-content button {
  padding: 10px 20px;
  background-color: var(--link-color);
  border: none;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-password-content button:disabled {
  background-color: rgba(0, 0, 0, 0.247);
  cursor: not-allowed;
}

.change-password-content .close {
  position: absolute;
  top: 0px;
  right: 10px;
  color: var(--link-color);
  cursor: pointer;
  font-size: 40px;
}

@media screen and (max-width: 1600px) {
  .edit-profile {
    grid-template-columns: 1fr;
  }

  .right-sidebar {
    padding-inline: 50px;
  }
}

@media screen and (max-width: 1175px) {
  .profile-content h1 {
    text-align: center;
  }

  .profile-content .user {
    grid-template-columns: 1fr;
    row-gap: 25px;
    place-items: center;
  }
}

@media screen and (max-width: 550px) {
  .user .photo {
    width: 100%;
    text-align: center;
  }

  .profile-content,
  .right-sidebar {
    padding: 0px;
  }

  .change-profile-photo .change-profile-photo-content {
    width: 95%;
    padding: 20px;
    text-align: center;
  }

  .change-profile-photo-content img {
    width: 200px;
    height: 200px;
  }

  .change-password-content {
    width: 95%;
    padding: 20px;
    text-align: center;
  }
}
</style>
