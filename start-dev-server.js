import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vitePath = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');

const devServer = spawn('node', [vitePath], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

devServer.on('error', (error) => {
  console.error('Failed to start dev server:', error);
});

devServer.on('close', (code) => {
  console.log(`Dev server exited with code ${code}`);
});

process.on('SIGINT', () => {
  devServer.kill('SIGINT');
});
