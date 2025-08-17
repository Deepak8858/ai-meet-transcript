#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Validates that all required environment variables are properly configured
 * No external dependencies required
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  backend: {
    required: ['GROQ_API_KEY', 'GMAIL_USER', 'GMAIL_APP_PASSWORD'],
    optional: ['GEMINI_API_KEY', 'DATABASE_URL', 'REDIS_URL', 'JWT_SECRET', 'SESSION_SECRET'],
    file: '.env'
  },
  frontend: {
    required: ['NEXT_PUBLIC_API_URL'],
    optional: ['NEXT_PUBLIC_GA_TRACKING_ID', 'NEXT_PUBLIC_SENTRY_DSN'],
    file: '.env.local'
  }
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

/**
 * Colorize text for terminal output
 */
function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

/**
 * Validate environment variables for a specific directory
 */
function validateEnvironment(dir, config) {
  console.log(`\n${colorize('📁 Validating ' + dir.toUpperCase() + ' environment...', 'bold')}`);
  
  const envPath = path.join(__dirname, dir, config.file);
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.log(`${colorize('❌ ' + envPath + ' not found', 'red')}`);
    console.log(`   Copy ${path.join(dir, '.env.example')} to ${config.file}`);
    return false;
  }

  // Load environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });

  let isValid = true;

  // Check required variables
  console.log(`\n${colorize('🔍 Required Variables:', 'bold')}`);
  config.required.forEach(key => {
    const value = envVars[key];
    if (!value || value === 'your_' + key.toLowerCase().replace(/_/g, '_') || 
        value.includes('your_') || value === 'placeholder' || value === '') {
      console.log(`${colorize('❌ ' + key + ': Not configured or using placeholder', 'red')}`);
      isValid = false;
    } else {
      console.log(`${colorize('✅ ' + key + ': ' + maskSensitiveValue(value), 'green')}`);
    }
  });

  // Check optional variables
  console.log(`\n${colorize('⚙️  Optional Variables:', 'bold')}`);
  config.optional.forEach(key => {
    const value = envVars[key];
    if (value && !value.includes('your_') && value !== 'placeholder' && value !== '') {
      console.log(`${colorize('✅ ' + key + ': ' + maskSensitiveValue(value), 'green')}`);
    } else {
      console.log(`${colorize('ℹ️  ' + key + ': Not configured (using defaults)', 'blue')}`);
    }
  });

  return isValid;
}

/**
 * Mask sensitive values for display
 */
function maskSensitiveValue(value) {
  if (!value || value === 'Not set') return 'Not set';
  if (value.length <= 8) return '***';
  return value.substring(0, 4) + '...' + value.substring(value.length - 4);
}

/**
 * Test basic configuration
 */
function testConfiguration() {
  console.log(`\n${colorize('🔬 Testing Configuration...', 'bold')}`);
  
  const backendEnv = path.join(__dirname, 'backend', '.env');
  const frontendEnv = path.join(__dirname, 'frontend', '.env.local');
  
  let tests = [];

  // Test backend .env
  if (fs.existsSync(backendEnv)) {
    const content = fs.readFileSync(backendEnv, 'utf8');
    if (content.includes('GROQ_API_KEY=your_groq_api_key_here')) {
      tests.push(`${colorize('❌ Groq API key needs to be configured', 'red')}`);
    } else {
      tests.push(`${colorize('✅ Groq API key appears to be configured', 'green')}`);
    }
    
    if (content.includes('GMAIL_USER=your_email@gmail.com')) {
      tests.push(`${colorize('❌ Gmail user needs to be configured', 'red')}`);
    } else {
      tests.push(`${colorize('✅ Gmail user appears to be configured', 'green')}`);
    }
  } else {
    tests.push(`${colorize('❌ Backend .env file not found', 'red')}`);
  }

  // Test frontend .env.local
  if (fs.existsSync(frontendEnv)) {
    const content = fs.readFileSync(frontendEnv, 'utf8');
    if (content.includes('NEXT_PUBLIC_API_URL=http://localhost:5000')) {
      tests.push(`${colorize('✅ Frontend API URL configured for development', 'green')}`);
    }
  } else {
    tests.push(`${colorize('❌ Frontend .env.local file not found', 'red')}`);
  }

  tests.forEach(test => console.log(test));
}

/**
 * Main validation function
 */
function main() {
  console.log(colorize('🚀 Environment Variables Validation', 'bold'));
  console.log('='.repeat(50));

  let allValid = true;

  // Validate backend
  const backendValid = validateEnvironment('backend', CONFIG.backend);
  if (!backendValid) allValid = false;

  // Validate frontend
  const frontendValid = validateEnvironment('frontend', CONFIG.frontend);
  if (!frontendValid) allValid = false;

  // Test configuration
  console.log('\n' + '='.repeat(50));
  testConfiguration();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(colorize('📋 Validation Summary:', 'bold'));
  
  if (allValid) {
    console.log(colorize('✅ All environment variables appear to be properly configured!', 'green'));
    console.log(colorize('🎉 Your application is ready to run!', 'green'));
  } else {
    console.log(colorize('❌ Some issues found. Please check the above messages.', 'red'));
    console.log(`\n${colorize('🔧 Next steps:', 'bold')}`);
    console.log('1. Fix any missing required variables');
    console.log('2. Configure your API keys and credentials');
    console.log('3. Run this validation again: node validate-env.js');
  }

  console.log(`\n${colorize('📖 For detailed setup instructions, see ENVIRONMENT_SETUP.md', 'blue')}`);
}

// Run validation
if (require.main === module) {
  main();
}

module.exports = { validateEnvironment };