#!/usr/bin/env node

const { authenticator } = require('otplib');

const secret = process.argv[2];

if (!secret) {
  console.error('Usage: node scripts/generate-otp.js <secret>');
  console.error('Example: node scripts/generate-otp.js "speedrun-challenge"');
  process.exit(1);
}

try {
  const code = authenticator.generate(secret);
  const timeRemaining = 30 - (Math.floor(Date.now() / 1000) % 30);

  console.log(`\nOTP Code: ${code}`);
  console.log(`Time remaining: ${timeRemaining}s`);
  console.log(`Secret: ${secret}\n`);
} catch (error) {
  console.error('Error generating OTP:', error.message);
  process.exit(1);
}
