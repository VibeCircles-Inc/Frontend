<?php
// config/supabase.php
// Supabase configuration for VibeCircles

// Replace these with your actual Supabase credentials
// You can find these in your Supabase project dashboard under Settings > API
define('SUPABASE_URL', 'your-project-url');
define('SUPABASE_ANON_KEY', 'your-anon-key');
define('SUPABASE_SERVICE_KEY', 'your-service-key');

// Database connection using Supabase REST API
function getSupabaseConnection() {
    $url = SUPABASE_URL . '/rest/v1/';
    $headers = [
        'apikey: ' . SUPABASE_ANON_KEY,
        'Authorization: Bearer ' . SUPABASE_ANON_KEY,
        'Content-Type: application/json'
    ];
    
    return [
        'url' => $url,
        'headers' => $headers
    ];
}

// Helper function to make Supabase API requests
function makeSupabaseRequest($endpoint, $method = 'GET', $data = null) {
    $config = getSupabaseConnection();
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $config['url'] . $endpoint);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $config['headers']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'data' => json_decode($response, true),
        'status' => $httpCode
    ];
}

// Test connection function
function testSupabaseConnection() {
    $result = makeSupabaseRequest('users?select=count');
    return $result['status'] === 200;
}
?>
