<?php
    require '../connection.php';
    require '../common/headers.php';

    $query = "SELECT * FROM topics";
    $statement = $db->prepare($query);
    $statement->execute();
    $topics = $statement->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Topics fetched successfully',
        'topics' => $topics
    ]);