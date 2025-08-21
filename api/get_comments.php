<?php
// api/get_comments.php
// Get comments from Supabase

require_once '../config/supabase.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

function getComments($postId, $limit = 50, $offset = 0) {
    $endpoint = "comments?select=*,users(username,profiles(full_name,avatar_url))&post_id=eq.{$postId}&limit={$limit}&offset={$offset}&order=created_at.asc";
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
            'error' => 'Failed to fetch comments',
            'details' => $result['data']
        ];
    }
}

function createComment($data) {
    $commentData = [
        'post_id' => $data['post_id'],
        'user_id' => $data['user_id'],
        'content' => $data['content']
    ];
    
    $result = makeSupabaseRequest('comments', 'POST', $commentData);
    
    if ($result['status'] === 201) {
        return [
            'success' => true,
            'data' => $result['data'][0],
            'message' => 'Comment created successfully'
        ];
    } else {
        return [
            'success' => false,
            'error' => 'Failed to create comment',
            'details' => $result['data']
        ];
    }
}

function deleteComment($commentId, $userId) {
    // First check if the comment belongs to the user
    $endpoint = "comments?select=*&id=eq.{$commentId}&user_id=eq.{$userId}";
    $checkResult = makeSupabaseRequest($endpoint);
    
    if ($checkResult['status'] === 200 && !empty($checkResult['data'])) {
        // Delete the comment
        $deleteEndpoint = "comments?id=eq.{$commentId}";
        $result = makeSupabaseRequest($deleteEndpoint, 'DELETE');
        
        if ($result['status'] === 204) {
            return [
                'success' => true,
                'message' => 'Comment deleted successfully'
            ];
        } else {
            return [
                'success' => false,
                'error' => 'Failed to delete comment',
                'details' => $result['data']
            ];
        }
    } else {
        return [
            'success' => false,
            'error' => 'Comment not found or unauthorized'
        ];
    }
}

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['post_id'])) {
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
            $response = getComments($_GET['post_id'], $limit, $offset);
        } else {
            $response = [
                'success' => false,
                'error' => 'Post ID is required'
            ];
            http_response_code(400);
        }
        break;
        
    case 'POST':
        // Create new comment
        $input = json_decode(file_get_contents('php://input'), true);
        if ($input && isset($input['post_id']) && isset($input['user_id']) && isset($input['content'])) {
            $response = createComment($input);
        } else {
            $response = [
                'success' => false,
                'error' => 'Missing required fields: post_id, user_id, content'
            ];
            http_response_code(400);
        }
        break;
        
    case 'DELETE':
        if (isset($_GET['id']) && isset($_GET['user_id'])) {
            $response = deleteComment($_GET['id'], $_GET['user_id']);
        } else {
            $response = [
                'success' => false,
                'error' => 'Comment ID and user ID are required'
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
