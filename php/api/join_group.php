<?php
require_once '../config/db.php';
$data = json_decode(file_get_contents('php://input'), true);
$group_id = $data['group_id'] ?? null;
$user_id = $data['user_id'] ?? null;
if (!$group_id || !$user_id) { http_response_code(400); echo json_encode(['error'=>'Missing data']); exit; }
$stmt = $pdo->prepare('INSERT IGNORE INTO group_memberships (group_id, user_id) VALUES (?, ?)');
$stmt->execute([$group_id, $user_id]);
echo json_encode(['success'=>true]);
?>