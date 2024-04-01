<?php
    require '../connection.php';
    require '../common/headers.php';
    require '../common/service.php';

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($data === null) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON'
        ]);
        return;
    }

    if (!isset($data['userId'])) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID cannot be empty'
        ]);
        return;
    }

    if (!getUserById($db, $data['userId'])) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        return;
    }

    $userId = $data['userId'];

    if (!isset($data['topic']) || empty($data['topic'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Topic cannot be empty'
        ]);
        return;
    }

    if (!isset($data['message']) || empty($data['message'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Message cannot be empty'
        ]);
        return;
    }

    $topic = $data['topic'];
    $message = $data['message'];

    if (strlen($topic) > 70) {
        echo json_encode([
            'success' => false,
            'message' => 'Topic title must be 70 characters or less.'
        ]);
        return;
    }

    if (strlen($message > 250)) {
        echo json_encode([
            'success' => false,
            'message' => 'Message must be 250 characters or less.'
        ]);
        return;
    }

    if (!isFieldTaken($db, 'topics', 'title', $topic)) {
        $topicId = uniqid('topic_');
        $query = "INSERT INTO topics (id, title, slug) VALUES (:id, :title, :slug)";
        $statement = $db->prepare($query);
        $statement->bindValue(':id', $topicId);
        $statement->bindValue(':title', $topic);
        $statement->bindValue(':slug', slugify($topic));
        $statement->execute();
    }
    else {
        $foundTopic = isFieldTaken($db, 'topics', 'title', $topic);
        $topicId = $foundTopic['id'];
    }

    $isSpamPost = "SELECT COUNT(*) as RecordCount FROM posts WHERE userId = :userId AND topicId = :topicId AND message = :message";
    $isSpamPostStatement = $db->prepare($isSpamPost);
    $isSpamPostStatement->bindValue(':userId', $userId);
    $isSpamPostStatement->bindValue(':topicId', $topicId);
    $isSpamPostStatement->bindValue(':message', $message);
    $isSpamPostStatement->execute();

    if ($isSpamPostStatement->fetch(PDO::FETCH_ASSOC)['RecordCount'] > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Post already exists, don\'t spam!'
        ]);
        return;
    }

    $postId = uniqid('post_');
    $query = "INSERT INTO posts (id, userId, topicId, message, createDate) VALUES (:id, :userId, :topicId, :message, :createDate)";
    $statement = $db->prepare($query);
    $statement->bindValue(':id', $postId);
    $statement->bindValue(':userId', $userId);
    $statement->bindValue(':topicId', $topicId);
    $statement->bindValue(':message', $message);
    $statement->bindValue(':createDate', date('Y-m-d H:i:s'));
    $statement->execute();

    $currentUser = isFieldTaken($db, 'users', 'id', $userId);
    
    echo json_encode([
        'success' => true,
        'message' => 'Post created successfully',
        'createdPost' => [
            'id' => $postId,
            'message' => $message,
            'username' => $currentUser['username'],
            'createDate' => date('Y-m-d H:i:s'),
            'photoUrl' => $currentUser['photoUrl'],
            'isUserLiked' => false,
            'likesCount' => 0,
            'topicSlug' => slugify($topic),
            'postId' => $postId
        ]
    ]);