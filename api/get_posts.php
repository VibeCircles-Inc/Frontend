<?php
// api/get_posts.php
// Get posts from Supabase

require_once '../config/supabase.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

function getPosts($limit = 20, $offset = 0, $userId = null) {
    $endpoint = "posts?select=*,users(username,profiles(full_name,avatar_url))&limit={$limit}&offset={$offset}&order=created_at.desc";
    
    // Filter by user if specified
    if ($userId) {
        $endpoint .= "&user_id=eq.{$userId}";
    }
    
    $result = makeSupabaseRequest($endpoint);
    
    if ($result['status'] === 200) {
        return [
            'success' => true,
            'data' => $result['data'],
            'count' => count($result['data'])
        ];
    } else {
        return [
            'success' => false,
            'error' => 'Failed to fetch posts',
            'details' => $result['data']
        ];
    }
}

function getPostById($postId) {
    $endpoint = "posts?select=*,users(username,profiles(full_name,avatar_url))&id=eq.{$postId}";
    $result = makeSupabaseRequest($endpoint);
    
    if ($result['status'] === 200 && !empty($result['data'])) {
        return [
            'success' => true,
            'data' => $result['data'][0]
        ];
    } else {
        return [
            'success' => false,
            'error' => 'Post not found',
            'details' => $result['data']
        ];
    }
}

function createPost($data) {
    $postData = [
        'user_id' => $data['user_id'],
        'content' => $data['content'],
        'privacy' => $data['privacy'] ?? 'public',
        'media_url' => $data['media_url'] ?? null,
        'group_id' => $data['group_id'] ?? null
    ];
    
    $result = makeSupabaseRequest('posts', 'POST', $postData);
    
    if ($result['status'] === 201) {
        return [
            'success' => true,
            'data' => $result['data'][0],
            'message' => 'Post created successfully'
        ];
    } else {
        return [
            'success' => false,
            'error' => 'Failed to create post',
            'details' => $result['data']
        ];
    }
}

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get specific post
            $response = getPostById($_GET['id']);
        } else {
            // Get all posts with pagination
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
            $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
            $response = getPosts($limit, $offset, $userId);
        }
        break;
        
    case 'POST':
        // Create new post
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input) {
            $response = createPost($input);
        } else {
            $response = [
                'success' => false,
                'error' => 'Invalid input data'
            ];
            http_response_code(400);
        }
        break;
        
    default:
        $response = [
            'success' => false,
            'error' => 'Method not allowed'
        ];
        http_response_code(405);
        break;
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
