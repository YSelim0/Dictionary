<?php
    require '../connection.php';
    require '../common/headers.php';
    require '../common/service.php';

    if (!isset($_GET['username'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Username is required'
        ]);
        return;
    }

    $username = $_GET['username'];

    $query = "SELECT * FROM users WHERE username = :username";
    $statement = $db->prepare($query);
    $statement->bindValue(':username', $username);
    $statement->execute();
    $user = $statement->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        return;
    }

    $query = "SELECT posts.id as postId, topics.title, posts.message, users.username, users.photoUrl, topics.slug, posts.createDate, posts.updateDate  from posts, topics, users WHERE posts.topicId = topics.id AND posts.userId = users.id AND posts.userId = :userId ORDER BY posts.createDate DESC";
    $statement = $db->prepare($query);
    $statement->bindValue(':userId', $user['id']);
    $statement->execute();
    $posts = $statement->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'User fetched successfully',
        'username' => $user['username'],
        'photoUrl' => $user['photoUrl'],
        'biography' => $user['biography'],
        'posts' => $posts
    ]);