<?php
    require '../connection.php';
    require '../common/headers.php';

    if (!isset($_GET['slug'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Slug is required'
        ]);
        return;
    }

    $slug = $_GET['slug'];

    $query = "SELECT * FROM topics WHERE slug = :slug";
    $statement = $db->prepare($query);
    $statement->bindValue(':slug', $slug);
    $statement->execute();
    $topic = $statement->fetch(PDO::FETCH_ASSOC);

    if (!$topic) {
        echo json_encode([
            'success' => false,
            'message' => 'Topic not found'
        ]);
        return;
    }

    if (isset($_GET['userId']))  {
        $userId = $_GET['userId'];
        
        $query = "SELECT posts.id AS postId, topics.title, posts.message, users.username, users.photoUrl, posts.createDate, posts.updateDate, COUNT(likes.id) AS likesCount, CASE WHEN userLikes.id IS NOT NULL THEN 1 ELSE 0 END AS isUserLiked FROM posts JOIN users ON posts.userId = users.id JOIN topics ON posts.topicId = topics.id LEFT JOIN likes ON posts.id = likes.postId LEFT JOIN likes AS userLikes ON posts.id = userLikes.postId AND userLikes.userId = :userId WHERE slug = :slug GROUP BY posts.id, topics.title, users.username, users.photoUrl, posts.createDate, posts.updateDate, userLikes.id ORDER BY posts.createDate ASC";
        $statement = $db->prepare($query);
        $statement->bindValue(':slug', $slug);
        $statement->bindValue(':userId', $userId);
        $statement->execute();
        $posts = $statement->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Topic fetched successfully',
            'topic' => [
                'topicId' => $topic['id'],
                'topicTitle' => $topic['title'],
                'posts' => $posts
            ]
        ]);
        return;
    }

    $query = "SELECT posts.id AS postId, topics.title, posts.message, users.username, users.photoUrl, posts.createDate, posts.updateDate, COUNT(likes.id) AS likesCount FROM posts JOIN users ON posts.userId = users.id JOIN topics ON posts.topicId = topics.id LEFT JOIN likes ON posts.id = likes.postId WHERE slug = :slug GROUP BY posts.id, topics.title, users.username, users.photoUrl, posts.createDate, posts.updateDate ORDER BY posts.createDate ASC";
    $statement = $db->prepare($query);
    $statement->bindValue(':slug', $slug);
    $statement->execute();
    $posts = $statement->fetchAll(PDO::FETCH_ASSOC);    

    echo json_encode([
        'success' => true,
        'message' => 'Topic fetched successfully',
        'topic' => [
            'topicId' => $topic['id'],
            'topicTitle' => $topic['title'],
            'posts' => $posts
        ]
    ]);