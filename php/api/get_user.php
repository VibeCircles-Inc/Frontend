<?php
require_once '../config/db.php';
$id = $_GET['id'] ?? null;
if (!$id) { http_response_code(400); echo json_encode(['error'=>'Missing user id']); exit; }
$stmt = $pdo->prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?');
$stmt->execute([$id]);
$user = $stmt->fetch();
header('Content-Type: application/json');
echo json_encode($user);
?>