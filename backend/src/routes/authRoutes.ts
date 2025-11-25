// // backend/src/routes/authRoutes.ts

// import express, { Router, Request, Response, NextFunction } from "express";
// import bcrypt from "bcrypt";
// import jwt, {
//   JwtPayload,
//   Secret,
//   SignOptions as jwtSignOptions,
// } from "jsonwebtoken";
// import crypto from "crypto";
// import { z, ZodError } from "zod";
// import { getDBPool, sql } from "../config/db"; // Ensure this path is correct
// import { OAuth2Client } from "google-auth-library";
// import { authenticator } from "otplib"; // For MFA TOTP verification
// import { decryptMfaSecret } from "../utils/encryption"; // Import decryption util
// import { protect as authMiddleware } from "../middleware/authMiddleware";
// import { sendPasswordResetEmail } from '../utils/emailService'; // Import the new service
// //import jwt from 'jsonwebtoken'; // Import jsonwebtoken

// const router: Router = express.Router();

// //Password Change
// const changePasswordSchema = z
//   .object({
//     currentPassword: z
//       .string()
//       .min(1, { message: "Current password is required." }),
//     newPassword: z
//       .string()
//       .min(8, { message: "New password must be at least 8 characters long." })
//       .max(100),
//     confirmNewPassword: z.string(),
//   })
//   .refine((data) => data.newPassword === data.confirmNewPassword, {
//     message: "New passwords do not match.",
//     path: ["confirmNewPassword"],
//   })
//   .refine((data) => data.currentPassword !== data.newPassword, {
//     message: "New password cannot be the same as the current password.",
//     path: ["newPassword"],
//   });

// console.log(
//   "🔑 authRoutes.ts: Module loading. Ensure all .env variables are accessible."
// );

// // --- Helper function for hashing tokens ---
// const hashToken = (token: string): string => {
//   return crypto.createHash("sha256").update(token).digest("hex");
// };

// // --- Zod Schemas ---
// const loginSchema = z.object({
//   email: z.string().email({ message: "A valid email address is required" }),
//   password: z.string().min(1, { message: "Password cannot be empty" }),
// });

// const registerSchema = z
//   .object({
//     firstName: z
//       .string()
//       .min(1, { message: "First name is required" })
//       .max(100),
//     lastName: z.string().min(1, { message: "Last name is required" }).max(100),
//     email: z
//       .string()
//       .email({ message: "A valid email address is required" })
//       .max(255),
//     password: z
//       .string()
//       .min(8, { message: "Password must be at least 8 characters long" })
//       .max(100),
//     passwordConfirmation: z.string(),
//   })
//   .refine((data) => data.password === data.passwordConfirmation, {
//     message: "Passwords do not match",
//     path: ["passwordConfirmation"],
//   });

// const requestPasswordResetSchema = z.object({
//   email: z.string().email({ message: "A valid email address is required" }),
// });

// const resetPasswordSchema = z
//   .object({
//     token: z.string().min(1, { message: "Reset token is required" }),
//     newPassword: z
//       .string()
//       .min(8, { message: "New password must be at least 8 characters long" })
//       .max(100),
//     confirmNewPassword: z.string(),
//   })
//   .refine((data) => data.newPassword === data.confirmNewPassword, {
//     message: "New passwords do not match",
//     path: ["confirmNewPassword"],
//   });

// // Schema for MFA verification during login step
// const verifyMfaLoginSchema = z.object({
//   userId: z
//     .string()
//     .uuid({ message: "Valid UserID is required for MFA verification." }),
//   totpCode: z
//     .string()
//     .length(6, { message: "TOTP code must be 6 digits" })
//     .regex(/^\d{6}$/, { message: "Invalid TOTP code format" }),
// });

// // --- Interface for user data passed to issueSessionTokens ---
// interface UserDataForToken {
//   UserID: string; // From database
//   Email: string; // From database
//   Role: string; // From database
//   // Add other fields if needed by the JWT payload itself, but keep it minimal
// }

// // --- Interface for comprehensive user data from DB (used in Google callback) ---
// interface DbUser extends UserDataForToken {
//   // Extends UserDataForToken for base fields
//   PasswordHash: string | null;
//   FirstName: string | null;
//   LastName: string | null;
//   IsActive: boolean;
//   GoogleID: string | null;
//   AuthProvider: string | null;
//   // Add other fields you select from dbo.Users like IsMfaEnabled, MfaSecret if needed directly on this object
//   IsMfaEnabled?: boolean; // Optional if not always selected
//   MfaSecret?: string | null; // Optional if not always selected
// }

// // --- Helper Function to Issue Access and Refresh Tokens & Set Cookies ---
// async function issueSessionTokens(
//   res: Response,
//   user: UserDataForToken,
//   pool: any /* mssql.ConnectionPool */
// ) {
//   // 1. Access Token (JWT)
//   const jwtSecret = process.env.JWT_SECRET;
//   const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
//   if (!jwtSecret) {
//     console.error("🔥 CRITICAL: JWT_SECRET not configured for token issuance.");
//     // This error should be caught by the calling route and handled.
//     throw new Error("Server configuration error: JWT_SECRET missing.");
//   }

//   const accessTokenPayload = {
//     userId: user.UserID,
//     email: user.Email,
//     role: user.Role,
//   };
//   const accessToken = jwt.sign(accessTokenPayload, jwtSecret, {
//     expiresIn: jwtExpiresIn,
//   } as jwtSignOptions); // User's preferred format

//   const accessTokenCookieName =
//     process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
//   let accessTokenMaxAgeMs = 15 * 60 * 1000; // Default 15 mins
//   if (jwtExpiresIn.endsWith("s")) {
//     accessTokenMaxAgeMs = parseInt(jwtExpiresIn.replace("s", ""), 10) * 1000;
//   } else if (jwtExpiresIn.endsWith("m")) {
//     accessTokenMaxAgeMs =
//       parseInt(jwtExpiresIn.replace("m", ""), 10) * 60 * 1000;
//   } else if (jwtExpiresIn.endsWith("h")) {
//     accessTokenMaxAgeMs =
//       parseInt(jwtExpiresIn.replace("h", ""), 10) * 60 * 60 * 1000;
//   }

//   res.cookie(accessTokenCookieName, accessToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax" as const, // User's preferred format
//     path: "/api",
//     maxAge: accessTokenMaxAgeMs,
//   });
//   console.log(
//     `🍪 Access Token Cookie ('${accessTokenCookieName}') set by helper. MaxAge: ${
//       accessTokenMaxAgeMs / 1000
//     }s for UserID: ${user.UserID}`
//   );

//   // 2. Refresh Token
//   const refreshToken = crypto.randomBytes(64).toString("hex");
//   const refreshTokenHash = hashToken(refreshToken);

//   const envRefreshTokenSeconds = process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS;
//   console.log(
//     `[issueSessionTokens] Reading REFRESH_TOKEN_EXPIRES_IN_SECONDS: "${envRefreshTokenSeconds}" for UserID: ${user.UserID}`
//   );
//   const refreshTokenLifetimeSeconds = parseInt(
//     envRefreshTokenSeconds || (7 * 24 * 60 * 60).toString(),
//     10
//   ); // Default 7 days

//   const refreshTokenExpiresAt = new Date(
//     Date.now() + refreshTokenLifetimeSeconds * 1000
//   );
//   const refreshTokenCookieName =
//     process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

//   // Invalidate old (non-revoked) refresh tokens for this user before inserting the new one
//   await pool
//     .request()
//     .input("UserID", sql.UniqueIdentifier, user.UserID)
//     .query(
//       "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID AND IsRevoked = 0"
//     );

//   // Store the new refresh token hash
//   await pool
//     .request()
//     .input("UserID", sql.UniqueIdentifier, user.UserID)
//     .input("TokenHash", sql.NVarChar(256), refreshTokenHash)
//     .input("ExpiresAt", sql.DateTime2, refreshTokenExpiresAt)
//     .query(
//       "INSERT INTO dbo.RefreshTokens (UserID, TokenHash, ExpiresAt, IsRevoked) VALUES (@UserID, @TokenHash, @ExpiresAt, 0)"
//     );

//   res.cookie(refreshTokenCookieName, refreshToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax" as const, // User's preferred format
//     path: "/api/auth/refresh-token",
//     maxAge: refreshTokenLifetimeSeconds * 1000,
//   });
//   console.log(
//     `🍪 Refresh Token Cookie ('${refreshTokenCookieName}') set by helper. MaxAge: ${refreshTokenLifetimeSeconds}s for UserID: ${user.UserID}`
//   );
//   // Note: This helper function only sets cookies. The calling route is responsible for sending the final JSON response.
// }

// // --- POST /api/auth/change-password (Protected by authMiddleware) ---
// router.post(
//   "/change-password",
//   authMiddleware,
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       // req.user is populated by authMiddleware
//       if (!req.user || !req.user.userId) {
//         res.status(401).json({
//           message: "User not authenticated or user session is invalid.",
//         });
//         return;
//       }
//       const { userId } = req.user; // Get userId from the authenticated session

//       // Validate the request body
//       const { currentPassword, newPassword } = changePasswordSchema.parse(
//         req.body
//       );

//       const pool = getDBPool();

//       // 1. Fetch current user's password hash and AuthProvider
//       // Ensure the user is active and has a password that can be changed (e.g., not an OAuth-only user)
//       const userResult = await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .query(
//           "SELECT PasswordHash, AuthProvider FROM dbo.Users WHERE UserID = @UserID AND IsActive = 1"
//         );

//       if (userResult.recordset.length === 0) {
//         // This case should ideally not happen if authMiddleware passed and user exists
//         res
//           .status(404)
//           .json({ message: "User not found or account is inactive." });
//         return;
//       }
//       const userData = userResult.recordset[0];

//       // 2. Check if password change is applicable for this account type
//       if (userData.AuthProvider !== "email" || !userData.PasswordHash) {
//         // If user signed up via Google/other OAuth, or if PasswordHash is somehow NULL for an email user
//         res.status(400).json({
//           message:
//             "Password change is not applicable for this account type. Users who signed up with external providers should manage their passwords there.",
//         });
//         return;
//       }

//       // 3. Verify current password
//       const isCurrentPasswordMatch = await bcrypt.compare(
//         currentPassword,
//         userData.PasswordHash
//       );
//       if (!isCurrentPasswordMatch) {
//         res
//           .status(400)
//           .json({ message: "Incorrect current password. Please try again." });
//         return;
//       }

//       // 4. Hash the new password
//       const saltRounds = 12; // Consistent with registration
//       const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

//       // 5. Update the password hash in the database
//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .input("NewPasswordHash", sql.NVarChar(sql.MAX), newPasswordHash)
//         .query(
//           "UPDATE dbo.Users SET PasswordHash = @NewPasswordHash, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         );

//       console.log(`✅ Password changed successfully for UserID: ${userId}`);

//       // OPTIONAL BUT RECOMMENDED: Invalidate other active sessions for this user.
//       // This typically involves revoking all their refresh tokens.
//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .query(
//           "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID"
//         );
//       console.log(
//         `ℹ️ All refresh tokens revoked for UserID: ${userId} after password change to enhance security.`
//       );
//       // Note: The current session's refresh token cookie on the client is now invalid.
//       // The access token remains valid until expiry. The user might need to log in again
//       // on other devices, and on this device once the access token expires and refresh fails.
//       // For an even better UX, you could issue new tokens here, but that's more complex.

//       res.status(200).json({
//         message:
//           "Password changed successfully. You may need to log in again on other devices.",
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Invalid data provided for password change.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Error changing password:", error);
//       next(error); // Pass to global error handler
//     }
//   }
// );

// // --- POST /api/auth/register ---
// router.post(
//   "/register",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const validatedBody = registerSchema.parse(req.body);
//       const { firstName, lastName, email, password } = validatedBody;
//       const pool = getDBPool();
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
//       const saltRounds = 12;
//       const passwordHash = await bcrypt.hash(password, saltRounds);
//       const defaultRole = "user";
//       const insertUserResult =
//         await // GoogleID will be NULL by default (if schema allows), MfaSecret NULL, IsMfaEnabled 0 by default
//         pool
//           .request()
//           .input("FirstName", sql.NVarChar(100), firstName)
//           .input("LastName", sql.NVarChar(100), lastName)
//           .input("Email", sql.NVarChar(255), email.toLowerCase())
//           .input("PasswordHash", sql.NVarChar(sql.MAX), passwordHash) // Assuming PasswordHash is NOT NULL
//           .input("Role", sql.NVarChar(50), defaultRole)
//           .input("AuthProvider", sql.NVarChar(50), "email") // Explicitly set AuthProvider
//           .query(`
//             INSERT INTO dbo.Users (FirstName, LastName, Email, PasswordHash, Role, AuthProvider, IsActive, CreatedAt, UpdatedAt)
//             OUTPUT inserted.UserID, inserted.Email, inserted.FirstName, inserted.LastName, inserted.Role, inserted.CreatedAt, inserted.IsActive
//             VALUES (@FirstName, @LastName, @Email, @PasswordHash, @Role, @AuthProvider, 1, SYSUTCDATETIME(), SYSUTCDATETIME())
//         `);
//       if (!insertUserResult.recordset[0])
//         throw new Error("User registration failed, no record outputted.");
//       const newUser = insertUserResult.recordset[0];
//       console.log("✅ User registered successfully:", {
//         userId: newUser.UserID,
//         email: newUser.Email,
//         role: newUser.Role,
//       });
//       res.status(201).json({
//         message: "User registered successfully! Please log in.",
//         user: {
//           id: newUser.UserID,
//           firstName: newUser.FirstName,
//           lastName: newUser.LastName,
//           email: newUser.Email,
//           role: newUser.Role,
//           isActive: newUser.IsActive,
//           createdAt: newUser.CreatedAt,
//           // isMfaEnabled will default to 0 (false) from DB schema
//         },
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Validation failed during registration.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Registration endpoint error:", error);
//       next(error);
//     }
//   }
// );

// // --- POST /api/auth/login (Handles MFA check) ---
// router.post(
//   "/login",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const validatedBody = loginSchema.parse(req.body);
//       const { email, password } = validatedBody;
//       const pool = getDBPool();

//       // Fetch all necessary fields, including IsMfaEnabled and MfaSecret
//       const userResult = await pool
//         .request()
//         .input("Email", sql.NVarChar(255), email.toLowerCase())
//         .query<DbUser>(
//           "SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role, IsMfaEnabled, MfaSecret, AuthProvider FROM dbo.Users WHERE Email = @Email"
//         );

//       if (userResult.recordset.length === 0) {
//         res.status(401).json({ message: "Invalid credentials provided." });
//         return;
//       }
//       const userFromDB = userResult.recordset[0];

//       if (!userFromDB.IsActive) {
//         res
//           .status(403)
//           .json({ message: "Account is inactive. Please contact support." });
//         return;
//       }

//       // Check if password login is appropriate for this user (e.g., not an OAuth-only user)
//       if (!userFromDB.PasswordHash) {
//         if (userFromDB.AuthProvider !== "email") {
//           console.warn(
//             `⚠️ Login attempt for user ${email} with no password hash (AuthProvider: ${userFromDB.AuthProvider}).`
//           );
//           res.status(401).json({
//             message: `This account was created using ${
//               userFromDB.AuthProvider || "an external provider"
//             }. Please sign in using that method.`,
//           });
//           return;
//         } else {
//           // User with 'email' as provider SHOULD have a password hash
//           console.error(
//             `🔥 User ${email} (AuthProvider 'email') has no PasswordHash! Account might be corrupted or improperly created.`
//           );
//           res.status(500).json({
//             message: "Account configuration error. Unable to log in.",
//           });
//           return;
//         }
//       }

//       const isPasswordMatch = await bcrypt.compare(
//         password,
//         userFromDB.PasswordHash
//       );
//       if (!isPasswordMatch) {
//         res.status(401).json({ message: "Invalid credentials provided." });
//         return;
//       }

//       // MFA Check
//       if (userFromDB.IsMfaEnabled && userFromDB.MfaSecret) {
//         console.log(
//           `ℹ️ MFA is enabled for user ${email}. MFA challenge required.`
//         );
//         res.status(200).json({
//           mfaRequired: true,
//           userId: userFromDB.UserID, // Send userId to link to the MFA verification step
//           message: "Password verified. Please provide your MFA code.",
//         });
//         return; // Stop here, wait for MFA verification
//       }

//       // MFA NOT Enabled: Proceed with normal token issuance
//       console.log(
//         `ℹ️ MFA is NOT enabled for user ${email} or no MfaSecret found. Proceeding with standard token issuance.`
//       );
//       await issueSessionTokens(res, userFromDB, pool); // Use helper function

//       // Update LastLoginAt after issuing tokens
//       pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
//         .query(
//           "UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         )
//         .catch((dbErr: any) =>
//           console.error(
//             "🔥 Failed to update LastLoginAt post-login:",
//             dbErr.message || dbErr
//           )
//         );

//       console.log(
//         `✅ Login successful for ${userFromDB.Email} (MFA not required).`
//       );
//       // Send final JSON response
//       res.status(200).json({
//         mfaRequired: false,
//         message: "Login successful! Session started.",
//         user: {
//           // Ensure this structure matches frontend UserData type
//           id: userFromDB.UserID,
//           firstName: userFromDB.FirstName,
//           lastName: userFromDB.LastName,
//           email: userFromDB.Email,
//           role: userFromDB.Role,
//           isMfaEnabled: userFromDB.IsMfaEnabled, // Also send current MFA status
//         },
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Validation failed.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Login endpoint error:", error);
//       if (!res.headersSent) {
//         // Check if headers already sent (e.g., by issueSessionTokens if it threw early)
//         next(error);
//       }
//     }
//   }
// );
// // backend/src/routes/authRoutes.ts - Piece 2 of 2
// // (Assumes Piece 1 with imports, helpers, schemas, issueSessionTokens, /register, and /login routes is directly above this)

// // Interface for the data structure returned by the refresh token validation query
// interface RefreshTokenQueryResult {
//   UserID: string;
//   Email: string;
//   Role: string;
//   FirstName: string | null;
//   LastName: string | null;
//   UserIsActive: boolean; // Specifically u.IsActive AS UserIsActive
//   TokenExpiresAt: Date; // Specifically rt.ExpiresAt AS TokenExpiresAt
//   IsRevoked: boolean; // Specifically rt.IsRevoked
//   // Include other fields from dbo.Users if they are selected and needed
// }

// // --- POST /api/auth/verify-mfa ---
// router.post(
//   "/verify-mfa",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const { userId, totpCode } = verifyMfaLoginSchema.parse(req.body); // verifyMfaLoginSchema defined in Piece 1
//       const pool = getDBPool();

//       // Fetch all fields needed for UserDataForToken and the final user object response
//       const userResult = await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .query<DbUser>(
//           "SELECT UserID, Email, FirstName, LastName, IsActive, Role, IsMfaEnabled, MfaSecret FROM dbo.Users WHERE UserID = @UserID"
//         );

//       if (userResult.recordset.length === 0) {
//         res
//           .status(401)
//           .json({ message: "User not found for MFA verification." });
//         return;
//       }
//       const userFromDB = userResult.recordset[0];

//       if (!userFromDB.IsActive) {
//         res.status(403).json({ message: "Account is inactive." });
//         return;
//       }
//       if (!userFromDB.IsMfaEnabled || !userFromDB.MfaSecret) {
//         console.warn(
//           `⚠️ MFA verification attempt for UserID: ${userId}, but MFA is not properly enabled or secret is missing.`
//         );
//         res.status(400).json({
//           message:
//             "MFA is not enabled for this account or setup is incomplete.",
//         });
//         return;
//       }
//       // Decrypt the stored MfaSecret
//       const decryptedMfaSecret = decryptMfaSecret(userFromDB.MfaSecret);
//       if (!decryptedMfaSecret) {
//         console.error(
//           `🔥 Failed to decrypt MFA secret for UserID: ${userId} during login verification.`
//         );
//         res.status(500).json({
//           message:
//             "MFA verification failed due to a security configuration issue.",
//         });
//         return;
//       }
//       // Verify the TOTP code
//       const isValid = authenticator.verify({
//         token: totpCode,
//         secret: decryptedMfaSecret,
//         // If you add 'window: 1', ensure your otplib types support it directly in this object literal.
//         // If type errors occur with 'window', it might be an otplib version/type definition issue.
//       });

//       if (!isValid) {
//         console.warn(
//           `⚠️ MFA verification failed for UserID: ${userId}. Invalid TOTP code.`
//         );
//         res
//           .status(401)
//           .json({ message: "Invalid MFA code. Please try again." });
//         return;
//       }

//       console.log(
//         `✅ MFA code verified for UserID: ${userId}. Issuing full session tokens.`
//       );
//       // Ensure userFromDB passed to issueSessionTokens matches UserDataForToken structure
//       await issueSessionTokens(res, userFromDB, pool);

//       pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
//         .query(
//           "UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         )
//         .catch((dbErr: any) =>
//           console.error(
//             "🔥 Failed to update LastLoginAt post-MFA verification:",
//             dbErr.message || dbErr
//           )
//         );

//       res.status(200).json({
//         message: "MFA verification successful! Login complete.",
//         user: {
//           id: userFromDB.UserID,
//           firstName: userFromDB.FirstName,
//           lastName: userFromDB.LastName,
//           email: userFromDB.Email,
//           role: userFromDB.Role,
//           isMfaEnabled: userFromDB.IsMfaEnabled,
//         },
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Invalid data for MFA verification.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Verify MFA endpoint error:", error);
//       if (!res.headersSent) {
//         next(error);
//       }
//     }
//   }
// );

// // --- POST /api/auth/refresh-token ---
// router.post(
//   "/refresh-token",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const refreshTokenCookieName =
//       process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";
//     const incomingRefreshToken = req.cookies
//       ? req.cookies[refreshTokenCookieName]
//       : undefined;
//     console.log(
//       `🔄 /api/auth/refresh-token: Endpoint hit. Cookie ('${refreshTokenCookieName}') value: ${
//         incomingRefreshToken ? "Present" : "Missing"
//       }`
//     );

//     if (!incomingRefreshToken) {
//       res
//         .status(401)
//         .json({ message: "Access denied. No refresh token provided." });
//       return;
//     }

//     try {
//       const pool = getDBPool();
//       const hashedIncomingRefreshToken = hashToken(incomingRefreshToken);

//       const tokenResult = await pool
//         .request()
//         .input("TokenHash", sql.NVarChar(256), hashedIncomingRefreshToken)
//         .query<RefreshTokenQueryResult>( // Use the new specific interface here
//           `SELECT
//             rt.UserID, rt.ExpiresAt AS TokenExpiresAt, rt.IsRevoked,
//             u.Email, u.Role, u.IsActive AS UserIsActive, u.FirstName, u.LastName
//          FROM dbo.RefreshTokens rt
//          INNER JOIN dbo.Users u ON rt.UserID = u.UserID
//          WHERE rt.TokenHash = @TokenHash`
//         );

//       if (tokenResult.recordset.length === 0) {
//         console.warn(
//           `🔄 Refresh token hash not found or mismatched: ${hashedIncomingRefreshToken.substring(
//             0,
//             10
//           )}...`
//         );
//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({ message: "Forbidden. Invalid refresh token provided." });
//         return;
//       }

//       const tokenData = tokenResult.recordset[0]; // tokenData is now of type RefreshTokenQueryResult

//       if (tokenData.IsRevoked) {
//         console.warn(
//           `🔄 Attempt to use a revoked refresh token for UserID: ${tokenData.UserID}. Invalidating all tokens for this user.`
//         );
//         await pool
//           .request()
//           .input("UserID", sql.UniqueIdentifier, tokenData.UserID)
//           .query(
//             "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID"
//           );
//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({ message: "Forbidden. Refresh token has been revoked." });
//         return;
//       }
//       if (new Date(tokenData.TokenExpiresAt) < new Date()) {
//         // TokenExpiresAt is from RefreshTokenQueryResult
//         console.warn(
//           `🔄 Expired refresh token used for UserID: ${tokenData.UserID}`
//         );
//         await pool
//           .request()
//           .input("TokenHash", sql.NVarChar(256), hashedIncomingRefreshToken)
//           .query(
//             "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE TokenHash = @TokenHash"
//           );
//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({ message: "Forbidden. Refresh token has expired." });
//         return;
//       }
//       if (!tokenData.UserIsActive) {
//         // UserIsActive is from RefreshTokenQueryResult
//         console.warn(
//           `🔄 Refresh token used for an inactive user: UserID ${tokenData.UserID}`
//         );
//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({ message: "Forbidden. User account is inactive." });
//         return;
//       }

//       // Prepare user data for issueSessionTokens (needs UserID, Email, Role)
//       const userForTokenIssue: UserDataForToken = {
//         UserID: tokenData.UserID,
//         Email: tokenData.Email,
//         Role: tokenData.Role,
//       };
//       await issueSessionTokens(res, userForTokenIssue, pool);

//       console.log(
//         `🔄 Access token refreshed successfully for UserID: ${tokenData.UserID}.`
//       ); // tokenData is in scope
//       res.status(200).json({ message: "Access token refreshed successfully." });
//     } catch (error) {
//       console.error("🔥 Refresh Token endpoint error:", error);
//       res.clearCookie(refreshTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api/auth/refresh-token",
//       });
//       if (!res.headersSent) {
//         next(error);
//       }
//     }
//   }
// );

// // --- POST /api/auth/logout ---
// router.post(
//   "/logout",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const accessTokenCookieName =
//       process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
//     const refreshTokenCookieName =
//       process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";
//     const incomingRefreshToken = req.cookies
//       ? req.cookies[refreshTokenCookieName]
//       : undefined;
//     try {
//       if (incomingRefreshToken) {
//         const pool = getDBPool();
//         const hashedRefreshToken = hashToken(incomingRefreshToken);
//         await pool
//           .request()
//           .input("TokenHash", sql.NVarChar(256), hashedRefreshToken)
//           .query(
//             "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE TokenHash = @TokenHash"
//           );
//         console.log(
//           `🍪 Refresh token (hash: ${hashedRefreshToken.substring(
//             0,
//             10
//           )}...) marked as revoked during logout.`
//         );
//       }
//       res.clearCookie(accessTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api",
//       });
//       res.clearCookie(refreshTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api/auth/refresh-token",
//       });
//       console.log(`🍪 All session cookies cleared during logout.`);
//       res
//         .status(200)
//         .json({ message: "Logout successful. All session tokens cleared." });
//     } catch (error) {
//       console.error("🔥 Logout error:", error);
//       res.clearCookie(accessTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api",
//       });
//       res.clearCookie(refreshTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api/auth/refresh-token",
//       });
//       if (!res.headersSent) {
//         next(error);
//       }
//     }
//   }
// );

// // --- POST /api/auth/forgot-password ---
// router.post(
//   "/forgot-password",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (!process.env.JWT_SECRET) {
//         console.error("🔥 FATAL ERROR: JWT_SECRET is not defined in environment.");
//         throw new Error("Server configuration error.");
//       }

//       const { email } = requestPasswordResetSchema.parse(req.body);
//       const pool = await getDBPool();
//       const userResult = await pool
//         .request()
//         .input("Email", sql.NVarChar(255), email.toLowerCase())
//         .query(
//           "SELECT UserID, Email, IsActive FROM dbo.Users WHERE Email = @Email"
//         );

//       if (
//         userResult.recordset.length === 0 ||
//         !userResult.recordset[0].IsActive
//       ) {
//         console.log(
//           `ℹ️ Password reset requested for email (potentially non-existent/inactive): ${email}`
//         );
//         res.status(200).json({
//           message:
//             "If an account with this email exists and is active, a password reset link has been sent.",
//         });
//         return;
//       }

//       const user = userResult.recordset[0];
//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, user.UserID)
//         .query("DELETE FROM dbo.PasswordResetTokens WHERE UserID = @UserID");

//       // --- FIX: Cast the options object to SignOptions ---
//       const resetToken = jwt.sign(
//         { userId: user.UserID },
//         process.env.JWT_SECRET,
//         {
//           expiresIn: process.env.JWT_RESET_PASSWORD_EXPIRES_IN || "1h",
//         } as jwtSignOptions
//       );

//       const expiresAt = new Date(
//         Date.now() +
//           (parseInt(
//             process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES || "60"
//           ) *
//             60 *
//             1000)
//       );

//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, user.UserID)
//         .input("ResetToken", sql.NVarChar(255), resetToken)
//         .input("ExpiresAt", sql.DateTime2, expiresAt)
//         .query(
//           "INSERT INTO dbo.PasswordResetTokens (UserID, ResetToken, ExpiresAt) VALUES (@UserID, @ResetToken, @ExpiresAt)"
//         );

//       await sendPasswordResetEmail(user.Email, resetToken);
//       console.log(`🔑 JWT Password Reset Token generated for ${user.Email}`);

//       res.status(200).json({
//         message:
//           "If an account with this email exists and is active, a password reset link has been sent.",
//       });

//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Invalid email provided.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Request Password Reset error:", error);
//       next(error);
//     }
//   }
// );

// /************************reset-password*********************************/

// // --- POST /api/auth/reset-password ---
// router.post(
//   "/reset-password",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (!process.env.JWT_SECRET) {
//         console.error("🔥 FATAL ERROR: JWT_SECRET is not defined in environment.");
//         throw new Error("Server configuration error.");
//       }

//       const { token, newPassword } = resetPasswordSchema.parse(req.body);

//       let decodedPayload: any;
//       try {
//         decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
//       } catch (err) {
//         res.status(400).json({ message: "Invalid or expired password reset token." });
//         return;
//       }

//       const pool = await getDBPool();
//       const tokenResult = await pool
//         .request()
//         .input("ResetToken", sql.NVarChar(255), token)
//         .input("CurrentTime", sql.DateTime2, new Date())
//         .query(
//         `
//             SELECT prt.UserID, u.IsActive FROM dbo.PasswordResetTokens prt
//             INNER JOIN dbo.Users u ON prt.UserID = u.UserID
//             WHERE prt.ResetToken = @ResetToken AND prt.ExpiresAt > @CurrentTime AND u.IsActive = 1
//           `
//         );

//       if (tokenResult.recordset.length === 0) {
//         res.status(400).json({
//           message:
//             "This password reset link has already been used or is invalid.",
//         });
//         return;
//       }

//       const { UserID } = tokenResult.recordset[0];
//       const saltRounds = 12;
//       const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, UserID)
//         .input("PasswordHash", sql.NVarChar(sql.MAX), newPasswordHash)
//         .query(
//           "UPDATE dbo.Users SET PasswordHash = @PasswordHash, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         );

//       await pool
//         .request()
//         .input("ResetToken", sql.NVarChar(255), token)
//         .query(
//           "DELETE FROM dbo.PasswordResetTokens WHERE ResetToken = @ResetToken"
//         );

//       console.log(`✅ Password successfully reset for UserID: ${UserID}`);
//       res.status(200).json({
//         message: "Password has been reset successfully. You can now log in.",
//       });

//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Invalid data for password reset.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Reset Password error:", error);
//       next(error);
//     }
//   }
// );

// // --- Google OAuth Routes ---
// router.get(
//   "/google",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
//       const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET; // Not directly used for auth URL generation, but good to check existence
//       const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

//       if (!clientId || !clientSecret || !redirectUri) {
//         console.error(
//           "🔥 Google OAuth environment variables missing (CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI)."
//         );
//         res
//           .status(500)
//           .json({ message: "Server configuration error for Google Sign-In." });
//         return;
//       }

//       const oauth2Client = new OAuth2Client(
//         clientId,
//         // Client secret is not needed for generating the auth URL itself,
//         // but it's good practice to initialize the client with it if you plan to use this
//         // same client instance later for exchanging the code for tokens.
//         // For just generating the auth URL, client secret can be omitted here in constructor.
//         clientSecret,
//         redirectUri
//       );

//       // Define the scopes you want to request
//       const scopes = [
//         "https://www.googleapis.com/auth/userinfo.email", // Access user's email address
//         "https://www.googleapis.com/auth/userinfo.profile", // Access basic profile information (name, picture)
//         "openid", // Standard OpenID scope
//       ];

//       // Generate the URL that will redirect the user to Google's consent page
//       const authorizationUrl = oauth2Client.generateAuthUrl({
//         access_type: "offline", // Request a refresh token (for long-term access if needed, not strictly for basic sign-in)
//         // Use 'online' if you don't need a Google refresh token.
//         scope: scopes,
//         include_granted_scopes: true,
//         // prompt: 'consent' // Optional: forces the consent screen every time, useful for testing. Remove for production.
//       });

//       console.log("ℹ️ Redirecting to Google OAuth URL:", authorizationUrl);
//       res.redirect(authorizationUrl); // Redirect the user's browser
//     } catch (error) {
//       console.error("🔥 Error initiating Google OAuth flow:", error);
//       next(error); // Pass to global error handler
//     }
//   }
// );

// // --- CORRECTED: GET /api/auth/google/callback - Handles Google OAuth redirect ---
// router.get(
//   "/google/callback",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     // Google sends 'code' on success, or 'error' and 'error_description' on failure, directly as query parameters.
//     const code = req.query.code as string | undefined;
//     const googleErrorParam = req.query.error as string | undefined;
//     const errorDescriptionParam = req.query.error_description as
//       | string
//       | undefined;
//     const stateParam = req.query.state as string | undefined; // If you use state parameter

//     console.log(
//       "ℹ️ Google OAuth Callback received. Code:",
//       code,
//       "Error Param:",
//       googleErrorParam,
//       "Error Description Param:",
//       errorDescriptionParam,
//       "State Param:",
//       stateParam
//     );

//     // Handle error from Google (e.g., user denied access)
//     if (googleErrorParam) {
//       const errorMessage =
//         errorDescriptionParam ||
//         googleErrorParam ||
//         "Unknown error during Google OAuth.";
//       console.error("🔥 Error from Google OAuth provider:", errorMessage);
//       res.redirect(
//         // Use return here
//         `${
//           process.env.FRONTEND_URL || "http://localhost:3000"
//         }/auth/signin?error=google_oauth_failed&message=${encodeURIComponent(
//           errorMessage
//         )}`
//       );
//       return; // Important to return after redirect
//     }

//     // Handle missing authorization code
//     if (!code) {
//       // Already checked typeof code !== 'string' in previous snippet, this is simpler
//       console.error(
//         "🔥 No authorization code received from Google in callback."
//       );
//       res.redirect(
//         // Use return here
//         `${
//           process.env.FRONTEND_URL || "http://localhost:3000"
//         }/auth/signin?error=google_no_code&message=Authorization%20code%20missing%20from%20Google.`
//       );
//       return; // Important to return
//     }

//     try {
//       const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
//       const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
//       const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

//       if (!clientId || !clientSecret || !redirectUri) {
//         console.error(
//           "🔥 Google OAuth server environment variables missing (CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI)."
//         );
//         throw new Error("Server configuration error for Google Sign-In.");
//       }

//       const oauth2Client = new OAuth2Client(
//         clientId,
//         clientSecret,
//         redirectUri
//       );

//       console.log("ℹ️ Exchanging Google auth code for tokens...");
//       const { tokens } = await oauth2Client.getToken(code); // 'code' is already confirmed to be a string here
//       // ... (rest of your Google callback logic: verifyIdToken, find/create user, issueSessionTokens, update LastLoginAt, final redirect) ...
//       // This part should remain the same as the last fully working version.
//       // For example:
//       if (!tokens.id_token) {
//         throw new Error("Failed to retrieve ID token from Google.");
//       }
//       const ticket = await oauth2Client.verifyIdToken({
//         idToken: tokens.id_token,
//         audience: clientId,
//       });
//       const googlePayload = ticket.getPayload();
//       if (!googlePayload || !googlePayload.sub || !googlePayload.email) {
//         throw new Error("Invalid Google ID token payload.");
//       }

//       const googleUserId = googlePayload.sub;
//       const email = googlePayload.email.toLowerCase();
//       const firstName =
//         googlePayload.given_name || googlePayload.name?.split(" ")[0] || "User";
//       const lastName =
//         googlePayload.family_name ||
//         googlePayload.name?.split(" ").slice(1).join(" ") ||
//         "";
//       const pool = getDBPool();
//       let userFromDB: DbUser | undefined;

//       let userResultByGoogleID = await pool
//         .request()
//         .input("GoogleID", sql.NVarChar(255), googleUserId)
//         .query<DbUser>(
//           `SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role, GoogleID, AuthProvider, IsMfaEnabled, MfaSecret FROM dbo.Users WHERE GoogleID = @GoogleID`
//         );
//       userFromDB = userResultByGoogleID.recordset[0];

//       if (!userFromDB) {
//         let userResultByEmail = await pool
//           .request()
//           .input("Email", sql.NVarChar(255), email)
//           .query<DbUser>(
//             `SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role, GoogleID, AuthProvider, IsMfaEnabled, MfaSecret FROM dbo.Users WHERE Email = @Email`
//           );
//         userFromDB = userResultByEmail.recordset[0];
//         if (userFromDB) {
//           if (userFromDB.GoogleID !== googleUserId) {
//             await pool
//               .request()
//               .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
//               .input("GoogleID", sql.NVarChar(255), googleUserId)
//               .input("AuthProvider", sql.NVarChar(50), "google")
//               .query(
//                 "UPDATE dbo.Users SET GoogleID = @GoogleID, AuthProvider = @AuthProvider, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//               );
//             userFromDB.GoogleID = googleUserId;
//             userFromDB.AuthProvider = "google";
//           }
//         } else {
//           const defaultRole = "user";
//           const newUserResult = await pool
//             .request()
//             .input("FirstName", sql.NVarChar(100), firstName)
//             .input("LastName", sql.NVarChar(100), lastName)
//             .input("Email", sql.NVarChar(255), email)
//             .input("PasswordHash", sql.NVarChar(sql.MAX), null)
//             .input("Role", sql.NVarChar(50), defaultRole)
//             .input("GoogleID", sql.NVarChar(255), googleUserId)
//             .input("AuthProvider", sql.NVarChar(50), "google")
//             .input("IsActive", sql.Bit, 1)
//             .query<DbUser>(
//               `INSERT INTO dbo.Users (FirstName, LastName, Email, PasswordHash, Role, GoogleID, AuthProvider, IsActive, CreatedAt, UpdatedAt, IsMfaEnabled, MfaSecret)
//                        OUTPUT inserted.UserID, inserted.Email, inserted.PasswordHash, inserted.FirstName, inserted.LastName, inserted.IsActive, inserted.Role, inserted.GoogleID, inserted.AuthProvider, inserted.IsMfaEnabled, inserted.MfaSecret
//                        VALUES (@FirstName, @LastName, @Email, @PasswordHash, @Role, @GoogleID, @AuthProvider, @IsActive, SYSUTCDATETIME(), SYSUTCDATETIME(), 0, NULL)`
//             );
//           if (!newUserResult.recordset[0])
//             throw new Error("Failed to create new user via Google SSO.");
//           userFromDB = newUserResult.recordset[0];
//         }
//       }
//       if (!userFromDB || !userFromDB.IsActive) {
//         res.redirect(
//           `${
//             process.env.FRONTEND_URL || "http://localhost:3000"
//           }/auth/signin?error=account_issue_google&message=Account%20is%20inactive%20or%20could%20not%20be%20verified.`
//         );
//         return; // return after redirect
//       }

//       await issueSessionTokens(res, userFromDB, pool);

//       pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
//         .input("AuthProvider", sql.NVarChar(50), "google")
//         .query(
//           "UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME(), AuthProvider = @AuthProvider WHERE UserID = @UserID"
//         )
//         .catch((dbErr: any) =>
//           console.error(
//             "🔥 Failed to update LastLoginAt/AuthProvider post Google SSO:",
//             dbErr.message || dbErr
//           )
//         );

//       console.log(
//         `✅ Google Sign-In successful for ${userFromDB.Email}. App session cookies set. Redirecting to /profile.`
//       );
//       res.redirect(
//         `${process.env.FRONTEND_URL || "http://localhost:3000"}/profile`
//       );
//     } catch (error) {
//       console.error("🔥 Google OAuth Callback Error:", error);
//       const specificError =
//         error instanceof Error ? error.message : String(error);
//       res.redirect(
//         `${
//           process.env.FRONTEND_URL || "http://localhost:3000"
//         }/auth/signin?error=google_callback_failed&message=${encodeURIComponent(
//           specificError
//         )}`
//       );
//     }
//   }
// );

// export default router;

// // backend/src/routes/authRoutes.ts

// import express, { Router, Request, Response, NextFunction } from "express";
// import bcrypt from "bcrypt";
// import jwt, {
//   JwtPayload,
//   Secret,
//   SignOptions as jwtSignOptions,
// } from "jsonwebtoken";
// import crypto from "crypto";
// import { z, ZodError } from "zod";
// import { getDBPool, sql } from "../config/db"; // Sicherstellen, dass dieser Pfad korrekt ist
// import { OAuth2Client } from "google-auth-library";
// import { authenticator } from "otplib"; // Für MFA (TOTP) Überprüfung
// import { decryptMfaSecret } from "../utils/encryption"; // Hilfsfunktion zur Entschlüsselung von MFA-Secrets
// import { protect as authMiddleware } from "../middleware/authMiddleware";
// import { sendPasswordResetEmail } from "../utils/emailService"; // Import des E-Mail-Dienstes für Passwort-Resets

// const router: Router = express.Router();

// // Logging zur Kontrolle beim Laden des Moduls
// console.log(
//   "🔑 authRoutes.ts: Modul geladen. Überprüfe, ob .env Variablen zugänglich sind."
// );

// // --- Interfaces ---
// // ---------------------------------------------------
// // ✅ Interface für Nutzerinformationen, die im JWT Access Token gespeichert werden
// //    und für die Session-Token-Ausstellung verwendet werden.
// // ---------------------------------------------------
// interface UserDataForToken {
//   UserID: string; // Benutzer-ID aus der Datenbank
//   Email: string; // E-Mail-Adresse des Benutzers
//   Role: string; // Rolle des Benutzers (z.B. 'user', 'admin')
// }

// // ---------------------------------------------------
// // ✅ Interface für den vollständigen Benutzer-Datensatz, wie er aus der Datenbank
// //    abgerufen wird (z.B. für Login- oder Google-Callback-Vorgänge).
// //    Erweitert 'UserDataForToken' um zusätzliche Datenbankfelder.
// // ---------------------------------------------------
// interface DbUser extends UserDataForToken {
//   PasswordHash: string | null; // Gehashter Passwort-String, kann bei OAuth null sein
//   FirstName: string | null; // Vorname des Benutzers
//   LastName: string | null; // Nachname des Benutzers
//   IsActive: boolean; // Status, ob das Konto aktiv ist
//   GoogleID: string | null; // Google-ID, falls über Google SSO registriert
//   AuthProvider: string | null; // Authentifizierungsanbieter (z.B. 'email', 'google')
//   IsMfaEnabled?: boolean; // Optional: Ist MFA für diesen Benutzer aktiviert?
//   MfaSecret?: string | null; // Optional: Das verschlüsselte MFA-Secret
// }

// // ---------------------------------------------------
// // ✅ Interface für die Datenstruktur, die bei der Validierung von Refresh Tokens
// //    aus der Datenbank zurückgegeben wird.
// //    WICHTIG: Diese Definition wurde nach oben verschoben, um den TypeScript-Fehler
// //    "Cannot find name 'RefreshTokenQueryResult'" zu beheben, da Interfaces vor
// //    ihrer Verwendung definiert sein müssen.
// // ---------------------------------------------------
// interface RefreshTokenQueryResult {
//   UserID: string; // Benutzer-ID
//   Email: string; // E-Mail des Benutzers
//   Role: string; // Rolle des Benutzers
//   FirstName: string | null; // Vorname des Benutzers
//   LastName: string | null; // Nachname des Benutzers
//   UserIsActive: boolean; // Aktivitätsstatus des Benutzers (aus dbo.Users u.IsActive)
//   TokenExpiresAt: Date; // Ablaufdatum des Refresh Tokens (aus rt.ExpiresAt)
//   IsRevoked: boolean; // Revokierungsstatus des Refresh Tokens (aus rt.IsRevoked)
// }

// // --- Zod Schemas zur Validierung der Request-Bodies ---
// // ---------------------------------------------
// // ✅ Schema für Passwortänderung (Validierung)
// //    Stellt sicher, dass das aktuelle Passwort angegeben ist, das neue Passwort
// //    Mindestanforderungen erfüllt und die Bestätigung übereinstimmt.
// // ---------------------------------------------
// const changePasswordSchema = z
//   .object({
//     currentPassword: z
//       .string()
//       .min(1, { message: "Aktuelles Passwort ist erforderlich." }),
//     newPassword: z
//       .string()
//       .min(8, {
//         message: "Neues Passwort muss mindestens 8 Zeichen enthalten.",
//       })
//       .max(100),
//     confirmNewPassword: z.string(),
//   })
//   .refine((data) => data.newPassword === data.confirmNewPassword, {
//     message: "Die neuen Passwörter stimmen nicht überein.",
//     path: ["confirmNewPassword"],
//   })
//   .refine((data) => data.currentPassword !== data.newPassword, {
//     message:
//       "Das neue Passwort darf nicht mit dem aktuellen Passwort übereinstimmen.",
//     path: ["newPassword"],
//   });

// // ---------------------------------------------
// // ✅ Schema für den Login-Vorgang
// //    Erfordert eine gültige E-Mail-Adresse und ein nicht leeres Passwort.
// // ---------------------------------------------
// const loginSchema = z.object({
//   email: z
//     .string()
//     .email({ message: "Eine gültige E-Mail-Adresse ist erforderlich." }),
//   password: z
//     .string()
//     .min(1, { message: "Das Passwort darf nicht leer sein." }),
// });

// // ---------------------------------------------
// // ✅ Schema für die Benutzerregistrierung
// //    Erfordert Vorname, Nachname, eine gültige E-Mail und ein Passwort, das
// //    Mindestanforderungen erfüllt und bestätigt wird.
// // ---------------------------------------------
// const registerSchema = z
//   .object({
//     firstName: z
//       .string()
//       .min(1, { message: "Vorname ist erforderlich." })
//       .max(100),
//     lastName: z
//       .string()
//       .min(1, { message: "Nachname ist erforderlich." })
//       .max(100),
//     email: z
//       .string()
//       .email({ message: "Eine gültige E-Mail-Adresse ist erforderlich." })
//       .max(255),
//     password: z
//       .string()
//       .min(8, { message: "Passwort muss mindestens 8 Zeichen lang sein." })
//       .max(100),
//     passwordConfirmation: z.string(),
//   })
//   .refine((data) => data.password === data.passwordConfirmation, {
//     message: "Die Passwörter stimmen nicht überein.",
//     path: ["passwordConfirmation"],
//   });

// // ---------------------------------------------
// // ✅ Schema für die Anforderung eines Passwort-Resets
// //    Erfordert lediglich eine gültige E-Mail-Adresse.
// // ---------------------------------------------
// const requestPasswordResetSchema = z.object({
//   email: z
//     .string()
//     .email({ message: "Eine gültige E-Mail-Adresse ist erforderlich." }),
// });

// // ---------------------------------------------
// // ✅ Schema für das Setzen eines neuen Passworts nach einem Reset-Link
// //    Erfordert den Reset-Token und ein neues Passwort, das den Anforderungen
// //    entspricht und bestätigt wird.
// // ---------------------------------------------
// const resetPasswordSchema = z
//   .object({
//     token: z.string().min(1, { message: "Reset-Token ist erforderlich." }),
//     newPassword: z
//       .string()
//       .min(8, {
//         message: "Das neue Passwort muss mindestens 8 Zeichen enthalten.",
//       })
//       .max(100),
//     confirmNewPassword: z.string(),
//   })
//   .refine((data) => data.newPassword === data.confirmNewPassword, {
//     message: "Die neuen Passwörter stimmen nicht überein.",
//     path: ["confirmNewPassword"],
//   });

// // ---------------------------------------------
// // ✅ Schema für die MFA-Verifizierung während des Login-Prozesses
// //    Erfordert die Benutzer-ID (UUID) und einen 6-stelligen TOTP-Code.
// // ---------------------------------------------
// const verifyMfaLoginSchema = z.object({
//   userId: z
//     .string()
//     .uuid({ message: "Gültige Benutzer-ID (UUID) ist erforderlich." }),
//   totpCode: z
//     .string()
//     .length(6, { message: "TOTP-Code muss 6 Ziffern lang sein." })
//     .regex(/^\d{6}$/, { message: "Ungültiges TOTP-Code-Format." }),
// });

// // --- Hilfsfunktionen ---
// // ---------------------------------------------
// // ✅ Hilfsfunktion: Erstellt einen SHA256-Hash eines Tokens
// //    Wird verwendet, um Refresh Tokens in der Datenbank sicher zu speichern.
// // ---------------------------------------------
// const hashToken = (token: string): string => {
//   return crypto.createHash("sha256").update(token).digest("hex");
// };

// // ---------------------------------------------------------------------
// // ✅ Hilfsfunktion zur Erstellung und zum Setzen von Access- und Refresh-Tokens
// //    Setzt JWTs als HTTP-Only-Cookies nach erfolgreicher Authentifizierung.
// // ---------------------------------------------------------------------
// async function issueSessionTokens(
//   res: Response,
//   user: UserDataForToken,
//   pool: any // Typisiert als 'any' für mssql.ConnectionPool
// ): Promise<void> {
//   const jwtSecret = process.env.JWT_SECRET;
//   const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";

//   // Sicherheitsprüfung: JWT_SECRET muss in den Umgebungsvariablen konfiguriert sein
//   if (!jwtSecret) {
//     console.error(
//       "🔥 KRITISCH: JWT_SECRET ist nicht konfiguriert für die Token-Ausstellung."
//     );
//     throw new Error("Server-Konfigurationsfehler: JWT_SECRET fehlt.");
//   }

//   // 📌 Erstellung des Access Tokens (Kurzlebiger JWT)
//   const accessTokenPayload = {
//     userId: user.UserID,
//     email: user.Email,
//     role: user.Role,
//   };
//   const accessToken = jwt.sign(accessTokenPayload, jwtSecret, {
//     expiresIn: jwtExpiresIn,
//   } as jwtSignOptions); // Typ-Assertion, um die korrekten Optionen zu gewährleisten

//   const accessTokenCookieName =
//     process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
//   let accessTokenMaxAgeMs = 15 * 60 * 1000; // Standard: 15 Minuten (in Millisekunden)

//   // Umrechnung der Ablaufzeit des Access Tokens in Millisekunden für das Cookie
//   if (jwtExpiresIn.endsWith("s")) {
//     accessTokenMaxAgeMs = parseInt(jwtExpiresIn.replace("s", ""), 10) * 1000;
//   } else if (jwtExpiresIn.endsWith("m")) {
//     accessTokenMaxAgeMs =
//       parseInt(jwtExpiresIn.replace("m", ""), 10) * 60 * 1000;
//   } else if (jwtExpiresIn.endsWith("h")) {
//     accessTokenMaxAgeMs =
//       parseInt(jwtExpiresIn.replace("h", ""), 10) * 60 * 60 * 1000;
//   }

//   // Setzen des Access Token Cookies
//   res.cookie(accessTokenCookieName, accessToken, {
//     httpOnly: true, // Macht das Cookie unzugänglich für clientseitiges JavaScript
//     secure: process.env.NODE_ENV === "production", // Nur über HTTPS in Produktion senden
//     sameSite: "lax" as const, // Schutz vor CSRF-Angriffen (lax ist ein guter Standard)
//     path: "/api", // Pfad, für den das Cookie gültig ist
//     maxAge: accessTokenMaxAgeMs, // Ablaufzeit des Cookies
//   });
//   console.log(
//     `🍪 Access Token-Cookie ('${accessTokenCookieName}') gesetzt. Dauer: ${
//       accessTokenMaxAgeMs / 1000
//     }s für Benutzer-ID: ${user.UserID}`
//   );

//   // 📌 Erstellung des Refresh Tokens (Langlebiges Token zur Erneuerung des Access Tokens)
//   const refreshToken = crypto.randomBytes(64).toString("hex"); // Generiert ein zufälliges, langes Token
//   const refreshTokenHash = hashToken(refreshToken); // Hashen für die sichere Speicherung in der DB

//   const envRefreshTokenSeconds = process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS;
//   console.log(
//     `[issueSessionTokens] Lese REFRESH_TOKEN_EXPIRES_IN_SECONDS: "${envRefreshTokenSeconds}" für Benutzer-ID: ${user.UserID}`
//   );
//   const refreshTokenLifetimeSeconds = parseInt(
//     envRefreshTokenSeconds || (7 * 24 * 60 * 60).toString(), // Standard: 7 Tage in Sekunden
//     10
//   );

//   const refreshTokenExpiresAt = new Date(
//     Date.now() + refreshTokenLifetimeSeconds * 1000
//   );
//   const refreshTokenCookieName =
//     process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

//   // Vor dem Einfügen eines neuen Refresh Tokens:
//   // Alle alten, nicht widerrufenen Refresh Tokens für diesen Benutzer ungültig machen.
//   // Dies erhöht die Sicherheit (Rotation) und verhindert die Wiederverwendung älterer Tokens.
//   await pool
//     .request()
//     .input("UserID", sql.UniqueIdentifier, user.UserID)
//     .query(
//       "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID AND IsRevoked = 0"
//     );

//   // Speichern des neuen Refresh Token Hash in der Datenbank
//   await pool
//     .request()
//     .input("UserID", sql.UniqueIdentifier, user.UserID)
//     .input("TokenHash", sql.NVarChar(256), refreshTokenHash)
//     .input("ExpiresAt", sql.DateTime2, refreshTokenExpiresAt)
//     .query(
//       "INSERT INTO dbo.RefreshTokens (UserID, TokenHash, ExpiresAt, IsRevoked) VALUES (@UserID, @TokenHash, @ExpiresAt, 0)"
//     );

//   // Setzen des Refresh Token Cookies
//   res.cookie(refreshTokenCookieName, refreshToken, {
//     httpOnly: true, // Muss HTTP-Only sein
//     secure: process.env.NODE_ENV === "production", // Nur über HTTPS in Produktion
//     sameSite: "lax" as const, // Standardmäßig lax, kann bei Bedarf auf "strict" gesetzt werden
//     path: "/api/auth/refresh-token", // Spezifischer Pfad, da es nur von diesem Endpunkt verwendet wird
//     maxAge: refreshTokenLifetimeSeconds * 1000, // Ablaufzeit des Cookies
//   });
//   console.log(
//     `🍪 Refresh Token-Cookie ('${refreshTokenCookieName}') gesetzt. Dauer: ${refreshTokenLifetimeSeconds}s für Benutzer-ID: ${user.UserID}`
//   );
//   // Hinweis: Diese Hilfsfunktion setzt nur Cookies. Die aufrufende Route ist
//   // dafür verantwortlich, die endgültige JSON-Antwort zu senden.
// }

// // --- Routen-Definitionen ---

// // -------------------------------------------------------------------
// // POST /api/auth/change-password
// // Ermöglicht einem authentifizierten Benutzer, sein Passwort zu ändern.
// // Geschützt durch die 'authMiddleware'.
// // -------------------------------------------------------------------
// router.post(
//   "/change-password",
//   authMiddleware, // Stellt sicher, dass der Benutzer eingeloggt ist
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       // req.user wird von der authMiddleware gesetzt und enthält die Benutzerinformationen
//       if (!req.user || !req.user.userId) {
//         res.status(401).json({
//           message: "Benutzer nicht authentifiziert oder Sitzung ungültig.",
//         });
//         return;
//       }
//       const { userId } = req.user; // Hole die Benutzer-ID aus der authentifizierten Sitzung

//       // Validierung des Request-Bodys mit Zod
//       const { currentPassword, newPassword } = changePasswordSchema.parse(
//         req.body
//       );

//       const pool = getDBPool();

//       // 🔍 1. Aktuellen Passwort-Hash und Authentifizierungsanbieter des Benutzers abrufen
//       //    Stellt sicher, dass der Benutzer aktiv ist und ein Passwort ändern kann (d.h. kein reiner OAuth-Benutzer).
//       const userResult = await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .query(
//           "SELECT PasswordHash, AuthProvider FROM dbo.Users WHERE UserID = @UserID AND IsActive = 1"
//         );

//       if (userResult.recordset.length === 0) {
//         // Dieser Fall sollte idealerweise nicht eintreten, wenn die authMiddleware den Benutzer bereits verifiziert hat
//         res
//           .status(404)
//           .json({ message: "Benutzer nicht gefunden oder Konto ist inaktiv." });
//         return;
//       }
//       const userData = userResult.recordset[0];

//       // ⚠️ 2. Prüfen, ob eine Passwortänderung für diesen Kontotyp zulässig ist
//       //    Wenn der Benutzer sich über Google oder einen anderen OAuth-Anbieter registriert hat,
//       //    oder wenn PasswordHash aus irgendeinem Grund NULL ist.
//       if (userData.AuthProvider !== "email" || !userData.PasswordHash) {
//         res.status(400).json({
//           message:
//             "Passwortänderung ist für diesen Kontotyp nicht möglich. Benutzer, die sich mit externen Anbietern registriert haben, sollten ihre Passwörter dort verwalten.",
//         });
//         return;
//       }

//       // 🔐 3. Aktuelles Passwort verifizieren
//       const isCurrentPasswordMatch = await bcrypt.compare(
//         currentPassword,
//         userData.PasswordHash
//       );
//       if (!isCurrentPasswordMatch) {
//         res
//           .status(400)
//           .json({
//             message: "Aktuelles Passwort ist falsch. Bitte erneut versuchen.",
//           });
//         return;
//       }

//       // 4. Das neue Passwort hashen
//       const saltRounds = 12; // Gleiche Salt-Runden wie bei der Registrierung
//       const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

//       // 5. Den neuen Passwort-Hash in der Datenbank aktualisieren
//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .input("NewPasswordHash", sql.NVarChar(sql.MAX), newPasswordHash)
//         .query(
//           "UPDATE dbo.Users SET PasswordHash = @NewPasswordHash, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         );

//       console.log(
//         `✅ Passwort erfolgreich geändert für Benutzer-ID: ${userId}`
//       );

//       // OPTIONAL, ABER EMPFOHLEN: Andere aktive Sitzungen für diesen Benutzer ungültig machen.
//       // Dies geschieht typischerweise durch das Widerrufen aller ihrer Refresh Tokens.
//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId)
//         .query(
//           "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID"
//         );
//       console.log(
//         `ℹ️ Alle Refresh Tokens für Benutzer-ID: ${userId} nach der Passwortänderung zur Verbesserung der Sicherheit widerrufen.`
//       );
//       // Hinweis: Das Refresh Token-Cookie der aktuellen Sitzung auf dem Client ist jetzt ungültig.
//       // Das Access Token bleibt bis zu seinem Ablauf gültig. Der Benutzer muss sich möglicherweise
//       // auf anderen Geräten erneut anmelden, und auf diesem Gerät, sobald das Access Token abläuft
//       // und die Aktualisierung fehlschlägt. Für eine bessere UX könnte man hier neue Tokens ausstellen,
//       // aber das ist komplexer.

//       res.status(200).json({
//         message:
//           "Passwort erfolgreich geändert. Du musst dich möglicherweise auf anderen Geräten erneut anmelden.",
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Ungültige Daten für die Passwortänderung bereitgestellt.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Fehler beim Ändern des Passworts:", error);
//       next(error); // Fehler an den globalen Fehler-Handler weiterleiten
//     }
//   }
// );

// // -------------------------------------------------------------------
// // POST /api/auth/register
// // Registrierung eines neuen Benutzers mit E-Mail und Passwort.
// // -------------------------------------------------------------------
// router.post(
//   "/register",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const validatedBody = registerSchema.parse(req.body);
//       const { firstName, lastName, email, password } = validatedBody;
//       const pool = getDBPool();

//       // 🔍 Prüfe, ob bereits ein Benutzer mit dieser E-Mail-Adresse existiert
//       const userExistsResult = await pool
//         .request()
//         .input("Email", sql.NVarChar(255), email.toLowerCase())
//         .query("SELECT UserID FROM dbo.Users WHERE Email = @Email");

//       if (userExistsResult.recordset.length > 0) {
//         res.status(409).json({
//           message:
//             "Konflikt: Ein Konto mit dieser E-Mail-Adresse existiert bereits.",
//         });
//         return;
//       }

//       // 🔐 Passwort hashen (Salt-Runden 12 für gute Sicherheit)
//       const saltRounds = 12;
//       const passwordHash = await bcrypt.hash(password, saltRounds);

//       const defaultRole = "user"; // Standardrolle für neue Benutzer

//       // 📝 Neuen Benutzer in die Datenbank einfügen
//       // GoogleID, MfaSecret und IsMfaEnabled werden hier standardmäßig gesetzt (NULL/0)
//       const insertUserResult = await pool
//         .request()
//         .input("FirstName", sql.NVarChar(100), firstName)
//         .input("LastName", sql.NVarChar(100), lastName)
//         .input("Email", sql.NVarChar(255), email.toLowerCase())
//         .input("PasswordHash", sql.NVarChar(sql.MAX), passwordHash) // Annahme: PasswordHash ist NICHT NULL
//         .input("Role", sql.NVarChar(50), defaultRole)
//         .input("AuthProvider", sql.NVarChar(50), "email") // Explizit den Authentifizierungsanbieter setzen
//         .query(`
//           INSERT INTO dbo.Users (FirstName, LastName, Email, PasswordHash, Role, AuthProvider, IsActive, CreatedAt, UpdatedAt)
//           OUTPUT inserted.UserID, inserted.Email, inserted.FirstName, inserted.LastName, inserted.Role, inserted.CreatedAt, inserted.IsActive
//           VALUES (@FirstName, @LastName, @Email, @PasswordHash, @Role, @AuthProvider, 1, SYSUTCDATETIME(), SYSUTCDATETIME())
//         `);

//       if (!insertUserResult.recordset[0]) {
//         throw new Error(
//           "Benutzerregistrierung fehlgeschlagen, kein Datensatz zurückgegeben."
//         );
//       }

//       const newUser = insertUserResult.recordset[0];
//       console.log("✅ Benutzer erfolgreich registriert:", {
//         userId: newUser.UserID,
//         email: newUser.Email,
//         role: newUser.Role,
//       });

//       res.status(201).json({
//         message: "Benutzer erfolgreich registriert! Bitte melde dich an.",
//         user: {
//           id: newUser.UserID,
//           firstName: newUser.FirstName,
//           lastName: newUser.LastName,
//           email: newUser.Email,
//           role: newUser.Role,
//           isActive: newUser.IsActive,
//           createdAt: newUser.CreatedAt,
//           // isMfaEnabled wird standardmäßig auf 0 (false) aus dem DB-Schema gesetzt
//         },
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Validierung fehlgeschlagen während der Registrierung.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Fehler im Registrierung-Endpunkt:", error);
//       next(error); // Fehler an den globalen Fehler-Handler weiterleiten
//     }
//   }
// );

// // -------------------------------------------------------------------
// // POST /api/auth/login
// // Handhabt den Benutzer-Login mit E-Mail/Passwort und integriert MFA-Prüfung.
// // -------------------------------------------------------------------
// router.post(
//   "/login",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       // 🔎 Eingabevalidierung des Login-Schemas mit Zod
//       const validatedBody = loginSchema.parse(req.body);
//       const { email, password } = validatedBody;
//       const pool = getDBPool();

//       // 📦 Benutzer anhand E-Mail-Adresse aus der Datenbank laden
//       // Alle notwendigen Felder, einschließlich IsMfaEnabled und MfaSecret, werden abgefragt.
//       const userResult = await pool
//         .request()
//         .input("Email", sql.NVarChar(255), email.toLowerCase()).query<DbUser>(`
//           SELECT
//             UserID, Email, PasswordHash, FirstName, LastName,
//             IsActive, Role, IsMfaEnabled, MfaSecret, AuthProvider
//           FROM dbo.Users
//           WHERE Email = @Email
//         `);

//       if (userResult.recordset.length === 0) {
//         // Benutzer existiert nicht oder E-Mail ist falsch
//         res
//           .status(401)
//           .json({ message: "Ungültige Anmeldedaten bereitgestellt." });
//         return;
//       }
//       const userFromDB = userResult.recordset[0];

//       // 🔒 Kontoaktivität prüfen
//       if (!userFromDB.IsActive) {
//         res
//           .status(403)
//           .json({
//             message: "Konto ist inaktiv. Bitte wende dich an den Support.",
//           });
//         return;
//       }

//       // 🔐 Prüfen, ob ein Passwort-Login für diesen Benutzerkontotyp zulässig ist
//       // Dies differenziert zwischen E-Mail-Passwort-Benutzern und OAuth-only-Benutzern.
//       if (!userFromDB.PasswordHash) {
//         if (userFromDB.AuthProvider !== "email") {
//           console.warn(
//             `⚠️ Login-Versuch für Benutzer ${email} ohne Passwort-Hash (AuthProvider: ${userFromDB.AuthProvider}).`
//           );
//           res.status(401).json({
//             message: `Dieses Konto wurde mit ${
//               userFromDB.AuthProvider || "einem externen Anbieter"
//             } erstellt. Bitte melde dich über diese Methode an.`,
//           });
//           return;
//         } else {
//           // Dies ist ein Fehlerzustand: Ein E-Mail-Benutzer sollte einen Passwort-Hash haben
//           console.error(
//             `🔥 Benutzer ${email} (AuthProvider 'email') hat keinen PasswordHash! Konto möglicherweise beschädigt oder falsch erstellt.`
//           );
//           res.status(500).json({
//             message: "Fehlerhafte Kontokonfiguration. Login nicht möglich.",
//           });
//           return;
//         }
//       }

//       // 🔍 Passwort überprüfen
//       const isPasswordMatch = await bcrypt.compare(
//         password,
//         userFromDB.PasswordHash
//       );
//       if (!isPasswordMatch) {
//         res
//           .status(401)
//           .json({ message: "Ungültige Anmeldedaten bereitgestellt." });
//         return;
//       }

//       // 🔐 MFA-Prüfung: Wenn MFA aktiviert ist, eine MFA-Challenge senden
//       if (userFromDB.IsMfaEnabled && userFromDB.MfaSecret) {
//         console.log(
//           `ℹ️ MFA ist für Benutzer ${email} aktiviert. MFA-Challenge erforderlich.`
//         );
//         res.status(200).json({
//           mfaRequired: true,
//           userId: userFromDB.UserID, // Sende die Benutzer-ID, um sie mit dem MFA-Verifizierungsschritt zu verknüpfen
//           message: "Passwort verifiziert. Bitte gib deinen MFA-Code ein.",
//         });
//         return; // Hier stoppen, auf MFA-Verifizierung warten
//       }

//       // ✅ MFA NICHT aktiviert: Direkt mit der Standard-Token-Ausstellung fortfahren
//       console.log(
//         `ℹ️ MFA ist NICHT für Benutzer ${email} aktiviert oder kein MfaSecret gefunden. Fahre mit der Standard-Token-Ausstellung fort.`
//       );
//       await issueSessionTokens(res, userFromDB, pool); // Ruft die Hilfsfunktion auf

//       // Letzte Login-Zeit in der Datenbank aktualisieren (asynchron, Fehler werden nur geloggt)
//       pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
//         .query(
//           "UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         )
//         .catch((dbErr: any) =>
//           console.error(
//             "🔥 Fehler beim Aktualisieren von LastLoginAt nach dem Login:",
//             dbErr.message || dbErr
//           )
//         );

//       console.log(
//         `✅ Login erfolgreich für ${userFromDB.Email} (MFA nicht erforderlich).`
//       );
//       // Sende die endgültige JSON-Antwort
//       res.status(200).json({
//         mfaRequired: false,
//         message: "Login erfolgreich! Sitzung wurde gestartet.",
//         user: {
//           // Sicherstellen, dass diese Struktur dem Frontend-UserData-Typ entspricht
//           id: userFromDB.UserID,
//           firstName: userFromDB.FirstName,
//           lastName: userFromDB.LastName,
//           email: userFromDB.Email,
//           role: userFromDB.Role,
//           isMfaEnabled: userFromDB.IsMfaEnabled, // Sende auch den aktuellen MFA-Status
//         },
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Validierung fehlgeschlagen.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Fehler im Login-Endpunkt:", error);
//       if (!res.headersSent) {
//         // Prüfen, ob Header bereits gesendet wurden (z.B. von issueSessionTokens, wenn es frühzeitig einen Fehler ausgelöst hat)
//         next(error); // Andernfalls an den globalen Fehler-Handler weiterleiten
//       }
//     }
//   }
// );

// // -------------------------------------------------------------------
// // POST /api/auth/verify-mfa
// // Wird aufgerufen NACHdem die E-Mail/Passwort-Kombination erfolgreich war
// // und MFA für den Benutzer aktiviert ist.
// // -------------------------------------------------------------------
// router.post(
//   "/verify-mfa",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       // 📥 Eingabedaten validieren: userId und TOTP-Code (muss 6-stellig sein)
//       const { userId, totpCode } = verifyMfaLoginSchema.parse(req.body);
//       const pool = getDBPool();

//       // 🔍 Benutzerdaten abrufen (einschließlich IsMfaEnabled und MfaSecret)
//       const userResult = await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userId).query<DbUser>(`
//           SELECT
//             UserID, Email, FirstName, LastName,
//             IsActive, Role, IsMfaEnabled, MfaSecret
//           FROM dbo.Users
//           WHERE UserID = @UserID
//         `);

//       if (userResult.recordset.length === 0) {
//         res
//           .status(401)
//           .json({ message: "Benutzer zur MFA-Verifizierung nicht gefunden." });
//         return;
//       }
//       const userFromDB = userResult.recordset[0];

//       // 🚫 Prüfen, ob das Konto inaktiv ist
//       if (!userFromDB.IsActive) {
//         res.status(403).json({ message: "Konto ist inaktiv." });
//         return;
//       }

//       // 🔐 Prüfen, ob MFA für dieses Konto ordnungsgemäß aktiviert ist
//       if (!userFromDB.IsMfaEnabled || !userFromDB.MfaSecret) {
//         console.warn(
//           `⚠️ MFA-Verifizierung angefordert für Benutzer-ID: ${userId}, aber MFA ist nicht ordnungsgemäß aktiviert oder Secret fehlt.`
//         );
//         res.status(400).json({
//           message:
//             "MFA ist für dieses Konto nicht aktiviert oder die Einrichtung ist unvollständig.",
//         });
//         return;
//       }

//       // 🔓 MFA-Secret entschlüsseln (es wird verschlüsselt in der DB gespeichert)
//       const decryptedMfaSecret = decryptMfaSecret(userFromDB.MfaSecret);
//       if (!decryptedMfaSecret) {
//         console.error(
//           `🔥 Fehler beim Entschlüsseln des MFA-Secrets für Benutzer-ID: ${userId} während der Login-Verifizierung.`
//         );
//         res.status(500).json({
//           message:
//             "MFA-Überprüfung fehlgeschlagen aufgrund eines Sicherheitsproblems bei der Konfiguration.",
//         });
//         return;
//       }

//       // 🔍 TOTP-Code mit der 'otplib'-Bibliothek verifizieren
//       const isValid = authenticator.verify({
//         token: totpCode,
//         secret: decryptedMfaSecret,
//         // Optional: 'window: 1' kann hinzugefügt werden, um eine geringfügige Zeitabweichung zuzulassen (1 vorheriges/nächstes Token)
//       });

//       if (!isValid) {
//         console.warn(
//           `⚠️ MFA-Verifizierung fehlgeschlagen für Benutzer-ID: ${userId}. Ungültiger TOTP-Code.`
//         );
//         res
//           .status(401)
//           .json({ message: "Ungültiger MFA-Code. Bitte erneut versuchen." });
//         return;
//       }

//       // ✅ MFA-Code erfolgreich verifiziert. Session-Tokens ausstellen.
//       console.log(
//         `✅ MFA-Code verifiziert für Benutzer-ID: ${userId}. Volle Session-Tokens werden ausgestellt.`
//       );
//       // Sicherstellen, dass userFromDB die 'UserDataForToken'-Struktur erfüllt
//       await issueSessionTokens(res, userFromDB, pool);

//       // Letzte Login-Zeit in der Datenbank aktualisieren (im Hintergrund, Fehler ignorieren)
//       pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
//         .query(
//           "UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//         )
//         .catch((dbErr: any) =>
//           console.error(
//             "🔥 Fehler beim Aktualisieren von LastLoginAt nach der MFA-Verifizierung:",
//             dbErr.message || dbErr
//           )
//         );

//       res.status(200).json({
//         message: "MFA-Verifizierung erfolgreich! Login abgeschlossen.",
//         user: {
//           id: userFromDB.UserID,
//           firstName: userFromDB.FirstName,
//           lastName: userFromDB.LastName,
//           email: userFromDB.Email,
//           role: userFromDB.Role,
//           isMfaEnabled: userFromDB.IsMfaEnabled,
//         },
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Ungültige Daten für die MFA-Verifizierung.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Fehler im /verify-mfa-Endpunkt:", error);
//       if (!res.headersSent) {
//         next(error); // Fehler an den globalen Fehler-Handler weiterleiten
//       }
//     }
//   }
// );

// // -------------------------------------------------------------------
// // POST /api/auth/refresh-token
// // Zweck: Erzeugt ein neues Access Token, falls der Benutzer ein gültiges
// //        Refresh Token als HTTP-Only-Cookie besitzt.
// // -------------------------------------------------------------------
// router.post(
//   "/refresh-token",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     // 🔍 Name des Refresh Token Cookies aus .env oder Fallback auf "refreshToken"
//     const refreshTokenCookieName =
//       process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

//     // 🧁 Refresh Token aus dem eingehenden HTTP-Cookie auslesen
//     const incomingRefreshToken = req.cookies
//       ? req.cookies[refreshTokenCookieName]
//       : undefined;

//     console.log(
//       `🔄 /api/auth/refresh-token: Endpunkt aufgerufen. Cookie '${refreshTokenCookieName}' ist ${
//         incomingRefreshToken ? "vorhanden" : "nicht vorhanden"
//       }`
//     );

//     // 🚫 Kein Refresh Token im Cookie → Zugriff verweigert
//     if (!incomingRefreshToken) {
//       res
//         .status(401)
//         .json({ message: "Zugriff verweigert. Kein Refresh-Token gesendet." });
//       return;
//     }

//     try {
//       const pool = getDBPool();

//       // 🧮 Eingehendes Token hashen, da in der Datenbank nur gehashte Tokens gespeichert sind (Sicherheitsprinzip!)
//       const hashedIncomingRefreshToken = hashToken(incomingRefreshToken);

//       // 🔍 In der Datenbank nach dem gehashten Token suchen und zugehörige Benutzerdaten abrufen
//       const tokenResult = await pool
//         .request()
//         .input("TokenHash", sql.NVarChar(256), hashedIncomingRefreshToken)
//         .query<RefreshTokenQueryResult>(`
//           SELECT
//             rt.UserID, rt.ExpiresAt AS TokenExpiresAt, rt.IsRevoked,
//             u.Email, u.Role, u.IsActive AS UserIsActive, u.FirstName, u.LastName
//           FROM dbo.RefreshTokens rt
//           INNER JOIN dbo.Users u ON rt.UserID = u.UserID
//           WHERE rt.TokenHash = @TokenHash
//         `);

//       // 🚫 Kein Treffer in der Datenbank → Token ungültig oder manipuliert
//       if (tokenResult.recordset.length === 0) {
//         console.warn(
//           `🔄 Refresh-Token nicht in DB gefunden oder manipuliert (Hash beginnt mit: ${hashedIncomingRefreshToken.substring(
//             0,
//             10
//           )}...)`
//         );
//         // Das ungültige Cookie beim Client löschen
//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({ message: "Zugriff verweigert. Refresh-Token ungültig." });
//         return;
//       }

//       const tokenData = tokenResult.recordset[0]; // tokenData ist jetzt vom Typ RefreshTokenQueryResult

//       // 🚫 Prüfen, ob das Token manuell oder automatisch widerrufen wurde
//       if (tokenData.IsRevoked) {
//         console.warn(
//           `🔄 Verwendetes Token wurde widerrufen (Benutzer-ID: ${tokenData.UserID}) – Alle Tokens dieses Benutzers werden nun gesperrt.`
//         );

//         // ⛔ Bei erkanntem Versuch, ein widerrufenes Token zu verwenden, alle Tokens des Nutzers widerrufen
//         // (z.B. bei Missbrauch oder Sicherheitsvorfall)
//         await pool
//           .request()
//           .input("UserID", sql.UniqueIdentifier, tokenData.UserID)
//           .query(
//             "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID"
//           );

//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({ message: "Zugriff verweigert. Token wurde widerrufen." });
//         return;
//       }

//       // 🕓 Prüfen, ob das Token abgelaufen ist
//       if (new Date(tokenData.TokenExpiresAt) < new Date()) {
//         console.warn(
//           `🔄 Abgelaufenes Refresh-Token verwendet für Benutzer-ID: ${tokenData.UserID}`
//         );

//         // ⛔ Token explizit widerrufen (obwohl abgelaufen), um es nicht erneut zuzulassen
//         await pool
//           .request()
//           .input("TokenHash", sql.NVarChar(256), hashedIncomingRefreshToken)
//           .query(
//             "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE TokenHash = @TokenHash"
//           );

//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({
//             message: "Zugriff verweigert. Refresh-Token ist abgelaufen.",
//           });
//         return;
//       }

//       // 📴 Prüfen, ob das zugehörige Benutzerkonto deaktiviert wurde
//       if (!tokenData.UserIsActive) {
//         console.warn(
//           `🔄 Refresh-Token verwendet für ein inaktives Benutzerkonto: Benutzer-ID ${tokenData.UserID}`
//         );
//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({ message: "Zugriff verweigert. Benutzerkonto ist inaktiv." });
//         return;
//       }

//       // ✅ Alle Prüfungen bestanden → Neues Access Token + neues Refresh Token ausstellen
//       const userForTokenIssue: UserDataForToken = {
//         UserID: tokenData.UserID,
//         Email: tokenData.Email,
//         Role: tokenData.Role,
//       };
//       await issueSessionTokens(res, userForTokenIssue, pool);

//       console.log(
//         `🔄 Access-Token erfolgreich erneuert für Benutzer-ID: ${tokenData.UserID}.`
//       );
//       res.status(200).json({ message: "Access-Token erfolgreich erneuert." });
//     } catch (error) {
//       console.error("🔥 Fehler im /refresh-token-Endpunkt:", error);

//       // 🍪 Cookie löschen bei kritischem Fehler, um den Client-Zustand zu bereinigen
//       res.clearCookie(refreshTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api/auth/refresh-token",
//       });

//       if (!res.headersSent) {
//         next(error); // Fehler an den globalen Fehler-Handler weiterleiten
//       }
//     }
//   }
// );

// // -------------------------------------------------------------------
// // POST /api/auth/logout
// // Zweck: Entfernt JWT Access- und Refresh-Tokens aus Cookies und widerruft
// //        ggf. das RefreshToken in der Datenbank.
// // -------------------------------------------------------------------
// router.post(
//   "/logout",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const accessTokenCookieName =
//       process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
//     const refreshTokenCookieName =
//       process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

//     // 🧁 Lies das aktuelle Refresh-Token aus den Cookies (falls vorhanden)
//     const incomingRefreshToken = req.cookies
//       ? req.cookies[refreshTokenCookieName]
//       : undefined;

//     try {
//       if (incomingRefreshToken) {
//         const pool = getDBPool();
//         const hashedRefreshToken = hashToken(incomingRefreshToken); // Sicherheit: Nur gehashte Tokens in der DB vergleichen

//         // 🛑 Widerrufe das RefreshToken in der Datenbank, um es ungültig zu machen
//         await pool
//           .request()
//           .input("TokenHash", sql.NVarChar(256), hashedRefreshToken)
//           .query(
//             "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE TokenHash = @TokenHash"
//           );
//         console.log(
//           `🍪 Refresh-Token (Hash beginnt mit: ${hashedRefreshToken.substring(
//             0,
//             10
//           )}...) als widerrufen markiert während des Logouts.`
//         );
//       }

//       // 🍪 Lösche Access- und Refresh-Token-Cookies vom Client
//       // Diese Operationen werden immer ausgeführt, unabhängig davon, ob ein Token gefunden wurde,
//       // um sicherzustellen, dass die Cookies auf dem Client gelöscht sind.
//       res.clearCookie(accessTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api",
//       });
//       res.clearCookie(refreshTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api/auth/refresh-token",
//       });

//       console.log(`🍪 Alle Session-Cookies beim Logout gelöscht.`);
//       res.status(200).json({
//         message: "Logout erfolgreich. Alle Sitzungstokens wurden entfernt.",
//       });
//     } catch (error) {
//       console.error("🔥 Fehler beim Logout:", error);

//       // Sicherheit: Auch im Fehlerfall die Cookies löschen
//       res.clearCookie(accessTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api",
//       });
//       res.clearCookie(refreshTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api/auth/refresh-token",
//       });

//       if (!res.headersSent) next(error); // Fehler an den globalen Fehler-Handler weiterleiten
//     }
//   }
// );

// // -------------------------------------------------------------------
// // POST /api/auth/forgot-password
// // Zweck: Sendet einen Link zum Zurücksetzen des Passworts an die angegebene E-Mail-Adresse,
// //        falls ein aktives Konto mit dieser E-Mail existiert.
// // -------------------------------------------------------------------
// router.post(
//   "/forgot-password",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       // 🔐 Sicherheitsprüfung: JWT_SECRET muss in den Umgebungsvariablen definiert sein
//       if (!process.env.JWT_SECRET) {
//         console.error(
//           "🔥 FATALER FEHLER: JWT_SECRET ist in der Umgebung nicht definiert."
//         );
//         throw new Error("Server-Konfigurationsfehler.");
//       }

//       // 📥 E-Mail-Adresse aus dem Request-Body validieren
//       const { email } = requestPasswordResetSchema.parse(req.body);

//       const pool = await getDBPool();

//       // 🔍 Benutzer anhand der E-Mail finden und prüfen, ob das Konto aktiv ist
//       const userResult = await pool
//         .request()
//         .input("Email", sql.NVarChar(255), email.toLowerCase())
//         .query(
//           "SELECT UserID, Email, IsActive FROM dbo.Users WHERE Email = @Email"
//         );

//       // ❌ Wenn kein aktives Konto gefunden wurde: Trotzdem eine generische Erfolgsmeldung zurückgeben,
//       //    um das Erraten von E-Mail-Adressen zu verhindern (Datenschutz).
//       if (
//         userResult.recordset.length === 0 ||
//         !userResult.recordset[0].IsActive
//       ) {
//         console.log(
//           `ℹ️ Passwort-Reset angefordert für E-Mail (möglicherweise nicht existent/inaktiv): ${email}`
//         );
//         res.status(200).json({
//           message:
//             "Falls ein aktives Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.",
//         });
//         return;
//       }

//       const user = userResult.recordset[0];

//       // 🧹 Vorherige Passwort-Reset-Tokens für diesen Benutzer aus der Datenbank löschen
//       // Dies stellt sicher, dass nur der neueste Link gültig ist.
//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, user.UserID)
//         .query("DELETE FROM dbo.PasswordResetTokens WHERE UserID = @UserID");

//       // 🔐 Ein neues JWT-basiertes Reset-Token generieren
//       const resetToken = jwt.sign(
//         { userId: user.UserID },
//         process.env.JWT_SECRET,
//         {
//           expiresIn: process.env.JWT_RESET_PASSWORD_EXPIRES_IN || "1h", // Standard-Gültigkeitsdauer: 1 Stunde
//         } as jwtSignOptions
//       );

//       // ⏳ Ablaufzeitpunkt für das Token berechnen
//       const expiresAt = new Date(
//         Date.now() +
//           parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES || "60") *
//             60 *
//             1000
//       );

//       // 📥 Das neue Reset-Token in der Datenbank speichern
//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, user.UserID)
//         .input("ResetToken", sql.NVarChar(255), resetToken)
//         .input("ExpiresAt", sql.DateTime2, expiresAt)
//         .query(
//           "INSERT INTO dbo.PasswordResetTokens (UserID, ResetToken, ExpiresAt) VALUES (@UserID, @ResetToken, @ExpiresAt)"
//         );

//       // 📤 E-Mail an den Benutzer senden, die den Reset-Link enthält
//       await sendPasswordResetEmail(user.Email, resetToken);
//       console.log(
//         `🔑 JWT-Passwort-Reset-Token für ${user.Email} generiert und E-Mail versendet.`
//       );

//       // ✅ Immer die gleiche Antwort senden (aus Datenschutzgründen, siehe oben)
//       res.status(200).json({
//         message:
//           "Falls ein aktives Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.",
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Ungültige E-Mail-Adresse angegeben.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Fehler beim Anfordern des Passwort-Resets:", error);
//       next(error); // Fehler an den globalen Fehler-Handler weiterleiten
//     }
//   }
// );

// // -------------------------------------------------------------------
// // POST /api/auth/reset-password
// // Zweck: Ermöglicht dem Benutzer, mit einem gültigen JWT-Reset-Token ein neues Passwort zu setzen.
// // -------------------------------------------------------------------
// router.post(
//   "/reset-password",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       // Sicherheitsprüfung: JWT_SECRET muss vorhanden sein
//       if (!process.env.JWT_SECRET) {
//         console.error("🔥 FATALER FEHLER: JWT_SECRET fehlt in der Umgebung.");
//         throw new Error("Server-Konfigurationsfehler.");
//       }

//       // Validiere Eingabe (Reset-Token und neues Passwort)
//       const { token, newPassword } = resetPasswordSchema.parse(req.body);

//       let decodedPayload: any;
//       try {
//         // Versuche, das JWT-Token zu verifizieren (prüft Signatur und Ablaufzeit)
//         decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
//       } catch (err) {
//         res
//           .status(400)
//           .json({
//             message: "Ungültiges oder abgelaufenes Passwort-Reset-Token.",
//           });
//         return;
//       }

//       const pool = await getDBPool();

//       // 🔍 Zusätzliche Verifizierung: Prüfen, ob der Token noch in der DB existiert
//       //    (d.h. nicht bereits verwendet wurde) und ob er noch gültig ist (gegen ExpiresAt).
//       //    Außerdem, ob der zugehörige Benutzer noch aktiv ist.
//       const tokenResult = await pool
//         .request()
//         .input("ResetToken", sql.NVarChar(255), token)
//         .input("CurrentTime", sql.DateTime2, new Date()).query(`
//           SELECT prt.UserID, u.IsActive
//           FROM dbo.PasswordResetTokens prt
//           INNER JOIN dbo.Users u ON prt.UserID = u.UserID
//           WHERE prt.ResetToken = @ResetToken
//             AND prt.ExpiresAt > @CurrentTime
//             AND u.IsActive = 1
//         `);

//       if (tokenResult.recordset.length === 0) {
//         res.status(400).json({
//           message:
//             "Dieser Passwort-Reset-Link ist ungültig oder wurde bereits verwendet.",
//         });
//         return;
//       }

//       // 🔐 Neues Passwort hashen und in der Datenbank speichern
//       const { UserID } = tokenResult.recordset[0];
//       const saltRounds = 12;
//       const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

//       await pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, UserID)
//         .input("PasswordHash", sql.NVarChar(sql.MAX), newPasswordHash).query(`
//           UPDATE dbo.Users
//           SET PasswordHash = @PasswordHash,
//               UpdatedAt = SYSUTCDATETIME()
//           WHERE UserID = @UserID
//         `);

//       // 🧹 Entferne den verwendeten Reset-Token aus der Datenbank, um die Wiederverwendung zu verhindern
//       await pool
//         .request()
//         .input("ResetToken", sql.NVarChar(255), token)
//         .query(
//           "DELETE FROM dbo.PasswordResetTokens WHERE ResetToken = @ResetToken"
//         );

//       console.log(
//         `✅ Passwort erfolgreich zurückgesetzt für Benutzer-ID: ${UserID}`
//       );
//       res.status(200).json({
//         message:
//           "Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.",
//       });
//     } catch (error) {
//       if (error instanceof ZodError) {
//         res.status(400).json({
//           message: "Ungültige Daten zum Zurücksetzen des Passworts.",
//           errors: error.flatten().fieldErrors,
//         });
//         return;
//       }
//       console.error("🔥 Fehler beim Zurücksetzen des Passworts:", error);
//       next(error); // Fehler an den globalen Fehler-Handler weiterleiten
//     }
//   }
// );

// // --- Google OAuth Routen ---
// // -------------------------------------------------------------------
// // GET /api/auth/google
// // Zweck: Leitet den Benutzer zur Google-OAuth-Zustimmungsseite weiter,
// //        um die Authentifizierung über Google zu initiieren.
// // -------------------------------------------------------------------
// router.get(
//   "/google",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       // 🔐 OAuth-Konfiguration aus Umgebungsvariablen prüfen
//       const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
//       const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
//       const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

//       // Fehlerprüfung: Sind alle notwendigen ENV-Variablen gesetzt?
//       if (!clientId || !clientSecret || !redirectUri) {
//         console.error(
//           "🔥 Google OAuth Umgebungsvariablen fehlen (CLIENT_ID, CLIENT_SECRET oder REDIRECT_URI)."
//         );
//         res
//           .status(500)
//           .json({
//             message: "Fehlerhafte Serverkonfiguration für Google Login.",
//           });
//         return;
//       }

//       // Initialisiere den OAuth2-Client mit Google-Anmeldedaten und Umleitungs-URI
//       const oauth2Client = new OAuth2Client(
//         clientId,
//         clientSecret,
//         redirectUri
//       );

//       // 📦 Definiere die benötigten Berechtigungen (Scopes)
//       const scopes = [
//         "https://www.googleapis.com/auth/userinfo.email", // Zugriff auf die E-Mail-Adresse des Benutzers
//         "https://www.googleapis.com/auth/userinfo.profile", // Zugriff auf grundlegende Profilinformationen (Name, Bild)
//         "openid", // Standard OpenID Connect Scope
//       ];

//       // 📤 Generiere die URL, die den Benutzer zu Googles Zustimmungsseite weiterleitet
//       const authorizationUrl = oauth2Client.generateAuthUrl({
//         access_type: "offline", // Fordert ein Refresh Token an (für langfristigen Zugriff, falls erforderlich; nicht strikt für den einfachen Login)
//         scope: scopes, // Liste der angeforderten Berechtigungen
//         include_granted_scopes: true, // Zeigt dem Benutzer, welche Berechtigungen bereits erteilt wurden
//         // prompt: 'consent' // Optional: Erzwingt die Zustimmungsseite bei jedem Mal, nützlich für Tests. Für die Produktion entfernen.
//       });

//       console.log("ℹ️ Weiterleitung zur Google OAuth URL:", authorizationUrl);
//       res.redirect(authorizationUrl); // Leitet den Browser des Benutzers um
//     } catch (error) {
//       console.error("🔥 Fehler beim Starten des Google-OAuth-Flows:", error);
//       next(error); // Fehler an den globalen Fehler-Handler weiterleiten
//     }
//   }
// );

// // -------------------------------------------------------------------
// // GET /api/auth/google/callback
// // Zweck: Handhabt die Umleitung von Google OAuth nach der Benutzerzustimmung.
// //        Verifiziert das Google-Token, findet oder erstellt den Benutzer und
// //        stellt Anwendungssession-Tokens aus.
// // -------------------------------------------------------------------
// router.get(
//   "/google/callback",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     // Google sendet 'code' bei Erfolg, oder 'error' und 'error_description' bei Fehlern, direkt als Query-Parameter.
//     const code = req.query.code as string | undefined;
//     const googleErrorParam = req.query.error as string | undefined;
//     const errorDescriptionParam = req.query.error_description as
//       | string
//       | undefined;
//     const stateParam = req.query.state as string | undefined; // Optionaler OAuth2-State-Parameter

//     console.log(
//       "ℹ️ Google OAuth Callback empfangen. Code:",
//       code,
//       "Fehler-Param:",
//       googleErrorParam,
//       "Fehlerbeschreibung-Param:",
//       errorDescriptionParam,
//       "State-Param:",
//       stateParam
//     );

//     // ❌ Fehler von Google verarbeiten (z.B. Benutzer hat den Zugriff verweigert)
//     if (googleErrorParam) {
//       const errorMessage =
//         errorDescriptionParam ||
//         googleErrorParam ||
//         "Unbekannter Fehler während Google OAuth.";
//       console.error("🔥 Fehler vom Google OAuth Anbieter:", errorMessage);
//       res.redirect(
//         `${
//           process.env.FRONTEND_URL || "http://localhost:3000"
//         }/auth/signin?error=google_oauth_failed&message=${encodeURIComponent(
//           errorMessage
//         )}`
//       );
//       return; // Wichtig: Nach der Umleitung immer 'return', um weitere Ausführung zu verhindern
//     }

//     // ❌ Fehlenden Autorisierungscode behandeln
//     if (!code) {
//       console.error(
//         "🔥 Kein Autorisierungscode von Google im Callback erhalten."
//       );
//       res.redirect(
//         `${
//           process.env.FRONTEND_URL || "http://localhost:3000"
//         }/auth/signin?error=google_no_code&message=Autorisierungscode%20fehlt%20von%20Google.`
//       );
//       return; // Wichtig: Nach der Umleitung immer 'return'
//     }

//     try {
//       // 🔐 Erneut Umgebungsvariablen prüfen
//       const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
//       const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
//       const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

//       if (!clientId || !clientSecret || !redirectUri) {
//         console.error(
//           "🔥 Google OAuth Server-Umgebungsvariablen fehlen (CLIENT_ID, CLIENT_SECRET oder REDIRECT_URI)."
//         );
//         throw new Error("Server-Konfigurationsfehler für Google Sign-In.");
//       }

//       // OAuth2-Client instanziieren, um den Autorisierungscode auszutauschen
//       const oauth2Client = new OAuth2Client(
//         clientId,
//         clientSecret,
//         redirectUri
//       );

//       console.log("ℹ️ Tausche Google-Auth-Code gegen Tokens aus...");
//       const { tokens } = await oauth2Client.getToken(code); // 'code' ist hier bereits als String bestätigt

//       // Prüfen, ob das ID-Token vorhanden ist
//       if (!tokens.id_token) {
//         throw new Error("Fehler beim Abrufen des ID-Tokens von Google.");
//       }

//       // ✅ Google-ID-Token verifizieren
//       const ticket = await oauth2Client.verifyIdToken({
//         idToken: tokens.id_token,
//         audience: clientId, // Überprüfen, ob das Token für unsere Client-ID ausgestellt wurde
//       });
//       const googlePayload = ticket.getPayload(); // Die Payload enthält die Benutzerinformationen

//       // Grundlegende Payload-Validierung
//       if (!googlePayload || !googlePayload.sub || !googlePayload.email) {
//         throw new Error("Ungültige Google ID-Token-Payload.");
//       }

//       // Benutzerinformationen aus der Google-Payload extrahieren
//       const googleUserId = googlePayload.sub; // Eindeutige Google-Benutzer-ID
//       const email = googlePayload.email.toLowerCase(); // E-Mail-Adresse des Benutzers
//       const firstName =
//         googlePayload.given_name || googlePayload.name?.split(" ")[0] || "User";
//       const lastName =
//         googlePayload.family_name ||
//         googlePayload.name?.split(" ").slice(1).join(" ") ||
//         "";

//       const pool = getDBPool();
//       let userFromDB: DbUser | undefined;

//       // 🔍 1. Benutzer anhand der GoogleID in unserer Datenbank suchen
//       let userResultByGoogleID = await pool
//         .request()
//         .input("GoogleID", sql.NVarChar(255), googleUserId)
//         .query<DbUser>(
//           `SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role, GoogleID, AuthProvider, IsMfaEnabled, MfaSecret FROM dbo.Users WHERE GoogleID = @GoogleID`
//         );
//       userFromDB = userResultByGoogleID.recordset[0];

//       if (!userFromDB) {
//         // 🔍 2. Wenn kein Benutzer über GoogleID gefunden wurde, suche über die E-Mail-Adresse
//         let userResultByEmail = await pool
//           .request()
//           .input("Email", sql.NVarChar(255), email)
//           .query<DbUser>(
//             `SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role, GoogleID, AuthProvider, IsMfaEnabled, MfaSecret FROM dbo.Users WHERE Email = @Email`
//           );
//         userFromDB = userResultByEmail.recordset[0];

//         if (userFromDB) {
//           // 🔁 Wenn ein bestehender Benutzer mit dieser E-Mail gefunden wurde, aber ohne GoogleID,
//           //    verknüpfe das Konto mit der GoogleID und setze den AuthProvider auf 'google'.
//           if (userFromDB.GoogleID !== googleUserId) {
//             await pool
//               .request()
//               .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
//               .input("GoogleID", sql.NVarChar(255), googleUserId)
//               .input("AuthProvider", sql.NVarChar(50), "google")
//               .query(
//                 "UPDATE dbo.Users SET GoogleID = @GoogleID, AuthProvider = @AuthProvider, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//               );
//             userFromDB.GoogleID = googleUserId;
//             userFromDB.AuthProvider = "google";
//           }
//         } else {
//           // ➕ Andernfalls: Neuen Benutzer anlegen, da weder GoogleID noch E-Mail existieren
//           const defaultRole = "user";
//           const newUserResult = await pool
//             .request()
//             .input("FirstName", sql.NVarChar(100), firstName)
//             .input("LastName", sql.NVarChar(100), lastName)
//             .input("Email", sql.NVarChar(255), email)
//             .input("PasswordHash", sql.NVarChar(sql.MAX), null) // OAuth-Benutzer haben keinen lokalen Passwort-Hash
//             .input("Role", sql.NVarChar(50), defaultRole)
//             .input("GoogleID", sql.NVarChar(255), googleUserId)
//             .input("AuthProvider", sql.NVarChar(50), "google")
//             .input("IsActive", sql.Bit, 1) // Standardmäßig aktiv setzen
//             .query<DbUser>(
//               `INSERT INTO dbo.Users (FirstName, LastName, Email, PasswordHash, Role, GoogleID, AuthProvider, IsActive, CreatedAt, UpdatedAt, IsMfaEnabled, MfaSecret)
//                        OUTPUT inserted.UserID, inserted.Email, inserted.PasswordHash, inserted.FirstName, inserted.LastName, inserted.IsActive, inserted.Role, inserted.GoogleID, inserted.AuthProvider, inserted.IsMfaEnabled, inserted.MfaSecret
//                        VALUES (@FirstName, @LastName, @Email, @PasswordHash, @Role, @GoogleID, @AuthProvider, @IsActive, SYSUTCDATETIME(), SYSUTCDATETIME(), 0, NULL)`
//             );
//           if (!newUserResult.recordset[0])
//             throw new Error(
//               "Benutzererstellung via Google SSO fehlgeschlagen."
//             );
//           userFromDB = newUserResult.recordset[0];
//         }
//       }

//       // ❌ Prüfen, ob der Benutzer gefunden wurde und aktiv ist
//       if (!userFromDB || !userFromDB.IsActive) {
//         res.redirect(
//           `${
//             process.env.FRONTEND_URL || "http://localhost:3000"
//           }/auth/signin?error=account_issue_google&message=Account%20is%20inactive%20or%20could%20not%20be%20verified.`
//         );
//         return; // Nach der Umleitung immer 'return'
//       }

//       // ✅ Session-Tokens ausstellen (Access Token & Refresh Token Cookies)
//       await issueSessionTokens(res, userFromDB, pool);

//       // 🕒 Letzten Login-Zeitpunkt und AuthProvider in der Datenbank aktualisieren
//       pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
//         .input("AuthProvider", sql.NVarChar(50), "google")
//         .query(
//           `UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME(), AuthProvider = @AuthProvider WHERE UserID = @UserID`
//         )
//         .catch((dbErr: any) =>
//           console.error(
//             "🔥 Fehler beim Aktualisieren von LastLoginAt/AuthProvider nach Google SSO:",
//             dbErr.message || dbErr
//           )
//         );

//       console.log(
//         `✅ Google Sign-In erfolgreich für ${userFromDB.Email}. App-Session-Cookies gesetzt. Weiterleitung zu /profile.`
//       );
//       // Letzte Umleitung an das Frontend nach erfolgreichem Login
//       res.redirect(
//         `${process.env.FRONTEND_URL || "http://localhost:3000"}/profile`
//       );
//     } catch (error) {
//       console.error("🔥 Fehler beim Google-OAuth-Callback:", error);
//       // Eine spezifische Fehlermeldung für die Weiterleitung vorbereiten
//       const specificError =
//         error instanceof Error ? error.message : String(error);
//       res.redirect(
//         `${
//           process.env.FRONTEND_URL || "http://localhost:3000"
//         }/auth/signin?error=google_callback_failed&message=${encodeURIComponent(
//           specificError
//         )}`
//       );
//     }
//   }
// );

// export default router;

// backend/src/routes/authRoutes.ts

import express, { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt, {
  JwtPayload,
  Secret,
  SignOptions as jwtSignOptions,
} from "jsonwebtoken";
import crypto from "crypto";
import { z, ZodError } from "zod";
import { getDBPool, sql } from "../config/db"; // Sicherstellen, dass dieser Pfad korrekt ist
import { OAuth2Client } from "google-auth-library";
import { authenticator } from "otplib"; // Für MFA (TOTP) Überprüfung
import { decryptMfaSecret } from "../utils/encryption"; // Hilfsfunktion zur Entschlüsselung von MFA-Secrets
import { protect as authMiddleware } from "../middleware/authMiddleware";
import { sendPasswordResetEmail } from "../utils/emailService"; // Import des E-Mail-Dienstes für Passwort-Resets

const router: Router = express.Router();

// Logging zur Kontrolle beim Laden des Moduls
console.log(
  "🔑 authRoutes.ts: Modul geladen. Überprüfe, ob .env Variablen zugänglich sind."
);

// --- Interfaces ---
// ---------------------------------------------------
// ✅ Interface für Nutzerinformationen, die im JWT Access Token gespeichert werden
//    und für die Session-Token-Ausstellung verwendet werden.
// ---------------------------------------------------
interface UserDataForToken {
  UserID: string; // Benutzer-ID aus der Datenbank
  Email: string; // E-Mail-Adresse des Benutzers
  Role: string; // Rolle des Benutzers (z.B. 'user', 'admin')
}

// ---------------------------------------------------
// ✅ Interface für den vollständigen Benutzer-Datensatz, wie er aus der Datenbank
//    abgerufen wird (z.B. für Login- oder Google-Callback-Vorgänge).
//    Erweitert 'UserDataForToken' um zusätzliche Datenbankfelder.
// ---------------------------------------------------
interface DbUser extends UserDataForToken {
  PasswordHash: string | null; // Gehashter Passwort-String, kann bei OAuth null sein
  FirstName: string | null; // Vorname des Benutzers
  LastName: string | null; // Nachname des Benutzers
  IsActive: boolean; // Status, ob das Konto aktiv ist
  GoogleID: string | null; // Google-ID, falls über Google SSO registriert
  AzureAdID: string | null; // NEU: Azure AD Object ID, falls über Azure AD SSO registriert
  AuthProvider: string | null; // Authentifizierungsanbieter (z.B. 'email', 'google', 'azure-ad')
  IsMfaEnabled?: boolean; // Optional: Ist MFA für diesen Benutzer aktiviert?
  MfaSecret?: string | null; // Optional: Das verschlüsselte MFA-Secret
}

// ---------------------------------------------------
// ✅ Interface für die Datenstruktur, die bei der Validierung von Refresh Tokens
//    aus der Datenbank zurückgegeben wird.
//    WICHTIG: Diese Definition wurde nach oben verschoben, um den TypeScript-Fehler
//    "Cannot find name 'RefreshTokenQueryResult'" zu beheben, da Interfaces vor
//    ihrer Verwendung definiert sein müssen.
// ---------------------------------------------------
interface RefreshTokenQueryResult {
  UserID: string; // Benutzer-ID
  Email: string; // E-Mail des Benutzers
  Role: string; // Rolle des Benutzers
  FirstName: string | null; // Vorname des Benutzers
  LastName: string | null; // Nachname des Benutzers
  UserIsActive: boolean; // Aktivitätsstatus des Benutzers (aus dbo.Users u.IsActive)
  TokenExpiresAt: Date; // Ablaufdatum des Refresh Tokens (aus rt.ExpiresAt)
  IsRevoked: boolean; // Revokierungsstatus des Refresh Tokens (aus rt.IsRevoked)
}

// --- Zod Schemas zur Validierung der Request-Bodies ---
// ---------------------------------------------
// ✅ Schema für Passwortänderung (Validierung)
//    Stellt sicher, dass das aktuelle Passwort angegeben ist, das neue Passwort
//    Mindestanforderungen erfüllt und die Bestätigung übereinstimmt.
// ---------------------------------------------
const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Aktuelles Passwort ist erforderlich." }),
    newPassword: z
      .string()
      .min(8, {
        message: "Neues Passwort muss mindestens 8 Zeichen enthalten.",
      })
      .max(100),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Die neuen Passwörter stimmen nicht überein.",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message:
      "Das neue Passwort darf nicht mit dem aktuellen Passwort übereinstimmen.",
    path: ["newPassword"],
  });

// ---------------------------------------------
// ✅ Schema für den Login-Vorgang
//    Erfordert eine gültige E-Mail-Adresse und ein nicht leeres Passwort.
// ---------------------------------------------
const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Eine gültige E-Mail-Adresse ist erforderlich." }),
  password: z
    .string()
    .min(1, { message: "Das Passwort darf nicht leer sein." }),
});

// ---------------------------------------------
// ✅ Schema für die Benutzerregistrierung
//    Erfordert Vorname, Nachname, eine gültige E-Mail und ein Passwort, das
//    Mindestanforderungen erfüllt und bestätigt wird.
// ---------------------------------------------
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, { message: "Vorname ist erforderlich." })
      .max(100),
    lastName: z
      .string()
      .min(1, { message: "Nachname ist erforderlich." })
      .max(100),
    email: z
      .string()
      .email({ message: "Eine gültige E-Mail-Adresse ist erforderlich." })
      .max(255),
    password: z
      .string()
      .min(8, { message: "Passwort muss mindestens 8 Zeichen lang sein." })
      .max(100),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["passwordConfirmation"],
  });

// ---------------------------------------------
// ✅ Schema für die Anforderung eines Passwort-Resets
//    Erfordert lediglich eine gültige E-Mail-Adresse.
// ---------------------------------------------
const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .email({ message: "Eine gültige E-Mail-Adresse ist erforderlich." }),
});

// ---------------------------------------------
// ✅ Schema für das Setzen eines neuen Passworts nach einem Reset-Link
//    Erfordert den Reset-Token und ein neues Passwort, das den Anforderungen
//    entspricht und bestätigt wird.
// ---------------------------------------------
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Reset-Token ist erforderlich." }),
    newPassword: z
      .string()
      .min(8, {
        message: "Das neue Passwort muss mindestens 8 Zeichen enthalten.",
      })
      .max(100),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Die neuen Passwörter stimmen nicht überein.",
    path: ["confirmNewPassword"],
  });

// ---------------------------------------------
// ✅ Schema für die MFA-Verifizierung während des Login-Prozesses
//    Erfordert die Benutzer-ID (UUID) und einen 6-stelligen TOTP-Code.
// ---------------------------------------------
const verifyMfaLoginSchema = z.object({
  userId: z
    .string()
    .uuid({ message: "Gültige Benutzer-ID (UUID) ist erforderlich." }),
  totpCode: z
    .string()
    .length(6, { message: "TOTP-Code muss 6 Ziffern lang sein." })
    .regex(/^\d{6}$/, { message: "Ungültiges TOTP-Code-Format." }),
});

// --- Hilfsfunktionen ---
// ---------------------------------------------
// ✅ Hilfsfunktion: Erstellt einen SHA256-Hash eines Tokens
//    Wird verwendet, um Refresh Tokens in der Datenbank sicher zu speichern.
// ---------------------------------------------
const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// ---------------------------------------------------------------------
// ✅ Hilfsfunktion zur Erstellung und zum Setzen von Access- und Refresh-Tokens
//    Setzt JWTs als HTTP-Only-Cookies nach erfolgreicher Authentifizierung.
// ---------------------------------------------------------------------

// async function issueSessionTokens(
//   res: Response,
//   user: UserDataForToken,
//   pool: any // Typisiert als 'any' für mssql.ConnectionPool
// ): Promise<void> {
//   const jwtSecret = process.env.JWT_SECRET;
//   const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";

//   // Sicherheitsprüfung: JWT_SECRET muss in den Umgebungsvariablen konfiguriert sein
//   if (!jwtSecret) {
//     console.error(
//       "🔥 KRITISCH: JWT_SECRET ist nicht konfiguriert für die Token-Ausstellung."
//     );
//     throw new Error("Server-Konfigurationsfehler: JWT_SECRET fehlt.");
//   }

//   // 📌 Erstellung des Access Tokens (Kurzlebiger JWT)
//   const accessTokenPayload = {
//     userId: user.UserID,
//     email: user.Email,
//     role: user.Role,
//   };
//   const accessToken = jwt.sign(accessTokenPayload, jwtSecret, {
//     expiresIn: jwtExpiresIn,
//   } as jwtSignOptions); // Typ-Assertion, um die korrekten Optionen zu gewährleisten

//   const accessTokenCookieName =
//     process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
//   let accessTokenMaxAgeMs = 15 * 60 * 1000; // Standard: 15 Minuten (in Millisekunden)

//   // Umrechnung der Ablaufzeit des Access Tokens in Millisekunden für das Cookie
//   if (jwtExpiresIn.endsWith("s")) {
//     accessTokenMaxAgeMs = parseInt(jwtExpiresIn.replace("s", ""), 10) * 1000;
//   } else if (jwtExpiresIn.endsWith("m")) {
//     accessTokenMaxAgeMs =
//       parseInt(jwtExpiresIn.replace("m", ""), 10) * 60 * 1000;
//   } else if (jwtExpiresIn.endsWith("h")) {
//     accessTokenMaxAgeMs =
//       parseInt(jwtExpiresIn.replace("h", ""), 10) * 60 * 60 * 1000;
//   }

//   // Setzen des Access Token Cookies
//   res.cookie(accessTokenCookieName, accessToken, {
//     httpOnly: true, // Macht das Cookie unzugänglich für clientseitiges JavaScript
//     secure: process.env.NODE_ENV === "production", // Nur über HTTPS in Produktion senden
//     sameSite: "lax" as const, // Schutz vor CSRF-Angriffen (lax ist ein guter Standard)
//     path: "/api", // Pfad, für den das Cookie gültig ist
//     maxAge: accessTokenMaxAgeMs, // Ablaufzeit des Cookies
//   });
//   console.log(
//     `🍪 Access Token-Cookie ('${accessTokenCookieName}') gesetzt. Dauer: ${
//       accessTokenMaxAgeMs / 1000
//     }s für Benutzer-ID: ${user.UserID}`
//   );

//   // 📌 Erstellung des Refresh Tokens (Langlebiges Token zur Erneuerung des Access Tokens)
//   const refreshToken = crypto.randomBytes(64).toString("hex"); // Generiert ein zufälliges, langes Token
//   const refreshTokenHash = hashToken(refreshToken); // Hashen für die sichere Speicherung in der DB

//   const envRefreshTokenSeconds = process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS;
//   console.log(
//     `[issueSessionTokens] Lese REFRESH_TOKEN_EXPIRES_IN_SECONDS: "${envRefreshTokenSeconds}" für Benutzer-ID: ${user.UserID}`
//   );
//   const refreshTokenLifetimeSeconds = parseInt(
//     envRefreshTokenSeconds || (7 * 24 * 60 * 60).toString(), // Standard: 7 Tage in Sekunden
//     10
//   );

//   const refreshTokenExpiresAt = new Date(
//     Date.now() + refreshTokenLifetimeSeconds * 1000
//   );
//   const refreshTokenCookieName =
//     process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

//   // Vor dem Einfügen eines neuen Refresh Tokens:
//   // Alle alten, nicht widerrufenen Refresh Tokens für diesen Benutzer ungültig machen.
//   // Dies erhöht die Sicherheit (Rotation) und verhindert die Wiederverwendung älterer Tokens.
//   await pool
//     .request()
//     .input("UserID", sql.UniqueIdentifier, user.UserID)
//     .query(
//       "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID AND IsRevoked = 0"
//     );

//   // Speichern des neuen Refresh Token Hash in der Datenbank
//   await pool
//     .request()
//     .input("UserID", sql.UniqueIdentifier, user.UserID)
//     .input("TokenHash", sql.NVarChar(256), refreshTokenHash)
//     .input("ExpiresAt", sql.DateTime2, refreshTokenExpiresAt)
//     .query(
//       "INSERT INTO dbo.RefreshTokens (UserID, TokenHash, ExpiresAt, IsRevoked) VALUES (@UserID, @TokenHash, @ExpiresAt, 0)"
//     );

//   // Setzen des Refresh Token Cookies
//   res.cookie(refreshTokenCookieName, refreshToken, {
//     httpOnly: true, // Muss HTTP-Only sein
//     secure: process.env.NODE_ENV === "production", // Nur über HTTPS in Produktion
//     sameSite: "lax" as const, // Standardmäßig lax, kann bei Bedarf auf "strict" gesetzt werden
//     path: "/api/auth/refresh-token", // Spezifischer Pfad, da es nur von diesem Endpunkt verwendet wird
//     maxAge: refreshTokenLifetimeSeconds * 1000, // Ablaufzeit des Cookies
//   });
//   console.log(
//     `🍪 Refresh Token-Cookie ('${refreshTokenCookieName}') gesetzt. Dauer: ${refreshTokenLifetimeSeconds}s für Benutzer-ID: ${user.UserID}`
//   );
//   // Hinweis: Diese Hilfsfunktion setzt nur Cookies. Die aufrufende Route ist
//   // dafür verantwortlich, die endgültige JSON-Antwort zu senden.
// }

async function issueSessionTokens(
  res: Response,
  user: UserDataForToken,
  pool: any
): Promise<void> {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
  if (!jwtSecret) {
    console.error("🔥 KRITISCH: JWT_SECRET fehlt.");
    throw new Error("Server-Konfigurationsfehler: JWT_SECRET fehlt.");
  }

  const isProd = process.env.NODE_ENV === "production";

  // ⬅️ Default jetzt "/" damit Cookies überall (z.B. /profile/me) gesendet werden.
  const cookieBasePathRaw = process.env.COOKIE_BASE_PATH ?? "/";
  const cookieBasePath =
    cookieBasePathRaw !== "/" && cookieBasePathRaw.endsWith("/")
      ? cookieBasePathRaw.slice(0, -1)
      : cookieBasePathRaw;

  const cookieDomain =
    process.env.COOKIE_DOMAIN || (isProd ? "simoneapi.gascade.de" : undefined);
  const sameSite: "none" | "lax" = isProd ? "none" : "lax";
  const secure = isProd;

  // ---- ACCESS TOKEN ----
  const accessTokenPayload = {
    userId: user.UserID,
    email: user.Email,
    role: user.Role,
  };
  const accessToken = jwt.sign(accessTokenPayload, jwtSecret, {
    expiresIn: jwtExpiresIn,
  } as jwtSignOptions);

  const accessTokenCookieName =
    process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";

  // parse "15m"/"3600s"/"2h"/"1d"
  let accessTokenMaxAgeMs = 15 * 60 * 1000;
  const dur = String(jwtExpiresIn).trim();
  const m = dur.match(/^(\d+)\s*([smhd])$/i);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    const factor =
      unit === "s"
        ? 1000
        : unit === "m"
        ? 60 * 1000
        : unit === "h"
        ? 60 * 60 * 1000
        : 24 * 60 * 60 * 1000; // d
    accessTokenMaxAgeMs = n * factor;
  }

  res.cookie(accessTokenCookieName, accessToken, {
    httpOnly: true,
    secure,
    sameSite,
    path: cookieBasePath, // ⬅️ jetzt "/" (oder via ENV steuerbar)
    ...(cookieDomain ? { domain: cookieDomain } : {}),
    maxAge: accessTokenMaxAgeMs,
  });
  console.log(
    `🍪 Access Token gesetzt (name=${accessTokenCookieName}, path=${cookieBasePath}, domain=${cookieDomain ?? "host-only"}, secure=${secure}, samesite=${sameSite}). Dauer=${Math.floor(
      accessTokenMaxAgeMs / 1000
    )}s, UserID=${user.UserID}`
  );

  // ---- REFRESH TOKEN ----
  const refreshToken = crypto.randomBytes(64).toString("hex");
  const refreshTokenHash = hashToken(refreshToken);
  const refreshSecs = parseInt(
    process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS || String(7 * 24 * 60 * 60),
    10
  );
  const refreshTokenExpiresAt = new Date(Date.now() + refreshSecs * 1000);
  const refreshTokenCookieName =
    process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

  // Rotation: alte Tokens widerrufen
  await pool
    .request()
    .input("UserID", sql.UniqueIdentifier, user.UserID)
    .query(
      "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID AND IsRevoked = 0"
    );

  // neuen Hash speichern
  await pool
    .request()
    .input("UserID", sql.UniqueIdentifier, user.UserID)
    .input("TokenHash", sql.NVarChar(256), refreshTokenHash)
    .input("ExpiresAt", sql.DateTime2, refreshTokenExpiresAt)
    .query(
      "INSERT INTO dbo.RefreshTokens (UserID, TokenHash, ExpiresAt, IsRevoked) VALUES (@UserID, @TokenHash, @ExpiresAt, 0)"
    );

  // Refresh-Cookie auf einen stabilen Pfad legen, passend zum SPA-Aufruf
  const refreshPath =
    cookieBasePath === "/"
      ? "/auth/refresh-token"
      : `${cookieBasePath}/auth/refresh-token`;

  res.cookie(refreshTokenCookieName, refreshToken, {
    httpOnly: true,
    secure,
    sameSite,
    path: refreshPath, // ⬅️ jetzt "/auth/refresh-token" (oder unterhalb von COOKIE_BASE_PATH)
    ...(cookieDomain ? { domain: cookieDomain } : {}),
    maxAge: refreshSecs * 1000,
  });
  console.log(
    `🍪 Refresh Token gesetzt (name=${refreshTokenCookieName}, path=${refreshPath}, domain=${cookieDomain ?? "host-only"}, secure=${secure}, samesite=${sameSite}). Dauer=${refreshSecs}s, UserID=${user.UserID}`
  );
}


// --- Routen-Definitionen ---

// // -------------------------------------------------------------------
// // GET /api/auth/sso/azure-ad-callback
// // Zweck: Handhabt die Umleitung vom Java Service nach erfolgreicher Azure AD SAML-Authentifizierung.
// //        Provisorisiert (erstellt) oder aktualisiert den Benutzer und stellt Anwendungstokens aus.
// // -------------------------------------------------------------------
// router.get(
//   "/sso/azure-ad-callback", // Dies ist die Route innerhalb des /api/auth Präfixes
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     // 📥 Benutzerdetails aus den Query-Parametern extrahieren, die vom Java Service gesendet wurden.
//     // Sicherstellen, dass die Typen korrekt behandelt werden.
//     const email = req.query.email as string | undefined;
//     const firstName = req.query.firstName as string | undefined;
//     const lastName = req.query.lastName as string | undefined;
//     const azureAdId = req.query.azureAdId as string | undefined; // Die Object ID aus Azure AD

//     console.log(
//       `ℹ️ Azure AD SSO Callback empfangen. Details: Email=${email}, FirstName=${firstName}, LastName=${lastName}, AzureAdId=${azureAdId}`
//     );

//     // ❌ Grundlegende Validierung der empfangenen Daten. E-Mail ist essentiell.
//     if (!email) {
//       console.error(
//         "🔥 Azure AD SSO Callback: E-Mail-Adresse fehlt in den Query-Parametern."
//       );
//       res.redirect(
//         `${
//           process.env.FRONTEND_URL || "http://localhost:3000"
//         }/auth/signin?error=sso_callback_failed&message=${encodeURIComponent(
//           "E-Mail-Adresse fehlte im SSO-Callback."
//         )}`
//       );
//       return;
//     }

//     try {
//       const pool = getDBPool();
//       let userFromDB: DbUser | undefined;

//       // 🔍 1. Benutzer anhand der AzureAdID in unserer Datenbank suchen (primäre Methode für SSO)
//       if (azureAdId) {
//         let userResultByAzureAdID = await pool
//           .request()
//           .input("AzureAdID", sql.NVarChar(255), azureAdId)
//           .query<DbUser>(
//             `SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role, GoogleID, AzureAdID, AuthProvider, IsMfaEnabled, MfaSecret FROM dbo.Users WHERE AzureAdID = @AzureAdID`
//           );
//         userFromDB = userResultByAzureAdID.recordset[0];
//       }

//       // 🔍 2. Wenn kein Benutzer über AzureAdID gefunden wurde, suche über die E-Mail-Adresse
//       if (!userFromDB) {
//         let userResultByEmail = await pool
//           .request()
//           .input("Email", sql.NVarChar(255), email.toLowerCase())
//           .query<DbUser>(
//             `SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role, GoogleID, AzureAdID, AuthProvider, IsMfaEnabled, MfaSecret FROM dbo.Users WHERE Email = @Email`
//           );
//         userFromDB = userResultByEmail.recordset[0];

//         if (userFromDB) {
//           // 🔁 Wenn ein bestehender Benutzer mit dieser E-Mail gefunden wurde, aber ohne AzureAdID,
//           //    verknüpfe das Konto mit der AzureAdID und setze den AuthProvider auf 'azure-ad'.
//           if (!userFromDB.AzureAdID) {
//             console.log(
//               `ℹ️ Verknüpfe bestehendes Konto (${email}) mit neuer AzureAdID.`
//             );
//             await pool
//               .request()
//               .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
//               .input("AzureAdID", sql.NVarChar(255), azureAdId || null) // Kann null sein, falls nicht übergeben
//               .input("AuthProvider", sql.NVarChar(50), "azure-ad")
//               .query(
//                 "UPDATE dbo.Users SET AzureAdID = @AzureAdID, AuthProvider = @AuthProvider, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
//               );
//             userFromDB.AzureAdID = azureAdId || null;
//             userFromDB.AuthProvider = "azure-ad";
//           }
//         } else {
//           // ➕ Andernfalls: Neuen Benutzer anlegen, da weder AzureAdID noch E-Mail existieren
//           console.log(`ℹ️ Erstelle neuen Benutzer für Azure AD SSO: ${email}`);
//           const defaultRole = "user"; // Standardrolle für neue SSO-Benutzer
//           const newUserResult = await pool
//             .request()
//             .input("FirstName", sql.NVarChar(100), firstName || null)
//             .input("LastName", sql.NVarChar(100), lastName || null)
//             .input("Email", sql.NVarChar(255), email.toLowerCase())
//             .input("PasswordHash", sql.NVarChar(sql.MAX), null) // SSO-Benutzer haben keinen lokalen Passwort-Hash
//             .input("Role", sql.NVarChar(50), defaultRole)
//             .input("GoogleID", sql.NVarChar(255), null) // Sicherstellen, dass GoogleID leer ist
//             .input("AzureAdID", sql.NVarChar(255), azureAdId || null) // Azure AD ID speichern
//             .input("AuthProvider", sql.NVarChar(50), "azure-ad") // Setze den Authentifizierungsanbieter
//             .input("IsActive", sql.Bit, 1) // Standardmäßig aktiv setzen
//             .query<DbUser>(
//               `INSERT INTO dbo.Users (FirstName, LastName, Email, PasswordHash, Role, GoogleID, AzureAdID, AuthProvider, IsActive, CreatedAt, UpdatedAt, IsMfaEnabled, MfaSecret)
//                        OUTPUT inserted.UserID, inserted.Email, inserted.PasswordHash, inserted.FirstName, inserted.LastName, inserted.IsActive, inserted.Role, inserted.GoogleID, inserted.AzureAdID, inserted.AuthProvider, inserted.IsMfaEnabled, inserted.MfaSecret
//                        VALUES (@FirstName, @LastName, @Email, @PasswordHash, @Role, @GoogleID, @AzureAdID, @AuthProvider, @IsActive, SYSUTCDATETIME(), SYSUTCDATETIME(), 0, NULL)`
//             );
//           if (!newUserResult.recordset[0]) {
//             throw new Error(
//               "Benutzererstellung via Azure AD SSO fehlgeschlagen."
//             );
//           }
//           userFromDB = newUserResult.recordset[0];
//         }
//       }

//       // ❌ Prüfen, ob der Benutzer gefunden wurde und aktiv ist
//       if (!userFromDB || !userFromDB.IsActive) {
//         console.warn(
//           `⚠️ Konto ist inaktiv oder konnte nach Azure AD SSO nicht verifiziert werden für Email: ${email}`
//         );
//         res.redirect(
//           `${
//             process.env.FRONTEND_URL || "http://localhost:3000"
//           }/auth/signin?error=account_issue_azure_ad&message=${encodeURIComponent(
//             "Konto ist inaktiv oder konnte nicht verifiziert werden."
//           )}`
//         );
//         return;
//       }

//       // ✅ Session-Tokens ausstellen (Access Token & Refresh Token Cookies)
//       // Das userFromDB-Objekt muss die Struktur von UserDataForToken erfüllen.
//       await issueSessionTokens(res, userFromDB, pool);

//       // 🕒 Letzten Login-Zeitpunkt und AuthProvider in der Datenbank aktualisieren
//       pool
//         .request()
//         .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
//         .input("AuthProvider", sql.NVarChar(50), "azure-ad") // AuthProvider auf 'azure-ad' setzen
//         .query(
//           `UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME(), AuthProvider = @AuthProvider WHERE UserID = @UserID`
//         )
//         .catch((dbErr: any) =>
//           console.error(
//             "🔥 Fehler beim Aktualisieren von LastLoginAt/AuthProvider nach Azure AD SSO:",
//             dbErr.message || dbErr
//           )
//         );

//       console.log(
//         `✅ Azure AD SSO erfolgreich für ${userFromDB.Email}. App-Session-Cookies gesetzt. Weiterleitung zu /profile.`
//       );
//       // Letzte Umleitung an das Frontend nach erfolgreichem Login
//       res.redirect(
//         `${process.env.FRONTEND_URL || "http://localhost:3000"}/profile`
//       );
//     } catch (error) {
//       console.error("🔥 Fehler im Azure AD SSO Callback-Endpunkt:", error);
//       const specificError =
//         error instanceof Error ? error.message : String(error);
//       res.redirect(
//         `${
//           process.env.FRONTEND_URL || "http://localhost:3000"
//         }/auth/signin?error=azure_ad_callback_failed&message=${encodeURIComponent(
//           specificError
//         )}`
//       );
//     }
//   }
// );


// -------------------------------------------------------------------
// GET /api/auth/sso/azure-ad-callback
// Zweck: Handhabt die Umleitung vom Java Service nach erfolgreicher Azure AD SAML-Authentifizierung.
//        Provisorisiert (erstellt) oder aktualisiert den Benutzer und stellt Anwendungstokens aus.
// -------------------------------------------------------------------
router.get(
  "/sso/azure-ad-callback",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const FRONTEND =
      (process.env.FRONTEND_URL && process.env.FRONTEND_URL.replace(/\/$/, "")) ||
      "https://simoneapi.gascade.de";

    // 📥 Daten aus Query übernehmen
    const email = req.query.email as string | undefined;
    const firstName = req.query.firstName as string | undefined;
    const lastName = req.query.lastName as string | undefined;
    const azureAdId = req.query.azureAdId as string | undefined;

    console.log(
      `ℹ️ Azure AD SSO Callback empfangen. Details: Email=${email}, FirstName=${firstName}, LastName=${lastName}, AzureAdId=${azureAdId}`
    );

    // ❌ Minimal-Validierung
    if (!email) {
      console.error("🔥 Azure AD SSO Callback: E-Mail-Adresse fehlt.");
      res.redirect(
        302,
        `${FRONTEND}/auth/signin?error=sso_callback_failed&message=${encodeURIComponent(
          "E-Mail-Adresse fehlte im SSO-Callback."
        )}`
      );
      return;
    }

    try {
      const pool = getDBPool();
      let userFromDB: DbUser | undefined;

      // 🔍 1) Nach AzureAdID suchen
      if (azureAdId) {
        const byAad = await pool
          .request()
          .input("AzureAdID", sql.NVarChar(255), azureAdId)
          .query<DbUser>(`
            SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role,
                   GoogleID, AzureAdID, AuthProvider, IsMfaEnabled, MfaSecret
            FROM dbo.Users WHERE AzureAdID = @AzureAdID
          `);
        userFromDB = byAad.recordset[0];
      }

      // 🔍 2) Fallback: nach E-Mail suchen (und ggf. zuordnen/erstellen)
      if (!userFromDB) {
        const byEmail = await pool
          .request()
          .input("Email", sql.NVarChar(255), email.toLowerCase())
          .query<DbUser>(`
            SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role,
                   GoogleID, AzureAdID, AuthProvider, IsMfaEnabled, MfaSecret
            FROM dbo.Users WHERE Email = @Email
          `);
        userFromDB = byEmail.recordset[0];

        if (userFromDB) {
          if (!userFromDB.AzureAdID) {
            console.log(`ℹ️ Verknüpfe bestehendes Konto (${email}) mit AzureAdID.`);
            await pool
              .request()
              .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
              .input("AzureAdID", sql.NVarChar(255), azureAdId || null)
              .input("AuthProvider", sql.NVarChar(50), "azure-ad")
              .query(`
                UPDATE dbo.Users
                   SET AzureAdID = @AzureAdID,
                       AuthProvider = @AuthProvider,
                       UpdatedAt = SYSUTCDATETIME()
                 WHERE UserID = @UserID
              `);
            userFromDB.AzureAdID = azureAdId || null;
            userFromDB.AuthProvider = "azure-ad";
          }
        } else {
          console.log(`ℹ️ Erstelle neuen Benutzer für Azure AD SSO: ${email}`);
          const defaultRole = "user";
          const inserted = await pool
            .request()
            .input("FirstName", sql.NVarChar(100), firstName || null)
            .input("LastName", sql.NVarChar(100), lastName || null)
            .input("Email", sql.NVarChar(255), email.toLowerCase())
            .input("PasswordHash", sql.NVarChar(sql.MAX), null)
            .input("Role", sql.NVarChar(50), defaultRole)
            .input("GoogleID", sql.NVarChar(255), null)
            .input("AzureAdID", sql.NVarChar(255), azureAdId || null)
            .input("AuthProvider", sql.NVarChar(50), "azure-ad")
            .input("IsActive", sql.Bit, 1)
            .query<DbUser>(`
              INSERT INTO dbo.Users
                (FirstName, LastName, Email, PasswordHash, Role, GoogleID, AzureAdID,
                 AuthProvider, IsActive, CreatedAt, UpdatedAt, IsMfaEnabled, MfaSecret)
              OUTPUT inserted.UserID, inserted.Email, inserted.PasswordHash, inserted.FirstName,
                     inserted.LastName, inserted.IsActive, inserted.Role, inserted.GoogleID,
                     inserted.AzureAdID, inserted.AuthProvider, inserted.IsMfaEnabled, inserted.MfaSecret
              VALUES (@FirstName, @LastName, @Email, @PasswordHash, @Role, @GoogleID, @AzureAdID,
                      @AuthProvider, @IsActive, SYSUTCDATETIME(), SYSUTCDATETIME(), 0, NULL)
            `);
          if (!inserted.recordset[0]) {
            throw new Error("Benutzererstellung via Azure AD SSO fehlgeschlagen.");
          }
          userFromDB = inserted.recordset[0];
        }
      }

      // ❌ Aktivität prüfen
      if (!userFromDB || !userFromDB.IsActive) {
        console.warn(`⚠️ Konto inaktiv oder unverifiziert: ${email}`);
        res.redirect(
          302,
          `${FRONTEND}/auth/signin?error=account_issue_azure_ad&message=${encodeURIComponent(
            "Konto ist inaktiv oder konnte nicht verifiziert werden."
          )}`
        );
        return;
      }

      // ✅ Tokens setzen (Cookies)
      await issueSessionTokens(res, userFromDB, pool);

      // 🕒 Loginmetadaten aktualisieren (Fire & forget)
      pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
        .input("AuthProvider", sql.NVarChar(50), "azure-ad")
        .query(`
          UPDATE dbo.Users
             SET LastLoginAt = SYSUTCDATETIME(), AuthProvider = @AuthProvider
           WHERE UserID = @UserID
        `)
        .catch((e: any) =>
          console.error("🔥 LastLoginAt/AuthProvider Update fehlgeschlagen:", e?.message || e)
        );

      console.log(`✅ Azure AD SSO erfolgreich für ${userFromDB.Email}. Redirect -> /profile`);
      res.redirect(302, `${FRONTEND}/profile`);
    } catch (error) {
      console.error("🔥 Fehler im Azure AD SSO Callback-Endpunkt:", error);
      const msg = error instanceof Error ? error.message : String(error);
      res.redirect(
        302,
        `${FRONTEND}/auth/signin?error=azure_ad_callback_failed&message=${encodeURIComponent(
          msg
        )}`
      );
    }
  }
);


// -------------------------------------------------------------------
// POST /api/auth/change-password
// Ermöglicht einem authentifizierten Benutzer, sein Passwort zu ändern.
// Geschützt durch die 'authMiddleware'.
// -------------------------------------------------------------------
router.post(
  "/change-password",
  authMiddleware, // Stellt sicher, dass der Benutzer eingeloggt ist
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user wird von der authMiddleware gesetzt und enthält die Benutzerinformationen
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          message: "Benutzer nicht authentifiziert oder Sitzung ungültig.",
        });
        return;
      }
      const { userId } = req.user; // Hole die Benutzer-ID aus der authentifizierten Sitzung

      // Validierung des Request-Bodys mit Zod
      const { currentPassword, newPassword } = changePasswordSchema.parse(
        req.body
      );

      const pool = getDBPool();

      // 🔍 1. Aktuellen Passwort-Hash und Authentifizierungsanbieter des Benutzers abrufen
      //    Stellt sicher, dass der Benutzer aktiv ist und ein Passwort ändern kann (d.h. kein reiner OAuth-Benutzer).
      const userResult = await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId)
        .query(
          "SELECT PasswordHash, AuthProvider FROM dbo.Users WHERE UserID = @UserID AND IsActive = 1"
        );

      if (userResult.recordset.length === 0) {
        // Dieser Fall sollte idealerweise nicht eintreten, wenn die authMiddleware den Benutzer bereits verifiziert hat
        res
          .status(404)
          .json({ message: "Benutzer nicht gefunden oder Konto ist inaktiv." });
        return;
      }
      const userData = userResult.recordset[0];

      // ⚠️ 2. Prüfen, ob eine Passwortänderung für diesen Kontotyp zulässig ist
      //    Wenn der Benutzer sich über Google oder einen anderen OAuth-Anbieter registriert hat,
      //    oder wenn PasswordHash aus irgendeinem Grund NULL ist.
      if (userData.AuthProvider !== "email" || !userData.PasswordHash) {
        res.status(400).json({
          message:
            "Passwortänderung ist für diesen Kontotyp nicht möglich. Benutzer, die sich mit externen Anbietern registriert haben, sollten ihre Passwörter dort verwalten.",
        });
        return;
      }

      // 🔐 3. Aktuelles Passwort verifizieren
      const isCurrentPasswordMatch = await bcrypt.compare(
        currentPassword,
        userData.PasswordHash
      );
      if (!isCurrentPasswordMatch) {
        res.status(400).json({
          message: "Aktuelles Passwort ist falsch. Bitte erneut versuchen.",
        });
        return;
      }

      // 4. Das neue Passwort hashen
      const saltRounds = 12; // Gleiche Salt-Runden wie bei der Registrierung
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // 5. Den neuen Passwort-Hash in der Datenbank aktualisieren
      await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId)
        .input("NewPasswordHash", sql.NVarChar(sql.MAX), newPasswordHash)
        .query(
          "UPDATE dbo.Users SET PasswordHash = @NewPasswordHash, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
        );

      console.log(
        `✅ Passwort erfolgreich geändert für Benutzer-ID: ${userId}`
      );

      // OPTIONAL, ABER EMPFOHLEN: Andere aktive Sitzungen für diesen Benutzer ungültig machen.
      // Dies geschieht typischerweise durch das Widerrufen aller ihrer Refresh Tokens.
      await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId)
        .query(
          "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID"
        );
      console.log(
        `ℹ️ Alle Refresh Tokens für Benutzer-ID: ${userId} nach der Passwortänderung zur Verbesserung der Sicherheit widerrufen.`
      );
      // Hinweis: Das Refresh Token-Cookie der aktuellen Sitzung auf dem Client ist jetzt ungültig.
      // Das Access Token bleibt bis zu seinem Ablauf gültig. Der Benutzer muss sich möglicherweise
      // auf anderen Geräten erneut anmelden, und auf diesem Gerät, sobald das Access Token abläuft
          res.status(200).json({
        message:
          "Passwort erfolgreich geändert. Du musst dich möglicherweise auf anderen Geräten erneut anmelden.",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Ungültige Daten für die Passwortänderung bereitgestellt.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }
      console.error("🔥 Fehler beim Ändern des Passworts:", error);
      next(error); // Fehler an den globalen Fehler-Handler weiterleiten
    }
  }
);

// -------------------------------------------------------------------
// POST /api/auth/register
// Registrierung eines neuen Benutzers mit E-Mail und Passwort.
// -------------------------------------------------------------------
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedBody = registerSchema.parse(req.body);
      const { firstName, lastName, email, password } = validatedBody;
      const pool = getDBPool();

      // 🔍 Prüfe, ob bereits ein Benutzer mit dieser E-Mail-Adresse existiert
      const userExistsResult = await pool
        .request()
        .input("Email", sql.NVarChar(255), email.toLowerCase())
        .query("SELECT UserID FROM dbo.Users WHERE Email = @Email");

      if (userExistsResult.recordset.length > 0) {
        res.status(409).json({
          message:
            "Konflikt: Ein Konto mit dieser E-Mail-Adresse existiert bereits.",
        });
        return;
      }

      // 🔐 Passwort hashen (Salt-Runden 12 für gute Sicherheit)
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const defaultRole = "user"; // Standardrolle für neue Benutzer

      // 📝 Neuen Benutzer in die Datenbank einfügen
      // GoogleID, MfaSecret und IsMfaEnabled werden hier standardmäßig gesetzt (NULL/0)
      const insertUserResult = await pool
        .request()
        .input("FirstName", sql.NVarChar(100), firstName)
        .input("LastName", sql.NVarChar(100), lastName)
        .input("Email", sql.NVarChar(255), email.toLowerCase())
        .input("PasswordHash", sql.NVarChar(sql.MAX), passwordHash) // Annahme: PasswordHash ist NICHT NULL
        .input("Role", sql.NVarChar(50), defaultRole)
        .input("AuthProvider", sql.NVarChar(50), "email") // Explizit den Authentifizierungsanbieter setzen
        .query(`
          INSERT INTO dbo.Users (FirstName, LastName, Email, PasswordHash, Role, AuthProvider, IsActive, CreatedAt, UpdatedAt)
          OUTPUT inserted.UserID, inserted.Email, inserted.FirstName, inserted.LastName, inserted.Role, inserted.CreatedAt, inserted.IsActive
          VALUES (@FirstName, @LastName, @Email, @PasswordHash, @Role, @AuthProvider, 1, SYSUTCDATETIME(), SYSUTCDATETIME())
        `);

      if (!insertUserResult.recordset[0]) {
        throw new Error(
          "Benutzerregistrierung fehlgeschlagen, kein Datensatz zurückgegeben."
        );
      }

      const newUser = insertUserResult.recordset[0];
      console.log("✅ Benutzer erfolgreich registriert:", {
        userId: newUser.UserID,
        email: newUser.Email,
        role: newUser.Role,
      });

      res.status(201).json({
        message: "Benutzer erfolgreich registriert! Bitte melde dich an.",
        user: {
          id: newUser.UserID,
          firstName: newUser.FirstName,
          lastName: newUser.LastName,
          email: newUser.Email,
          role: newUser.Role,
          isActive: newUser.IsActive,
          createdAt: newUser.CreatedAt,
          // isMfaEnabled wird standardmäßig auf 0 (false) aus dem DB-Schema gesetzt
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validierung fehlgeschlagen während der Registrierung.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }
      console.error("🔥 Fehler im Registrierung-Endpunkt:", error);
      next(error); // Fehler an den globalen Fehler-Handler weiterleiten
    }
  }
);

// -------------------------------------------------------------------
// POST /api/auth/login
// Handhabt den Benutzer-Login mit E-Mail/Passwort und integriert MFA-Prüfung.
// -------------------------------------------------------------------
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 🔎 Eingabevalidierung des Login-Schemas mit Zod
      const validatedBody = loginSchema.parse(req.body);
      const { email, password } = validatedBody;
      const pool = getDBPool();

      // 📦 Benutzer anhand E-Mail-Adresse aus der Datenbank laden
      // Alle notwendigen Felder, einschließlich IsMfaEnabled und MfaSecret, werden abgefragt.
      const userResult = await pool
        .request()
        .input("Email", sql.NVarChar(255), email.toLowerCase()).query<DbUser>(`
          SELECT
            UserID, Email, PasswordHash, FirstName, LastName,
            IsActive, Role, IsMfaEnabled, MfaSecret, AuthProvider
          FROM dbo.Users
          WHERE Email = @Email
        `);

      if (userResult.recordset.length === 0) {
        // Benutzer existiert nicht oder E-Mail ist falsch
        res
          .status(401)
          .json({ message: "Ungültige Anmeldedaten bereitgestellt." });
        return;
      }
      const userFromDB = userResult.recordset[0];

      // 🔒 Kontoaktivität prüfen
      if (!userFromDB.IsActive) {
        res.status(403).json({
          message: "Konto ist inaktiv. Bitte wende dich an den Support.",
        });
        return;
      }

      // 🔐 Prüfen, ob ein Passwort-Login für diesen Benutzerkontotyp zulässig ist
      // Dies differenziert zwischen E-Mail-Passwort-Benutzern und OAuth-only-Benutzern.
      if (!userFromDB.PasswordHash) {
        if (userFromDB.AuthProvider !== "email") {
          console.warn(
            `⚠️ Login-Versuch für Benutzer ${email} ohne Passwort-Hash (AuthProvider: ${userFromDB.AuthProvider}).`
          );
          res.status(401).json({
            message: `Dieses Konto wurde mit ${
              userFromDB.AuthProvider || "einem externen Anbieter"
            }. Bitte melde dich über diese Methode an.`,
          });
          return;
        } else {
          // Dies ist ein Fehlerzustand: Ein E-Mail-Benutzer sollte einen Passwort-Hash haben
          console.error(
            `🔥 Benutzer ${email} (AuthProvider 'email') hat keinen PasswordHash! Konto möglicherweise beschädigt oder falsch erstellt.`
          );
          res.status(500).json({
            message: "Fehlerhafte Kontokonfiguration. Login nicht möglich.",
          });
          return;
        }
      }

      // 🔍 Passwort überprüfen
      const isPasswordMatch = await bcrypt.compare(
        password,
        userFromDB.PasswordHash
      );
      if (!isPasswordMatch) {
        res
          .status(401)
          .json({ message: "Ungültige Anmeldedaten bereitgestellt." });
        return;
      }

      // 🔐 MFA-Prüfung: Wenn MFA aktiviert ist, eine MFA-Challenge senden
      if (userFromDB.IsMfaEnabled && userFromDB.MfaSecret) {
        console.log(
          `ℹ️ MFA ist für Benutzer ${email} aktiviert. MFA-Challenge erforderlich.`
        );
        res.status(200).json({
          mfaRequired: true,
          userId: userFromDB.UserID, // Sende die Benutzer-ID, um sie mit dem MFA-Verifizierungsschritt zu verknüpfen
          message: "Passwort verifiziert. Bitte gib deinen MFA-Code ein.",
        });
        return; // Hier stoppen, auf MFA-Verifizierung warten
      }

      // ✅ MFA NICHT aktiviert: Direkt mit der Standard-Token-Ausstellung fortfahren
      console.log(
        `ℹ️ MFA ist NICHT für Benutzer ${email} aktiviert oder kein MfaSecret gefunden. Fahre mit der Standard-Token-Ausstellung fort.`
      );
      await issueSessionTokens(res, userFromDB, pool); // Ruft die Hilfsfunktion auf

      // Letzte Login-Zeit in der Datenbank aktualisieren (asynchron, Fehler werden nur geloggt)
      pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
        .query(
          "UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME() WHERE UserID = @UserID"
        )
        .catch((dbErr: any) =>
          console.error(
            "🔥 Fehler beim Aktualisieren von LastLoginAt nach dem Login:",
            dbErr.message || dbErr
          )
        );

      console.log(
        `✅ Login erfolgreich für ${userFromDB.Email} (MFA nicht erforderlich).`
      );
      // Sende die endgültige JSON-Antwort
      res.status(200).json({
        mfaRequired: false,
        message: "Login erfolgreich! Sitzung wurde gestartet.",
        user: {
          // Sicherstellen, dass diese Struktur dem Frontend-UserData-Typ entspricht
          id: userFromDB.UserID,
          firstName: userFromDB.FirstName,
          lastName: userFromDB.LastName,
          email: userFromDB.Email,
          role: userFromDB.Role,
          isMfaEnabled: userFromDB.IsMfaEnabled, // Sende auch den aktuellen MFA-Status
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validierung fehlgeschlagen.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }
      console.error("🔥 Fehler im Login-Endpunkt:", error);
      if (!res.headersSent) {
        // Prüfen, ob Header bereits gesendet wurden (z.B. von issueSessionTokens, wenn es frühzeitig einen Fehler ausgelöst hat)
        next(error); // Andernfalls an den globalen Fehler-Handler weiterleiten
      }
    }
  }
);

// -------------------------------------------------------------------
// POST /api/auth/verify-mfa
// Wird aufgerufen NACHdem die E-Mail/Passwort-Kombination erfolgreich war
// und MFA für den Benutzer aktiviert ist.
// -------------------------------------------------------------------
router.post(
  "/verify-mfa",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 📥 Eingabedaten validieren: userId und TOTP-Code (muss 6-stellig sein)
      const { userId, totpCode } = verifyMfaLoginSchema.parse(req.body);
      const pool = getDBPool();

      // 🔍 Benutzerdaten abrufen (einschließlich IsMfaEnabled und MfaSecret)
      const userResult = await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userId).query<DbUser>(`
          SELECT
            UserID, Email, FirstName, LastName,
            IsActive, Role, IsMfaEnabled, MfaSecret
          FROM dbo.Users
          WHERE UserID = @UserID
        `);

      if (userResult.recordset.length === 0) {
        res
          .status(401)
          .json({ message: "Benutzer zur MFA-Verifizierung nicht gefunden." });
        return;
      }
      const userFromDB = userResult.recordset[0];

      // 🚫 Prüfen, ob das Konto inaktiv ist
      if (!userFromDB.IsActive) {
        res.status(403).json({ message: "Konto ist inaktiv." });
        return;
      }

      // 🔐 Prüfen, ob MFA für dieses Konto ordnungsgemäß aktiviert ist
      if (!userFromDB.IsMfaEnabled || !userFromDB.MfaSecret) {
        console.warn(
          `⚠️ MFA-Verifizierung angefordert für Benutzer-ID: ${userId}, aber MFA ist nicht ordnungsgemäß aktiviert oder Secret fehlt.`
        );
        res.status(400).json({
          message:
            "MFA ist für dieses Konto nicht aktiviert oder die Einrichtung ist unvollständig.",
        });
        return;
      }

      // 🔓 MFA-Secret entschlüsseln (es wird verschlüsselt in der DB gespeichert)
      const decryptedMfaSecret = decryptMfaSecret(userFromDB.MfaSecret);
      if (!decryptedMfaSecret) {
        console.error(
          `🔥 Fehler beim Entschlüsseln des MFA-Secrets für Benutzer-ID: ${userId} während der Login-Verifizierung.`
        );
        res.status(500).json({
          message:
            "MFA-Überprüfung fehlgeschlagen aufgrund eines Sicherheitsproblems bei der Konfiguration.",
        });
        return;
      }

      // 🔍 TOTP-Code mit der 'otplib'-Bibliothek verifizieren
      const isValid = authenticator.verify({
        token: totpCode,
        secret: decryptedMfaSecret,
        // Optional: 'window: 1' kann hinzugefügt werden, um eine geringfügige Zeitabweichung zuzulassen (1 vorheriges/nächstes Token)
      });

      if (!isValid) {
        console.warn(
          `⚠️ MFA-Verifizierung fehlgeschlagen für Benutzer-ID: ${userId}. Ungültiger TOTP-Code.`
        );
        res
          .status(401)
          .json({ message: "Ungültiger MFA-Code. Bitte erneut versuchen." });
        return;
      }

      // ✅ MFA-Code erfolgreich verifiziert. Session-Tokens ausstellen.
      console.log(
        `✅ MFA-Code verifiziert für Benutzer-ID: ${userId}. Volle Session-Tokens werden ausgestellt.`
      );
      // Sicherstellen, dass userFromDB die 'UserDataForToken'-Struktur erfüllt
      await issueSessionTokens(res, userFromDB, pool);

      // Letzte Login-Zeit in der Datenbank aktualisieren (im Hintergrund, Fehler ignorieren)
      pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
        .query(
          "UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME() WHERE UserID = @UserID"
        )
        .catch((dbErr: any) =>
          console.error(
            "🔥 Fehler beim Aktualisieren von LastLoginAt nach der MFA-Verifizierung:",
            dbErr.message || dbErr
          )
        );

      res.status(200).json({
        message: "MFA-Verifizierung erfolgreich! Login abgeschlossen.",
        user: {
          id: userFromDB.UserID,
          firstName: userFromDB.FirstName,
          lastName: userFromDB.LastName,
          email: userFromDB.Email,
          role: userFromDB.Role,
          isMfaEnabled: userFromDB.IsMfaEnabled,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Ungültige Daten für die MFA-Verifizierung.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }
      console.error("🔥 Fehler im /verify-mfa-Endpunkt:", error);
      if (!res.headersSent) {
        next(error); // Fehler an den globalen Fehler-Handler weiterleiten
      }
    }
  }
);

// // -------------------------------------------------------------------
// // POST /api/auth/refresh-token
// // Zweck: Erzeugt ein neues Access Token, falls der Benutzer ein gültiges
// //        Refresh Token als HTTP-Only-Cookie besitzt.
// // -------------------------------------------------------------------
// router.post(
//   "/refresh-token",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     // 🔍 Name des Refresh Token Cookies aus .env oder Fallback auf "refreshToken"
//     const refreshTokenCookieName =
//       process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

//     // 🧁 Refresh Token aus dem eingehenden HTTP-Cookie auslesen
//     const incomingRefreshToken = req.cookies
//       ? req.cookies[refreshTokenCookieName]
//       : undefined;

//     console.log(
//       `🔄 /api/auth/refresh-token: Endpunkt aufgerufen. Cookie '${refreshTokenCookieName}' ist ${
//         incomingRefreshToken ? "vorhanden" : "nicht vorhanden"
//       }`
//     );

//     // 🚫 Kein Refresh Token im Cookie → Zugriff verweigert
//     if (!incomingRefreshToken) {
//       res
//         .status(401)
//         .json({ message: "Zugriff verweigert. Kein Refresh-Token gesendet." });
//       return;
//     }

//     try {
//       const pool = getDBPool();

//       // 🧮 Eingehendes Token hashen, da in der Datenbank nur gehashte Tokens gespeichert sind (Sicherheitsprinzip!)
//       const hashedIncomingRefreshToken = hashToken(incomingRefreshToken);

//       // 🔍 In der Datenbank nach dem gehashten Token suchen und zugehörige Benutzerdaten abrufen
//       const tokenResult = await pool
//         .request()
//         .input("TokenHash", sql.NVarChar(256), hashedIncomingRefreshToken)
//         .query<RefreshTokenQueryResult>(`
//           SELECT
//             rt.UserID, rt.ExpiresAt AS TokenExpiresAt, rt.IsRevoked,
//             u.Email, u.Role, u.IsActive AS UserIsActive, u.FirstName, u.LastName
//           FROM dbo.RefreshTokens rt
//           INNER JOIN dbo.Users u ON rt.UserID = u.UserID
//           WHERE rt.TokenHash = @TokenHash
//         `);

//       // 🚫 Kein Treffer in der Datenbank → Token ungültig oder manipuliert
//       if (tokenResult.recordset.length === 0) {
//         console.warn(
//           `🔄 Refresh-Token nicht in DB gefunden oder manipuliert (Hash beginnt mit: ${hashedIncomingRefreshToken.substring(
//             0,
//             10
//           )}...)`
//         );
//         // Das ungültige Cookie beim Client löschen
//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({ message: "Zugriff verweigert. Refresh-Token ungültig." });
//         return;
//       }

//       const tokenData = tokenResult.recordset[0]; // tokenData ist jetzt vom Typ RefreshTokenQueryResult

//       // 🚫 Prüfen, ob das Token manuell oder automatisch widerrufen wurde
//       if (tokenData.IsRevoked) {
//         console.warn(
//           `🔄 Verwendetes Token wurde widerrufen (Benutzer-ID: ${tokenData.UserID}) – Alle Tokens dieses Benutzers werden nun gesperrt.`
//         );

//         // ⛔ Bei erkanntem Versuch, ein widerrufenes Token zu verwenden, alle Tokens des Nutzers widerrufen
//         // (z.B. bei Missbrauch oder Sicherheitsvorfall)
//         await pool
//           .request()
//           .input("UserID", sql.UniqueIdentifier, tokenData.UserID)
//           .query(
//             "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID"
//           );

//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({ message: "Zugriff verweigert. Token wurde widerrufen." });
//         return;
//       }

//       // 🕓 Prüfen, ob das Token abgelaufen ist
//       if (new Date(tokenData.TokenExpiresAt) < new Date()) {
//         console.warn(
//           `🔄 Abgelaufenes Refresh-Token verwendet für Benutzer-ID: ${tokenData.UserID}`
//         );

//         // ⛔ Token explizit widerrufen (obwohl abgelaufen), um es nicht erneut zuzulassen
//         await pool
//           .request()
//           .input("TokenHash", sql.NVarChar(256), hashedIncomingRefreshToken)
//           .query(
//             "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE TokenHash = @TokenHash"
//           );

//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res.status(403).json({
//           message: "Zugriff verweigert. Refresh-Token ist abgelaufen.",
//         });
//         return;
//       }

//       // 📴 Prüfen, ob das zugehörige Benutzerkonto deaktiviert wurde
//       if (!tokenData.UserIsActive) {
//         console.warn(
//           `🔄 Refresh-Token verwendet für ein inaktives Benutzerkonto: Benutzer-ID ${tokenData.UserID}`
//         );
//         res.clearCookie(refreshTokenCookieName, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax" as const,
//           path: "/api/auth/refresh-token",
//         });
//         res
//           .status(403)
//           .json({ message: "Zugriff verweigert. Benutzerkonto ist inaktiv." });
//         return;
//       }

//       // ✅ Alle Prüfungen bestanden → Neues Access Token + neues Refresh Token ausstellen
//       const userForTokenIssue: UserDataForToken = {
//         UserID: tokenData.UserID,
//         Email: tokenData.Email,
//         Role: tokenData.Role,
//       };
//       await issueSessionTokens(res, userForTokenIssue, pool);

//       console.log(
//         `🔄 Access-Token erfolgreich erneuert für Benutzer-ID: ${tokenData.UserID}.`
//       );
//       res.status(200).json({ message: "Access-Token erfolgreich erneuert." });
//     } catch (error) {
//       console.error("🔥 Fehler im /refresh-token-Endpunkt:", error);

//       // 🍪 Cookie löschen bei kritischem Fehler, um den Client-Zustand zu bereinigen
//       res.clearCookie(refreshTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api/auth/refresh-token",
//       });

//       if (!res.headersSent) {
//         next(error); // Fehler an den globalen Fehler-Handler weiterleiten
//       }
//     }
//   }
// );

// -------------------------------------------------------------------
// POST /api/auth/refresh-token
// Zweck: Erzeugt ein neues Access Token, falls der Benutzer ein gültiges
//        Refresh Token als HTTP-Only-Cookie besitzt.
// -------------------------------------------------------------------
router.post(
  "/refresh-token",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 🔧 Gemeinsame Cookie-Optionen dynamisch bestimmen
    const isProd = process.env.NODE_ENV === "production";
    const sameSite: "none" | "lax" = isProd ? "none" : "lax";

    // Basis-Pfad für Cookies: Standard "/" damit Cookies überall (z.B. /profile/me) gesendet werden
    const cookieBasePathRaw = process.env.COOKIE_BASE_PATH ?? "/";
    const cookieBasePath =
      cookieBasePathRaw !== "/" && cookieBasePathRaw.endsWith("/")
        ? cookieBasePathRaw.slice(0, -1)
        : cookieBasePathRaw;

    // Pfad für das Refresh-Cookie (unterhalb der Basis)
    const refreshCookiePath =
      cookieBasePath === "/"
        ? "/auth/refresh-token"
        : `${cookieBasePath}/auth/refresh-token`;

    // Domain (in Prod nötig, damit die Attribute beim Löschen übereinstimmen)
    const cookieDomain =
      process.env.COOKIE_DOMAIN || (isProd ? "simoneapi.gascade.de" : undefined);

    // 🔍 Name des Refresh Token Cookies aus .env oder Fallback auf "refreshToken"
    const refreshTokenCookieName =
      process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

    // Kleine Hilfsfunktion: Refresh-Cookies auf allen relevanten (auch alten) Pfaden löschen
    const clearRefreshCookies = () => {
      const pathsToClear = [
        refreshCookiePath,                     // aktueller Pfad (z.B. "/auth/refresh-token")
        "/api/auth/refresh-token",             // Legacy-Variante
        "/simone/api/auth/refresh-token",      // Legacy-Variante
      ];
      for (const p of pathsToClear) {
        res.clearCookie(refreshTokenCookieName, {
          httpOnly: true,
          secure: isProd,
          sameSite,
          path: p,
          ...(cookieDomain ? { domain: cookieDomain } : {}),
        });
      }
    };

    // 🧁 Refresh Token aus dem eingehenden HTTP-Cookie auslesen
    const incomingRefreshToken = req.cookies
      ? req.cookies[refreshTokenCookieName]
      : undefined;

    console.log(
      `🔄 /api/auth/refresh-token: Endpunkt aufgerufen. Cookie '${refreshTokenCookieName}' ist ${
        incomingRefreshToken ? "vorhanden" : "nicht vorhanden"
      } (erwartet auf path='${refreshCookiePath}')`
    );

    // 🚫 Kein Refresh Token im Cookie → Zugriff verweigert
    if (!incomingRefreshToken) {
      clearRefreshCookies();
      res
        .status(401)
        .json({ message: "Zugriff verweigert. Kein Refresh-Token gesendet." });
      return;
    }

    try {
      const pool = getDBPool();

      // 🧮 Eingehendes Token hashen (in DB nur gehashte Tokens)
      const hashedIncomingRefreshToken = hashToken(incomingRefreshToken);

      // 🔍 In der Datenbank nach dem gehashten Token suchen und zugehörige Benutzerdaten abrufen
      const tokenResult = await pool
        .request()
        .input("TokenHash", sql.NVarChar(256), hashedIncomingRefreshToken)
        .query<RefreshTokenQueryResult>(`
          SELECT
            rt.UserID, rt.ExpiresAt AS TokenExpiresAt, rt.IsRevoked,
            u.Email, u.Role, u.IsActive AS UserIsActive, u.FirstName, u.LastName
          FROM dbo.RefreshTokens rt
          INNER JOIN dbo.Users u ON rt.UserID = u.UserID
          WHERE rt.TokenHash = @TokenHash
        `);

      // 🚫 Kein Treffer in der Datenbank → Token ungültig oder manipuliert
      if (tokenResult.recordset.length === 0) {
        console.warn(
          `🔄 Refresh-Token nicht in DB gefunden oder manipuliert (Hash beginnt mit: ${hashedIncomingRefreshToken.substring(
            0,
            10
          )}...)`
        );
        clearRefreshCookies();
        res
          .status(403)
          .json({ message: "Zugriff verweigert. Refresh-Token ungültig." });
        return;
      }

      const tokenData = tokenResult.recordset[0];

      // 🚫 Prüfen, ob das Token widerrufen wurde
      if (tokenData.IsRevoked) {
        console.warn(
          `🔄 Verwendetes Token wurde widerrufen (Benutzer-ID: ${tokenData.UserID}) – alle Tokens dieses Benutzers werden gesperrt.`
        );

        await pool
          .request()
          .input("UserID", sql.UniqueIdentifier, tokenData.UserID)
          .query(
            "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE UserID = @UserID"
          );

        clearRefreshCookies();
        res
          .status(403)
          .json({ message: "Zugriff verweigert. Token wurde widerrufen." });
        return;
      }

      // 🕓 Prüfen, ob das Token abgelaufen ist
      if (new Date(tokenData.TokenExpiresAt) < new Date()) {
        console.warn(
          `🔄 Abgelaufenes Refresh-Token verwendet für Benutzer-ID: ${tokenData.UserID}`
        );

        await pool
          .request()
          .input("TokenHash", sql.NVarChar(256), hashedIncomingRefreshToken)
          .query(
            "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE TokenHash = @TokenHash"
          );

        clearRefreshCookies();
        res.status(403).json({
          message: "Zugriff verweigert. Refresh-Token ist abgelaufen.",
        });
        return;
      }

      // 📴 Prüfen, ob das Benutzerkonto deaktiviert wurde
      if (!tokenData.UserIsActive) {
        console.warn(
          `🔄 Refresh-Token für inaktives Benutzerkonto verwendet: Benutzer-ID ${tokenData.UserID}`
        );
        clearRefreshCookies();
        res
          .status(403)
          .json({ message: "Zugriff verweigert. Benutzerkonto ist inaktiv." });
        return;
      }

      // ✅ Alle Prüfungen bestanden → Neues Access Token + neues Refresh Token ausstellen
      const userForTokenIssue: UserDataForToken = {
        UserID: tokenData.UserID,
        Email: tokenData.Email,
        Role: tokenData.Role,
      };
      await issueSessionTokens(res, userForTokenIssue, pool);

      console.log(
        `🔄 Access-Token erfolgreich erneuert für Benutzer-ID: ${tokenData.UserID}.`
      );
      res.status(200).json({ message: "Access-Token erfolgreich erneuert." });
    } catch (error) {
      console.error("🔥 Fehler im /refresh-token-Endpunkt:", error);
      clearRefreshCookies();

      if (!res.headersSent) {
        next(error);
      }
    }
  }
);


// // -------------------------------------------------------------------
// // POST /api/auth/logout
// // Zweck: Entfernt JWT Access- und Refresh-Tokens aus Cookies und widerruft
// //        ggf. das RefreshToken in der Datenbank.
// // -------------------------------------------------------------------
// router.post(
//   "/logout",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const accessTokenCookieName =
//       process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
//     const refreshTokenCookieName =
//       process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

//     // 🧁 Lies das aktuelle Refresh-Token aus den Cookies (falls vorhanden)
//     const incomingRefreshToken = req.cookies
//       ? req.cookies[refreshTokenCookieName]
//       : undefined;

//     try {
//       if (incomingRefreshToken) {
//         const pool = getDBPool();
//         const hashedRefreshToken = hashToken(incomingRefreshToken); // Sicherheit: Nur gehashte Tokens in der DB vergleichen

//         // 🛑 Widerrufe das RefreshToken in der Datenbank, um es ungültig zu machen
//         await pool
//           .request()
//           .input("TokenHash", sql.NVarChar(256), hashedRefreshToken)
//           .query(
//             "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE TokenHash = @TokenHash"
//           );
//         console.log(
//           `🍪 Refresh-Token (Hash beginnt mit: ${hashedRefreshToken.substring(
//             0,
//             10
//           )}...) als widerrufen markiert während des Logouts.`
//         );
//       }

//       // 🍪 Lösche Access- und Refresh-Token-Cookies vom Client
//       // Diese Operationen werden immer ausgeführt, unabhängig davon, ob ein Token gefunden wurde,
//       // um sicherzustellen, dass die Cookies auf dem Client gelöscht sind.
//       res.clearCookie(accessTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api",
//       });
//       res.clearCookie(refreshTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api/auth/refresh-token",
//       });

//       console.log(`🍪 Alle Session-Cookies beim Logout gelöscht.`);
//       res.status(200).json({
//         message: "Logout erfolgreich. Alle Sitzungstokens wurden entfernt.",
//       });
//     } catch (error) {
//       console.error("🔥 Fehler beim Logout:", error);

//       // Sicherheit: Auch im Fehlerfall die Cookies löschen
//       res.clearCookie(accessTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api",
//       });
//       res.clearCookie(refreshTokenCookieName, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax" as const,
//         path: "/api/auth/refresh-token",
//       });

//       if (!res.headersSent) {
//         next(error); // Fehler an den globalen Fehler-Handler weiterleiten
//       }
//     }
//   }
// );

// -------------------------------------------------------------------
// POST /api/auth/logout
// Zweck: Entfernt JWT Access- und Refresh-Tokens aus Cookies und widerruft
//        ggf. das RefreshToken in der Datenbank.
// -------------------------------------------------------------------
router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 🔧 Gemeinsame Cookie-Optionen dynamisch bestimmen
    const isProd = process.env.NODE_ENV === "production";
    const sameSite: "none" | "lax" = isProd ? "none" : "lax";

    // Basis-Pfad für Cookies
    const cookieBasePathRaw = process.env.COOKIE_BASE_PATH ?? "/";
    const cookieBasePath =
      cookieBasePathRaw !== "/" && cookieBasePathRaw.endsWith("/")
        ? cookieBasePathRaw.slice(0, -1)
        : cookieBasePathRaw;

    // Spezifische Pfade
    const accessCookiePath = cookieBasePath; // i.d.R. "/"
    const refreshCookiePath =
      cookieBasePath === "/"
        ? "/auth/refresh-token"
        : `${cookieBasePath}/auth/refresh-token`;

    // Domain (in Prod nötig, damit die Attribute beim Löschen übereinstimmen)
    const cookieDomain =
      process.env.COOKIE_DOMAIN || (isProd ? "simoneapi.gascade.de" : undefined);

    const accessTokenCookieName =
      process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
    const refreshTokenCookieName =
      process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

    // Hilfsfunktionen: Cookies auf allen (auch alten) Pfaden löschen
    const clearAccessCookies = () => {
      const pathsToClear = [
        accessCookiePath,     // aktueller Pfad (z.B. "/")
        "/api",               // Legacy-Variante
        "/simone/api",        // Legacy-Variante
      ];
      for (const p of pathsToClear) {
        res.clearCookie(accessTokenCookieName, {
          httpOnly: true,
          secure: isProd,
          sameSite,
          path: p,
          ...(cookieDomain ? { domain: cookieDomain } : {}),
        });
      }
    };

    const clearRefreshCookies = () => {
      const pathsToClear = [
        refreshCookiePath,                // aktueller Pfad (z.B. "/auth/refresh-token")
        "/api/auth/refresh-token",        // Legacy-Variante
        "/simone/api/auth/refresh-token", // Legacy-Variante
      ];
      for (const p of pathsToClear) {
        res.clearCookie(refreshTokenCookieName, {
          httpOnly: true,
          secure: isProd,
          sameSite,
          path: p,
          ...(cookieDomain ? { domain: cookieDomain } : {}),
        });
      }
    };

    // 🧁 Lies das aktuelle Refresh-Token aus den Cookies (falls vorhanden)
    const incomingRefreshToken = req.cookies
      ? req.cookies[refreshTokenCookieName]
      : undefined;

    try {
      // DB-Revocation nur, wenn tatsächlich ein Refresh-Token vorliegt
      if (incomingRefreshToken) {
        const pool = getDBPool();
        const hashedRefreshToken = hashToken(incomingRefreshToken);

        await pool
          .request()
          .input("TokenHash", sql.NVarChar(256), hashedRefreshToken)
          .query(
            "UPDATE dbo.RefreshTokens SET IsRevoked = 1 WHERE TokenHash = @TokenHash"
          );

        console.log(
          `🍪 Refresh-Token (Hash beginnt mit: ${hashedRefreshToken.substring(
            0,
            10
          )}...) als widerrufen markiert während des Logouts.`
        );
      }

      // 🍪 Cookies immer löschen (auch wenn kein Token anlag)
      clearAccessCookies();
      clearRefreshCookies();

      console.log(`🍪 Alle Session-Cookies beim Logout gelöscht.`);
      res.status(200).json({
        message: "Logout erfolgreich. Alle Sitzungstokens wurden entfernt.",
      });
    } catch (error) {
      console.error("🔥 Fehler beim Logout:", error);

      // Sicherheit: Auch im Fehlerfall die Cookies löschen
      clearAccessCookies();
      clearRefreshCookies();

      if (!res.headersSent) {
        next(error);
      }
    }
  }
);


// -------------------------------------------------------------------
// POST /api/auth/forgot-password
// Zweck: Sendet einen Link zum Zurücksetzen des Passworts an die angegebene E-Mail-Adresse,
//        falls ein aktives Konto mit dieser E-Mail existiert.
// -------------------------------------------------------------------
router.post(
  "/forgot-password",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 🔐 Sicherheitsprüfung: JWT_SECRET muss in den Umgebungsvariablen definiert sein
      if (!process.env.JWT_SECRET) {
        console.error(
          "🔥 FATALER FEHLER: JWT_SECRET ist in der Umgebung nicht definiert."
        );
        throw new Error("Server-Konfigurationsfehler.");
      }

      // 📥 E-Mail-Adresse aus dem Request-Body validieren
      const { email } = requestPasswordResetSchema.parse(req.body);

      const pool = await getDBPool();

      // 🔍 Benutzer anhand der E-Mail finden und prüfen, ob das Konto aktiv ist
      const userResult = await pool
        .request()
        .input("Email", sql.NVarChar(255), email.toLowerCase())
        .query(
          "SELECT UserID, Email, IsActive FROM dbo.Users WHERE Email = @Email"
        );

      // ❌ Wenn kein aktives Konto gefunden wurde: Trotzdem eine generische Erfolgsmeldung zurückgeben,
      //    um das Erraten von E-Mail-Adressen zu verhindern (Datenschutz).
      if (
        userResult.recordset.length === 0 ||
        !userResult.recordset[0].IsActive
      ) {
        console.log(
          `ℹ️ Passwort-Reset angefordert für E-Mail (möglicherweise nicht existent/inaktiv): ${email}`
        );
        res.status(200).json({
          message:
            "Falls ein aktives Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.",
        });
        return;
      }

      const user = userResult.recordset[0];

      // 🧹 Vorherige Passwort-Reset-Tokens für diesen Benutzer aus der Datenbank löschen
      // Dies stellt sicher, dass nur der neueste Link gültig ist.
      await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, user.UserID)
        .query("DELETE FROM dbo.PasswordResetTokens WHERE UserID = @UserID");

      // 🔐 Ein neues JWT-basiertes Reset-Token generieren
      const resetToken = jwt.sign(
        { userId: user.UserID },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_RESET_PASSWORD_EXPIRES_IN || "1h", // Standard-Gültigkeitsdauer: 1 Stunde
        } as jwtSignOptions
      );

      // ⏳ Ablaufzeitpunkt für das Token berechnen
      const expiresAt = new Date(
        Date.now() +
          parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES || "60") *
            60 *
            1000
      );

      // 📥 Das neue Reset-Token in der Datenbank speichern
      await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, user.UserID)
        .input("ResetToken", sql.NVarChar(255), resetToken)
        .input("ExpiresAt", sql.DateTime2, expiresAt)
        .query(
          "INSERT INTO dbo.PasswordResetTokens (UserID, ResetToken, ExpiresAt) VALUES (@UserID, @ResetToken, @ExpiresAt)" // Fix: Use @ResetToken instead of @TokenHash
        );

      // 📤 E-Mail an den Benutzer senden, die den Reset-Link enthält
      await sendPasswordResetEmail(user.Email, resetToken);
      console.log(
        `🔑 JWT-Passwort-Reset-Token für ${user.Email} generiert und E-Mail versendet.`
      );

      // ✅ Immer die gleiche Antwort senden (aus Datenschutzgründen, siehe oben)
      res.status(200).json({
        message:
          "Falls ein aktives Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Ungültige E-Mail-Adresse angegeben.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }
      console.error("🔥 Fehler beim Anfordern des Passwort-Resets:", error);
      next(error); // Fehler an den globalen Fehler-Handler weiterleiten
    }
  }
);

// -------------------------------------------------------------------
// POST /api/auth/reset-password
// Zweck: Ermöglicht dem Benutzer, mit einem gültigen JWT-Reset-Token ein neues Passwort zu setzen.
// -------------------------------------------------------------------
router.post(
  "/reset-password",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Sicherheitsprüfung: JWT_SECRET muss vorhanden sein
      if (!process.env.JWT_SECRET) {
        console.error("🔥 FATALER FEHLER: JWT_SECRET fehlt in der Umgebung.");
        throw new Error("Server-Konfigurationsfehler.");
      }

      // Validiere Eingabe (Reset-Token und neues Passwort)
      const { token, newPassword } = resetPasswordSchema.parse(req.body);

      let decodedPayload: any;
      try {
        // Versuche, das JWT-Token zu verifizieren (prüft Signatur und Ablaufzeit)
        decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        res.status(400).json({
          message: "Ungültiges oder abgelaufenes Passwort-Reset-Token.",
        });
        return;
      }

      const pool = await getDBPool();

      // 🔍 Zusätzliche Verifizierung: Prüfen, ob der Token noch in der DB existiert
      //    (d.h. nicht bereits verwendet wurde) und ob er noch gültig ist (gegen ExpiresAt).
      //    Außerdem, ob der zugehörige Benutzer noch aktiv ist.
      const tokenResult = await pool
        .request()
        .input("ResetToken", sql.NVarChar(255), token)
        .input("CurrentTime", sql.DateTime2, new Date()).query(`
          SELECT prt.UserID, u.IsActive
          FROM dbo.PasswordResetTokens prt
          INNER JOIN dbo.Users u ON prt.UserID = u.UserID
          WHERE prt.ResetToken = @ResetToken
            AND prt.ExpiresAt > @CurrentTime
            AND u.IsActive = 1
        `);

      if (tokenResult.recordset.length === 0) {
        res.status(400).json({
          message:
            "Dieser Passwort-Reset-Link ist ungültig oder wurde bereits verwendet.",
        });
        return;
      }

      // 🔐 Neues Passwort hashen und in der Datenbank speichern
      const { UserID } = tokenResult.recordset[0];
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      await pool
        .request()
        .input("UserID", sql.UniqueIdentifier, UserID)
        .input("PasswordHash", sql.NVarChar(sql.MAX), newPasswordHash).query(`
          UPDATE dbo.Users
          SET PasswordHash = @PasswordHash,
              UpdatedAt = SYSUTCDATETIME()
          WHERE UserID = @UserID
        `);

      // 🧹 Entferne den verwendeten Reset-Token aus der Datenbank, um die Wiederverwendung zu verhindern
      await pool
        .request()
        .input("ResetToken", sql.NVarChar(255), token)
        .query(
          "DELETE FROM dbo.PasswordResetTokens WHERE ResetToken = @ResetToken"
        );

      console.log(
        `✅ Passwort erfolgreich zurückgesetzt für Benutzer-ID: ${UserID}`
      );
      res.status(200).json({
        message:
          "Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Ungültige Daten zum Zurücksetzen des Passworts.",
          errors: error.flatten().fieldErrors,
        });
        return;
      }
      console.error("🔥 Fehler beim Zurücksetzen des Passworts:", error);
      next(error); // Fehler an den globalen Fehler-Handler weiterleiten
    }
  }
);

// --- Google OAuth Routen ---
// -------------------------------------------------------------------
// GET /api/auth/google
// Zweck: Leitet den Benutzer zur Google-OAuth-Zustimmungsseite weiter,
//        um die Authentifizierung über Google zu initiieren.
// -------------------------------------------------------------------
router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 🔐 OAuth-Konfiguration aus Umgebungsvariablen prüfen
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

      // Fehlerprüfung: Sind alle notwendigen ENV-Variablen gesetzt?
      if (!clientId || !clientSecret || !redirectUri) {
        console.error(
          "🔥 Google OAuth Umgebungsvariablen fehlen (CLIENT_ID, CLIENT_SECRET oder REDIRECT_URI)."
        );
        res.status(500).json({
          message: "Fehlerhafte Serverkonfiguration für Google Login.",
        });
        return;
      }

      // Initialisiere den OAuth2-Client mit Google-Anmeldedaten und Umleitungs-URI
      const oauth2Client = new OAuth2Client(
        clientId,
        clientSecret,
        redirectUri
      );

      // 📦 Definiere die benötigten Berechtigungen (Scopes)
      const scopes = [
        "https://www.googleapis.com/auth/userinfo.email", // Zugriff auf die E-Mail-Adresse des Benutzers
        "https://www.googleapis.com/auth/userinfo.profile", // Zugriff auf grundlegende Profilinformationen (Name, Bild)
        "openid", // Standard OpenID Connect Scope
      ];

      // 📤 Generiere die URL, die den Benutzer zu Googles Zustimmungsseite weiterleitet
      const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: "offline", // Fordert ein Refresh Token an (für langfristigen Zugriff, falls erforderlich; nicht strikt für den einfachen Login)
        scope: scopes, // Liste der angeforderten Berechtigungen
        include_granted_scopes: true, // Zeigt dem Benutzer, welche Berechtigungen bereits erteilt wurden
        // prompt: 'consent' // Optional: Erzwingt die Zustimmungsseite bei jedem Mal, nützlich für Tests. Für die Produktion entfernen.
      });

      console.log("ℹ️ Weiterleitung zur Google OAuth URL:", authorizationUrl);
      res.redirect(authorizationUrl); // Leitet den Browser des Benutzers um
    } catch (error) {
      console.error("🔥 Fehler beim Starten des Google-OAuth-Flows:", error);
      next(error); // Fehler an den globalen Fehler-Handler weiterleiten
    }
  }
);

// -------------------------------------------------------------------
// GET /api/auth/google/callback
// Zweck: Handhabt die Umleitung von Google OAuth nach der Benutzerzustimmung.
//        Verifiziert das Google-Token, findet oder erstellt den Benutzer und
//        stellt Anwendungssession-Tokens aus.
// -------------------------------------------------------------------
router.get(
  "/google/callback",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Google sendet 'code' bei Erfolg, oder 'error' und 'error_description' bei Fehlern, direkt als Query-Parameter.
    const code = req.query.code as string | undefined;
    const googleErrorParam = req.query.error as string | undefined;
    const errorDescriptionParam = req.query.error_description as
      | string
      | undefined;
    const stateParam = req.query.state as string | undefined; // Optionaler OAuth2-State-Parameter

    console.log(
      "ℹ️ Google OAuth Callback empfangen. Code:",
      code,
      "Fehler-Param:",
      googleErrorParam,
      "Fehlerbeschreibung-Param:",
      errorDescriptionParam,
      "State-Param:",
      stateParam
    );

    // ❌ Fehler von Google verarbeiten (z.B. Benutzer hat den Zugriff verweigert)
    if (googleErrorParam) {
      const errorMessage =
        errorDescriptionParam ||
        googleErrorParam ||
        "Unbekannter Fehler während Google OAuth.";
      console.error("🔥 Fehler vom Google OAuth Anbieter:", errorMessage);
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/signin?error=google_oauth_failed&message=${encodeURIComponent(
          errorMessage
        )}`
      );
      return; // Wichtig: Nach der Umleitung immer 'return', um weitere Ausführung zu verhindern
    }

    // ❌ Fehlenden Autorisierungscode behandeln
    if (!code) {
      console.error(
        "🔥 Kein Autorisierungscode von Google im Callback erhalten."
      );
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/signin?error=google_no_code&message=Autorisierungscode%20fehlt%20von%20Google.`
      );
      return; // Wichtig: Nach der Umleitung immer 'return'
    }

    try {
      // 🔐 Erneut Umgebungsvariablen prüfen
      const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

      if (!clientId || !clientSecret || !redirectUri) {
        console.error(
          "🔥 Google OAuth Server-Umgebungsvariablen fehlen (CLIENT_ID, CLIENT_SECRET oder REDIRECT_URI)."
        );
        throw new Error("Server-Konfigurationsfehler für Google Sign-In.");
      }

      // OAuth2-Client instanziieren, um den Autorisierungscode auszutauschen
      const oauth2Client = new OAuth2Client(
        clientId,
        clientSecret,
        redirectUri
      );

      console.log("ℹ️ Tausche Google-Auth-Code gegen Tokens aus...");
      const { tokens } = await oauth2Client.getToken(code); // 'code' ist hier bereits als String bestätigt

      // Prüfen, ob das ID-Token vorhanden ist
      if (!tokens.id_token) {
        throw new Error("Fehler beim Abrufen des ID-Tokens von Google.");
      }

      // ✅ Google-ID-Token verifizieren
      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: clientId, // Überprüfen, ob das Token für unsere Client-ID ausgestellt wurde
      });
      const googlePayload = ticket.getPayload(); // Die Payload enthält die Benutzerinformationen

      // Grundlegende Payload-Validierung
      if (!googlePayload || !googlePayload.sub || !googlePayload.email) {
        throw new Error("Ungültige Google ID-Token-Payload.");
      }

      // Benutzerinformationen aus der Google-Payload extrahieren
      const googleUserId = googlePayload.sub; // Eindeutige Google-Benutzer-ID
      const email = googlePayload.email.toLowerCase(); // E-Mail-Adresse des Benutzers
      const firstName =
        googlePayload.given_name || googlePayload.name?.split(" ")[0] || "User";
      const lastName =
        googlePayload.family_name ||
        googlePayload.name?.split(" ").slice(1).join(" ") ||
        "";

      const pool = getDBPool();
      let userFromDB: DbUser | undefined;

      // 🔍 1. Benutzer anhand der GoogleID in unserer Datenbank suchen
      let userResultByGoogleID = await pool
        .request()
        .input("GoogleID", sql.NVarChar(255), googleUserId)
        .query<DbUser>(
          `SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role, GoogleID, AuthProvider, IsMfaEnabled, MfaSecret FROM dbo.Users WHERE GoogleID = @GoogleID`
        );
      userFromDB = userResultByGoogleID.recordset[0];

      if (!userFromDB) {
        // 🔍 2. Wenn kein Benutzer über GoogleID gefunden wurde, suche über die E-Mail-Adresse
        let userResultByEmail = await pool
          .request()
          .input("Email", sql.NVarChar(255), email)
          .query<DbUser>(
            `SELECT UserID, Email, PasswordHash, FirstName, LastName, IsActive, Role, GoogleID, AzureAdID, AuthProvider, IsMfaEnabled, MfaSecret FROM dbo.Users WHERE Email = @Email`
          ); // Added AzureAdID to select
        userFromDB = userResultByEmail.recordset[0];

        if (userFromDB) {
          // 🔁 Wenn ein bestehender Benutzer mit dieser E-Mail gefunden wurde, aber ohne GoogleID,
          //    verknüpfe das Konto mit der GoogleID und setze den AuthProvider auf 'google'.
          if (userFromDB.GoogleID !== googleUserId) {
            await pool
              .request()
              .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
              .input("GoogleID", sql.NVarChar(255), googleUserId)
              .input("AuthProvider", sql.NVarChar(50), "google")
              .query(
                "UPDATE dbo.Users SET GoogleID = @GoogleID, AuthProvider = @AuthProvider, UpdatedAt = SYSUTCDATETIME() WHERE UserID = @UserID"
              );
            userFromDB.GoogleID = googleUserId;
            userFromDB.AuthProvider = "google";
          }
        } else {
          // ➕ Andernfalls: Neuen Benutzer anlegen, da weder GoogleID noch E-Mail existieren
          const defaultRole = "user";
          const newUserResult = await pool
            .request()
            .input("FirstName", sql.NVarChar(100), firstName)
            .input("LastName", sql.NVarChar(100), lastName)
            .input("Email", sql.NVarChar(255), email)
            .input("PasswordHash", sql.NVarChar(sql.MAX), null) // OAuth-Benutzer haben keinen lokalen Passwort-Hash
            .input("Role", sql.NVarChar(50), defaultRole)
            .input("GoogleID", sql.NVarChar(255), googleUserId)
            .input("AzureAdID", sql.NVarChar(255), null) // Ensure AzureAdID is null for new Google SSO users
            .input("AuthProvider", sql.NVarChar(50), "google")
            .input("IsActive", sql.Bit, 1) // Standardmäßig aktiv setzen
            .query<DbUser>(
              `INSERT INTO dbo.Users (FirstName, LastName, Email, PasswordHash, Role, GoogleID, AzureAdID, AuthProvider, IsActive, CreatedAt, UpdatedAt, IsMfaEnabled, MfaSecret)
                       OUTPUT inserted.UserID, inserted.Email, inserted.PasswordHash, inserted.FirstName, inserted.LastName, inserted.IsActive, inserted.Role, inserted.GoogleID, inserted.AzureAdID, inserted.AuthProvider, inserted.IsMfaEnabled, inserted.MfaSecret
                       VALUES (@FirstName, @LastName, @Email, @PasswordHash, @Role, @GoogleID, @AzureAdID, @AuthProvider, @IsActive, SYSUTCDATETIME(), SYSUTCDATETIME(), 0, NULL)`
            );
          if (!newUserResult.recordset[0])
            throw new Error(
              "Benutzererstellung via Google SSO fehlgeschlagen."
            );
          userFromDB = newUserResult.recordset[0];
        }
      }

      // ❌ Prüfen, ob der Benutzer gefunden wurde und aktiv ist
      if (!userFromDB || !userFromDB.IsActive) {
        res.redirect(
          `${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/auth/signin?error=account_issue_google&message=Account%20is%20inactive%20or%20could%20not%20be%20verified.`
        );
        return; // Nach der Umleitung immer 'return'
      }

      // ✅ Session-Tokens ausstellen (Access Token & Refresh Token Cookies)
      await issueSessionTokens(res, userFromDB, pool);

      // 🕒 Letzten Login-Zeitpunkt und AuthProvider in der Datenbank aktualisieren
      pool
        .request()
        .input("UserID", sql.UniqueIdentifier, userFromDB.UserID)
        .input("AuthProvider", sql.NVarChar(50), "google")
        .query(
          `UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME(), AuthProvider = @AuthProvider WHERE UserID = @UserID`
        )
        .catch((dbErr: any) =>
          console.error(
            "🔥 Fehler beim Aktualisieren von LastLoginAt/AuthProvider nach Google SSO:",
            dbErr.message || dbErr
          )
        );

      console.log(
        `✅ Google Sign-In erfolgreich für ${userFromDB.Email}. App-Session-Cookies gesetzt. Weiterleitung zu /profile.`
      );
      // Letzte Umleitung an das Frontend nach erfolgreichem Login
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/profile`
      );
    } catch (error) {
      console.error("🔥 Fehler beim Google-OAuth-Callback:", error);
      // Eine spezifische Fehlermeldung für die Weiterleitung vorbereiten
      const specificError =
        error instanceof Error ? error.message : String(error);
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/signin?error=google_callback_failed&message=${encodeURIComponent(
          specificError
        )}`
      );
    }
  }
);

export default router;
