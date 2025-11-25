const { spawn } = require('child_process');
spawn('mvn spring-boot:run', {
  stdio: 'inherit',
  shell: true
});

// const { spawn } = require('child_process');
// const child = spawn('mvn', ['spring-boot:run'], {
//   cwd: __dirname,
//   stdio: 'inherit',
//   shell: true,
//   detached: true
// });
// child.unref();