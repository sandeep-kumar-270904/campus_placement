#!/usr/bin/env node

/**
 * PLACEearly Quick Task CLI Runner
 * Single command entrypoint for dev, tests, health checks, and seeds.
 */

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

const command = process.argv[2] || 'help';

function checkHttp(port) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(`http://localhost:${port}/`, (res) => {
      resolve({
        active: true,
        statusCode: res.statusCode,
        latencyMs: Date.now() - start,
      });
    });
    req.on('error', (err) => {
      resolve({ active: false, error: err.code || err.message });
    });
    req.setTimeout(1200, () => {
      req.destroy();
      resolve({ active: false, error: 'TIMEOUT' });
    });
  });
}

async function showStatus() {
  console.log(`\n${BOLD}${CYAN}🔍 Checking PLACEearly Service Status...${RESET}\n`);

  const [backend, frontend] = await Promise.all([
    checkHttp(5001),
    checkHttp(5173),
  ]);

  console.log(
    `• ${BOLD}Backend API (Port 5001):${RESET} ` +
      (backend.active
        ? `${GREEN}● RUNNING${RESET} (HTTP ${backend.statusCode}, ${backend.latencyMs}ms)`
        : `${RED}○ STOPPED${RESET} ${DIM}(${backend.error})${RESET}`)
  );

  console.log(
    `• ${BOLD}Frontend Client (Port 5173):${RESET} ` +
      (frontend.active
        ? `${GREEN}● RUNNING${RESET} (HTTP ${frontend.statusCode}, ${frontend.latencyMs}ms)`
        : `${RED}○ STOPPED${RESET} ${DIM}(${frontend.error})${RESET}`)
  );

  console.log('\n' + (backend.active && frontend.active
    ? `${GREEN}✨ All services are active and reachable!${RESET}`
    : `${YELLOW}💡 Run ${BOLD}npm run dev${RESET}${YELLOW} to start all services.${RESET}`) + '\n');
}

function showHelp() {
  console.log(`
${BOLD}${GREEN}================================================================${RESET}
${BOLD}${CYAN}   ⚡  PLACEearly Fast Command Runner & Cheat Sheet             ${RESET}
${BOLD}${GREEN}================================================================${RESET}

${BOLD}QUICK USAGE:${RESET}
  ${CYAN}npm run dev${RESET}           Start BOTH Backend (:5001) & Frontend (:5173) together
  ${CYAN}npm run status${RESET}        Check live status & latency of backend and frontend
  ${CYAN}npm test${RESET}              Run all 330 backend automated test suites
  ${CYAN}npm run seed:recruiter${RESET} Seed demo recruiter credentials
  ${CYAN}npm run build:client${RESET}  Build production Vite frontend bundle

${BOLD}ONE-CLICK WINDOWS LAUNCHERS:${RESET}
  ${YELLOW}start-dev.bat${RESET}         Double-click to start both servers in one command
  ${YELLOW}test-all.bat${RESET}          Double-click to run full test suite with report

${BOLD}SERVICE ENDPOINTS:${RESET}
  • Frontend Web App:   ${CYAN}http://localhost:5173${RESET}
  • Backend REST API:   ${CYAN}http://localhost:5001${RESET}
  • API Health Check:   ${CYAN}http://localhost:5001/api/health${RESET}

${BOLD}DEFAULT DEMO ACCOUNTS:${RESET}
  • ${BOLD}TPO Admin:${RESET}        tpo@demo.edu / Password@123
  • ${BOLD}Student:${RESET}          student@demo.edu / Password@123
  • ${BOLD}Recruiter:${RESET}        recruiter.google@techcorp.com / Password@123
  • ${BOLD}Super Admin:${RESET}      admin@placeearly.com / Password@123

${BOLD}TROUBLESHOOTING PORT CONFLICTS (WINDOWS):${RESET}
  If port 5001 or 5173 is locked by a previous zombie process:
  ${DIM}netstat -ano | findstr :5001${RESET}
  ${DIM}taskkill /PID <PID> /F${RESET}
${BOLD}${GREEN}================================================================${RESET}
`);
}

switch (command.toLowerCase()) {
  case 'dev':
  case 'start':
    require('./dev.js');
    break;

  case 'status':
  case 'health':
    showStatus();
    break;

  case 'test':
    console.log(`\n${CYAN}Running all backend unit and integration test suites...${RESET}\n`);
    spawnSync(npmCmd, ['--prefix', 'server', 'test'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: isWin,
    });
    break;

  case 'seed':
  case 'seed:recruiter':
    console.log(`\n${CYAN}Seeding corporate recruiter credentials...${RESET}\n`);
    spawnSync(npmCmd, ['--prefix', 'server', 'run', 'seed:recruiter'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: isWin,
    });
    break;

  case 'build':
    console.log(`\n${CYAN}Building client bundle for production...${RESET}\n`);
    spawnSync(npmCmd, ['--prefix', 'client', 'run', 'build'], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: isWin,
    });
    break;

  case 'help':
  default:
    showHelp();
    break;
}
