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

    $userId = $data['userId'];

    $query = "SELECT * FROM users WHERE id = :userId";
    $statement = $db->prepare($query);
    $statement->bindValue(':userId', $userId);
    $statement->execute();
    $user = $statement->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        return;
    }

    $query = "SELECT posts.id, topics.title, users.username, users.photoUrl, posts.createDate, posts.updateDate  from posts, topics, users WHERE posts.topicId = topics.id AND posts.userId = users.id AND posts.userId = :userId ORDER BY posts.createDate DESC";
    $statement = $db->prepare($query);
    $statement->bindValue(':userId', $user['id']);
    $statement->execute();
    $posts = $statement->fetchAll(PDO::FETCH_ASSOC);

    $queryTotalLike = "SELECT COUNT(*) as totalLike FROM likes l INNER JOIN posts p ON l.postId = p.id WHERE p.userId = :userId";
    $stmtTotalLike = $db->prepare($queryTotalLike);
    $stmtTotalLike->bindValue(':userId', $user['id']);
    $stmtTotalLike->execute();
    $totalLikeRow = $stmtTotalLike->fetch(PDO::FETCH_ASSOC);
    $totalLike = (int) ($totalLikeRow['totalLike'] ?? 0);

    echo json_encode([
        'success' => true,
        'message' => 'User fetched successfully',
        'user' => [
            'username' => $user['username'],
            'photoUrl' => $user['photoUrl'],
            'biography' => $user['biography'],
            'totalLike' => $totalLike,
            'posts' => $posts
        ]
    ]);