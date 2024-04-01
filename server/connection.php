<?php
    require_once 'config/index.php';

    try {
        $db = new PDO('mysql:host=localhost;dbname=dictionary', $db_user, $db_pass);
    } catch (PDOException $e) {
        die('Connection failed: ' . $e->getMessage());
    }