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
    if (isset($data['oldPassword']) && !empty($data['oldPassword'])) {
        $oldPassword = $data['oldPassword'];
        $query = "SELECT password FROM users WHERE id = :userId";
        $statement = $db->prepare($query);
        $statement->bindValue(':userId', $userId);
        $statement->execute();
        $result = $statement->fetch(PDO::FETCH_ASSOC);
        if (!password_verify($oldPassword, $result['password'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Old password is incorrect'
            ]);
            return;
        }
    }

    if (!isset($data['newPassword']) && empty($data['newPassword'])) {
        echo json_encode([
            'success' => false,
            'message' => 'New password cannot be empty'
        ]);
        return;
    }

    $newPassword = $data['newPassword'];
    $query = "UPDATE users SET password = :password WHERE id = :userId";
    $statement = $db->prepare($query);
    $statement->bindValue(':password', password_hash($newPassword, PASSWORD_DEFAULT));
    $statement->bindValue(':userId', $userId);
    $statement->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully'
    ]);