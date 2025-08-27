#!/usr/bin/env node

/**
 * VibeCircles Supabase Deployment Script
 * This script helps automate the deployment of VibeCircles to Supabase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 VibeCircles Supabase Deployment Script');
console.log('==========================================\n');

// Configuration
const config = {
    projectName: 'vibecircles',
    supabaseConfigPath: './supabase/config.toml',
    schemaPath: './supabase/database/schema.sql',
    seedPath: './supabase/database/seed.sql',
    edgeFunctionsPath: './supabase/edge-functions'
};

// Utility functions
function checkPrerequisites() {
    console.log('📋 Checking prerequisites...');
    
    try {
        // Check if Supabase CLI is installed
        execSync('supabase --version', { stdio: 'pipe' });
        console.log('✅ Supabase CLI is installed');
    } catch (error) {
        console.error('❌ Supabase CLI is not installed');
        console.log('Please install it with: npm install -g supabase');
        process.exit(1);
    }

    // Check if required files exist
    const requiredFiles = [
        config.supabaseConfigPath,
        config.schemaPath,
        config.seedPath
    ];

    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            console.error(`❌ Required file not found: ${file}`);
            process.exit(1);
        }
    }

    console.log('✅ All prerequisites met\n');
}

function promptForCredentials() {
    console.log('🔑 Please provide your Supabase credentials:');
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Project URL (e.g., https://your-project-ref.supabase.co): ', (url) => {
            rl.question('Anon Key (starts with eyJ...): ', (key) => {
                rl.close();
                resolve({ url, key });
            });
        });
    });
}

function updateSupabaseClient(credentials) {
    console.log('📝 Updating Supabase client configuration...');
    
    const clientPath = './js/supabase-client.js';
    let clientContent = fs.readFileSync(clientPath, 'utf8');
    
    // Replace placeholder values
    clientContent = clientContent.replace(
        /this\.supabaseUrl = 'https:\/\/your-project-ref\.supabase\.co'/,
        `this.supabaseUrl = '${credentials.url}'`
    );
    
    clientContent = clientContent.replace(
        /this\.supabaseAnonKey = 'your-anon-key'/,
        `this.supabaseAnonKey = '${credentials.key}'`
    );
    
    fs.writeFileSync(clientPath, clientContent);
    console.log('✅ Supabase client configuration updated\n');
}

function deployEdgeFunctions() {
    console.log('🚀 Deploying edge functions...');
    
    try {
        // Deploy vibecircles-api function
        console.log('Deploying vibecircles-api...');
        execSync('supabase functions deploy vibecircles-api', { stdio: 'inherit' });
        
        // Deploy realtime-sync function
        console.log('Deploying realtime-sync...');
        execSync('supabase functions deploy realtime-sync', { stdio: 'inherit' });
        
        console.log('✅ Edge functions deployed successfully\n');
    } catch (error) {
        console.error('❌ Failed to deploy edge functions:', error.message);
        console.log('Please check your Supabase CLI configuration and try again');
        process.exit(1);
    }
}

function createEnvironmentFile(credentials) {
    console.log('📄 Creating environment file...');
    
    const envContent = `# VibeCircles Supabase Environment Variables
SUPABASE_URL=${credentials.url}
SUPABASE_ANON_KEY=${credentials.key}

# Add these to your Supabase dashboard under Settings > Edge Functions
`;
    
    fs.writeFileSync('.env.supabase', envContent);
    console.log('✅ Environment file created (.env.supabase)\n');
}

function generateSetupInstructions() {
    console.log('📚 Setup Instructions:');
    console.log('=====================\n');
    
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of supabase/database/schema.sql');
    console.log('4. Run the SQL commands');
    console.log('5. Copy and paste the contents of supabase/database/seed.sql');
    console.log('6. Run the seed data commands');
    console.log('7. Go to Settings > Edge Functions');
    console.log('8. Add the environment variables from .env.supabase');
    console.log('\n9. Test your application by opening it in a browser');
    console.log('10. Check the browser console for success messages\n');
}

function main() {
    console.log('Welcome to the VibeCircles Supabase deployment script!\n');
    
    // Check prerequisites
    checkPrerequisites();
    
    // Prompt for credentials
    promptForCredentials().then(credentials => {
        // Update Supabase client
        updateSupabaseClient(credentials);
        
        // Create environment file
        createEnvironmentFile(credentials);
        
        // Deploy edge functions
        deployEdgeFunctions();
        
        // Generate setup instructions
        generateSetupInstructions();
        
        console.log('🎉 Deployment script completed successfully!');
        console.log('Please follow the setup instructions above to complete the configuration.');
    }).catch(error => {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    });
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    checkPrerequisites,
    promptForCredentials,
    updateSupabaseClient,
    deployEdgeFunctions,
    createEnvironmentFile,
    generateSetupInstructions
};
