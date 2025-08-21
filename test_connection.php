<?php
// test_connection.php
// Test file to verify Supabase connection

require_once 'config/supabase.php';

echo "<h2>Testing Supabase Connection</h2>";

// Test 1: Check if configuration is loaded
echo "<h3>1. Configuration Check:</h3>";
echo "SUPABASE_URL: " . (defined('SUPABASE_URL') ? '✅ Set' : '❌ Not set') . "<br>";
echo "SUPABASE_ANON_KEY: " . (defined('SUPABASE_ANON_KEY') ? '✅ Set' : '❌ Not set') . "<br>";
echo "SUPABASE_SERVICE_KEY: " . (defined('SUPABASE_SERVICE_KEY') ? '✅ Set' : '❌ Not set') . "<br>";

// Test 2: Test connection
echo "<h3>2. Connection Test:</h3>";
if (testSupabaseConnection()) {
    echo "✅ Connection successful!<br>";
} else {
    echo "❌ Connection failed!<br>";
}

// Test 3: Try to get users count
echo "<h3>3. API Test:</h3>";
$result = makeSupabaseRequest('users?select=count');
echo "HTTP Status: " . $result['status'] . "<br>";
echo "Response: ";
if ($result['status'] === 200) {
    echo "✅ Success - " . json_encode($result['data']) . "<br>";
} else {
    echo "❌ Failed - " . json_encode($result['data']) . "<br>";
}

echo "<h3>4. Next Steps:</h3>";
echo "If all tests pass, your Supabase connection is working!<br>";
echo "You can now proceed to update your API endpoints to use Supabase.<br>";
?>
