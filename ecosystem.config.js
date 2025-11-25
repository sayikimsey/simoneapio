// module.exports = {
//   apps: [
//     // Node.js Backend Service
//     {
//       name: "simone-backend",
//       cwd: "./backend",
//       script: "dist/server.js",
//       watch: false,
//       env: {
//         NO_PROXY: "localhost,127.0.0.1,winsimonet01.gascadead.gascade.de",
//         JAVA_SERVICE_BASE_URL: "http://localhost:8081",
//         DB_USER: "sql-simoneapi",
//         DB_PASSWORD: "W4Fe1f4LoZysvLqDzTjz",
//         DB_SERVER: "agt-simoneapi.gascadead.gascade.de",
//         DB_DATABASE: "ModernSignInAppDB",
//         DB_PORT: 1433,
//         DB_OPTIONS_ENCRYPT: true,
//         DB_OPTIONS_TRUST_SERVER_CERTIFICATE: true,
//         JWT_SECRET: "your-very-long-random-and-super-secret-key-for-jwt-signing-!@#$%^&*()",
//         JWT_EXPIRES_IN: "3600s",
//         REFRESH_TOKEN_SECRET: "your-VERY-secure-and-VERY-long-random-string-for-refresh-tokens-!@#$%",
//         NODE_ENV: "production",
//         PORT: 3001,
//       },
//     },
//     // Java Backend Service

//     {
//       name: "simone-java-service",
//       // ✅ KORRIGIERT: Führt den Maven-Befehl direkt in der richtigen Arbeitsumgebung aus.
//       script: "mvn",
//       args: ["spring-boot:run"],
//       cwd: "./simone-java-service",
//       watch: false,
//       // Das Attribut `exec_mode` ist hier nicht erforderlich, da PM2 `mvn` als ausführbare Datei erkennt.
//     },

//     // Frontend Service (Next.js)
//     {
//       name: "simone-frontend",
//       cwd: "./frontend",
//       script: "npm",
//       args: ["run", "start"],
//       watch: false,
//       env: {
//         NEXT_PUBLIC_API_BASE_URL: "https://simoneapi.gascade.de/api",
//       },
//     },
//   ],
// };


// module.exports = {
//   apps: [
//     {
//       name: "backend",
//       cwd: "./backend",
//       script: "cmd",
//       args: "/c npm run start",
//       env: {
//         NO_PROXY: "localhost,127.0.0.1,winsimonet01.gascadead.gascade.de",
//         SIMONE_JAVA_SERVICE_URL: "http://localhost:8081",
//         DB_USER: "sql-simoneapi",
//         DB_PASSWORD: "W4Fe1f4LoZysvLqDzTjz",
//         DB_SERVER: "agt-simoneapi.gascadead.gascade.de",
//         DB_DATABASE: "ModernSignInAppDB",
//         DB_PORT: 1433,
//         DB_OPTIONS_ENCRYPT: true,
//         DB_OPTIONS_TRUST_SERVER_CERTIFICATE: true,
//         JWT_SECRET: "your-very-long-random-and-super-secret-key-for-jwt-signing-!@#$%^&*()",
//         JWT_EXPIRES_IN: "3600s",
//         REFRESH_TOKEN_SECRET: "your-VERY-secure-and-VERY-long-random-string-for-refresh-tokens-!@#$%",
//         NODE_ENV: "production",
//         PORT: 3001,
//       },
//     },
//     {
//       name: "frontend",
//       cwd: "./frontend",
//       script: "cmd",
//       args: "/c npm run start",
//     },
//     {
//       name: "simone-java-service",
//       cwd: "./simone-java-service",
//       script: "cmd",
//       args: "/c mvn spring-boot:run",
//     },
//   ],
// };

// module.exports = {
//   apps: [
//     {
//       name: 'frontend',
//       script: 'cmd',
//       args: ['/c', 'start-pm2.bat'],
//       cwd: './frontend',
//       exec_mode: 'fork',
//       autorestart: true,
//       restart_delay: 1000,
//       env: {
//         NODE_ENV: 'development',
//         PM2_DISABLE_PIDUSAGE_METRICS: 'true'
//       },
//       env_production: {
//         NODE_ENV: 'production',
//         PM2_DISABLE_PIDUSAGE_METRICS: 'true'
//       }
//     },
//     {
//       name: 'backend',
//       script: 'cmd',
//       args: ['/c', 'start-pm2.bat'],
//       cwd: './backend',
//       exec_mode: 'fork',
//       autorestart: true,
//       restart_delay: 1000,
//       env: {
//         NODE_ENV: 'development',
//         PM2_DISABLE_PIDUSAGE_METRICS: 'true'
//       },
//       env_production: {
//         NODE_ENV: 'production',
//         PM2_DISABLE_PIDUSAGE_METRICS: 'true'
//       }
//     },
//     {
//       name: 'simone-java-service',
//       script: 'cmd',
//       args: ['/c', 'start-pm2.bat'],
//       cwd: './simone-java-service',
//       exec_mode: 'fork',
//       autorestart: true,
//       restart_delay: 1000,
//       env: {
//         NODE_ENV: 'development',
//         PM2_DISABLE_PIDUSAGE_METRICS: 'true'
//       },
//       env_production: {
//         NODE_ENV: 'production',
//         PM2_DISABLE_PIDUSAGE_METRICS: 'true'
//       }
//     },
//   ],
// };

// module.exports = {
//   apps: [
//     {
//       name: 'frontend',
//       script: 'start-pm2.js',
//       cwd: './frontend',
//       exec_mode: 'fork',
//       autorestart: true,
//       restart_delay: 1000,
//       env: {
//         NODE_ENV: 'development',
//         PM2_DISABLE_PIDUSAGE_METRICS: true
//       },
//       env_production: {
//         NODE_ENV: 'production',
//         PM2_DISABLE_PIDUSAGE_METRICS: true
//       }
//     },
//     {
//       name: 'backend',
//       script: 'start-pm2.js',
//       cwd: './backend',
//       exec_mode: 'fork',
//       autorestart: true,
//       restart_delay: 1000,
//       env: {
//         NODE_ENV: 'development',
//         PM2_DISABLE_PIDUSAGE_METRICS: true
//       },
//       env_production: {
//         NODE_ENV: 'production',
//         PM2_DISABLE_PIDUSAGE_METRICS: true
//       }
//     },
//     {
//       name: 'simone-java-service',
//       script: 'start-pm2.js',
//       cwd: './simone-java-service',
//       exec_mode: 'fork',
//       autorestart: true,
//       restart_delay: 1000,
//       env: {
//         NODE_ENV: 'development',
//         PM2_DISABLE_PIDUSAGE_METRICS: true
//       },
//       env_production: {
//         NODE_ENV: 'production',
//         PM2_DISABLE_PIDUSAGE_METRICS: true
//       }
//     },
//   ],
// };
/**************************************************************************************************************************** */

/*module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: './frontend',
      script: 'C:\\Windows\\System32\\cmd.exe',
      args: '/d /s /c "node .\\node_modules\\next\\dist\\bin\\next start -p 3000"',
      interpreter: 'none',
      windowsHide: true,
      exec_mode: 'fork',
      min_uptime: 5000,
      restart_delay: 1000,
      env: { NODE_ENV: 'development', PM2_DISABLE_PIDUSAGE_METRICS: 'true' },
      env_production: { NODE_ENV: 'production', PM2_DISABLE_PIDUSAGE_METRICS: 'true' }
    },
    {
      name: 'backend',
      cwd: './backend',
      script: 'C:\\Windows\\System32\\cmd.exe',
      // TODO: put YOUR real entry file below (one of: dist/server.js, dist/index.js, build/index.js, etc.)
      args: '/d /s /c "node .\\dist\\server.js"',
      interpreter: 'none',
      windowsHide: true,
      exec_mode: 'fork',
      min_uptime: 5000,
      restart_delay: 1000,
      env: { NODE_ENV: 'development', PM2_DISABLE_PIDUSAGE_METRICS: 'true' },
      env_production: { NODE_ENV: 'production', PM2_DISABLE_PIDUSAGE_METRICS: 'true' }
    },
    {
  name: 'simone-java-service',
  cwd: './simone-java-service',
  script: 'java',
  args: ['-jar', 'target/simone-java-service-1.0.0.jar'],
  interpreter: 'none',
  windowsHide: true,
  exec_mode: 'fork',
  min_uptime: 5000,
  restart_delay: 1000,
  env: { NODE_ENV: 'development', PM2_DISABLE_PIDUSAGE_METRICS: 'true' },
  env_production: { NODE_ENV: 'production', PM2_DISABLE_PIDUSAGE_METRICS: 'true' }
}
    // {
    //   name: 'simone-java-service',
    //   cwd: './simone-java-service',
    //   script: 'C:\\Windows\\System32\\cmd.exe',
    //   args: '/d /s /c "mvn.cmd spring-boot:run"',
    //   interpreter: 'none',
    //   windowsHide: true,
    //   exec_mode: 'fork',
    //   min_uptime: 5000,
    //   restart_delay: 1000,
    //   env: { NODE_ENV: 'development', PM2_DISABLE_PIDUSAGE_METRICS: 'true' },
    //   env_production: { NODE_ENV: 'production', PM2_DISABLE_PIDUSAGE_METRICS: 'true' }
    // }
  ]
}*/


/****************************************************************************************************************** */


module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: './frontend',
      script: 'node',
      args: ['.\\node_modules\\next\\dist\\bin\\next', 'start', '-p', '3000'],
      interpreter: 'none',
      windowsHide: true,
      exec_mode: 'fork',
      min_uptime: 5000,
      restart_delay: 1000,
      env: { NODE_ENV: 'development', PM2_DISABLE_PIDUSAGE_METRICS: 'true' },
      env_production: { NODE_ENV: 'production', PM2_DISABLE_PIDUSAGE_METRICS: 'true' }
    },
    {
      name: 'backend',
      cwd: './backend',
      script: 'node',
      args: ['.\\dist\\server.js'],
      interpreter: 'none',
      windowsHide: true,
      exec_mode: 'fork',
      min_uptime: 5000,
      restart_delay: 1000,
      env: { NODE_ENV: 'development', PM2_DISABLE_PIDUSAGE_METRICS: 'true' },
      env_production: { NODE_ENV: 'production', PM2_DISABLE_PIDUSAGE_METRICS: 'true' }
    },
   {
  name: 'simone-java-service',
  cwd: './simone-java-service',
  script: 'java',
  args: ['-Dserver.tomcat.basedir=C:\\simone-temp', '-jar', 'target/simone-java-service-0.0.1-SNAPSHOT.jar'], // <--- UPDATED LINE
  interpreter: 'none',
  windowsHide: true,
  exec_mode: 'fork',
  min_uptime: 5000,
  restart_delay: 1000,
  env: { NODE_ENV: 'development', PM2_DISABLE_PIDUSAGE_METRICS: 'true' },
  env_production: { NODE_ENV: 'production', PM2_DISABLE_PIDUSAGE_METRICS: 'true' }
}
  ]
}