// // backend/src/routes/mfaRoutes.ts
// import express, { Router, Request, Response, NextFunction } from "express";
// import { authenticator } from "otplib";
// import qrcode from "qrcode";
// import { protect as authMiddleware } from "../middleware/authMiddleware"; // Adjust path if needed
// import { getDBPool, sql } from "../config/db"; // Adjust path if needed
// import { z, ZodError } from "zod";
// import { encryptMfaSecret, decryptMfaSecret } from "../utils/encryption"; // Import encryption utils

// console.log("✅ mfaRoutes.ts module loaded by server!");

// const router: Router = express.Router();

// const APP_NAME = process.env.APP_NAME || "YourSecureApp";

// // Zod schema for verifying TOTP code during MFA setup enable
// const verifyMfaSetupSchema = z.object({
//   totpCode: z
//     .string()
//     .length(6, { message: "TOTP code must be 6 digits" })
//     .regex(/^\d{6}$/, {
//       message: "Invalid TOTP code format. Must be 6 digits.",
//     }),
//   mfaSecret: z.string().min(16, {
//     message: "MFA secret is required and should be a valid length.",
//   }),
// });

// // New Zod schema for disabling MFA (requires a current TOTP code)
// const disableMfaSchema = z.object({
//   totpCode: z
//     .string()
//     .length(6, { message: "TOTP code must be 6 digits" })
//     .regex(/^\d{6}$/, {
//       message: "Invalid TOTP code format. Must be 6 digits.",
//     }),
// });

// // --- POST /api/mfa/generate-secret (Protected by authMiddleware) ---
// router.post(
//   "/generate-secret",
//   authMiddleware,
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (!req.user || !req.user.userId || !req.user.email) {
//         res.status(401).json({
//           message: "User not authenticated properly or missing details.",
//         });
//         return;
//       }
//       const { email } = req.user;
//       const mfaSecret = authenticator.generateSecret();
//       const otpAuthUrl = authenticator.keyuri(email, APP_NAME, mfaSecret);

//       console.log(`ℹ️ MFA secret generated for ${email}.`); // Secret itself should not be logged in prod long-term
//       console.log(`ℹ️ OTPAuth URL for ${email}: ${otpAuthUrl}`);

//       const qrCodeDataURL = await qrcode.toDataURL(otpAuthUrl);

//       res.status(200).json({
//         message:
//           "MFA secret and QR code generated. Scan with your authenticator app to add this account.",
//         mfaSecret: mfaSecret,
//         qrCodeDataURL: qrCodeDataURL,
//         otpAuthUrl: otpAuthUrl,
//       });
//     } catch (error) {
//       console.error("🔥 Error in /api/mfa/generate-secret:", error);
//       next(error);
//     }
//   }
// );

// // --- POST /api/mfa/enable (Protected by authMiddleware) ---
// router.post(
//   "/enable",
//   authMiddleware,
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (!req.user || !req.user.userId) {
//         res.status(401).json({ message: "User not authenticated properly." });
//         return; // Correct: sends response and then returns void
//       }
//       const { userId } = req.user;

//       const { totpCode, mfaSecret: plainMfaSecretFromClient } =
//         verifyMfaSetupSchema.parse(req.body);

//       const isTotpValid = authenticator.verify({
//         token: totpCode,
//         secret: plainMfaSecretFromClient,
//       });

//       if (!isTotpValid) {
//         console.warn(
//           `⚠️ MFA setup verification failed for UserID: ${userId}. Invalid TOTP code provided.`
//         );
//         res.status(400).json({
//           message:
//             "Invalid TOTP code. Please check your authenticator app and try again. Ensure your device's time is synced.",
//         });
//         return; // Correct
//       }

//       const encryptedMfaSecret = encryptMfaSecret(plainMfaSecretFromClient);
//       if (!encryptedMfaSecret) {
//         console.error(
//           `🔥 Failed to encrypt MFA secret for UserID: ${userId}. Encryption returned null. MFA not enabled.`
//         );
//         // Corrected: Send response, then return.
//         res.status(500).json({
//           message:
//             "Failed to secure MFA setup due to an internal encryption error. Please try again later.",
//         });
//         return;
//       }

//       const pool = getDBPool();
//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .input("MfaSecretParam", sql.NVarChar(255), encryptedMfaSecret)
//         .input("IsMfaEnabled", sql.Bit, 1)
//         .query(
//           "UPDATE dbo.Users SET MfaSecret = @MfaSecretParam, IsMfaEnabled = @IsMfaEnabled, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         );

//       console.log(`✅ MFA enabled successfully for UserID: ${userId}.`);
//       res.status(200).json({
//         message: "MFA has been successfully enabled for your account.",
//       });
//       // Implicit return here is fine as it's the end of the try block path
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Invalid data provided for MFA setup confirmation.",
//           errors: error.flatten().fieldErrors,
//         });
//         return; // Correct
//       }
//       console.error("🔥 Error in /api/mfa/enable:", error);
//       // Send back the specific error message if it's a RequestError from mssql
//       if (
//         error instanceof Error &&
//         (error as any).constructor.name === "RequestError"
//       ) {
//         res
//           .status(500)
//           .json({ message: `Database error enabling MFA: ${error.message}` });
//         return; // Correct
//       }
//       if (!res.headersSent) {
//         // Ensure headers aren't already sent before calling next
//         next(error);
//       }
//     }
//   }
// );

// // --- POST /api/mfa/disable (Protected by authMiddleware) ---
// router.post(
//   "/disable",
//   authMiddleware,
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (!req.user || !req.user.userId) {
//         res.status(401).json({ message: "User not authenticated properly." });
//         return; // Correct
//       }
//       const { userId } = req.user;

//       const { totpCode } = disableMfaSchema.parse(req.body);

//       const pool = getDBPool();

//       const userResult = await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .query(
//           "SELECT MfaSecret, IsMfaEnabled FROM dbo.Users WHERE UserID = @UserID"
//         );

//       if (userResult.recordset.length === 0) {
//         res.status(404).json({ message: "User not found." });
//         return; // Correct
//       }
//       const userMfaData = userResult.recordset[0];

//       if (!userMfaData.IsMfaEnabled || !userMfaData.MfaSecret) {
//         res
//           .status(400)
//           .json({ message: "MFA is not currently enabled for this account." });
//         return; // Correct
//       }

//       const decryptedMfaSecret = decryptMfaSecret(userMfaData.MfaSecret);
//       if (!decryptedMfaSecret) {
//         console.error(
//           `🔥 Failed to decrypt MFA secret for UserID: ${userId} during disable attempt.`
//         );
//         // Corrected: Send response, then return.
//         res.status(500).json({
//           message:
//             "Could not verify MFA code due to a security configuration issue (decryption failed).",
//         });
//         return;
//       }

//       const isTotpValid = authenticator.verify({
//         token: totpCode,
//         secret: decryptedMfaSecret,
//       });

//       if (!isTotpValid) {
//         console.warn(
//           `⚠️ MFA disable attempt failed for UserID: ${userId}. Invalid TOTP code.`
//         );
//         res
//           .status(400)
//           .json({ message: "Invalid TOTP code. MFA not disabled." });
//         return; // Correct
//       }

//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .query(
//           "UPDATE dbo.Users SET MfaSecret = NULL, IsMfaEnabled = 0, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         );

//       console.log(`✅ MFA disabled successfully for UserID: ${userId}.`);
//       res.status(200).json({
//         message: "Multi-Factor Authentication has been successfully disabled.",
//       });
//       // Implicit return here
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Invalid data provided for disabling MFA.",
//           errors: error.flatten().fieldErrors,
//         });
//         return; // Correct
//       }
//       console.error("🔥 Error in /api/mfa/disable:", error);
//       if (
//         error instanceof Error &&
//         (error as any).constructor.name === "RequestError"
//       ) {
//         res
//           .status(500)
//           .json({ message: `Database error disabling MFA: ${error.message}` });
//         return; // Correct
//       }
//       if (!res.headersSent) {
//         next(error);
//       }
//     }
//   }
// );

// export default router;

// backend/src/routes/mfaRoutes.ts

import express, { Router, Request, Response, NextFunction } from "express";
import { authenticator } from "otplib"; // Bibliothek für TOTP (Time-based One-Time Password)
import qrcode from "qrcode"; // Bibliothek zur Generierung von QR-Codes
import { protect as authMiddleware } from "../middleware/authMiddleware"; // Middleware zum Schutz von Routen (Authentifizierung erforderlich)
import { getDBPool, sql } from "../config/db"; // Datenbank-Pool und SQL-Typen für MSSQL
import { z, ZodError } from "zod"; // Zod für die Validierung von Request-Bodies
import { encryptMfaSecret, decryptMfaSecret } from "../utils/encryption"; // Hilfsfunktionen zur Ver- und Entschlüsselung von MFA-Secrets

// Konsolenmeldung beim Laden des Moduls
console.log("✅ mfaRoutes.ts Modul vom Server geladen!");

const router: Router = express.Router();

// Name der Anwendung aus Umgebungsvariablen oder Standardwert
// Dieser Name wird im Authenticator-App-Eintrag (z.B. Google Authenticator) angezeigt.
const APP_NAME = process.env.APP_NAME || "IhreSichereApp";

// --- Zod Schemas zur Validierung der Request-Bodies ---

// -------------------------------------------------------------------
// ✅ Zod-Schema für die Verifizierung des TOTP-Codes während der MFA-Einrichtung
//    Stellt sicher, dass der TOTP-Code ein 6-stelliger String ist
//    und das MFA-Secret vom Client gültig ist.
// -------------------------------------------------------------------
const verifyMfaSetupSchema = z.object({
  totpCode: z
    .string()
    .length(6, { message: "TOTP-Code muss 6 Ziffern lang sein." })
    .regex(/^\d{6}$/, {
      message: "Ungültiges TOTP-Code-Format. Muss 6 Ziffern enthalten.",
    }),
  mfaSecret: z.string().min(16, {
    message: "MFA-Secret ist erforderlich und sollte eine gültige Länge haben.",
  }),
});

// -------------------------------------------------------------------
// ✅ Neues Zod-Schema zum Deaktivieren von MFA
//    Erfordert einen aktuellen TOTP-Code zur Bestätigung der Identität des Benutzers.
// -------------------------------------------------------------------
const disableMfaSchema = z.object({
  totpCode: z
    .string()
    .length(6, { message: "TOTP-Code muss 6 Ziffern lang sein." })
    .regex(/^\d{6}$/, {
      message: "Ungültiges TOTP-Code-Format. Muss 6 Ziffern enthalten.",
    }),
});

// --- Routen-Definitionen ---

// -------------------------------------------------------------------
// POST /api/mfa/generate-secret
// Zweck: Generiert ein neues MFA-Secret und die entsprechende OTPAuth-URL
//        sowie einen QR-Code für die Einrichtung in einer Authenticator-App.
// Geschützt durch authMiddleware: Nur authentifizierte Benutzer können Secrets generieren.
// -------------------------------------------------------------------
router.post(
  "/generate-secret",
  authMiddleware, // Stellt sicher, dass der Benutzer eingeloggt ist
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Überprüfen, ob Benutzerdetails von der Authentifizierungs-Middleware vorhanden sind
      if (!req.user || !req.user.userId || !req.user.email) {
        res.status(401).json({
          message:
            "Benutzer nicht korrekt authentifiziert oder Details fehlen.",
        });
        return;
      }
      const { email } = req.user; // E-Mail-Adresse des authentifizierten Benutzers

      // Generiere ein neues MFA-Secret mit otplib
      const mfaSecret = authenticator.generateSecret();
      // Erstelle die OTPAuth-URL, die von Authenticator-Apps gescannt wird
      const otpAuthUrl = authenticator.keyuri(email, APP_NAME, mfaSecret);

      console.log(`ℹ️ MFA-Secret für ${email} generiert.`); // Secret selbst sollte in Produktion nicht langfristig geloggt werden
      console.log(`ℹ️ OTPAuth-URL für ${email}: ${otpAuthUrl}`);

      // Generiere einen QR-Code als Data URL aus der OTPAuth-URL
      const qrCodeDataURL = await qrcode.toDataURL(otpAuthUrl);

      // Sende die generierten Daten an den Client
      res.status(200).json({
        message:
          "MFA-Secret und QR-Code generiert. Scannen Sie mit Ihrer Authenticator-App, um dieses Konto hinzuzufügen.",
        mfaSecret: mfaSecret, // Das Secret wird an den Client gesendet, da es für den nächsten Schritt benötigt wird
        qrCodeDataURL: qrCodeDataURL, // Der QR-Code als Data URL
        otpAuthUrl: otpAuthUrl, // Die OTPAuth-URL selbst
      });
    } catch (error) {
      console.error("🔥 Fehler in /api/mfa/generate-secret:", error);
      next(error); // Fehler an den globalen Fehler-Handler weiterleiten
    }
  }
);

// -------------------------------------------------------------------
// POST /api/mfa/enable
// Zweck: Aktiviert MFA für den Benutzer, nachdem das Secret generiert
//        und der erste TOTP-Code erfolgreich verifiziert wurde.
// Geschützt durch authMiddleware.
// -------------------------------------------------------------------
router.post(
  "/enable",
  authMiddleware, // Stellt sicher, dass der Benutzer eingeloggt ist
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Überprüfen, ob Benutzer-ID von der Authentifizierungs-Middleware vorhanden ist
      if (!req.user || !req.user.userId) {
        res
          .status(401)
          .json({ message: "Benutzer nicht korrekt authentifiziert." });
        return;
      }
      const { userId } = req.user; // Benutzer-ID des authentifizierten Benutzers

      // Validierung des Request-Bodys mit Zod
      // Erwartet den TOTP-Code und das Klartext-MFA-Secret vom Client
      const { totpCode, mfaSecret: plainMfaSecretFromClient } =
        verifyMfaSetupSchema.parse(req.body);

      // Verifiziere den TOTP-Code mit dem vom Client gesendeten Secret
      const isTotpValid = authenticator.verify({
        token: totpCode,
        secret: plainMfaSecretFromClient,
      });

      // Wenn der TOTP-Code ungültig ist
      if (!isTotpValid) {
        console.warn(
          `⚠️ MFA-Einrichtungs-Verifizierung fehlgeschlagen für Benutzer-ID: ${userId}. Ungültiger TOTP-Code bereitgestellt.`
        );
        res.status(400).json({
          message:
            "Ungültiger TOTP-Code. Bitte überprüfen Sie Ihre Authenticator-App und versuchen Sie es erneut. Stellen Sie sicher, dass die Uhrzeit Ihres Geräts synchronisiert ist.",
        });
        return;
      }

      // Verschlüssele das MFA-Secret, bevor es in der Datenbank gespeichert wird
      const encryptedMfaSecret = encryptMfaSecret(plainMfaSecretFromClient);
      if (!encryptedMfaSecret) {
        console.error(
          `🔥 Fehler beim Verschlüsseln des MFA-Secrets für Benutzer-ID: ${userId}. Verschlüsselung gab null zurück. MFA nicht aktiviert.`
        );
        res.status(500).json({
          message:
            "Fehler bei der Sicherung der MFA-Einrichtung aufgrund eines internen Verschlüsselungsfehlers. Bitte versuchen Sie es später erneut.",
        });
        return;
      }

      const pool = getDBPool();
      // Aktualisiere den Benutzerdatensatz in der Datenbank: Speichere das verschlüsselte Secret
      // und setze IsMfaEnabled auf true.
      await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId)
        .input("MfaSecretParam", sql.NVarChar(255), encryptedMfaSecret)
        .input("IsMfaEnabled", sql.Bit, 1)
        .query(
          "UPDATE dbo.Users SET MfaSecret = @MfaSecretParam, IsMfaEnabled = @IsMfaEnabled, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
        );

      console.log(`✅ MFA erfolgreich aktiviert für Benutzer-ID: ${userId}.`);
      res.status(200).json({
        message:
          "Die Multi-Faktor-Authentifizierung wurde erfolgreich für Ihr Konto aktiviert.",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message:
            "Ungültige Daten für die Bestätigung der MFA-Einrichtung bereitgestellt.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }
      console.error("🔥 Fehler in /api/mfa/enable:", error);
      // Spezifische Fehlerbehandlung für Datenbankfehler
      if (
        error instanceof Error &&
        (error as any).constructor.name === "RequestError"
      ) {
        res
          .status(500)
          .json({
            message: `Datenbankfehler beim Aktivieren von MFA: ${error.message}`,
          });
        return;
      }
      if (!res.headersSent) {
        // Sicherstellen, dass Header nicht bereits gesendet wurden, bevor next() aufgerufen wird
        next(error); // Fehler an den globalen Fehler-Handler weiterleiten
      }
    }
  }
);

// -------------------------------------------------------------------
// POST /api/mfa/disable
// Zweck: Deaktiviert MFA für den Benutzer, nachdem ein gültiger TOTP-Code
//        zur Bestätigung der Identität eingegeben wurde.
// Geschützt durch authMiddleware.
// -------------------------------------------------------------------
router.post(
  "/disable",
  authMiddleware, // Stellt sicher, dass der Benutzer eingeloggt ist
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Überprüfen, ob Benutzer-ID von der Authentifizierungs-Middleware vorhanden ist
      if (!req.user || !req.user.userId) {
        res
          .status(401)
          .json({ message: "Benutzer nicht korrekt authentifiziert." });
        return;
      }
      const { userId } = req.user; // Benutzer-ID des authentifizierten Benutzers

      // Validierung des Request-Bodys mit Zod (nur TOTP-Code erforderlich)
      const { totpCode } = disableMfaSchema.parse(req.body);

      const pool = getDBPool();

      // MFA-Secret und Status aus der Datenbank abrufen
      const userResult = await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId)
        .query(
          "SELECT MfaSecret, IsMfaEnabled FROM dbo.Users WHERE UserID = @UserID"
        );

      if (userResult.recordset.length === 0) {
        res.status(404).json({ message: "Benutzer nicht gefunden." });
        return;
      }
      const userMfaData = userResult.recordset[0];

      // Prüfen, ob MFA überhaupt aktiviert ist
      if (!userMfaData.IsMfaEnabled || !userMfaData.MfaSecret) {
        res
          .status(400)
          .json({
            message: "MFA ist für dieses Konto derzeit nicht aktiviert.",
          });
        return;
      }

      // MFA-Secret entschlüsseln, um den eingegebenen TOTP-Code zu verifizieren
      const decryptedMfaSecret = decryptMfaSecret(userMfaData.MfaSecret);
      if (!decryptedMfaSecret) {
        console.error(
          `🔥 Fehler beim Entschlüsseln des MFA-Secrets für Benutzer-ID: ${userId} während des Deaktivierungsversuchs.`
        );
        res.status(500).json({
          message:
            "MFA-Code konnte aufgrund eines Sicherheitsproblems bei der Konfiguration nicht verifiziert werden (Entschlüsselung fehlgeschlagen).",
        });
        return;
      }

      // Verifiziere den TOTP-Code
      const isTotpValid = authenticator.verify({
        token: totpCode,
        secret: decryptedMfaSecret,
      });

      // Wenn der TOTP-Code ungültig ist
      if (!isTotpValid) {
        console.warn(
          `⚠️ MFA-Deaktivierungsversuch fehlgeschlagen für Benutzer-ID: ${userId}. Ungültiger TOTP-Code.`
        );
        res
          .status(400)
          .json({ message: "Ungültiger TOTP-Code. MFA nicht deaktiviert." });
        return;
      }

      // MFA in der Datenbank deaktivieren: Secret auf NULL setzen und IsMfaEnabled auf 0
      await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId)
        .query(
          "UPDATE dbo.Users SET MfaSecret = NULL, IsMfaEnabled = 0, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
        );

      console.log(`✅ MFA erfolgreich deaktiviert für Benutzer-ID: ${userId}.`);
      res.status(200).json({
        message:
          "Die Multi-Faktor-Authentifizierung wurde erfolgreich deaktiviert.",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Ungültige Daten zum Deaktivieren von MFA bereitgestellt.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }
      console.error("🔥 Fehler in /api/mfa/disable:", error);
      // Spezifische Fehlerbehandlung für Datenbankfehler
      if (
        error instanceof Error &&
        (error as any).constructor.name === "RequestError"
      ) {
        res
          .status(500)
          .json({
            message: `Datenbankfehler beim Deaktivieren von MFA: ${error.message}`,
          });
        return;
      }
      if (!res.headersSent) {
        // Sicherstellen, dass Header nicht bereits gesendet wurden, bevor next() aufgerufen wird
        next(error); // Fehler an den globalen Fehler-Handler weiterleiten
      }
    }
  }
);

export default router;
