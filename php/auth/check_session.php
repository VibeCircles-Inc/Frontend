<?php
// php/auth/check_session.php
header('Content-Type: application/json');
session_start();
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email']
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['logged_in' => false, 'error' => 'Not logged in.']);
} 