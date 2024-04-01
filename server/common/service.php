<?php
    function getUserById($db, $userId) {
        $query = "SELECT * FROM users WHERE id = :id";
        $statement = $db->prepare($query);
        $statement->bindValue(':id', $userId);
        $statement->execute();
        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    function isFieldTaken($db, $table, $field, $value) {
        $query = "SELECT * FROM $table WHERE $field = :value";
        $statement = $db->prepare($query);
        $statement->bindValue(':value', $value);
        $statement->execute();
        return $statement->fetch(PDO::FETCH_ASSOC);
    }

    function getDateTimeNow() {
        $date = new DateTime('now', new DateTimeZone('UTC'));
        $date->setTimezone(new DateTimeZone('Europe/Istanbul'));
        return $date->format('Y-m-d H:i:s');
    }

    function slugify($text) {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);

        if (empty($text)) {
            return 'n-a';
        }

        return $text;
    }