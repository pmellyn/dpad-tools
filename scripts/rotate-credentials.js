#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Function to generate a secure random string
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Function to update .env file
function updateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log('Creating new .env file from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const updatedContent = envContent
    .replace(/SESSION_SECRET=.*/, `SESSION_SECRET="${generateSecureString()}"`)
    .replace(/JWT_SECRET=.*/, `JWT_SECRET="${generateSecureString()}"`);
  
  fs.writeFileSync(envPath, updatedContent);
  console.log('Updated .env file with new secrets');
}

// Main function
function main() {
  console.log('Starting credential rotation...');
  
  // Update environment variables
  updateEnvFile();
  
  console.log('\nCredential rotation complete!');
  console.log('Please remember to:');
  console.log('1. Update your Google Cloud service account credentials');
  console.log('2. Update any other external service credentials');
  console.log('3. Restart your application');
}

main(); 