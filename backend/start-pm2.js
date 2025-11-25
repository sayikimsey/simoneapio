const { spawn } = require('child_process');
spawn('npm run start', {
  stdio: 'inherit',
  shell: true
});

// const { spawn } = require('child_process');
// const child = spawn('npm', ['run', 'start'], {
//   cwd: __dirname,
//   stdio: 'inherit',
//   shell: true,
//   detached: true
// });
// child.unref();