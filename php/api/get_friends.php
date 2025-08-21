<?php
require_once '../config/db.php';
$user_id = $_GET['user_id'] ?? null;
if (!$user_id) { http_response_code(400); echo json_encode(['error'=>'Missing user id']); exit; }
$stmt = $pdo->prepare('SELECT friend_id FROM friendships WHERE user_id = ? AND status = \"accepted\"');
$stmt->execute([$user_id]);
$friends = $stmt->fetchAll();
header('Content-Type: application/json');
echo json_encode($friends);
?>