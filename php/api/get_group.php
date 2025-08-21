<?php
require_once '../config/db.php';
$stmt = $pdo->query('SELECT * FROM groups');
$groups = $stmt->fetchAll();
header('Content-Type: application/json');
echo json_encode($groups);
?>