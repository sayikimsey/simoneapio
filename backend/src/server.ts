// backend/src/server.ts

// ------------------------------------------------------------
// Umgebungsvariablen sehr früh laden
// ------------------------------------------------------------
import dotenv from "dotenv";
import path from "path";
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: path.resolve(process.cwd(), `.env.${env}`) });

// ------------------------------------------------------------
// Imports / Grund-Setup
// ------------------------------------------------------------
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { ClientRequest } from "http";

// DB-Verbindung
import { connectDB } from "./config/db";

// API-Routen
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import adminRoutes from "./routes/adminRoutes";
import mfaRoutes from "./routes/mfaRoutes";
import simoneProxyRoutes from "./routes/simoneProxyRoutes";
import simoneConfigRoutes from "./routes/simoneConfigRoutes";

const app: Express = express();
const PORT = process.env.PORT || 3001 || 4201;

// Zielsystem (Java / Spring Boot)
const JAVA_TARGET = process.env.SIMONE_JAVA_TARGET || "http://localhost:8081";
const JAVA_CONTEXT = process.env.SIMONE_JAVA_CONTEXT || "/simone-api-java";

// ------------------------------------------------------------
// Basis-Middlewares (ohne JSON/urlencoded!)
//  WICHTIG: SAML-Proxies werden VOR den Body-Parsern registriert,
//           damit der ACS-POST-Body (SAMLResponse) unverändert bleibt.
// ------------------------------------------------------------
app.set("trust proxy", true);

/*const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};*/

const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:3000"
).split(',');

const corsOptions = {
  origin: allowedOrigins, 
  credentials: true,
  optionsSuccessStatus: 200,
};

console.log("CORS enabled for origins:", allowedOrigins); 


app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(cookieParser());

// Roh-Body Parser nur für den ACS-Endpunkt (POST vom IdP)
const acsRawParser = bodyParser.raw({
  type: "application/x-www-form-urlencoded",
  limit: "5mb",
});

// ------------------------------------------------------------
// Hilfsfunktionen für Proxy
// ------------------------------------------------------------

// Pfade vom öffentlichen Präfix auf den Java-Kontext umschreiben
function rewriteToJava(p: string): string {
  return p
    .replace(/^\/api\/simone/, JAVA_CONTEXT)
    .replace(/^\/simone/, JAVA_CONTEXT);
}

// Location-Header vom Java-Service zurück auf öffentliche Pfade umschreiben
function rewriteLocationHeader(value: string): string {
  try {
    const u = new URL(value);
    u.pathname = u.pathname.replace(new RegExp(`^${JAVA_CONTEXT}`), "/simone");
    return u.toString();
  } catch {
    return value.replace(new RegExp(`^${JAVA_CONTEXT}`), "/simone");
  }
}

// Gemeinsamer Fehler-Handler für Proxy (typfrei, vermeidet TS-Inkompatibilitäten)
const onProxyError = (err: any, _req: any, res: any) => {
  try {
    if (res && typeof res.writeHead === "function" && !res.headersSent) {
      res.writeHead(502);
      res.end("Bad Gateway");
    } else if (res && typeof res.end === "function") {
      res.end();
    }
  } catch {
    /* noop */
  }
  console.error("🔌 Proxy-Fehler:", err?.message || err);
};

// ------------------------------------------------------------
// SAML-Proxies (MÜSSEN VOR den Body-Parsern registriert sein)
// ------------------------------------------------------------

// 1) GET – Start des SAML-Flows (Spring-Standard): /saml2/authenticate/{registrationId}
app.get(
  ["/simone/saml2/authenticate/:id", "/api/simone/saml2/authenticate/:id"],
  createProxyMiddleware({
    target: JAVA_TARGET,
    changeOrigin: true,
    secure: false,
    prependPath: false,
    xfwd: true,
    pathRewrite: (p) => rewriteToJava(p),
    on: {
      error: onProxyError,
      proxyRes: (proxyRes: any) => {
        const loc = proxyRes.headers?.["location"];
        if (typeof loc === "string") {
          proxyRes.headers["location"] = rewriteLocationHeader(loc);
        }
      },
    },
  })
);

// 2) Optionale weitere GETs unter /saml2 (z. B. Metadaten) durchreichen
app.use(
  ["/simone/saml2", "/api/simone/saml2"],
  createProxyMiddleware({
    target: JAVA_TARGET,
    changeOrigin: true,
    secure: false,
    prependPath: false,
    xfwd: true,
    pathRewrite: (p) => rewriteToJava(p),
    on: {
      error: onProxyError,
      proxyRes: (proxyRes: any) => {
        const loc = proxyRes.headers?.["location"];
        if (typeof loc === "string") {
          proxyRes.headers["location"] = rewriteLocationHeader(loc);
        }
      },
    },
  })
);

// 3) POST – ACS (Assertion Consumer Service): /login/saml2/sso/{registrationId}
app.post(
  ["/simone/login/saml2/sso/:id", "/api/simone/login/saml2/sso/:id"],
  acsRawParser, // Roh lassen, NICHT mit urlencoded/json parsen!
  createProxyMiddleware({
    target: JAVA_TARGET,
    changeOrigin: true,
    secure: false,
    prependPath: false,
    xfwd: true,
    pathRewrite: (p) => rewriteToJava(p),
    on: {
      error: onProxyError,
      proxyReq: (proxyReq: ClientRequest, req: any) => {
        const body = req?.body as Buffer;
        if (body && (body as any).length) {
          const ct = req.headers?.["content-type"];
          if (ct) proxyReq.setHeader("Content-Type", String(ct));
          proxyReq.setHeader("Content-Length", Buffer.byteLength(body));
          proxyReq.write(body);
        }
      },
      proxyRes: (proxyRes: any) => {
        const loc = proxyRes.headers?.["location"];
        if (typeof loc === "string") {
          proxyRes.headers["location"] = rewriteLocationHeader(loc);
        }
      },
    },
  })
);

// 4) Schutz: Pfad „/api/simone/api/...“ auf „/simone/api/...“ normalisieren
app.get("/api/simone/api/auth/sso/azure-ad-callback", (req, res) => {
  const i = req.originalUrl.indexOf("?");
  const qs = i >= 0 ? req.originalUrl.substring(i) : "";
  res.redirect(302, `/simone/api/auth/sso/azure-ad-callback${qs}`);
});

// ------------------------------------------------------------
// AB HIER: Body-Parser für die restlichen APIs aktivieren
// ------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------------
// API-Router auf allen benötigten Basispfaden mounten
//  - "/"            => unterstützt alte Clients, die z.B. /auth/login, /profile/me aufrufen
//  - "/api"         => aktueller Reverse-Proxy-Pfad (öffentlich: https://.../api)
//  - "/simone/api"  => Legacy-Pfad, der in Logs/Konfigurationen vorkam
//  - "/simone"      => deckt ebenfalls alte Aufrufe ohne /api ab
// ------------------------------------------------------------
const apiRouter = express.Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/profile", profileRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/mfa", mfaRoutes);
apiRouter.use("/simone", simoneProxyRoutes);
apiRouter.use("/config/simone", simoneConfigRoutes);

app.use("/", apiRouter);
app.use("/api", apiRouter);
app.use("/simone", apiRouter);
app.use("/simone/api", apiRouter);

// Health-Check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Die API läuft reibungslos! 🎉",
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------------------------------------
// 404-Fallback (immer am Ende)
// ------------------------------------------------------------
app.use((req: Request, res: Response) => {
  console.warn(`⚠️ 404 Nicht gefunden: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: "Fehler: Ressource nicht gefunden unter " + req.originalUrl,
  });
});

// ------------------------------------------------------------
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Nicht behandelter Serverfehler:", err.stack);
  const statusCode = (err as any).statusCode || 500;
  const errorMessage =
    process.env.NODE_ENV === "production"
      ? "Ein unerwarteter Serverfehler ist aufgetreten. 🚨"
      : err.message || "Interner Serverfehler";
  if (res.headersSent) return next(err);
  res.status(statusCode).json({ message: errorMessage });
});

// ------------------------------------------------------------
// Serverstart
// ------------------------------------------------------------
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Der Backend-Server läuft unter http://localhost:${PORT}`);

      if (!process.env.JWT_SECRET) {
        console.warn("\n⚠️ WARNUNG: JWT_SECRET ist nicht definiert.\n");
      }
      if (!process.env.CORS_ORIGIN) {
        console.warn("\n⚠️ WARNUNG: CORS_ORIGIN fehlt.\n");
      }
      if (
        !process.env.MFA_ENCRYPTION_KEY ||
        process.env.MFA_ENCRYPTION_KEY.length !== 64
      ) {
        console.warn(
          "\n⚠️ WARNUNG: MFA_ENCRYPTION_KEY fehlt/ist ungültig (64 Hex-Zeichen erwartet).\n"
        );
      }
    });
  } catch (error) {
    console.error("🔥 Fehler beim Starten des Servers:", error);
    process.exit(1);
  }
};

startServer();
