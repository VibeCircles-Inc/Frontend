<?php
require_once '../config/db.php';
$user_id = $_GET['user_id'] ?? null;
$group_id = $_GET['group_id'] ?? null;
$sql = 'SELECT * FROM posts';
$params = [];
if ($user_id) { $sql .= ' WHERE user_id = ?'; $params[] = $user_id; }
elseif ($group_id) { $sql .= ' WHERE group_id = ?'; $params[] = $group_id; }
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$posts = $stmt->fetchAll();
header('Content-Type: application/json');
echo json_encode($posts);
?>