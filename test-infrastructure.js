#!/usr/bin/env node

/**
 * Infrastructure Test Script
 * Tests the core infrastructure components of MindConnect
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing MindConnect Infrastructure...\n');

// Test 1: Check project structure
console.log('📁 Checking project structure...');
const requiredDirs = [
  'frontend',
  'backend',
  'database',
  '.github/workflows',
  '.kiro/specs'
];

const requiredFiles = [
  'docker-compose.yml',
  'README.md',
  'frontend/package.json',
  'backend/package.json',
  'frontend/next.config.ts',
  'backend/tsconfig.json',
  'frontend/tsconfig.json'
];

let structureOk = true;

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}/`);
  } else {
    console.log(`  ❌ ${dir}/ - Missing`);
    structureOk = false;
  }
});

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - Missing`);
    structureOk = false;
  }
});

// Test 2: Check configuration files
console.log('\n⚙️  Checking configuration files...');

// Check Docker Compose
try {
  const dockerCompose = fs.readFileSync('docker-compose.yml', 'utf8');
  if (dockerCompose.includes('mysql') && dockerCompose.includes('redis') &&
    dockerCompose.includes('backend') && dockerCompose.includes('frontend')) {
    console.log('  ✅ docker-compose.yml - All services configured');
  } else {
    console.log('  ❌ docker-compose.yml - Missing required services');
    structureOk = false;
  }
} catch (error) {
  console.log('  ❌ docker-compose.yml - Cannot read file');
  structureOk = false;
}

// Check package.json files
try {
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));

  // Check frontend dependencies
  const frontendDeps = ['next', 'react', 'typescript', '@tanstack/react-query', 'axios', 'socket.io-client'];
  const frontendMissing = frontendDeps.filter(dep =>
    !frontendPkg.dependencies[dep] && !frontendPkg.devDependencies[dep]
  );

  if (frontendMissing.length === 0) {
    console.log('  ✅ Frontend dependencies - All required packages present');
  } else {
    console.log(`  ❌ Frontend dependencies - Missing: ${frontendMissing.join(', ')}`);
    structureOk = false;
  }

  // Check backend dependencies
  const backendDeps = ['express', 'typescript', 'mysql2', 'redis', 'socket.io', 'jsonwebtoken'];
  const backendMissing = backendDeps.filter(dep =>
    !backendPkg.dependencies[dep] && !backendPkg.devDependencies[dep]
  );

  if (backendMissing.length === 0) {
    console.log('  ✅ Backend dependencies - All required packages present');
  } else {
    console.log(`  ❌ Backend dependencies - Missing: ${backendMissing.join(', ')}`);
    structureOk = false;
  }
} catch (error) {
  console.log('  ❌ Package.json files - Cannot read or parse');
  structureOk = false;
}

// Test 3: Check TypeScript configuration
console.log('\n📝 Checking TypeScript configuration...');

try {
  const frontendTsConfig = JSON.parse(fs.readFileSync('frontend/tsconfig.json', 'utf8'));
  const backendTsConfig = JSON.parse(fs.readFileSync('backend/tsconfig.json', 'utf8'));

  if (frontendTsConfig.compilerOptions && backendTsConfig.compilerOptions) {
    console.log('  ✅ TypeScript configurations - Valid JSON structure');
  } else {
    console.log('  ❌ TypeScript configurations - Invalid structure');
    structureOk = false;
  }
} catch (error) {
  console.log('  ❌ TypeScript configurations - Cannot read or parse');
  structureOk = false;
}

// Test 4: Check database configuration
console.log('\n🗄️  Checking database configuration...');

const dbFiles = [
  'backend/src/config/database.ts',
  'backend/src/config/redis.ts',
  'database/init/01-init.sql'
];

dbFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - Missing`);
    structureOk = false;
  }
});

// Test 5: Check CI/CD configuration
console.log('\n🚀 Checking CI/CD configuration...');

if (fs.existsSync('.github/workflows/ci.yml')) {
  try {
    const ciConfig = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
    if (ciConfig.includes('test-backend') && ciConfig.includes('test-frontend') &&
      ciConfig.includes('security-scan')) {
      console.log('  ✅ GitHub Actions CI/CD - All jobs configured');
    } else {
      console.log('  ❌ GitHub Actions CI/CD - Missing required jobs');
      structureOk = false;
    }
  } catch (error) {
    console.log('  ❌ GitHub Actions CI/CD - Cannot read file');
    structureOk = false;
  }
} else {
  console.log('  ❌ GitHub Actions CI/CD - Missing workflow file');
  structureOk = false;
}

// Test 6: Check PWA configuration
console.log('\n📱 Checking PWA configuration...');

const pwaFiles = [
  'frontend/public/manifest.json',
  'frontend/next.config.ts'
];

pwaFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - Missing`);
    structureOk = false;
  }
});

// Test 7: Check environment configuration
console.log('\n🌍 Checking environment configuration...');

const envFiles = [
  'backend/.env.example',
  'frontend/.env.example',
  'backend/.env.test',
  'frontend/.env.local'
];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - Missing`);
    structureOk = false;
  }
});

// Final result
console.log('\n' + '='.repeat(50));
if (structureOk) {
  console.log('🎉 Infrastructure Test PASSED');
  console.log('✅ All core infrastructure components are properly configured');
  console.log('\nNext steps:');
  console.log('1. Start Docker services: docker-compose up -d');
  console.log('2. Run backend tests: cd backend && npm test');
  console.log('3. Run frontend tests: cd frontend && npm test');
  console.log('4. Access application: http://localhost:3000');
  process.exit(0);
} else {
  console.log('❌ Infrastructure Test FAILED');
  console.log('⚠️  Some infrastructure components are missing or misconfigured');
  console.log('Please review the errors above and fix them before proceeding');
  process.exit(1);
}