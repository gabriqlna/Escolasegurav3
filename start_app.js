import { spawn } from 'child_process';

const npmDev = spawn('npm', ['run', 'dev'], {
  cwd: '/home/runner/workspace',
  stdio: 'inherit'
});

npmDev.on('close', (code) => {
  console.log(`React app exited with code ${code}`);
});
