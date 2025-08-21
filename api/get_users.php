<?php
// api/get_users.php
// Get all users from Supabase

require_once '../config/supabase.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

function getUsers($limit = 50, $offset = 0) {
    $endpoint = "users?select=*&limit={$limit}&offset={$offset}&order=created_at.desc";
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
            'error' => 'Failed to fetch users',
            'details' => $result['data']
        ];
    }
}

function getUserById($userId) {
    $endpoint = "users?select=*&id=eq.{$userId}";
    $result = makeSupabaseRequest($endpoint);
    
    if ($result['status'] === 200 && !empty($result['data'])) {
        return [
            'success' => true,
            'data' => $result['data'][0]
        ];
    } else {
        return [
            'success' => false,
            'error' => 'User not found',
            'details' => $result['data']
        ];
    }
}

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get specific user
            $response = getUserById($_GET['id']);
        } else {
            // Get all users with pagination
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
            $response = getUsers($limit, $offset);
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
