<?php
require_once '../config/db.php';

// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Check if file and user_id are provided
if (!isset($_FILES['image']) || !isset($_POST['user_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing file or user_id']);
    exit;
}

$user_id = intval($_POST['user_id']);
$type = $_POST['type'] ?? 'post'; // 'post' or 'avatar'
$post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : null;

// Validate user_id exists
try {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    if (!$stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid user_id']);
        exit;
    }
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit;
}

$target_dir = ($type === 'avatar') ? '../../assets/images/user/' : '../../assets/images/post/';

// Create directory if it doesn't exist
if (!is_dir($target_dir)) {
    if (!mkdir($target_dir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create directory']);
        exit;
    }
}

// Validate and move uploaded file
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxFileSize = 10 * 1024 * 1024; // 10 MB

if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Upload error: ' . $_FILES['image']['error']]);
    exit;
}

if ($_FILES['image']['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Max 10MB allowed.']);
    exit;
}

// Validate file type using both MIME type and file extension
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $_FILES['image']['tmp_name']);
finfo_close($finfo);

$ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
$allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

if (!in_array($mime_type, $allowed_types) || !in_array($ext, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, and WebP allowed.']);
    exit;
}

// Generate secure filename
$filename = uniqid('img_', true) . '_' . time() . '.' . $ext;
$target_file = $target_dir . $filename;

if (!move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
    exit;
}

// Save file path to DB
$relative_path = 'assets/images/' . (($type === 'avatar') ? 'user/' : 'post/') . $filename;

try {
    if ($type === 'avatar') {
        // Update user profile avatar_url
        $stmt = $pdo->prepare('UPDATE profiles SET avatar_url = ? WHERE user_id = ?');
        $stmt->execute([$relative_path, $user_id]);
        echo json_encode(['success' => true, 'avatar_url' => $relative_path]);
    } else {
        // Insert into media table for post
        if (!$post_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing post_id for post image upload']);
            exit;
        }
        $stmt = $pdo->prepare('INSERT INTO media (user_id, post_id, url, type) VALUES (?, ?, ?, ?)');
        $stmt->execute([$user_id, $post_id, $relative_path, 'image']);
        echo json_encode(['success' => true, 'media_url' => $relative_path]);
    }
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit;
}
?> 