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
            'message' => 'You don\'t have permission to edit'
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

    $message = $data['message'];

    $query = "UPDATE posts SET message = :message, updateDate = :updateDate  WHERE id = :postId";
    $statement = $db->prepare($query);
    $statement->bindValue(':message', $message);
    $statement->bindValue(':updateDate', date('Y-m-d H:i:s'));
    $statement->bindValue(':postId', $postId);
    $statement->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Post updated successfully'
    ]);