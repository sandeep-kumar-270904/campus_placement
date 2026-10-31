#!/usr/bin/env node

/**
 * PLACEearly Unified Dev Server Runner
 * Concurrently spawns backend (port 5001) and frontend (port 5173)
 * with colorized prefixes, graceful shutdown, and port status display.
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// ANSI color escape codes
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.clear?.();
console.log(`
${BOLD}${GREEN}================================================================${RESET}
${BOLD}${CYAN}   🚀  PLACEearly — Campus Placement Operating System           ${RESET}
${BOLD}${GREEN}================================================================${RESET}
${YELLOW}Starting concurrent services...${RESET}
• Backend API:      ${CYAN}http://localhost:5001${RESET}
• Frontend Client:  ${CYAN}http://localhost:5173${RESET}
• Quick Cheatsheet: ${CYAN}COMMANDS.md${RESET}
${BOLD}${GREEN}----------------------------------------------------------------${RESET}
${YELLOW}Press Ctrl+C at any time to gracefully terminate both services.${RESET}
`);

let serverProc = null;
let clientProc = null;

function prefixStream(stream, label, color) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep unfinished tail
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.log(`${color}${label}${RESET} ${line}`);
      }
    }
  });
}

function checkPort(port, callback) {
  const req = http.get(`http://localhost:${port}/`, (res) => {
    callback(true, res.statusCode);
  });
  req.on('error', () => {
    callback(false);
  });
  req.setTimeout(1000, () => {
    req.destroy();
    callback(false);
  });
}

// 1. Launch Backend (nodemon server)
serverProc = spawn(npmCmd, ['--prefix', 'server', 'run', 'dev'], {
  cwd: ROOT_DIR,
  env: { ...process.env, FORCE_COLOR: '1' },
  shell: isWin,
});
prefixStream(serverProc.stdout, '[SERVER 5001]', CYAN);
prefixStream(serverProc.stderr, '[SERVER 5001:ERR]', RED);

// 2. Launch Frontend (vite client)
clientProc = spawn(npmCmd, ['--prefix', 'client', 'run', 'dev'], {
  cwd: ROOT_DIR,
  env: { ...process.env, FORCE_COLOR: '1' },
  shell: isWin,
});
prefixStream(clientProc.stdout, '[CLIENT 5173]', GREEN);
prefixStream(clientProc.stderr, '[CLIENT 5173:ERR]', RED);

// Graceful cleanup handler
function shutdown(code = 0) {
  console.log(`\n${YELLOW}Shutting down PLACEearly services...${RESET}`);

  if (serverProc) {
    if (isWin) {
      spawn('taskkill', ['/pid', serverProc.pid, '/f', '/t']);
    } else {
      serverProc.kill('SIGTERM');
    }
  }

  if (clientProc) {
    if (isWin) {
      spawn('taskkill', ['/pid', clientProc.pid, '/f', '/t']);
    } else {
      clientProc.kill('SIGTERM');
    }
  }

  setTimeout(() => {
    console.log(`${GREEN}Services stopped cleanly. Goodbye!${RESET}`);
    process.exit(code);
  }, 500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('exit', () => shutdown(0));
