// // backend/src/routes/adminRoutes.ts
// import express, { Router, Request, Response, NextFunction } from "express";
// import bcrypt from "bcrypt"; // For hashing the initial password
// import { protect as authMiddleware } from "../middleware/authMiddleware"; // Adjust path if needed
// import { authorize as rbacMiddleware } from "../middleware/rbacMiddleware"; // Adjust path if needed
// import { getDBPool, sql } from "../config/db"; // Adjust path if needed
// import { z, ZodError } from "zod"; // Ensure ZodError is imported if not already

// const updateUserRoleSchema = z.object({
//   newRole: z.enum(["user", "admin"], {
//     required_error: "New role is required.",
//     invalid_type_error: "Invalid role specified. Must be 'user' or 'admin'.",
//   }),
// });

// const updateUserStatusSchema = z.object({
//   isActive: z.boolean({
//     required_error: "isActive status (true or false) is required.",
//     invalid_type_error: "isActive status must be a boolean.",
//   }),
// });

// const adminCreateUserSchema = z.object({
//   email: z
//     .string()
//     .email({ message: "A valid email address is required." })
//     .max(255),
//   firstName: z
//     .string()
//     .min(1, { message: "First name is required." })
//     .max(100)
//     .optional(),
//   lastName: z
//     .string()
//     .min(1, { message: "Last name is required." })
//     .max(100)
//     .optional(),
//   password: z
//     .string()
//     .min(8, { message: "Password must be at least 8 characters long." })
//     .max(100),
//   role: z
//     .enum(["user", "admin"], {
//       errorMap: () => ({
//         message: "Invalid role specified. Must be 'user' or 'admin'.",
//       }),
//     })
//     .optional(), // Admin can set role, defaults to 'user' if not provided
//   isActive: z.boolean().optional(), // Admin can set initial active status, defaults to true if not provided
// });
// // Diagnostic log to confirm this module is loaded by Node.js when the server starts
// console.log("✅ adminRoutes.ts module loaded by server!");

// const router: Router = express.Router();

// // Diagnostic middleware: Logs all requests reaching this admin router
// router.use((req: Request, res: Response, next: NextFunction) => {
//   console.log(
//     `📣 adminRoutes: Base path "/api/admin" received request for ${req.method} ${req.path}`
//   );
//   // console.log(`📣 adminRoutes: Full originalUrl hit: ${req.originalUrl}`); // Can be verbose, uncomment if needed
//   next();
// });

// // GET /api/admin/users - Admin Only: List all users
// router.get(
//   "/users",
//   authMiddleware, // 1. Ensure user is authenticated
//   rbacMiddleware(["admin"]), // 2. Ensure user has 'admin' role
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       res.setHeader(
//         "Cache-Control",
//         "no-store, no-cache, must-revalidate, proxy-revalidate"
//       );
//       res.setHeader("Pragma", "no-cache");
//       res.setHeader("Expires", "0");
//       res.setHeader("Surrogate-Control", "no-store");

//       console.log(
//         `👑 Admin Route (/api/admin/users) logic entered by admin: ${req.user?.email}`
//       );
//       const pool = getDBPool();
//       const result = await pool.request().query(
//         `SELECT UserID, Email, FirstName, LastName, Role, IsActive, CreatedAt
//          FROM dbo.Users
//          ORDER BY CreatedAt DESC`
//       );

//       const formattedUsers = result.recordset.map((dbUser) => ({
//         id: dbUser.UserID,
//         email: dbUser.Email,
//         firstName: dbUser.FirstName,
//         lastName: dbUser.LastName,
//         role: dbUser.Role,
//         isActive: dbUser.IsActive,
//         createdAt: dbUser.CreatedAt,
//       }));

//       console.log(
//         "👑 Admin Route (/users): Sending formatted users list. Count:",
//         formattedUsers.length
//       );
//       res.status(200).json({
//         message: "List of users retrieved successfully (admin access).",
//         users: formattedUsers,
//       });
//     } catch (error) {
//       console.error("🔥 Error in GET /api/admin/users route:", error);
//       next(error);
//     }
//   }
// );

// // --- CORRECTED: PUT /api/admin/users/:userId/status - Admin Only: Update a user's active status ---
// router.put(
//   "/users/:userId/status",
//   authMiddleware,
//   rbacMiddleware(["admin"]),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const { userId } = req.params;

//     try {
//       if (!req.user) {
//         res.status(401).json({ message: "Authentication required." });
//         return; // Corrected
//       }
//       const { isActive } = updateUserStatusSchema.parse(req.body); // Ensure updateUserStatusSchema is defined
//       console.log(
//         `👑 Admin Route (/api/admin/users/${userId}/status): Attempting to set isActive to '${isActive}' by admin: ${req.user.email}`
//       );

//       const pool = getDBPool();

//       if (req.user.userId === userId && !isActive) {
//         const adminCountResult = await pool
//           .request()
//           .query(
//             "SELECT COUNT(*) as adminCount FROM dbo.Users WHERE Role = 'admin' AND IsActive = 1"
//           );
//         if (adminCountResult.recordset[0].adminCount <= 1) {
//           console.warn(
//             `⚠️ Admin ${req.user.email} attempted to deactivate the last active admin (themselves).`
//           );
//           res.status(400).json({
//             message: "Cannot deactivate the last active admin account.",
//           });
//           return; // Corrected
//         }
//       }

//       const updateResult = await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .input("IsActive", sql.Bit, isActive)
//         .query(
//           "UPDATE dbo.Users SET IsActive = @IsActive, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         );

//       if (updateResult.rowsAffected[0] === 0) {
//         res
//           .status(404)
//           .json({ message: "User not found or status could not be updated." });
//         return; // Corrected
//       }

//       const actionText = isActive ? "activated" : "deactivated";
//       console.log(
//         `👑 Admin Route (/users/${userId}/status): User successfully ${actionText}.`
//       );
//       res.status(200).json({
//         message: `User successfully ${actionText}.`,
//         user: { id: userId, isActive: isActive },
//       });
//       // No explicit return needed if it's the last statement in this successful path
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Invalid data provided for status update.",
//           errors: error.flatten().fieldErrors,
//         });
//         return; // Corrected
//       }
//       console.error(
//         `🔥 Error in PUT /api/admin/users/${userId}/status route:`,
//         error
//       );
//       if (error instanceof Error && error.message.includes("Invalid UDT")) {
//         res.status(400).json({ message: "Invalid User ID format." });
//         return; // Corrected
//       }
//       if (!res.headersSent) {
//         // Check before calling next() if an error response might have been partially sent
//         next(error);
//       }
//     }
//   }
// );

// // --- NEW: POST /api/admin/users - Admin Only: Create a new user ---
// router.post(
//   "/users",
//   authMiddleware,
//   rbacMiddleware(["admin"]),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const validatedBody = adminCreateUserSchema.parse(req.body);
//       const { email, password, firstName, lastName } = validatedBody;

//       // Use provided role or default to 'user'. Use provided isActive or default to true.
//       const role = validatedBody.role || "user";
//       const isActive =
//         validatedBody.isActive !== undefined ? validatedBody.isActive : true;

//       console.log(
//         `👑 Admin Route (POST /api/admin/users): Attempting to create user ${email} with role ${role} by admin: ${req.user?.email}`
//       );

//       const pool = getDBPool();

//       // 1. Check if user with this email already exists
//       const userExistsResult = await pool
//         .request()
//         .input("Email", sql.NVarChar(255), email.toLowerCase())
//         .query("SELECT UserID FROM dbo.Users WHERE Email = @Email");

//       if (userExistsResult.recordset.length > 0) {
//         res.status(409).json({
//           message: "Conflict: An account with this email already exists.",
//         });
//         return;
//       }

//       // 2. Hash the initial password
//       const saltRounds = 12;
//       const passwordHash = await bcrypt.hash(password, saltRounds);

//       // 3. Store new user in the database
//       // For users created by an admin, AuthProvider could be 'email' or a special 'admin_created'
//       // Let's use 'email' for now, assuming they will use this email/password to login.
//       // GoogleID will be NULL, MfaSecret will be NULL, IsMfaEnabled will be 0 (DB defaults)
//       const insertUserResult = await pool
//         .request()
//         .input("FirstName", sql.NVarChar(100), firstName || null) // Handle optional fields
//         .input("LastName", sql.NVarChar(100), lastName || null) // Handle optional fields
//         .input("Email", sql.NVarChar(255), email.toLowerCase())
//         .input("PasswordHash", sql.NVarChar(sql.MAX), passwordHash)
//         .input("Role", sql.NVarChar(50), role)
//         .input("AuthProvider", sql.NVarChar(50), "email") // User created with email/password by admin
//         .input("IsActive", sql.Bit, isActive).query(`
//           INSERT INTO dbo.Users
//             (FirstName, LastName, Email, PasswordHash, Role, AuthProvider, IsActive, CreatedAt, UpdatedAt, IsMfaEnabled, MfaSecret, GoogleID)
//           OUTPUT
//             inserted.UserID, inserted.Email, inserted.FirstName, inserted.LastName, inserted.Role,
//             inserted.AuthProvider, inserted.IsActive, inserted.IsMfaEnabled, inserted.CreatedAt
//           VALUES
//             (@FirstName, @LastName, @Email, @PasswordHash, @Role, @AuthProvider, @IsActive,
//              SYSUTCDATETIME(), SYSUTCDATETIME(), 0, NULL, NULL)
//             -- Explicitly set IsMfaEnabled=0, MfaSecret=NULL, GoogleID=NULL for admin-created users
//         `);

//       if (!insertUserResult.recordset[0]) {
//         console.error(
//           "🔥 Admin Create User: User creation failed, no record outputted from DB."
//         );
//         throw new Error("User creation failed due to a database error.");
//       }

//       const newUser = insertUserResult.recordset[0];

//       // Map to frontend-friendly UserData structure
//       const createdUserProfile = {
//         id: newUser.UserID,
//         email: newUser.Email,
//         firstName: newUser.FirstName,
//         lastName: newUser.LastName,
//         role: newUser.Role,
//         authProvider: newUser.AuthProvider,
//         isActive: newUser.IsActive,
//         isMfaEnabled: newUser.IsMfaEnabled,
//         createdAt: newUser.CreatedAt,
//       };

//       console.log(
//         "👑 Admin Route: User created successfully by admin:",
//         createdUserProfile
//       );
//       res.status(201).json({
//         // 201 Created
//         message: "User created successfully by admin.",
//         user: createdUserProfile,
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Validation failed for new user data.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Error in POST /api/admin/users route:", error);
//       // Handle potential unique constraint violation on email if somehow missed by initial check (race condition)
//       if (error instanceof Error && (error as any).number === 2627) {
//         // SQL Server unique constraint violation code
//         res.status(409).json({
//           message: "Conflict: An account with this email already exists.",
//         });
//         return;
//       }
//       next(error);
//     }
//   }
// );

// // GET /api/admin/stats/overview - Admin Only: Get dashboard statistics
// router.get(
//   "/stats/overview", // This is the path the frontend is calling
//   authMiddleware, // 1. Ensure user is authenticated
//   rbacMiddleware(["admin"]), // 2. Ensure user has 'admin' role
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       console.log(
//         `📊 Admin Stats Overview (/api/admin/stats/overview) logic entered by admin: ${req.user?.email}`
//       );
//       const pool = getDBPool();

//       // Fetch Total Users
//       const totalUsersResult = await pool
//         .request()
//         .query("SELECT COUNT(*) AS totalUsers FROM dbo.Users");
//       const totalUsers = totalUsersResult.recordset[0].totalUsers;

//       // Fetch New Users (Last 7 Days)
//       const newUsersResult = await pool.request().query(`
//           SELECT COUNT(*) AS newUsersLast7Days
//           FROM dbo.Users
//           WHERE CreatedAt >= DATEADD(day, -7, GETUTCDATE())
//         `);
//       const newUsersLast7Days = newUsersResult.recordset[0].newUsersLast7Days;

//       // Fetch Users by Role
//       const usersByRoleResult = await pool.request().query(`
//           SELECT Role, COUNT(*) AS count
//           FROM dbo.Users
//           GROUP BY Role
//         `);
//       const usersByRole = usersByRoleResult.recordset;

//       // Fetch Active vs. Inactive Users
//       const usersByStatusResult = await pool.request().query(`
//           SELECT IsActive, COUNT(*) AS count
//           FROM dbo.Users
//           GROUP BY IsActive
//         `);
//       let activeUsers = 0;
//       let inactiveUsers = 0;
//       usersByStatusResult.recordset.forEach((row) => {
//         if (row.IsActive) {
//           activeUsers = row.count;
//         } else {
//           inactiveUsers = row.count;
//         }
//       });

//       console.log("📊 Admin Stats Overview: Data fetched successfully.");

//       res.status(200).json({
//         message: "Admin dashboard statistics retrieved successfully.",
//         stats: {
//           totalUsers,
//           newUsersLast7Days,
//           usersByRole,
//           activeUsers,
//           inactiveUsers,
//         },
//       });
//     } catch (error) {
//       console.error("🔥 Error fetching admin dashboard statistics:", error);
//       next(error);
//     }
//   }
// );

// // --- NEW: GET /api/admin/users/:userId - Admin Only: Get specific user details ---
// // --- CORRECTED: GET /api/admin/users/:userId - Admin Only: Get specific user details ---
// router.get(
//   "/users/:userId",
//   authMiddleware,
//   rbacMiddleware(["admin"]),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const { userId } = req.params;

//     console.log(
//       `👑 Admin Route (/api/admin/users/${userId}) accessed by admin: ${req.user?.email}`
//     );
//     try {
//       const pool = getDBPool();
//       const result = await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId).query(`
//           SELECT
//             UserID, Email, FirstName, LastName, Role, AuthProvider,
//             IsActive, IsMfaEnabled, CreatedAt, UpdatedAt, LastLoginAt
//           FROM dbo.Users
//           WHERE UserID = @UserID
//         `); // Removed AND IsActive = 1 to allow admins to see inactive users too

//       if (result.recordset.length === 0) {
//         res.status(404).json({ message: "User not found." });
//         return; // Corrected
//       }

//       const userFromDB = result.recordset[0];
//       const userProfile = {
//         id: userFromDB.UserID,
//         email: userFromDB.Email,
//         firstName: userFromDB.FirstName,
//         lastName: userFromDB.LastName,
//         role: userFromDB.Role,
//         authProvider: userFromDB.AuthProvider,
//         isActive: userFromDB.IsActive,
//         isMfaEnabled: userFromDB.IsMfaEnabled,
//         createdAt: userFromDB.CreatedAt,
//         updatedAt: userFromDB.UpdatedAt,
//         lastLoginAt: userFromDB.LastLoginAt,
//       };

//       console.log(
//         `👑 Admin Route (/users/${userId}): Sending user details for:`,
//         userProfile.email
//       );
//       res.status(200).json({
//         message: "User details retrieved successfully.",
//         user: userProfile,
//       });
//       // No explicit return needed if it's the last statement in the try block path
//     } catch (error) {
//       console.error(`🔥 Error in GET /api/admin/users/${userId} route:`, error);
//       if (error instanceof Error && error.message.includes("Invalid UDT")) {
//         res.status(400).json({ message: "Invalid User ID format." });
//         return; // Corrected
//       }
//       if (!res.headersSent) {
//         next(error);
//       }
//     }
//   }
// );

// // --- CORRECTED: PUT /api/admin/users/:userId/role - Admin Only: Update a user's role ---
// router.put(
//   "/users/:userId/role",
//   authMiddleware,
//   rbacMiddleware(["admin"]),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const { userId } = req.params;

//     try {
//       if (!req.user) {
//         // Should be caught by authMiddleware, but good check
//         res.status(401).json({ message: "Authentication required." });
//         return; // Corrected
//       }
//       const { newRole } = updateUserRoleSchema.parse(req.body); // Ensure updateUserRoleSchema is defined
//       console.log(
//         `👑 Admin Route (/api/admin/users/${userId}/role): Attempting to set role to '${newRole}' by admin: ${req.user.email}`
//       );

//       const pool = getDBPool();

//       const userCheckResult = await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .query(
//           "SELECT UserID, Role, Email FROM dbo.Users WHERE UserID = @UserID"
//         );

//       if (userCheckResult.recordset.length === 0) {
//         res.status(404).json({ message: "User not found." });
//         return; // Corrected
//       }
//       const targetUser = userCheckResult.recordset[0];

//       if (req.user.userId === userId) {
//         console.warn(
//           `⚠️ Admin ${req.user.email} attempted to change their own role via admin endpoint.`
//         );
//         res.status(403).json({
//           message:
//             "Admins cannot change their own role through this interface.",
//         });
//         return; // Corrected
//       }

//       if (targetUser.Role === "admin" && newRole === "user") {
//         const adminCountResult = await pool
//           .request()
//           .query(
//             "SELECT COUNT(*) as adminCount FROM dbo.Users WHERE Role = 'admin' AND IsActive = 1"
//           );
//         if (adminCountResult.recordset[0].adminCount <= 1) {
//           console.warn(
//             `⚠️ Attempt to demote the last active admin (UserID: ${userId}) by ${req.user.email}.`
//           );
//           res
//             .status(400)
//             .json({ message: "Cannot demote the last active admin." });
//           return; // Corrected
//         }
//       }

//       const updateResult = await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .input("NewRole", sql.NVarChar(50), newRole)
//         .query(
//           "UPDATE dbo.Users SET Role = @NewRole, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         );

//       if (updateResult.rowsAffected[0] === 0) {
//         res.status(404).json({
//           message:
//             "User not found or role could not be updated (no rows affected).",
//         });
//         return; // Corrected
//       }

//       console.log(
//         `👑 Admin Route (/users/${userId}/role): Role updated to '${newRole}' successfully.`
//       );
//       res.status(200).json({
//         message: `User role successfully updated to '${newRole}'.`,
//         user: { id: userId, role: newRole },
//       });
//       // No explicit return needed if it's the last statement in the try block path
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Invalid data provided for role update.",
//           errors: error.flatten().fieldErrors,
//         });
//         return; // Corrected
//       }
//       console.error(
//         `🔥 Error in PUT /api/admin/users/${userId}/role route:`,
//         error
//       );
//       if (error instanceof Error && error.message.includes("Invalid UDT")) {
//         res.status(400).json({ message: "Invalid User ID format." });
//         return; // Corrected
//       }
//       if (!res.headersSent) {
//         next(error);
//       }
//     }
//   }
// );
// // --- NEW: GET /api/admin/stats/new-user-activity - Admin Only: Get new user registration activity ---
// router.get(
//   "/stats/new-user-activity",
//   authMiddleware,
//   rbacMiddleware(["admin"]),
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       console.log(
//         `📊 Admin New User Activity accessed by admin: ${req.user?.email}`
//       );
//       const pool = getDBPool();

//       // Determine the period, e.g., last 7 days or last 30 days
//       const numberOfDays = parseInt((req.query.days as string) || "7", 10); // Default to 7 days, allow query param

//       // SQL Server query to get count of new users per day for the last 'numberOfDays'
//       // CONVERT(date, CreatedAt) groups by the date part only.
//       // GETUTCDATE() is for UTC. Adjust if your CreatedAt is local time.
//       const activityResult = await pool
//         .request()
//         .input("NumberOfDays", sql.Int, numberOfDays).query(`
//           SELECT
//             CONVERT(date, CreatedAt) AS registrationDate,
//             COUNT(UserID) AS newUsersCount
//           FROM
//             dbo.Users
//           WHERE
//             CreatedAt >= DATEADD(day, -@NumberOfDays, GETUTCDATE())
//             AND CreatedAt < DATEADD(day, 1, GETUTCDATE()) -- Ensure we include up to the end of today (UTC)
//           GROUP BY
//             CONVERT(date, CreatedAt)
//           ORDER BY
//             registrationDate ASC;
//         `);

//       // Format data for the chart (ensure all days in the period are present, even with 0 count)
//       const activityData = [];
//       const today = new Date(); // Use local date for generating the date range for simplicity, or UTC if preferred
//       today.setUTCHours(0, 0, 0, 0); // Normalize to start of UTC day for comparison with DB dates

//       for (let i = 0; i < numberOfDays; i++) {
//         const date = new Date(today);
//         date.setUTCDate(today.getUTCDate() - (numberOfDays - 1 - i)); // Iterate from (numberOfDays-1) days ago up to today
//         const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD format

//         const foundData = activityResult.recordset.find(
//           (row) =>
//             new Date(row.registrationDate).toISOString().split("T")[0] ===
//             dateString
//         );
//         activityData.push({
//           date: dateString,
//           count: foundData ? foundData.newUsersCount : 0,
//         });
//       }

//       console.log(
//         `📊 Admin New User Activity: ${numberOfDays} days data fetched.`
//       );

//       res.status(200).json({
//         message: `New user registration activity for the last ${numberOfDays} days retrieved successfully.`,
//         activity: activityData, // Array of { date: "YYYY-MM-DD", count: number }
//       });
//     } catch (error) {
//       console.error("🔥 Error fetching new user activity statistics:", error);
//       next(error);
//     }
//   }
// );

// export default router;

// backend/src/routes/adminRoutes.ts

import express, { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { protect as authMiddleware } from "../middleware/authMiddleware";
import { authorize as rbacMiddleware } from "../middleware/rbacMiddleware";
import { getDBPool, sql } from "../config/db";
import { z, ZodError } from "zod";

const router: Router = express.Router();

/**
 * Schema zur Validierung der Benutzerrolle beim Update.
 */
const updateUserRoleSchema = z.object({
  newRole: z.enum(["user", "admin"], {
    required_error: "Neue Rolle ist erforderlich.",
    invalid_type_error:
      "Ungültige Rolle. Erlaubt sind nur 'user' oder 'admin'.",
  }),
});

/**
 * Schema zur Validierung des Aktivitätsstatus eines Benutzers.
 */
const updateUserStatusSchema = z.object({
  isActive: z.boolean({
    required_error: "Status 'isActive' (true oder false) ist erforderlich.",
    invalid_type_error: "'isActive' muss ein boolescher Wert sein.",
  }),
});

/**
 * Schema zur Erstellung eines neuen Benutzers durch einen Administrator.
 */
const adminCreateUserSchema = z.object({
  email: z
    .string()
    .email({ message: "Eine gültige E-Mail-Adresse ist erforderlich." })
    .max(255),
  firstName: z
    .string()
    .min(1, { message: "Vorname ist erforderlich." })
    .max(100)
    .optional(),
  lastName: z
    .string()
    .min(1, { message: "Nachname ist erforderlich." })
    .max(100)
    .optional(),
  password: z
    .string()
    .min(8, { message: "Das Passwort muss mindestens 8 Zeichen lang sein." })
    .max(100),
  role: z
    .enum(["user", "admin"], {
      errorMap: () => ({
        message: "Ungültige Rolle. Erlaubt sind 'user' oder 'admin'.",
      }),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

console.log("✅ adminRoutes.ts wurde erfolgreich vom Server geladen.");

/**
 * Middleware zur Protokollierung aller eingehenden Anfragen auf /api/admin.
 */
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📣 Anfrage an /api/admin: ${req.method} ${req.path}`);
  next();
});

/**
 * @route GET /api/admin/users
 * @desc Ruft alle Benutzer ab (Admin-Zugriff erforderlich)
 * @access Nur Administratoren
 */
router.get(
  "/users",
  authMiddleware,
  rbacMiddleware(["admin"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // HTTP-Caching deaktivieren
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");

      console.log(`👑 Admin-Zugriff (/users) durch: ${req.user?.email}`);

      const pool = getDBPool();
      const result = await pool.request().query(`
        SELECT UserID, Email, FirstName, LastName, Role, IsActive, CreatedAt 
        FROM dbo.Users 
        ORDER BY CreatedAt DESC
      `);

      const formattedUsers = result.recordset.map((dbUser) => ({
        id: dbUser.UserID,
        email: dbUser.Email,
        firstName: dbUser.FirstName,
        lastName: dbUser.LastName,
        role: dbUser.Role,
        isActive: dbUser.IsActive,
        createdAt: dbUser.CreatedAt,
      }));

      console.log(
        "👑 Benutzerliste erfolgreich geladen. Anzahl:",
        formattedUsers.length
      );
      res.status(200).json({
        message: "Benutzerliste erfolgreich geladen (nur Admin).",
        users: formattedUsers,
      });
    } catch (error) {
      console.error("🔥 Fehler beim Abrufen der Benutzerliste:", error);
      next(error);
    }
  }
);

/**
 * @route PUT /api/admin/users/:userId/status
 * @desc Aktualisiert den Aktivitätsstatus eines Benutzers
 * @access Nur Administratoren
 */
router.put(
  "/users/:userId/status",
  authMiddleware,
  rbacMiddleware(["admin"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;

    try {
      if (!req.user) {
        res.status(401).json({ message: "Authentifizierung erforderlich." });
        return;
      }

      const { isActive } = updateUserStatusSchema.parse(req.body);

      console.log(
        `👑 Status-Update durch ${req.user.email}: Benutzer ${userId} wird auf 'isActive = ${isActive}' gesetzt.`
      );

      const pool = getDBPool();

      // Selbst-Deaktivierung des letzten aktiven Admins verhindern
      if (req.user.userId === userId && !isActive) {
        const adminCountResult = await pool
          .request()
          .query(
            "SELECT COUNT(*) as adminCount FROM dbo.Users WHERE Role = 'admin' AND IsActive = 1"
          );

        if (adminCountResult.recordset[0].adminCount <= 1) {
          console.warn(
            `⚠️ Letzter aktiver Admin (${req.user.email}) kann nicht deaktiviert werden.`
          );
          res.status(400).json({
            message:
              "Der letzte aktive Administrator kann nicht deaktiviert werden.",
          });
          return;
        }
      }

      const updateResult = await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId)
        .input("IsActive", sql.Bit, isActive).query(`
          UPDATE dbo.Users 
          SET IsActive = @IsActive, UpdatedAt = SYSUTCDATETIME() 
          WHERE UserID = @UserID
        `);

      if (updateResult.rowsAffected[0] === 0) {
        res.status(404).json({
          message:
            "Benutzer nicht gefunden oder Status konnte nicht aktualisiert werden.",
        });
        return;
      }

      const actionText = isActive ? "aktiviert" : "deaktiviert";
      console.log(`👑 Benutzer ${userId} erfolgreich ${actionText}.`);
      res.status(200).json({
        message: `Benutzer erfolgreich ${actionText}.`,
        user: { id: userId, isActive: isActive },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Ungültige Daten für Statusaktualisierung.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }

      console.error(
        `🔥 Fehler beim Status-Update für Benutzer ${userId}:`,
        error
      );

      if (error instanceof Error && error.message.includes("Invalid UDT")) {
        res.status(400).json({ message: "Ungültige Benutzer-ID." });
        return;
      }

      if (!res.headersSent) {
        next(error);
      }
    }
  }
);
/**
 * @route POST /api/admin/users
 * @description Erstellt einen neuen Benutzer (nur Admins)
 * @access Nur Administratoren
 */
router.post(
  "/users",
  authMiddleware,
  rbacMiddleware(["admin"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedBody = adminCreateUserSchema.parse(req.body);
      const { email, password, firstName, lastName } = validatedBody;

      const role = validatedBody.role || "user";
      const isActive =
        validatedBody.isActive !== undefined ? validatedBody.isActive : true;

      console.log(
        `👑 Admin-Route (POST /users): Erstelle Benutzer ${email} mit Rolle ${role} durch ${req.user?.email}`
      );

      const pool = getDBPool();

      // Prüfen, ob die E-Mail bereits existiert
      const userExistsResult = await pool
        .request()
        .input("Email", sql.NVarChar(255), email.toLowerCase())
        .query("SELECT UserID FROM dbo.Users WHERE Email = @Email");

      if (userExistsResult.recordset.length > 0) {
        res.status(409).json({
          message:
            "Konflikt: Ein Benutzer mit dieser E-Mail existiert bereits.",
        });
        return;
      }

      // Passwort hashen
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Benutzer in Datenbank einfügen
      const insertUserResult = await pool
        .request()
        .input("FirstName", sql.NVarChar(100), firstName || null)
        .input("LastName", sql.NVarChar(100), lastName || null)
        .input("Email", sql.NVarChar(255), email.toLowerCase())
        .input("PasswordHash", sql.NVarChar(sql.MAX), passwordHash)
        .input("Role", sql.NVarChar(50), role)
        .input("AuthProvider", sql.NVarChar(50), "email")
        .input("IsActive", sql.Bit, isActive).query(`
          INSERT INTO dbo.Users 
            (FirstName, LastName, Email, PasswordHash, Role, AuthProvider, IsActive, CreatedAt, UpdatedAt, IsMfaEnabled, MfaSecret, GoogleID)
          OUTPUT 
            inserted.UserID, inserted.Email, inserted.FirstName, inserted.LastName, inserted.Role, 
            inserted.AuthProvider, inserted.IsActive, inserted.IsMfaEnabled, inserted.CreatedAt
          VALUES 
            (@FirstName, @LastName, @Email, @PasswordHash, @Role, @AuthProvider, @IsActive, 
             SYSUTCDATETIME(), SYSUTCDATETIME(), 0, NULL, NULL)
        `);

      if (!insertUserResult.recordset[0]) {
        console.error(
          "🔥 Benutzererstellung fehlgeschlagen – kein Datensatz zurückgegeben."
        );
        throw new Error(
          "Fehler beim Erstellen des Benutzers in der Datenbank."
        );
      }

      const newUser = insertUserResult.recordset[0];

      const createdUserProfile = {
        id: newUser.UserID,
        email: newUser.Email,
        firstName: newUser.FirstName,
        lastName: newUser.LastName,
        role: newUser.Role,
        authProvider: newUser.AuthProvider,
        isActive: newUser.IsActive,
        isMfaEnabled: newUser.IsMfaEnabled,
        createdAt: newUser.CreatedAt,
      };

      console.log(
        "👑 Neuer Benutzer erfolgreich erstellt:",
        createdUserProfile
      );

      res.status(201).json({
        message: "Benutzer wurde erfolgreich erstellt.",
        user: createdUserProfile,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validierungsfehler bei der Benutzererstellung.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }

      // SQL Server: Fehlercode 2627 = Unique Constraint Violation
      if (error instanceof Error && (error as any).number === 2627) {
        res.status(409).json({
          message:
            "Konflikt: Ein Benutzer mit dieser E-Mail existiert bereits.",
        });
        return;
      }

      console.error("🔥 Fehler bei POST /api/admin/users:", error);
      next(error);
    }
  }
);

/**
 * @route GET /api/admin/stats/overview
 * @description Liefert Übersichtsdaten für das Admin-Dashboard
 * @access Nur Administratoren
 */
router.get(
  "/stats/overview",
  authMiddleware,
  rbacMiddleware(["admin"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`📊 Admin-Statistikzugriff durch: ${req.user?.email}`);
      const pool = getDBPool();

      // Gesamtanzahl Benutzer
      const totalUsersResult = await pool
        .request()
        .query("SELECT COUNT(*) AS totalUsers FROM dbo.Users");
      const totalUsers = totalUsersResult.recordset[0].totalUsers;

      // Neue Benutzer (letzte 7 Tage)
      const newUsersResult = await pool.request().query(`
        SELECT COUNT(*) AS newUsersLast7Days 
        FROM dbo.Users 
        WHERE CreatedAt >= DATEADD(day, -7, GETUTCDATE())
      `);
      const newUsersLast7Days = newUsersResult.recordset[0].newUsersLast7Days;

      // Benutzer nach Rolle
      const usersByRoleResult = await pool.request().query(`
        SELECT Role, COUNT(*) AS count 
        FROM dbo.Users 
        GROUP BY Role
      `);
      const usersByRole = usersByRoleResult.recordset;

      // Benutzer nach Aktivitätsstatus
      const usersByStatusResult = await pool.request().query(`
        SELECT IsActive, COUNT(*) AS count 
        FROM dbo.Users 
        GROUP BY IsActive
      `);

      let activeUsers = 0;
      let inactiveUsers = 0;
      usersByStatusResult.recordset.forEach((row) => {
        if (row.IsActive) {
          activeUsers = row.count;
        } else {
          inactiveUsers = row.count;
        }
      });

      console.log("📊 Statistiken erfolgreich ermittelt.");

      res.status(200).json({
        message: "Admin-Dashboard-Statistiken erfolgreich geladen.",
        stats: {
          totalUsers,
          newUsersLast7Days,
          usersByRole,
          activeUsers,
          inactiveUsers,
        },
      });
    } catch (error) {
      console.error("🔥 Fehler beim Laden der Admin-Statistiken:", error);
      next(error);
    }
  }
);

/**
 * @route GET /api/admin/users/:userId
 * @description Gibt die Benutzerdetails eines spezifischen Benutzers zurück (nur Admins)
 * @access Nur Administratoren
 */
router.get(
  "/users/:userId",
  authMiddleware,
  rbacMiddleware(["admin"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;

    console.log(
      `👑 Admin-Route (/users/${userId}) aufgerufen von: ${req.user?.email}`
    );

    try {
      const pool = getDBPool();
      const result = await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId).query(`
          SELECT 
            UserID, Email, FirstName, LastName, Role, AuthProvider, 
            IsActive, IsMfaEnabled, CreatedAt, UpdatedAt, LastLoginAt 
          FROM dbo.Users 
          WHERE UserID = @UserID
        `);

      if (result.recordset.length === 0) {
        res.status(404).json({ message: "Benutzer nicht gefunden." });
        return;
      }

      const userFromDB = result.recordset[0];
      const userProfile = {
        id: userFromDB.UserID,
        email: userFromDB.Email,
        firstName: userFromDB.FirstName,
        lastName: userFromDB.LastName,
        role: userFromDB.Role,
        authProvider: userFromDB.AuthProvider,
        isActive: userFromDB.IsActive,
        isMfaEnabled: userFromDB.IsMfaEnabled,
        createdAt: userFromDB.CreatedAt,
        updatedAt: userFromDB.UpdatedAt,
        lastLoginAt: userFromDB.LastLoginAt,
      };

      console.log(`👑 Benutzerprofil gesendet: ${userProfile.email}`);
      res.status(200).json({
        message: "Benutzerdetails erfolgreich abgerufen.",
        user: userProfile,
      });
    } catch (error) {
      console.error(`🔥 Fehler bei GET /users/${userId}:`, error);
      if (error instanceof Error && error.message.includes("Invalid UDT")) {
        res.status(400).json({ message: "Ungültiges Benutzer-ID-Format." });
        return;
      }
      if (!res.headersSent) {
        next(error);
      }
    }
  }
);

/**
 * @route PUT /api/admin/users/:userId/role
 * @description Aktualisiert die Rolle eines Benutzers (nur Admins)
 * @access Nur Administratoren
 */
router.put(
  "/users/:userId/role",
  authMiddleware,
  rbacMiddleware(["admin"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;

    try {
      if (!req.user) {
        res.status(401).json({ message: "Authentifizierung erforderlich." });
        return;
      }

      const { newRole } = updateUserRoleSchema.parse(req.body);

      console.log(
        `👑 Admin-Route (/users/${userId}/role): Admin ${req.user.email} versucht, Rolle auf '${newRole}' zu setzen.`
      );

      const pool = getDBPool();

      const userCheckResult = await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId)
        .query(
          "SELECT UserID, Role, Email FROM dbo.Users WHERE UserID = @UserID"
        );

      if (userCheckResult.recordset.length === 0) {
        res.status(404).json({ message: "Benutzer nicht gefunden." });
        return;
      }

      const targetUser = userCheckResult.recordset[0];

      if (req.user.userId === userId) {
        console.warn(
          `⚠️ Admin ${req.user.email} hat versucht, seine eigene Rolle zu ändern.`
        );
        res.status(403).json({
          message: "Administratoren können ihre eigene Rolle nicht ändern.",
        });
        return;
      }

      // Verhindere Degradierung des letzten aktiven Admins
      if (targetUser.Role === "admin" && newRole === "user") {
        const adminCountResult = await pool
          .request()
          .query(
            "SELECT COUNT(*) as adminCount FROM dbo.Users WHERE Role = 'admin' AND IsActive = 1"
          );

        if (adminCountResult.recordset[0].adminCount <= 1) {
          console.warn(
            `⚠️ Versuch, den letzten aktiven Admin (${userId}) zu degradieren durch ${req.user.email}.`
          );
          res.status(400).json({
            message: "Der letzte aktive Admin kann nicht herabgestuft werden.",
          });
          return;
        }
      }

      const updateResult = await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId)
        .input("NewRole", sql.NVarChar(50), newRole).query(`
          UPDATE dbo.Users 
          SET Role = @NewRole, UpdatedAt = SYSUTCDATETIME() 
          WHERE UserID = @UserID
        `);

      if (updateResult.rowsAffected[0] === 0) {
        res.status(404).json({
          message:
            "Benutzer nicht gefunden oder Rolle konnte nicht aktualisiert werden.",
        });
        return;
      }

      console.log(
        `👑 Rolle des Benutzers ${userId} erfolgreich auf '${newRole}' aktualisiert.`
      );
      res.status(200).json({
        message: `Benutzerrolle wurde erfolgreich auf '${newRole}' aktualisiert.`,
        user: { id: userId, role: newRole },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Ungültige Daten für Rollenänderung.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }

      console.error(`🔥 Fehler bei PUT /users/${userId}/role:`, error);

      if (error instanceof Error && error.message.includes("Invalid UDT")) {
        res.status(400).json({ message: "Ungültiges Benutzer-ID-Format." });
        return;
      }

      if (!res.headersSent) {
        next(error);
      }
    }
  }
);
/**
 * @route GET /api/admin/stats/new-user-activity
 * @description Gibt die tägliche Anzahl neu registrierter Benutzer der letzten X Tage zurück (Standard: 7)
 * @queryParam days Optional: Anzahl der Tage (z. B. ?days=30)
 * @access Nur Administratoren
 */
router.get(
  "/stats/new-user-activity",
  authMiddleware,
  rbacMiddleware(["admin"]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(
        `📊 Admin Statistik (Neue Benutzeraktivität) aufgerufen von: ${req.user?.email}`
      );

      const pool = getDBPool();

      // Anzahl der Tage aus Query-Parameter lesen oder 7 als Standard setzen
      const numberOfDays = parseInt((req.query.days as string) || "7", 10);

      // SQL-Abfrage zur Ermittlung neuer Registrierungen pro Tag (nur Datumsteil berücksichtigen)
      const activityResult = await pool
        .request()
        .input("NumberOfDays", sql.Int, numberOfDays).query(`
          SELECT 
            CONVERT(date, CreatedAt) AS registrationDate,
            COUNT(UserID) AS newUsersCount
          FROM dbo.Users
          WHERE 
            CreatedAt >= DATEADD(day, -@NumberOfDays, GETUTCDATE()) 
            AND CreatedAt < DATEADD(day, 1, GETUTCDATE()) 
          GROUP BY CONVERT(date, CreatedAt)
          ORDER BY registrationDate ASC;
        `);

      // Ergebnisse normalisieren – sicherstellen, dass auch Tage mit 0 Registrierungen enthalten sind
      const activityData: { date: string; count: number }[] = [];
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0); // Startzeit auf Mitternacht UTC setzen

      for (let i = 0; i < numberOfDays; i++) {
        const date = new Date(today);
        date.setUTCDate(today.getUTCDate() - (numberOfDays - 1 - i));
        const dateString = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD

        const found = activityResult.recordset.find(
          (row) =>
            new Date(row.registrationDate).toISOString().split("T")[0] ===
            dateString
        );

        activityData.push({
          date: dateString,
          count: found ? found.newUsersCount : 0,
        });
      }

      console.log(
        `📊 Neue Benutzeraktivität: Statistik der letzten ${numberOfDays} Tage erfolgreich generiert.`
      );

      res.status(200).json({
        message: `Registrierungsaktivität der letzten ${numberOfDays} Tage erfolgreich abgerufen.`,
        activity: activityData,
      });
    } catch (error) {
      console.error("🔥 Fehler beim Abrufen der Benutzeraktivität:", error);
      next(error);
    }
  }
);

export default router;
