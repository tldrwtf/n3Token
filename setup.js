#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Setting up n3Token - Twitch Token Manager...');

// Check Node.js version
const nodeVersion = process.version.slice(1).split('.')[0];
if (parseInt(nodeVersion) < 18) {
    console.error(`❌ Node.js version ${process.version} is too old. Please install Node.js 18 or higher.`);
    process.exit(1);
}

console.log(`✅ Node.js ${process.version} is installed`);

// Create .env file if it doesn't exist
if (!fs.existsSync('.env')) {
    console.log('📝 Creating .env file...');
    if (fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', '.env');
        console.log('⚠️  Please edit .env file with your configuration before starting the application!');
    } else {
        // Create basic .env template
        const envTemplate = `# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/twitchmanager

# Session Configuration (Change in production!)
SESSION_SECRET=your-secure-session-secret-change-this-in-production

# Twitch API Configuration (Optional)
TWITCH_CLIENT_ID=your-twitch-client-id
TWITCH_CLIENT_SECRET=your-twitch-client-secret

# Application Configuration
NODE_ENV=production
PORT=5000
`;
        fs.writeFileSync('.env', envTemplate);
        console.log('📝 Created .env template - please configure it!');
    }
} else {
    console.log('✅ .env file already exists');
}

// Create uploads directory
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
    console.log('✅ Created uploads directory');
}

// Create dist directory
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
    console.log('✅ Created dist directory');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Edit .env file with your configuration');
console.log('2. Set up your PostgreSQL database');
console.log('3. Run "npm run db:push" to set up database schema');
console.log('4. Run "npm run build" to build the application');
console.log('5. Start the application with "npm start"');
