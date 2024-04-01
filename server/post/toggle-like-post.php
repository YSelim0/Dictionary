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

    if (!isset($data['postId']) || empty($data['postId'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Post ID cannot be empty'
        ]);
        return;
    }

    if (!isFieldTaken($db,'posts', 'id', $data['postId'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Post not found'
        ]);
        return;
    }

    $postId = $data['postId'];

    $isUserLikedPostquery = "SELECT * FROM likes WHERE userId = :userId AND postId = :postId";
    $isUserLikedPostStatement = $db->prepare($isUserLikedPostquery);
    $isUserLikedPostStatement->bindValue(':userId', $userId);
    $isUserLikedPostStatement->bindValue(':postId', $postId);
    $isUserLikedPostStatement->execute();
    $isUserLikedPost = $isUserLikedPostStatement->fetch(PDO::FETCH_ASSOC);

    if ($isUserLikedPost) {
        $query = "DELETE FROM likes WHERE userId = :userId AND postId = :postId";

        $statement = $db->prepare($query);
        $statement->bindValue(':userId', $userId);
        $statement->bindValue(':postId', $postId);
        $statement->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Post unliked.',
            'isUserLiked' => false
        ]);
        return;
    }

    $query = "INSERT INTO likes (id, userId, postId, createDate) VALUES (:id, :userId, :postId, :createDate)";
    $statement = $db->prepare($query);
    $statement->bindValue(':id', uniqid('like_'));
    $statement->bindValue(':userId', $userId);
    $statement->bindValue(':postId', $postId);
    $statement->bindValue(':createDate', date('Y-m-d H:i:s'));
    $statement->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Post liked.',
        'isUserLiked' => true
    ]);