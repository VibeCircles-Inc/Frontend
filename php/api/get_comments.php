<?php
require_once '../config/db.php';
$post_id = $_GET['post_id'] ?? null;
if (!$post_id) { http_response_code(400); echo json_encode(['error'=>'Missing post id']); exit; }
$stmt = $pdo->prepare('SELECT * FROM comments WHERE post_id = ?');
$stmt->execute([$post_id]);
$comments = $stmt->fetchAll();
header('Content-Type: application/json');
echo json_encode($comments);
?>