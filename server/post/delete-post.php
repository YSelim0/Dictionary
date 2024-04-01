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

    if (!isFieldTaken($db, 'posts', 'id', $data['postId'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Post not found'
        ]);
        return;
    }

    $postId = $data['postId'];

    $post = isFieldTaken($db, 'posts', 'id', $data['postId']);

    if ($post['userId'] !== $userId) {
        echo json_encode([
            'success' => false,
            'message' => 'You don\'t have permission to delete.'
        ]);
        return;
    }
    
    $topicRecordCountQuery = "SELECT COUNT(*) as RecordCount FROM posts WHERE topicId = :topicId";
    $topicRecordCountStatement = $db->prepare($topicRecordCountQuery);
    $topicRecordCountStatement->bindValue(':topicId', $post['topicId']);
    $topicRecordCountStatement->execute();
    $topicRecordCount = $topicRecordCountStatement->fetch(PDO::FETCH_ASSOC)['RecordCount'];

    if ($topicRecordCount === 1) {
        $query = "DELETE FROM topics WHERE id = :topicId";
        $statement = $db->prepare($query);
        $statement->bindValue(':topicId', $post['topicId']);
        $statement->execute();
    }

    $deleteLikesOfPostQuery = "DELETE FROM likes WHERE postId = :postId";
    $deleteLikesOfPostStatement = $db->prepare($deleteLikesOfPostQuery);
    $deleteLikesOfPostStatement->bindValue(':postId', $postId);
    $deleteLikesOfPostStatement->execute();

    $query = "DELETE FROM posts WHERE id = :postId AND userId = :userId";
    $statement = $db->prepare($query);
    $statement->bindValue(':postId', $postId);
    $statement->bindValue(':userId', $userId);
    $statement->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Post deleted successfully'
    ]);