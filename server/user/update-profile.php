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
    if (isset($data['username']) && !empty($data['username'])) {
        $username = $data['username'];
        if (isFieldTaken($db, 'users', 'username', $username) && getUserById($db, $userId)['username'] != $username) {
            echo json_encode([
                'success' => false,
                'message' => 'Username already taken'
            ]);
            return;
        }

        $query = "UPDATE users SET username = :username WHERE id = :userId";
        $statement = $db->prepare($query);
        $statement->bindValue(':username', $username);
        $statement->bindValue(':userId', $userId);
        $statement->execute();
    }

    if (isset($data['biography']) && !empty($data['biography'])) {
        $biography = $data['biography'];

        $query = "UPDATE users SET biography = :biography WHERE id = :userId";
        $statement = $db->prepare($query);
        $statement->bindValue(':biography', $biography);
        $statement->bindValue(':userId', $userId);
        $statement->execute();
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'User updated successfully',
        'user' => getUserById($db, $userId)
    ]);