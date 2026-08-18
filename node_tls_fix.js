// TLS fix for local development when system clock is wrong
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.NODE_OPTIONS = (process.env.NODE_OPTIONS || '') + ' --dns-result-order=ipv4first';

// Now start Next.js
import { spawn } from 'child_process'

const next = spawn('node', ['node_modules/.bin/next', 'dev'], { stdio: 'inherit' })


next.on('error', (err) => {
  console.error('Failed to start next dev:', err);
  process.exit(1);
});
