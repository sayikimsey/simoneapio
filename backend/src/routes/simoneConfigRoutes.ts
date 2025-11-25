// // backend/src/routes/simoneConfigRoutes.ts
// import express, { Request, Response } from "express";
// import fs from "fs/promises"; // Using promise-based file system module
// import path from "path";
// import { protect as authMiddleware } from "../middleware/authMiddleware";
// import { authorize as rbacMiddleware } from "../middleware/rbacMiddleware";

// const router = express.Router();
// // Create the absolute path to the config file relative to the execution directory
// const configFilePath = path.resolve(process.cwd(), "simone.config.json");

// // Helper function to read the config file
// const readConfig = async () => {
//   try {
//     console.log(`[Config] Reading config from: ${configFilePath}`);
//     const data = await fs.readFile(configFilePath, "utf-8");
//     return JSON.parse(data);
//   } catch (error) {
//     console.error("Error reading SIMONE config file:", error);
//     // If file doesn't exist, return a default structure
//     if ((error as NodeJS.ErrnoException).code === "ENOENT") {
//       return {
//         simoneInstallationPath: "",
//         defaultNetworkDirectory: "",
//         defaultConfigFilePath: "",
//       };
//     }
//     throw error; // Re-throw other errors
//   }
// };

// // Helper function to write to the config file
// const writeConfig = async (data: any) => {
//   try {
//     console.log(`[Config] Writing config to: ${configFilePath}`);
//     // Use JSON.stringify with spacing for readability
//     await fs.writeFile(configFilePath, JSON.stringify(data, null, 2), "utf-8");
//   } catch (error) {
//     console.error("Error writing to SIMONE config file:", error);
//     throw error;
//   }
// };

// // --- Define Routes ---
// const adminOnly = rbacMiddleware(["admin"]);

// // GET /api/config/simone - Get current configuration (Admin only)
// router.get(
//   "/",
//   authMiddleware,
//   /*adminOnly,*/
//   async (req: Request, res: Response) => {
//     console.log("GET /api/config/simone - Request to read config");
//     try {
//       const config = await readConfig();
//       res.status(200).json(config);
//     } catch (error) {
//       res.status(500).json({ message: "Failed to read configuration file." });
//     }
//   }
// );

// // POST /api/config/simone - Update configuration (Admin only)
// router.post(
//   "/",
//   authMiddleware,
//   /*adminOnly,*/
//   async (req: Request, res: Response) => {
//     console.log(
//       "POST /api/config/simone - Request to update config with:",
//       req.body
//     );
//     try {
//       const {
//         simoneInstallationPath,
//         defaultNetworkDirectory,
//         defaultConfigFilePath,
//       } = req.body;
//       if (
//         typeof simoneInstallationPath !== "string" ||
//         typeof defaultNetworkDirectory !== "string" ||
//         typeof defaultConfigFilePath !== "string"
//       ) {
//         // CORRECTED: Removed the 'return' keyword
//         res
//           .status(400)
//           .json({
//             message:
//               "Invalid configuration data provided. All path fields are required.",
//           });
//         return; // Use a standalone return to exit the function after sending the response
//       }

//       const newConfig = {
//         simoneInstallationPath,
//         defaultNetworkDirectory,
//         defaultConfigFilePath,
//       };

//       await writeConfig(newConfig);
//       res
//         .status(200)
//         .json({
//           message: "Configuration updated successfully.",
//           config: newConfig,
//         });
//     } catch (error) {
//       res.status(500).json({ message: "Failed to write configuration file." });
//     }
//   }
// );

// export default router;

// backend/src/routes/simoneConfigRoutes.ts

import express, { Request, Response } from "express";
import fs from "fs/promises"; // Verwendet das Promise-basierte Dateisystem-Modul für asynchrone Operationen
import path from "path"; // Hilfsprogramm zum Arbeiten mit Dateipfaden
import { protect as authMiddleware } from "../middleware/authMiddleware"; // Ihre Authentifizierungs-Middleware
import { authorize as rbacMiddleware } from "../middleware/rbacMiddleware"; // Ihre Rollenbasierte Zugriffssteuerungs-Middleware (RBAC)

const router = express.Router();

// Erstellt den absoluten Pfad zur Konfigurationsdatei.
// 'process.cwd()' gibt das aktuelle Arbeitsverzeichnis des Node.js-Prozesses zurück.
// 'path.resolve()' löst den Pfad korrekt auf, unabhängig vom Betriebssystem.
const configFilePath = path.resolve(process.cwd(), "simone.config.json");

// -------------------------------------------------------------------
// ✅ Hilfsfunktion: readConfig
// Zweck: Liest die SIMONE-Konfigurationsdatei (simone.config.json).
// Gibt den Inhalt als JSON-Objekt zurück oder eine Standardstruktur,
// wenn die Datei nicht existiert.
// -------------------------------------------------------------------
const readConfig = async () => {
  try {
    console.log(`[Config] Lese Konfiguration von: ${configFilePath}`);
    // Versucht, die Datei asynchron zu lesen und den Inhalt als UTF-8-String zu interpretieren.
    const data = await fs.readFile(configFilePath, "utf-8");
    // Parsen des JSON-Strings in ein JavaScript-Objekt
    return JSON.parse(data);
  } catch (error) {
    console.error("Fehler beim Lesen der SIMONE-Konfigurationsdatei:", error);
    // Wenn der Fehlercode 'ENOENT' ist (Error No ENTry = Datei oder Verzeichnis nicht gefunden),
    // wird eine Standardkonfiguration zurückgegeben.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("[Config] Konfigurationsdatei nicht gefunden, gebe Standardstruktur zurück.");
      return {
        simoneInstallationPath: "",
        defaultNetworkDirectory: "",
        defaultConfigFilePath: "",
      };
    }
    // Andere Fehler werden erneut geworfen, damit sie vom Aufrufer behandelt werden können.
    throw error;
  }
};

// -------------------------------------------------------------------
// ✅ Hilfsfunktion: writeConfig
// Zweck: Schreibt Daten in die SIMONE-Konfigurationsdatei.
// Speichert das übergebene Objekt als formatierten JSON-String.
// -------------------------------------------------------------------
const writeConfig = async (data: any) => {
  try {
    console.log(`[Config] Schreibe Konfiguration nach: ${configFilePath}`);
    // Konvertiert das JavaScript-Objekt in einen JSON-String.
    // 'null, 2' sorgt für eine lesbare Formatierung mit 2 Leerzeichen Einrückung.
    await fs.writeFile(configFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Fehler beim Schreiben in die SIMONE-Konfigurationsdatei:", error);
    // Wirft den Fehler erneut, damit der Aufrufer ihn behandeln kann.
    throw error;
  }
};

// --- Routen definieren ---

// Middleware für die Rollenprüfung: Stellt sicher, dass nur Benutzer mit der Rolle 'admin'
// auf bestimmte Routen zugreifen können.
const adminOnly = rbacMiddleware(["admin"]);

// -------------------------------------------------------------------
// GET /api/config/simone
// Zweck: Ruft die aktuelle SIMONE-Konfiguration ab.
// Authentifizierung ist erforderlich (authMiddleware).
// Eine Rollenprüfung (adminOnly) ist auskommentiert, kann aber bei Bedarf aktiviert werden.
// -------------------------------------------------------------------
router.get(
  "/",
  authMiddleware, // Stellt sicher, dass der Benutzer angemeldet ist
  /*adminOnly,*/ // Auskommentiert: Fügt die Rollenprüfung für Administratoren hinzu, wenn aktiviert
  async (req: Request, res: Response) => {
    console.log("GET /api/config/simone - Anfrage zum Lesen der Konfiguration");
    try {
      // Versucht, die Konfiguration zu lesen
      const config = await readConfig();
      // Sendet die gelesene Konfiguration mit Status 200 (OK) zurück
      res.status(200).json(config);
    } catch (error) {
      // Bei einem Fehler beim Lesen der Konfiguration, sende Status 500 (Internal Server Error)
      res.status(500).json({ message: "Fehler beim Lesen der Konfigurationsdatei." });
    }
  }
);

// -------------------------------------------------------------------
// POST /api/config/simone
// Zweck: Aktualisiert die SIMONE-Konfiguration mit neuen Werten.
// Authentifizierung ist erforderlich (authMiddleware).
// Eine Rollenprüfung (adminOnly) ist auskommentiert, kann aber bei Bedarf aktiviert werden.
// -------------------------------------------------------------------
router.post(
  "/",
  authMiddleware, // Stellt sicher, dass der Benutzer angemeldet ist
  /*adminOnly,*/ // Auskommentiert: Fügt die Rollenprüfung für Administratoren hinzu, wenn aktiviert
  async (req: Request, res: Response) => {
    console.log(
      "POST /api/config/simone - Anfrage zur Aktualisierung der Konfiguration mit:",
      req.body
    );
    try {
      // Extrahiert die erwarteten Konfigurationsfelder aus dem Request-Body
      const {
        simoneInstallationPath,
        defaultNetworkDirectory,
        defaultConfigFilePath,
      } = req.body;

      // Eingabevalidierung: Prüft, ob alle erwarteten Felder Strings sind.
      // Dies verhindert, dass ungültige Daten in die Konfigurationsdatei geschrieben werden.
      if (
        typeof simoneInstallationPath !== "string" ||
        typeof defaultNetworkDirectory !== "string" ||
        typeof defaultConfigFilePath !== "string"
      ) {
        // Wenn die Daten ungültig sind, sende Status 400 (Bad Request)
        res
          .status(400)
          .json({
            message:
              "Ungültige Konfigurationsdaten bereitgestellt. Alle Pfadfelder sind erforderlich.",
          });
        return; // Beendet die Funktion nach dem Senden der Antwort
      }

      // Erstellt ein neues Konfigurationsobjekt aus den validierten Daten
      const newConfig = {
        simoneInstallationPath,
        defaultNetworkDirectory,
        defaultConfigFilePath,
      };

      // Schreibt das neue Konfigurationsobjekt in die Datei
      await writeConfig(newConfig);

      // Sendet eine Erfolgsmeldung und die neue Konfiguration mit Status 200 (OK) zurück
      res
        .status(200)
        .json({
          message: "Konfiguration erfolgreich aktualisiert.",
          config: newConfig,
        });
    } catch (error) {
      // Bei einem Fehler beim Schreiben der Konfiguration, sende Status 500 (Internal Server Error)
      res.status(500).json({ message: "Fehler beim Schreiben der Konfigurationsdatei." });
    }
  }
);

export default router; // Exportiert den Router, damit er in der Hauptanwendung registriert werden kann.