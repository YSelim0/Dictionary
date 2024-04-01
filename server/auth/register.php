<?php
    require '../connection.php';
    require '../common/headers.php';
    require '../common/service.php';
    require '../config/index.php';

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($data === null) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON'
        ]);
        return;
    }

    if (!isset($data['username']) || !isset($data['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Username or password cannot be empty'
        ]);
        return;
    }

    $username = $data['username'];
    $password = $data['password'];
    $biography = isset($data['biography']) && !empty($data['biography']) ? $data['biography'] : '';

    if (isFieldTaken($db, 'users', 'username', $username)) {
        echo json_encode([
            'success' => false,
            'message' => 'Username already taken'
        ]);
        return;
    }

    $query = "INSERT INTO users (id, username, password, createDate, photoUrl, biography) VALUES (:id, :username, :password, :createDate, :photoUrl, :biography)";
    $statement = $db->prepare($query);

    $id = uniqid('user_');
    $statement->bindValue(':id', $id);
    $statement->bindValue(':username', $username);
    $statement->bindValue(':password', password_hash($password, PASSWORD_BCRYPT));
    $statement->bindValue(':createDate', date('Y-m-d H:i:s'));
    $statement->bindValue(':photoUrl', $defaultPhotoURL);
    $statement->bindValue(':biography', $biography == null ? '' : $biography);
    $statement->execute();

    echo json_encode([
        'success' => true,
        'message' => 'User registered successfully',
        'user' => getUserById($db, $id)
    ]);