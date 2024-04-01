<?php
    require '../connection.php';
    require '../common/headers.php';
    require '../common/service.php';

    $today = new DateTime('now', new DateTimeZone('UTC'));
    $today->setTimezone(new DateTimeZone('Europe/Istanbul'));
    $threeDaysAgo = new DateInterval('P3D');
    $today->sub($threeDaysAgo);
    $dateResult = $today->format('Y-m-d H:i:s');
    $today = getDateTimeNow();
    
    $query = "SELECT topics.title, topics.slug, COUNT(*) as count FROM topics INNER JOIN posts ON posts.topicId = topics.id WHERE posts.createDate >= :startDate GROUP BY topics.title, topics.slug ORDER BY count DESC LIMIT 5;";
    $statement = $db->prepare($query);
    $statement->bindValue(':startDate', $dateResult);
    $statement->execute();
    $result = $statement->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Popular topics fetched successfully',
        'topics' => $result
    ]);