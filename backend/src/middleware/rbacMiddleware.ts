// // backend/src/middleware/rbacMiddleware.ts
// import { Request, Response, NextFunction } from 'express';

// // This middleware assumes that 'protect' middleware has already run
// // and populated req.user with { userId, email, role }
// export const authorize = (allowedRoles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction): void => {
//     console.log(`🛡️ RBAC Middleware: Checking authorization for role: ${req.user?.role}. Allowed roles: ${allowedRoles.join(', ')}`);

//     if (!req.user || !req.user.role) {
//       console.warn('🛡️ RBAC Middleware: req.user or req.user.role not found. Ensure protect middleware ran first.');
//       res.status(403).json({ message: 'Forbidden: User role not available for authorization.' });
//       return;
//     }

//     if (!allowedRoles.includes(req.user.role)) {
//       console.warn(`🛡️ RBAC Middleware: Role [${req.user.role}] not authorized for this resource.`);
//       res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions to access this resource.' });
//       return;
//     }

//     console.log(`🛡️ RBAC Middleware: Role [${req.user.role}] authorized.`);
//     next(); // User has one of the allowed roles
//   };
// };

// backend/src/middleware/rbacMiddleware.ts

import { Request, Response, NextFunction } from "express";

/**
 * Middleware zur rollenbasierten Zugriffskontrolle (RBAC).
 * Diese Middleware geht davon aus, dass vorher die `protect`-Middleware ausgeführt wurde,
 * sodass `req.user` mit den Benutzerinformationen (inkl. `role`) befüllt ist.
 *
 * @param allowedRoles - Liste zulässiger Rollen für den Zugriff auf die geschützte Route
 * @returns Eine Middleware-Funktion für Express
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log(
      `🛡️ RBAC Middleware: Berechtigungsprüfung für Rolle: ${
        req.user?.role
      }. Erlaubte Rollen: ${allowedRoles.join(", ")}`
    );

    // Überprüfen, ob Benutzerinformationen vorhanden sind
    if (!req.user || !req.user.role) {
      console.warn(
        "🛡️ RBAC Middleware: req.user oder req.user.role ist nicht vorhanden. Sicherstellen, dass 'protect' vorher ausgeführt wurde."
      );
      res.status(403).json({
        message:
          "Zugriff verweigert: Keine Rolleninformationen für den Benutzer verfügbar.",
      });
      return;
    }

    // Überprüfen, ob Benutzerrolle in der erlaubten Rollenliste enthalten ist
    if (!allowedRoles.includes(req.user.role)) {
      console.warn(
        `🛡️ RBAC Middleware: Rolle [${req.user.role}] ist für diese Ressource nicht autorisiert.`
      );
      res.status(403).json({
        message: "Zugriff verweigert: Fehlende Berechtigung für diese Aktion.",
      });
      return;
    }

    console.log(
      `✅ RBAC Middleware: Rolle [${req.user.role}] ist autorisiert.`
    );
    next(); // Zugriff gewähren
  };
};
