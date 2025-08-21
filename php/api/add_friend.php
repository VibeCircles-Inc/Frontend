<?php
require_once '../config/db.php';
$data = json_decode(file_get_contents('php://input'), true);
$user_id = $data['user_id'] ?? null;
$friend_id = $data['friend_id'] ?? null;
if (!$user_id || !$friend_id) { http_response_code(400); echo json_encode(['error'=>'Missing data']); exit; }
$stmt = $pdo->prepare('INSERT INTO friendships (user_id, friend_id, status) VALUES (?, ?, \"pending\")');
$stmt->execute([$user_id, $friend_id]);
echo json_encode(['success'=>true]);
?>