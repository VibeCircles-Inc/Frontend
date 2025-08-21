<?php
require_once '../config/db.php';

$stmt = $pdo->query('SELECT * FROM users');
$users = $stmt->fetchAll();
echo json_encode($users);
?>