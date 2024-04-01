<?php
    require '../connection.php';
    require '../common/headers.php';
    require '../config/index.php';

    if (!isset($_POST['userId'])) {
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        return;
    }

    $userId = $_POST['userId'];

    $isUserExistsQuery = "SELECT * FROM users WHERE id = :userId";
    $isUserExistsStatement = $db->prepare($isUserExistsQuery);
    $isUserExistsStatement->bindValue(':userId', $userId);
    $isUserExistsStatement->execute();

    if ($isUserExistsStatement->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'User does not exist'
        ]);
        return;
    }

    if (isset($_FILES["photo"])) {
        $file = $_FILES["photo"];

        $tmpName = $file["tmp_name"];
        $error = $file["error"];
        $fileType = $file["type"];

        $allowedTypes = array("image/jpeg", "image/jpg", "image/png");

        if (in_array($fileType, $allowedTypes)) {
            $uploadDir = "../storage/users/";
            $targetFilePath = $uploadDir . $userId . ".jpg";

            if ($error === 0) {
                if (move_uploaded_file($tmpName, $targetFilePath)) {
                    $photoUrl = $appBaseURL . "server/storage/users/" . $userId . ".jpg";

                    $query = "UPDATE users SET photoUrl = :photoUrl WHERE id = :userId";
                    $statement = $db->prepare($query);
                    $statement->bindValue(':photoUrl', $photoUrl);
                    $statement->bindValue(':userId', $userId);
                    $statement->execute();
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Photo updated successfully',
                        'photoUrl' => $photoUrl
                    ]);
                    return;
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'An error occurred while uploading the file.'
                    ]);
                    return;
                }
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'An error occurred while uploading the file. Error code: ' . $error
                ]);
                return;
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid file format. Please upload a JPG, JPEG, or PNG file.'
            ]);
            return;
        }
    }