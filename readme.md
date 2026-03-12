![Dictionary Banner](https://i.ibb.co/KGvd8mF/dictionary-banner.png)

# Dictionary 📚

Welcome to Dictionary, a platform designed to foster open discussions and exploration of diverse topics. Users initiate conversations on subjects they're passionate about, inviting others to share their perspectives.

## Features ✨

- **Create Threads:** Initiate conversations on a wide array of topics.
- **Post Sharing:** Share your thoughts and ideas within threads.
- **Like Posts:** Show appreciation for posts that resonate with you.
- **User Profiles:** Customize your profile with a picture and biography.
- **Explore Profiles:** Visit user profiles to see their posts organized by topic.
- **Mobile Access:** Stay connected on the go with our dedicated mobile application.

## Technical Overview 💻

The project consists of three main components:

- **Server:** Contains a JSON backend service created with PHP.
- **Web:** Vue.js frontend project for web-based user interaction.
- **Mobile:** Cross-platform mobile application developed using React Native.

### Installation 🛠️

#### 1. Backend & Web
1. Clone the repository.
2. Place the project in your Apache server directory (e.g., htdocs for XAMPP).
3. Import the provided `.sql` file into your MySQL database using phpMyAdmin.
4. Navigate to the `web` directory in your command line.
5. Run `pnpm install` to install the necessary packages.
6. After installation, run `pnpm run serve` to start the project at `http://localhost:8080`.

#### 2. Mobile (React Native)
1. Navigate to the `mobile` directory.
2. Run `npm install` or `yarn install` to install dependencies.
3. For iOS (macOS only): Run `cd ios && pod install && cd ..`.
4. Run `npx react-native run-android` or `npx react-native run-ios` to launch the app.

## Join the Discussion 🤝

Dictionary is a space dedicated to cultivating engaging conversations. Join us and be part of an inclusive community where every voice matters. Together, let's delve into the fascinating world of discussions.