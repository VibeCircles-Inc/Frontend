<?php
require_once '../config/db.php';
$data = json_decode(file_get_contents('php://input'), true);
$user_id = $data['user_id'] ?? null;
$content = $data['content'] ?? '';
$group_id = $data['group_id'] ?? null;
if (!$user_id || !$content) { http_response_code(400); echo json_encode(['error'=>'Missing data']); exit; }
$stmt = $pdo->prepare('INSERT INTO posts (user_id, group_id, content) VALUES (?, ?, ?)');
$stmt->execute([$user_id, $group_id, $content]);
echo json_encode(['success'=>true, 'post_id'=>$pdo->lastInsertId()]);
?>