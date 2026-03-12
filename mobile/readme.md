## Dictionary Mobile (React Native & Expo)

This project is the mobile client for the `dictionary` web application. It is built with React Native and Expo and connects to the same PHP JSON API described in the web and server README files.

- **Platform**: React Native (Expo)
- **Targets**: Android, iOS (and Expo Go for quick preview)
- **Backend**: `dictionary` PHP JSON API

---

## Features

- **User authentication** (login & register)
- **Profile management** (view, edit, change password, update photo)
- **Create, edit, delete posts**
- **List own posts**
- **Topic detail screens**
- **Public user profiles**
- **Search screen**
- **Like / unlike posts** (via server `toggle-like-post` endpoint)

---

## Requirements

Make sure the following are installed:

- **Node.js** (LTS recommended)
- **npm** or **yarn**
- **Expo CLI** (global):
  ```bash
  npm install -g expo-cli
  ```
- (Optional) **Android Studio / Xcode** for emulators
- (Optional) **Expo Go** for running on a physical device

---

## Installation

From the repository root:

```bash
cd mobile
```

Install dependencies:

```bash
npm install
```

or:

```bash
yarn
```

---

## API & Environment Configuration

The mobile app uses the same endpoints documented in the server README (for example: `auth/register.php`, `auth/login.php`, `user/update-profile.php`, `user/change-password.php`, `user/update-photo.php`, `post/create-post.php`, `post/edit-post.php`, `post/delete-post.php`, `post/toggle-like-post.php`, `topic/get-all-topics.php`, `topic/get-posts-of-topic.php`, `topic/get-popular-topics.php`, `topic/get-topics-sorted.php`, etc.).

Configure the **API base URL** for your environment, for example:

- Local development: `http://localhost/dictionary/server`
- Production: your deployed server URL

Configuration Note: The API base URL is defined in the src/services/api.js file within the apiRoutes object. Make sure to update the base URL in this file so that all requests point to your correct backend server address.

---

## Running in Development

Start the Expo development server from the `mobile` directory:

```bash
npm start
```

or:

```bash
expo start
```

You can then:

- Run on a **physical device** with Expo Go by scanning the QR code.
- Run on an **Android emulator** started from Android Studio.
- Run on an **iOS simulator** (on macOS with Xcode installed).

---

## Building (Optional)

For production native builds, you can use Expo Application Services (EAS):

```bash
npm install -g eas-cli
eas login
eas build --platform android   # or ios
```

For more information, see `https://docs.expo.dev`.

---

## License

The mobile client uses the same license as the main repository (see the root `LICENSE` file).
