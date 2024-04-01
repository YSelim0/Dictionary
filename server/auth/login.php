<?php
    require '../connection.php';
    require '../common/headers.php';

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

    $query = "SELECT * FROM users WHERE username = :username";
    $statement = $db->prepare($query);
    $statement->bindValue(':username', $username);
    $statement->execute();

    $user = $statement->fetch(PDO::FETCH_ASSOC);

    if ($user === false) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
        return;
    }

    if (!password_verify($password, $user['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
        return;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Login successfully.',
        'user' => $user
    ]);