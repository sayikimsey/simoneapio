// // backend/src/middleware/authMiddleware.ts
// import { Request, Response, NextFunction } from "express";
// import jwt, {
//   JwtPayload,
//   Secret,
//   TokenExpiredError,
//   JsonWebTokenError,
// } from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config(); // Ensure env vars are available

// console.log(
//   "🔑 authMiddleware.ts: JWT_SECRET at module load:",
//   process.env.JWT_SECRET ? "Defined" : "!!! UNDEFINED !!!"
// );

// // Augment Express's Request type to include a more specific 'user' object
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         userId: string;
//         email: string;
//         role: string; // Add role here
//         // You can add iat, exp if needed, or other custom claims
//         [key: string]: any; // Allow other properties from JwtPayload
//       };
//     }
//   }
// }

// export const protect = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   console.log("🛡️ authMiddleware: protect function invoked.");
//   // console.log('🛡️ authMiddleware: req.cookies available:', req.cookies); // Keep for debugging if needed

//   const cookieName = "accessToken";
//   let token: string | undefined = req.cookies
//     ? req.cookies[cookieName]
//     : undefined;
//   // console.log(`🛡️ authMiddleware: Token from cookie "${cookieName}": ${token ? 'Found' : 'Not Found'}`);

//   if (!token) {
//     res.status(401).json({ message: "Not authorized, no token provided." });
//     return;
//   }

//   try {
//     const jwtSecret = process.env.JWT_SECRET;
//     // console.log('🛡️ authMiddleware: JWT_SECRET inside protect:', jwtSecret ? 'Defined' : '!!! UNDEFINED !!!');

//     if (!jwtSecret) {
//       console.error(
//         "🔥 Authentication error: JWT_SECRET is not defined within protect function."
//       );
//       res
//         .status(401)
//         .json({ message: "Internal server error: Auth configuration issue." });
//       return;
//     }

//     const decodedPayload = jwt.verify(token, jwtSecret as Secret) as JwtPayload;
//     // console.log('🛡️ authMiddleware: Token verified successfully. Payload:', decodedPayload);

//     if (
//       decodedPayload &&
//       typeof decodedPayload.userId === "string" &&
//       typeof decodedPayload.email === "string" &&
//       typeof decodedPayload.role === "string"
//     ) {
//       // Check for role

//       req.user = {
//         userId: decodedPayload.userId,
//         email: decodedPayload.email,
//         role: decodedPayload.role, // Attach role to req.user
//       };
//       console.log("🛡️ authMiddleware: req.user set to:", req.user);
//       next();
//     } else {
//       console.error(
//         "🔒 authMiddleware: Decoded JWT payload is malformed or missing expected claims (userId, email, role). Payload:",
//         decodedPayload
//       );
//       res
//         .status(401)
//         .json({ message: "Not authorized, malformed token content." });
//       return;
//     }
//   } catch (error) {
//     console.error("🔒 Token verification failed:", error);
//     if (error instanceof TokenExpiredError) {
//       res.status(401).json({ message: "Not authorized, token has expired." });
//     } else if (error instanceof JsonWebTokenError) {
//       res.status(401).json({ message: "Not authorized, token is invalid." });
//     } else {
//       res
//         .status(401)
//         .json({ message: "Not authorized, token validation failed." });
//     }
//   }
// };
// backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt, {
  JwtPayload,
  Secret,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Lädt Umgebungsvariablen aus der .env-Datei

console.log(
  "🔑 authMiddleware.ts: JWT_SECRET beim Laden des Moduls:",
  process.env.JWT_SECRET ? "Definiert" : "!!! NICHT DEFINIERT !!!"
);

/**
 * Erweiterung des Express Request-Typs, um Benutzerinformationen aus dem JWT zu ermöglichen.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        [key: string]: any; // Optional: Weitere Claims
      };
    }
  }
}

/**
 * Middleware zum Schutz von Routen durch JWT-Authentifizierung.
 * Überprüft, ob ein gültiger Access-Token im Cookie vorhanden ist.
 *
 * @param req - HTTP-Anfrageobjekt
 * @param res - HTTP-Antwortobjekt
 * @param next - Nächste Middleware-Funktion
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("🛡️ authMiddleware: Schutzfunktion aufgerufen.");

  const cookieName = "accessToken";
  const token: string | undefined = req.cookies?.[cookieName];

  if (!token) {
    res
      .status(401)
      .json({ message: "Nicht autorisiert: Kein Token vorhanden." });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("🔥 Authentifizierungsfehler: JWT_SECRET nicht definiert.");
      res
        .status(500)
        .json({
          message: "Serverfehler: Authentifizierungs-Konfiguration fehlt.",
        });
      return;
    }

    const decodedPayload = jwt.verify(token, jwtSecret as Secret) as JwtPayload;

    if (
      decodedPayload &&
      typeof decodedPayload.userId === "string" &&
      typeof decodedPayload.email === "string" &&
      typeof decodedPayload.role === "string"
    ) {
      // Benutzerinformationen aus dem Token extrahieren und in der Anfrage speichern
      req.user = {
        userId: decodedPayload.userId,
        email: decodedPayload.email,
        role: decodedPayload.role,
      };
      console.log(
        "✅ authMiddleware: Benutzer erfolgreich verifiziert:",
        req.user
      );
      next();
    } else {
      console.error(
        "🔒 Ungültiger JWT-Inhalt: Pflichtfelder fehlen oder sind ungültig.",
        decodedPayload
      );
      res
        .status(401)
        .json({ message: "Nicht autorisiert: Token-Inhalt ungültig." });
    }
  } catch (error) {
    console.error("🔒 Fehler bei Token-Verifizierung:", error);

    if (error instanceof TokenExpiredError) {
      res
        .status(401)
        .json({ message: "Nicht autorisiert: Token ist abgelaufen." });
    } else if (error instanceof JsonWebTokenError) {
      res.status(401).json({ message: "Nicht autorisiert: Ungültiges Token." });
    } else {
      res
        .status(401)
        .json({ message: "Nicht autorisiert: Tokenprüfung fehlgeschlagen." });
    }
  }
};
