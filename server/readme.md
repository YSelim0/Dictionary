# Dictionary PHP JSON Server 📚

Welcome to the Dictionary PHP JSON Server documentation! This document provides an overview of the available API endpoints, their methods, and the required parameters for interacting with the server.

## Auth 🔐

### Register

- **Method:** POST
- **URL:** [https://yavuzselim.online/server/auth/register.php](https://yavuzselim.online/server/auth/register.php)
- **Parameters:**
  - username: string (required)
  - password: string (required)
  - biography: string

### Login

- **Method:** POST
- **URL:** [http://localhost/dictionary/server/auth/login.php](http://localhost/dictionary/server/auth/login.php)
- **Parameters:**
  - username: string (required)
  - password: string (required)

## User 👤

### Update Profile

- **Method:** POST
- **URL:** [http://localhost/dictionary/server/user/update-profile.php](http://localhost/dictionary/server/user/update-profile.php)
- **Parameters:**
  - userId: string (required)
  - username: string
  - biography: string

### Change Password

- **Method:** POST
- **URL:** [http://localhost/dictionary/server/user/change-password.php](http://localhost/dictionary/server/user/change-password.php)
- **Parameters:**
  - userId: string (required)
  - oldPassword: string (required)
  - newPassword: string (required)

### Update Profile Photo

- **Method:** POST
- **URL:** [http://localhost/dictionary/server/user/update-photo.php](http://localhost/dictionary/server/user/update-photo.php)
- **Parameters:**
  - userId: string (required)
  - photo: image file (required)

### Get User By Id

- **Method:** POST
- **URL:** [http://localhost/dictionary/server/user/get-user.php](http://localhost/dictionary/server/user/get-user.php)
- **Parameters:**
  - userId: string (required)

### Get User Profile

- **Method:** GET
- **URL:** [http://localhost/dictionary/server/user/get-user-profile.php?username=username](http://localhost/dictionary/server/user/get-user-profile.php?username=username)
- **Parameters:**
  - username: string (required)

## Post 📮

### Create Post

- **Method:** POST
- **URL:** [http://localhost/dictionary/server/post/create-post.php](http://localhost/dictionary/server/post/create-post.php)
- **Parameters:**
  - userId: string (required)
  - topic: string (required)
  - message: string (required)

### Edit Post

- **Method:** POST
- **URL:** [http://localhost/dictionary/server/post/edit-post.php](http://localhost/dictionary/server/post/edit-post.php)
- **Parameters:**
  - postId: string (required)
  - userId: string (required)
  - message: string (required)

### Delete Post

- **Method:** POST
- **URL:** [http://localhost/dictionary/server/post/delete-post.php](http://localhost/dictionary/server/post/delete-post.php)
- **Parameters:**
  - userId: string (required)
  - postId: string (required)

### Toggle Like Post

- **Method:** POST
- **URL:** [http://localhost/dictionary/server/post/toggle-like-post.php](http://localhost/dictionary/server/post/toggle-like-post.php)
- **Parameters:**
  - userId: string (required)
  - postId: string (required)

## Topic 📝

### Get Topics

- **Method:** GET
- **URL:** [http://localhost/dictionary/server/topic/get-all-topics.php](http://localhost/dictionary/server/topic/get-all-topics.php)
- **Parameters:** None

### Get Posts Of Topic

- **Method:** GET
- **URL:** [http://localhost/dictionary/server/topic/get-posts-of-topic.php?slug=post-slug&userId=userId](http://localhost/dictionary/server/topic/get-posts-of-topic.php?slug=post-slug&userId=userId)
- **Parameters:**
  - slug: string (required)
  - userId: string (for isUserLiked column)

### Get Popular Topics

- **Method:** GET
- **URL:** [http://localhost/dictionary/server/topic/get-popular-topics.php](http://localhost/dictionary/server/topic/get-popular-topics.php)
- **Parameters:** None

### Get Topics Sorted

- **Method:** GET
- **URL:** [http://localhost/dictionary/server/topic/get-topics-sorted.php](http://localhost/dictionary/server/topic/get-topics-sorted.php)
- **Parameters:** None
