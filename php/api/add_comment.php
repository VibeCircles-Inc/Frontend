<?php
require_once '../config/db.php';
$data = json_decode(file_get_contents('php://input'), true);
$post_id = $data['post_id'] ?? null;
$user_id = $data['user_id'] ?? null;
$content = $data['content'] ?? '';
if (!$post_id || !$user_id || !$content) { http_response_code(400); echo json_encode(['error'=>'Missing data']); exit; }
$stmt = $pdo->prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)');
$stmt->execute([$post_id, $user_id, $content]);
echo json_encode(['success'=>true, 'comment_id'=>$pdo->lastInsertId()]);
?>