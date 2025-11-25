// // backend/src/config/db.ts
// import sql, { ConnectionPool, config as MSSQLConfig } from "mssql"; // Import mssql
// import dotenv from "dotenv";

// dotenv.config(); // Ensure environment variables are loaded

// const dbConfig: MSSQLConfig = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   server: process.env.DB_SERVER || "localhost", // Default to localhost if not set
//   database: process.env.DB_DATABASE,
//   port: parseInt(process.env.DB_PORT || "1433", 10), // Default to 1433
//   options: {
//     encrypt: process.env.DB_OPTIONS_ENCRYPT === "true", // Default to false if not 'true'
//     trustServerCertificate:
//       process.env.DB_OPTIONS_TRUST_SERVER_CERTIFICATE === "true", // Default to false
//     // You might need to add other options depending on your SQL Server setup
//     // e.g., instanceName for named instances
//   },
//   pool: {
//     // Connection pool configuration
//     max: 10, // Max number of connections in the pool
//     min: 0, // Min number of connections
//     idleTimeoutMillis: 30000, // How long a connection can be idle before being removed
//   },
// };

// let pool: ConnectionPool | null = null;

// export const connectDB = async (): Promise<void> => {
//   try {
//     console.log("Attempting to connect to MSSQL database...");
//     console.log("DB Config Used:", {
//       server: dbConfig.server,
//       database: dbConfig.database,
//       user: dbConfig.user ? "******" : undefined, // Mask user for logging
//       port: dbConfig.port,
//       encrypt: dbConfig.options?.encrypt,
//       trustServerCertificate: dbConfig.options?.trustServerCertificate,
//     });

//     pool = await new ConnectionPool(dbConfig).connect();
//     console.log("✅ MSSQL Database connected successfully!");

//     // Optional: Test query
//     // const result = await pool.request().query('SELECT 1 AS number');
//     // console.log('Test query result:', result.recordset);
//   } catch (err) {
//     console.error(
//       "🔥 MSSQL Database Connection Failed:",
//       err instanceof Error ? err.message : String(err)
//     );
//     // Depending on your error handling strategy, you might want to exit the process
//     // process.exit(1);
//     // For now, we'll let the server start but log the error.
//     // Routes needing DB will fail until connection is restored.
//     // Consider implementing retry logic or a health check endpoint.
//   }
// };

// // Export a function to get the pool or a request object
// // This ensures that a connection attempt has been made before trying to use the pool.
// export const getDBPool = (): ConnectionPool => {
//   if (!pool) {
//     // This state should ideally be avoided by ensuring connectDB is called successfully at startup.
//     // Or, make connectDB return the pool and manage its lifecycle carefully.
//     // For robust applications, consider a more sophisticated connection management strategy.
//     console.error(
//       "🔥 Database pool has not been initialized. Ensure connectDB() was called and succeeded."
//     );
//     throw new Error("Database pool not initialized.");
//   }
//   return pool;
// };

// // Export the mssql object itself if you need to access its data types directly (e.g., sql.VarChar)
// export { sql };

// backend/src/config/db.ts

import sql, { ConnectionPool, config as MSSQLConfig } from "mssql";
import dotenv from "dotenv";

dotenv.config(); // Lädt Umgebungsvariablen aus .env-Datei

/**
 * Konfiguration für die Verbindung zur Microsoft SQL Server-Datenbank.
 * Die Werte werden bevorzugt aus Umgebungsvariablen geladen.
 */
const dbConfig: MSSQLConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "localhost", // Standardwert: localhost
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || "1433", 10), // Standardport für MSSQL
  options: {
    encrypt: process.env.DB_OPTIONS_ENCRYPT === "true", // TLS-Verschlüsselung aktivieren
    trustServerCertificate:
      process.env.DB_OPTIONS_TRUST_SERVER_CERTIFICATE === "true", // Für selbstsignierte Zertifikate
  },
  pool: {
    max: 10, // Maximale Anzahl gleichzeitiger Verbindungen
    min: 0, // Minimale Anzahl von Verbindungen
    idleTimeoutMillis: 30000, // Zeit in ms, bis eine inaktive Verbindung entfernt wird
  },
};

let pool: ConnectionPool | null = null;

/**
 * Stellt die Verbindung zur Datenbank her.
 * Die Verbindungskonfiguration wird aus Umgebungsvariablen geladen.
 * 
 * @returns void
 * @throws Gibt eine Fehlermeldung in der Konsole aus, wenn die Verbindung fehlschlägt.
 */
export const connectDB = async (): Promise<void> => {
  try {
    console.log("🌐 Versuch, Verbindung zur MSSQL-Datenbank herzustellen...");
    console.log("🔧 Verwendete DB-Konfiguration:", {
      server: dbConfig.server,
      database: dbConfig.database,
      user: dbConfig.user ? "******" : undefined, // Benutzername aus Datenschutzgründen maskieren
      port: dbConfig.port,
      encrypt: dbConfig.options?.encrypt,
      trustServerCertificate: dbConfig.options?.trustServerCertificate,
    });

    pool = await new ConnectionPool(dbConfig).connect();
    console.log("✅ Verbindung zur MSSQL-Datenbank erfolgreich hergestellt.");
  } catch (err) {
    console.error(
      "❌ Verbindung zur MSSQL-Datenbank fehlgeschlagen:",
      err instanceof Error ? err.message : String(err)
    );

    // Hinweis: Die Anwendung wird nicht beendet.
    // Nachfolgende Anfragen, die die DB benötigen, schlagen jedoch fehl,
    // bis die Verbindung erfolgreich aufgebaut wurde.
  }
};

/**
 * Gibt die aktive Verbindungspool-Instanz zurück.
 * 
 * @returns {ConnectionPool} Aktiver MSSQL ConnectionPool
 * @throws Wenn der Pool nicht initialisiert wurde (connectDB nicht erfolgreich aufgerufen).
 */
export const getDBPool = (): ConnectionPool => {
  if (!pool) {
    console.error(
      "❗ Der Datenbank-Pool wurde nicht initialisiert. connectDB() muss erfolgreich ausgeführt werden."
    );
    throw new Error("Datenbankverbindung nicht initialisiert.");
  }
  return pool;
};

/**
 * Exportiert das SQL-Modul für den Zugriff auf SQL-Datentypen (z. B. sql.VarChar).
 */
export { sql };
