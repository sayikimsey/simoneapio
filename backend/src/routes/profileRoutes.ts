// // backend/src/routes/profileRoutes.ts
// import express, { Router, Request, Response, NextFunction } from "express";
// import { protect as authMiddleware } from "../middleware/authMiddleware"; // Your auth middleware
// import { getDBPool, sql } from "../config/db"; // Your DB utilities

// const router: Router = express.Router();

// // GET /api/profile/me - Protected route to get current user's profile from DB
// router.get(
//   "/me",
//   authMiddleware,
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       console.log("👤 profileRoutes /me: Entered handler");
//       // req.user is typed via global augmentation in authMiddleware.ts
//       // It should have { userId: string; email: string; role: string; ... }
//       const currentUser = req.user;
//       console.log(
//         "👤 profileRoutes /me: req.user from middleware:",
//         currentUser
//       );

//       if (!currentUser || !currentUser.userId) {
//         console.log(
//           "👤 profileRoutes /me: No currentUser or currentUser.userId found on req.user. Sending 401."
//         );
//         res.status(401).json({
//           message:
//             "Not authorized, user identifier missing after authentication.",
//         });
//         return;
//       }

//       const pool = getDBPool();
//       const result = await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, currentUser.userId).query(`
//         SELECT
//             UserID,
//             Email,
//             FirstName,
//             LastName,
//             Role,
//             IsActive,
//             IsMfaEnabled, -- Added IsMfaEnabled to the SELECT query
//             AuthProvider,
//             CreatedAt,
//             UpdatedAt,
//             LastLoginAt
//         FROM dbo.Users
//         WHERE UserID = @UserID AND IsActive = 1
//       `);
//       console.log(
//         "👤 profileRoutes /me: DB query result for UserID",
//         currentUser.userId,
//         ":",
//         result.recordset
//       );

//       if (result.recordset.length === 0) {
//         console.log(
//           "👤 profileRoutes /me: User not found in DB or inactive. Sending 404."
//         );
//         res
//           .status(404)
//           .json({ message: "User profile not found or account is inactive." });
//         return;
//       }

//       const userFromDB = result.recordset[0];
//       const userProfile = {
//         id: userFromDB.UserID,
//         email: userFromDB.Email,
//         firstName: userFromDB.FirstName,
//         lastName: userFromDB.LastName,
//         role: userFromDB.Role,
//         isActive: userFromDB.IsActive,
//         isMfaEnabled: userFromDB.IsMfaEnabled, // Include IsMfaEnabled in the response
//         authProvider: userFromDB.AuthProvider,
//         createdAt: userFromDB.CreatedAt,
//         updatedAt: userFromDB.UpdatedAt,
//         lastLoginAt: userFromDB.LastLoginAt,
//       };

//       console.log(
//         "👤 profileRoutes /me: Successfully fetched and formatted profile. Sending user profile:",
//         userProfile
//       );
//       res.status(200).json({
//         message: "User profile data retrieved successfully.",
//         user: userProfile,
//       });
//     } catch (error) {
//       console.error("🔥 Error fetching user profile in /me handler:", error);
//       next(error); // Pass to global error handler
//     }
//   }
// );

// export default router;

// backend/src/routes/profileRoutes.ts

import express, { Router, Request, Response, NextFunction } from "express";
import { protect as authMiddleware } from "../middleware/authMiddleware"; // Ihre Authentifizierungs-Middleware
import { getDBPool, sql } from "../config/db"; // Ihre Datenbank-Hilfsprogramme

const router: Router = express.Router();

// -------------------------------------------------------------------
// GET /api/profile/me
// Zweck: Ruft das Profil des aktuell angemeldeten Benutzers aus der Datenbank ab.
//        Diese Route ist geschützt und erfordert eine Authentifizierung.
// -------------------------------------------------------------------
router.get(
  "/me",
  authMiddleware, // Stellt sicher, dass der Benutzer authentifiziert ist (JWT-Prüfung)
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log("👤 profileRoutes /me: Handler betreten.");

      // req.user wird von der 'authMiddleware.ts' über eine globale Typ-Erweiterung gesetzt.
      // Es sollte Benutzerinformationen wie { userId: string; email: string; role: string; ... } enthalten.
      const currentUser = req.user;
      console.log(
        "👤 profileRoutes /me: req.user von der Middleware:",
        currentUser
      );

      // Prüfen, ob die Benutzerinformationen von der Middleware korrekt übergeben wurden.
      // Ohne eine gültige userId können wir das Profil nicht abrufen.
      if (!currentUser || !currentUser.userId) {
        console.log(
          "👤 profileRoutes /me: Kein currentUser oder currentUser.userId auf req.user gefunden. Sende 401."
        );
        res.status(401).json({
          message:
            "Nicht autorisiert, Benutzeridentifikator fehlt nach der Authentifizierung.",
        });
        return; // Wichtig: Nach dem Senden der Antwort die Funktion beenden.
      }

      const pool = getDBPool(); // Holt den Datenbank-Verbindungspool

      // Datenbankabfrage: Rufe alle relevanten Benutzerdaten für die aktuelle UserID ab.
      // Sichergestellt ist auch, dass das Konto aktiv ist (IsActive = 1).
      const result = await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, currentUser.userId) // Fügt die UserID als SQL-Parameter hinzu (UUID-Typ)
        .query(`
          SELECT
              UserID,
              Email,
              FirstName,
              LastName,
              Role,
              IsActive,
              IsMfaEnabled,    -- Wichtig: 'IsMfaEnabled' wurde zur Abfrage hinzugefügt
              AuthProvider,
              CreatedAt,
              UpdatedAt,
              LastLoginAt
          FROM dbo.Users
          WHERE UserID = @UserID AND IsActive = 1
        `);
      console.log(
        "👤 profileRoutes /me: Datenbankabfrageergebnis für Benutzer-ID",
        currentUser.userId,
        ":",
        result.recordset
      );

      // Prüfen, ob ein Benutzer mit der gegebenen ID und dem Status 'aktiv' gefunden wurde.
      if (result.recordset.length === 0) {
        console.log(
          "👤 profileRoutes /me: Benutzer in der Datenbank nicht gefunden oder inaktiv. Sende 404."
        );
        res
          .status(404)
          .json({
            message: "Benutzerprofil nicht gefunden oder Konto ist inaktiv.",
          });
        return; // Wichtig: Nach dem Senden der Antwort die Funktion beenden.
      }

      // Den gefundenen Benutzerdatensatz extrahieren
      const userFromDB = result.recordset[0];

      // Erstelle ein sauberes Benutzerprofil-Objekt für die Antwort an den Client.
      // Es enthält alle benötigten Informationen, einschließlich des MFA-Status.
      const userProfile = {
        id: userFromDB.UserID,
        email: userFromDB.Email,
        firstName: userFromDB.FirstName,
        lastName: userFromDB.LastName,
        role: userFromDB.Role,
        isActive: userFromDB.IsActive,
        isMfaEnabled: userFromDB.IsMfaEnabled, // 'IsMfaEnabled' im Antwortobjekt enthalten
        authProvider: userFromDB.AuthProvider,
        createdAt: userFromDB.CreatedAt,
        updatedAt: userFromDB.UpdatedAt,
        lastLoginAt: userFromDB.LastLoginAt,
      };

      console.log(
        "👤 profileRoutes /me: Profil erfolgreich abgerufen und formatiert. Sende Benutzerprofil:",
        userProfile
      );
      // Sende das Benutzerprofil mit dem Status 200 (OK) zurück.
      res.status(200).json({
        message: "Benutzerprofildaten erfolgreich abgerufen.",
        user: userProfile,
      });
    } catch (error) {
      // Allgemeine Fehlerbehandlung für diesen Endpunkt
      console.error(
        "🔥 Fehler beim Abrufen des Benutzerprofils im /me-Handler:",
        error
      );
      next(error); // Leite den Fehler an den globalen Fehler-Handler weiter
    }
  }
);

export default router; // Exportiert den Router, damit er in der Hauptanwendung verwendet werden kann.
