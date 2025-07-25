#!/usr/bin/env node

/**
 * MindConnect Setup Script
 * Automated setup for the MindConnect development environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up MindConnect Development Environment...\n');

// Helper function to run commands
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📝 Running: ${command}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed to run: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Helper function to check if command exists
function commandExists(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Step 1: Check prerequisites
console.log('🔍 Checking prerequisites...');

const prerequisites = [
  { name: 'Node.js', command: 'node', version: '--version' },
  { name: 'npm', command: 'npm', version: '--version' },
  { name: 'Docker', command: 'docker', version: '--version' },
  { name: 'Docker Compose', command: 'docker-compose', version: '--version' }
];

let prerequisitesMet = true;

prerequisites.forEach(({ name, command, version }) => {
  if (commandExists(command)) {
    try {
      const versionOutput = execSync(`${command} ${version}`, { encoding: 'utf8' });
      console.log(`  ✅ ${name}: ${versionOutput.trim()}`);
    } catch (error) {
      console.log(`  ✅ ${name}: Available`);
    }
  } else {
    console.log(`  ❌ ${name}: Not found`);
    prerequisitesMet = false;
  }
});

if (!prerequisitesMet) {
  console.log('\n❌ Prerequisites not met. Please install the missing tools and try again.');
  process.exit(1);
}

// Step 2: Install dependencies
console.log('\n📦 Installing dependencies...');

console.log('\n🎨 Installing frontend dependencies...');
if (!runCommand('npm ci', 'frontend')) {
  console.log('❌ Failed to install frontend dependencies');
  process.exit(1);
}

console.log('\n⚙️  Installing backend dependencies...');
if (!runCommand('npm ci', 'backend')) {
  console.log('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Step 3: Setup environment files
console.log('\n🌍 Setting up environment files...');

// Copy backend .env.example to .env if it doesn't exist
if (!fs.existsSync('backend/.env')) {
  try {
    fs.copyFileSync('backend/.env.example', 'backend/.env');
    console.log('  ✅ Created backend/.env from .env.example');
  } catch (error) {
    console.log('  ❌ Failed to create backend/.env');
  }
} else {
  console.log('  ✅ backend/.env already exists');
}

// Copy frontend .env.example to .env.local if it doesn't exist
if (!fs.existsSync('frontend/.env.local')) {
  try {
    fs.copyFileSync('frontend/.env.example', 'frontend/.env.local');
    console.log('  ✅ Created frontend/.env.local from .env.example');
  } catch (error) {
    console.log('  ❌ Failed to create frontend/.env.local');
  }
} else {
  console.log('  ✅ frontend/.env.local already exists');
}

// Step 4: Build Docker images
console.log('\n🐳 Building Docker images...');
if (!runCommand('docker-compose build')) {
  console.log('❌ Failed to build Docker images');
  process.exit(1);
}

// Step 5: Start services
console.log('\n🚀 Starting services...');
if (!runCommand('docker-compose up -d mysql redis')) {
  console.log('❌ Failed to start database services');
  process.exit(1);
}

// Wait for services to be ready
console.log('\n⏳ Waiting for services to be ready...');
setTimeout(() => {
  // Step 6: Run tests
  console.log('\n🧪 Running tests...');
  
  console.log('\n🔧 Testing backend...');
  runCommand('npm run type-check', 'backend');
  
  console.log('\n🎨 Testing frontend...');
  runCommand('npm run type-check', 'frontend');
  
  // Step 7: Final verification
  console.log('\n✅ Running infrastructure test...');
  runCommand('node test-infrastructure.js');
  
  // Success message
  console.log('\n' + '='.repeat(60));
  console.log('🎉 MindConnect setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Start all services: docker-compose up -d');
  console.log('2. View logs: docker-compose logs -f');
  console.log('3. Access frontend: http://localhost:3000');
  console.log('4. Access backend API: http://localhost:5000/health');
  console.log('5. Stop services: docker-compose down');
  console.log('\n📚 Development commands:');
  console.log('- Backend dev: cd backend && npm run dev');
  console.log('- Frontend dev: cd frontend && npm run dev');
  console.log('- Run tests: npm test (in backend or frontend directory)');
  console.log('- View database: Connect to localhost:3307 with MySQL client');
  console.log('- View Redis: Connect to localhost:6380 with Redis client');
  console.log('\n🔧 Troubleshooting:');
  console.log('- Check service status: docker-compose ps');
  console.log('- View service logs: docker-compose logs [service-name]');
  console.log('- Restart services: docker-compose restart');
  console.log('- Clean up: docker-compose down -v');
  
}, 10000); // Wait 10 seconds for services to start