<?php
    require '../connection.php';
    require '../common/headers.php';
    require '../common/service.php';

    $today = new DateTime('now', new DateTimeZone('UTC'));
    $today->setTimezone(new DateTimeZone('Europe/Istanbul'));
    $sevenDaysAgo = new DateInterval('P7D');
    $today->sub($sevenDaysAgo);
    $dateResult = $today->format('Y-m-d H:i:s');
    $today = getDateTimeNow();

    $query = "SELECT topics.title, topics.slug, COUNT(*) as count, COUNT(likes.id) as likesCount FROM topics INNER JOIN posts ON posts.topicId = topics.id LEFT JOIN likes ON likes.postId = posts.id WHERE posts.createDate >= :startDate GROUP BY topics.title, topics.slug ORDER BY likesCount DESC LIMIT 15;";
    $statement = $db->prepare($query);
    $statement->bindValue(':startDate', $dateResult);
    $statement->execute();
    $result = $statement->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($result) < 15) {
        $limit = 15 - count($result);
        $query = "SELECT topics.title, topics.slug, COUNT(*) as count, COUNT(likes.id) as likesCount FROM topics INNER JOIN posts ON posts.topicId = topics.id LEFT JOIN likes ON likes.postId = posts.id GROUP BY topics.title, topics.slug ORDER BY likesCount DESC LIMIT ".$limit.";";
        $statement = $db->prepare($query);
        $statement->execute();
        $extraResult = $statement->fetchAll(PDO::FETCH_ASSOC);
    
        foreach ($extraResult as $extraTopic) {
            $found = false;
            foreach ($result as &$topic) {
                if ($topic['title'] == $extraTopic['title']) {
                    $topic['count'] += $extraTopic['count']; 
                    $topic['likesCount'] += $extraTopic['likesCount']; 
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $result[] = $extraTopic;
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Sorted topics fetched successfully',
        'topics' => $result
    ]);