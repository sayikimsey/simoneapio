// // backend/src/routes/simoneProxyRoutes.ts

// import express, { Request, Response } from "express";
// import axios, { AxiosError, Method } from "axios";
// import { protect as authMiddleware } from "../middleware/authMiddleware";
// import { authorize as rbacMiddleware } from "../middleware/rbacMiddleware";
// import fs from "fs/promises";
// import path from "path";

// const router = express.Router();

// const JAVA_SERVICE_BASE_URL =
//  process.env.SIMONE_JAVA_SERVICE_URL;

// const configFilePath = path.resolve(process.cwd(), "simone.config.json");

// const readConfig = async () => {
//  try {
//   const data = await fs.readFile(configFilePath, "utf-8");
//   return JSON.parse(data);
//  } catch (error) {
//   console.error("[Proxy] Konnte simone.config.json nicht lesen:", error);
//   throw new Error(
//    "Konnte SIMONE-Konfigurationsdatei im Backend nicht lesen."
//   );
//  }
// };

// const forwardRequest = async (
//  req: Request,
//  res: Response,
//  method: Method,
//  javaServicePath: string,
//  requestData?: any
// ) => {
//  const url = `${JAVA_SERVICE_BASE_URL}${javaServicePath}`;
//  console.log(
//   `[Proxy] Leite ${method.toUpperCase()}-Anfrage von ${
//    req.originalUrl
//   } an den Java-Dienst weiter unter: ${url}`
//  );

//  try {
//   const axiosConfig: any = {
//    method: method,
//    url: url,
//    params:
//     method.toLowerCase() === "get" ? requestData || req.query : req.query,
//    data:
//     method.toLowerCase() !== "get" ? requestData || req.body : undefined,
//    timeout: 60000,
//    maxRedirects: 0,
//    validateStatus: (status: number) => status >= 200 && status < 400,
//    headers: {
//     ...(req.headers.cookie && { Cookie: req.headers.cookie }),
//     ...(req.headers["content-type"] && {
//      "Content-Type": req.headers["content-type"],
//     }),
//    },
//   };

//   console.log(
//    `[Proxy] Sende Anfrage an Java-Dienst. Header: ${JSON.stringify(
//     axiosConfig.headers
//    )}`
//   );

//   const response = await axios(axiosConfig);

//   if (response.headers["set-cookie"]) {
//    res.setHeader("Set-Cookie", response.headers["set-cookie"]);
//   }

//   if (
//    response.status >= 300 &&
//    response.status < 400 &&
//    response.headers.location
//   ) {
//    console.log(
//     `[Proxy] Umleitung vom Java-Dienst erkannt für ${req.originalUrl}. Leite Client um zu: ${response.headers.location}`
//    );
//    res.setHeader("Location", response.headers.location);
//    res.status(response.status).send();
//    return;
//   }

//   res.status(response.status).json(response.data);
//  } catch (error) {
//   if (axios.isAxiosError(error)) {
//    const axiosError = error as AxiosError;
//    if (axiosError.response) {
//     console.error(
//      `[Proxy] Fehlerantwort vom Java-Dienst (${url}):`,
//      axiosError.response.data
//     );
//     if (
//      axiosError.response.headers["content-type"] &&
//      axiosError.response.headers["content-type"].includes("text/html")
//     ) {
//      res.setHeader(
//       "Content-Type",
//       axiosError.response.headers["content-type"]
//      );
//      res.status(axiosError.response.status).send(axiosError.response.data);
//     } else {
//      res.status(axiosError.response.status).json(axiosError.response.data);
//     }
//    } else if (axiosError.request) {
//     console.error(
//      `[Proxy] Keine Antwort vom Java-Dienst (${url}):`,
//      axiosError.message
//     );
//     res.status(503).json({
//      message:
//       "Dienst nicht verfügbar: Verbindung zum SIMONE-Dienst nicht möglich.",
//     });
//    } else {
//     console.error(
//      `[Proxy] Proxy-Fehler bei Anfrageeinrichtung: ${axiosError.message}`
//     );
//     res
//      .status(500)
//      .json({ message: `Proxy-Fehler: ${axiosError.message}` });
//    }
//   } else {
//    console.error(
//     "[Proxy] Ein unerwarteter Fehler im Proxy ist aufgetreten:",
//     error
//    );
//    res
//     .status(500)
//     .json({ message: "Ein unerwarteter Fehler ist im Proxy aufgetreten." });
//   }
//  }
// };

// const adminOnly = rbacMiddleware(["admin"]);
// // --- ROUTEN-DEFINITIONEN ---

// // -------------------------------------------------------------------
// // GET /api/simone/health
// // Zweck: Health Check des SIMONE Java-Dienstes.
// // Dies ist eine öffentliche Route, die keine Authentifizierung erfordert (direkt an Java-Dienst weitergeleitet).
// // -------------------------------------------------------------------
// router.get("/health", (req, res) =>
//  forwardRequest(req, res, "GET", "/v1/health")
// );

// // ===================================================================
// // SAML Proxy Routen (Azure AD SSO)
// // Diese Routen leiten SAML-bezogenen Verkehr an den SIMONE Java-Dienst weiter.
// // ===================================================================

// // -------------------------------------------------------------------
// // GET /api/simone/saml2/authenticate/:registrationId
// // Zweck: Leitet SAML-Authentifizierungsanfragen (GET-Bindung, wenn SP-initiiert) vom Frontend
// //    an den SAML-Authentifizierungs-Endpunkt des Java-Dienstes weiter.
// // Dies ist der Startpunkt für den SAML-Login-Fluss von der Anwendung aus.
// // -------------------------------------------------------------------
// router.get("/saml2/authenticate/:registrationId", (req, res) => {
//  const javaServicePath = `/saml2/authenticate/${req.params.registrationId}`;
//  forwardRequest(req, res, "GET", javaServicePath);
// });

// // -------------------------------------------------------------------
// // POST /api/simone/saml2/authenticate/:registrationId
// // Zweck: Leitet SAML-Antworten (Assertion Consumer Service - ACS) von Azure AD
// //    über den Browser an den Java-Dienst weiter.
// // Dies ist der Endpunkt, an den Azure AD die SAML-Assertions nach erfolgreichem Login POSTet.
// // -------------------------------------------------------------------
// router.post("/saml2/authenticate/:registrationId", (req, res) => {
//  const javaServicePath = `/saml2/authenticate/${req.params.registrationId}`;
//  forwardRequest(req, res, "POST", javaServicePath, req.body);
// });

// // -------------------------------------------------------------------
// // GET /api/simone/saml2/service-provider-metadata/:registrationId
// // Zweck: Stellt die SAML Service Provider Metadaten-XML-Datei des Java-Dienstes bereit.
// // Azure AD oder andere Tools können diese Metadaten abrufen, um Ihre SP-Konfiguration zu erhalten.
// // -------------------------------------------------------------------
// router.get("/saml2/service-provider-metadata/:registrationId", (req, res) => {
//  const javaServicePath = `/saml2/service-provider-metadata/${req.params.registrationId}`;
//  forwardRequest(req, res, "GET", javaServicePath);
// });

// // --- Lifecycle-Operationen (Admin-Bereich) ---

// // -------------------------------------------------------------------
// // POST /api/simone/initialize
// // Zweck: Initialisiert den SIMONE-Dienst. Liest Konfiguration, um Pfade zu übergeben.
// // Authentifizierung erforderlich, Rollenprüfung (Admin) ist auskommentiert.
// // -------------------------------------------------------------------
// router.post(
//  "/initialize",
//  authMiddleware, // Authentifizierung erforderlich
//  /*adminOnly,*/ // Auskommentiert: Rollenprüfung für Administratoren
//  async (req, res) => {
//   try {
//    // ✅ NEU: Überprüft, ob ein configFilePath im Body der Anfrage vorhanden ist.
//    // Wenn ja, wird dieser verwendet, andernfalls wird der Standardpfad aus der Konfigurationsdatei verwendet.
//    const config = await readConfig();
//    const requestBody = {
//     configFilePath: req.body.configFilePath || config.defaultConfigFilePath,
//     useTemporaryConfigCopy: req.body.useTemporaryConfigCopy || true,
//    };
//    await forwardRequest(
//     req,
//     res,
//     "POST",
//     "/v1/initialize",
//     requestBody
//    );
//   } catch (error) {
//    res.status(500).json({ message: (error as Error).message });
//   }
//  }
// );

// // -------------------------------------------------------------------
// // POST /api/simone/terminate
// // Zweck: Beendet den SIMONE-Dienst.
// // Authentifizierung erforderlich, Rollenprüfung (Admin) ist auskommentiert.
// // -------------------------------------------------------------------
// router.post(
//  "/terminate",
//  authMiddleware, // Authentifizierung erforderlich
//  /*adminOnly,*/ // Auskommentiert: Rollenprüfung für Administratoren
//  (req, res) =>
//   forwardRequest(req, res, "POST", "/v1/terminate", {})
// );

// // ✅ NEU: POST-Endpunkt zum Beenden des SIMONE-Dienstes beim Abmelden
// // -------------------------------------------------------------------
// // Zweck: Beendet den SIMONE-Dienst auf Anfrage des Clients.
// // Leitet die Anfrage an den bestehenden /v1/terminate-Endpunkt weiter.
// // -------------------------------------------------------------------
// router.post(
//   "/lifecycle/shutdown",
//   authMiddleware,
//   (req, res) =>
//     forwardRequest(req, res, "POST", "/v1/terminate", {})
// );

// // --- Admin Netzwerk-/Archiv-Operationen (Admin-Bereich) ---
// // Diese Routen sind alle durch 'authMiddleware' und 'adminOnly' geschützt.

// // -------------------------------------------------------------------
// // POST /api/simone/admin/networks
// // Zweck: Erstellt ein neues Netzwerk.
// // -------------------------------------------------------------------
// router.post("/admin/networks", authMiddleware, adminOnly, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/admin/networks/create",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/admin/networks/import
// // Zweck: Importiert ein Netzwerk aus einer Datei.
// // -------------------------------------------------------------------
// router.post("/admin/networks/import", authMiddleware, adminOnly, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/admin/networks/import-from-file",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/admin/networks/activate
// // Zweck: Aktiviert ein Netzwerk.
// // -------------------------------------------------------------------
// router.post("/admin/networks/activate", authMiddleware, adminOnly, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/admin/networks/current/activate",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/admin/networks/save-as
// // Zweck: Speichert das aktuelle Netzwerk unter einem neuen Namen.
// // -------------------------------------------------------------------
// router.post("/admin/networks/save-as", authMiddleware, adminOnly, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/admin/networks/current/save-as",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // DELETE /api/simone/admin/networks/:networkName
// // Zweck: Löscht ein Netzwerk anhand seines Namens.
// // -------------------------------------------------------------------
// router.delete(
//  "/admin/networks/:networkName",
//  authMiddleware,
//  adminOnly,
//  (req, res) =>
//   forwardRequest(
//    req,
//    res,
//    "DELETE",
//    `/v1/admin/networks/${req.params.networkName}`
//   )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/admin/archives/list
// // Zweck: Listet Archive auf.
// // -------------------------------------------------------------------
// router.post("/admin/archives/list", authMiddleware, adminOnly, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/admin/archives/list",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/admin/archives/create
// // Zweck: Erstellt ein neues Archiv.
// // -------------------------------------------------------------------
// router.post("/admin/archives/create", authMiddleware, adminOnly, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/admin/archives/create",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/admin/archives/add-network
// // Zweck: Fügt ein Netzwerk zu einem Archiv hinzu.
// // -------------------------------------------------------------------
// router.post(
//  "/admin/archives/add-network",
//  authMiddleware,
//  adminOnly,
//  (req, res) =>
//   forwardRequest(
//    req,
//    res,
//    "POST",
//    "/v1/admin/archives/add-network",
//    req.body
//   )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/admin/archives/extract-network
// // Zweck: Extrahiert ein Netzwerk aus einem Archiv.
// // -------------------------------------------------------------------
// router.post(
//  "/admin/archives/extract-network",
//  authMiddleware,
//  adminOnly,
//  (req, res) =>
//   forwardRequest(
//    req,
//    res,
//    "POST",
//    "/v1/admin/archives/extract-network",
//    req.body
//   )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/admin/archives/delete-network
// // Zweck: Löscht ein Netzwerk aus einem Archiv.
// // -------------------------------------------------------------------
// router.post(
//  "/admin/archives/delete-network",
//  authMiddleware,
//  adminOnly,
//  (req, res) =>
//   forwardRequest(
//    req,
//    res,
//    "POST",
//    "/v1/admin/archives/delete-network",
//    req.body
//   )
// );

// // --- Allgemeine Benutzer-Routen (Authentifiziert) ---
// // Diese Routen sind alle durch 'authMiddleware' geschützt, aber erfordern keine Admin-Rechte.

// // -------------------------------------------------------------------
// // ✅ NEU: POST-Endpunkt zum Setzen des Netzwerkverzeichnisses des Benutzers
// // -------------------------------------------------------------------
// router.post("/set-network-directory", authMiddleware, (req, res) => {
//  forwardRequest(req, res, "POST", "/v1/networks/set-network-directory", req.body);
// });

// // -------------------------------------------------------------------
// // GET /api/simone/networks
// // Zweck: Listet verfügbare Netzwerke auf. Verwendet den defaultNetworkDirectory aus der Konfig.
// // -------------------------------------------------------------------
// router.get("/networks", authMiddleware, async (req, res) => {
//  try {
//   // ✅ NEU: Prüft, ob ein 'directoryPath' in den Query-Parametern vorhanden ist.
//   // Wenn ja, wird dieser verwendet. Andernfalls wird der Standardpfad aus der simone.config.json gelesen.
//   const queryParams = req.query.directoryPath
//    ? { directoryPath: req.query.directoryPath }
//    : {};
  
//   if (Object.keys(queryParams).length === 0) {
//    const config = await readConfig();
//    queryParams.directoryPath = config.defaultNetworkDirectory;
//   }

//   await forwardRequest(
//    req,
//    res,
//    "GET",
//    "/v1/networks",
//    queryParams
//   );
//  } catch (error) {
//   res.status(500).json({ message: (error as Error).message });
//  }
// });

// // -------------------------------------------------------------------
// // POST /api/simone/networks/select
// // Zweck: Wählt ein bestimmtes Netzwerk aus.
// // -------------------------------------------------------------------
// router.post("/networks/select", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/networks/current/select",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // GET /api/simone/networks/current
// // Zweck: Ruft Informationen zum aktuell ausgewählten Netzwerk ab.
// // -------------------------------------------------------------------
// router.get("/networks/current", authMiddleware, (req, res) =>
//  forwardRequest(req, res, "GET", "/v1/networks/current")
// );

// // -------------------------------------------------------------------
// // GET /api/simone/networks/objects
// // Zweck: Dies ist eine KRITISCHE ROUTE. Ruft Objekte aus dem aktuellen Netzwerk ab.
// // Der Pfad zum Java-Dienst MUSS korrekt sein.
// // -------------------------------------------------------------------
// router.get("/networks/objects", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "GET",
//   "/v1/networks/current/objects"
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/copy
// // Zweck: Kopiert ein Szenario (entspricht "Speichern unter").
// // -------------------------------------------------------------------
// router.post(
//  "/scenarios/copy",
//  authMiddleware,
//  (req: Request, res: Response) => {
//   console.log("[Proxy-Router] POST /scenarios/copy Route wurde gematcht.");
//   forwardRequest(
//    req,
//    res,
//    "POST",
//    "/v1/scenarios/copy",
//    req.body
//   );
//  }
// );

// // -------------------------------------------------------------------
// // GET /api/simone/scenarios
// // Zweck: Listet alle Szenarien auf.
// // -------------------------------------------------------------------
// router.get("/scenarios", authMiddleware, (req, res) =>
//  forwardRequest(req, res, "GET", "/v1/scenarios")
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/open
// // Zweck: Öffnet ein bestimmtes Szenario.
// // -------------------------------------------------------------------
// router.post("/scenarios/open", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/scenarios/open",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/close
// // Zweck: Schließt das aktuell geöffnete Szenario.
// // -------------------------------------------------------------------
// router.post("/scenarios/close", authMiddleware, (req, res) =>
//  forwardRequest(req, res, "POST", "/v1/scenarios/close", {})
// );

// // -------------------------------------------------------------------
// // GET /api/simone/scenarios/current/status
// // Zweck: Ruft den Status des aktuell geöffneten Szenarios ab.
// // -------------------------------------------------------------------
// router.get("/scenarios/current/status", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "GET",
//   "/v1/scenarios/current/status"
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/translate/varid
// // Zweck: Übersetzt eine VARID (Variable ID).
// // -------------------------------------------------------------------
// router.post("/translate/varid", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/translate/varid",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/translate/varids
// // Zweck: Übersetzt mehrere VARIDs (Variable IDs).
// // (Keine Auth-Middleware hier? Prüfen, ob dies beabsichtigt ist für öffentliche Endpunkte oder ein Versehen.)
// // -------------------------------------------------------------------
// router.post("/translate/varids", (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/translate/varids",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // GET /api/simone/translate/networks/:networkName/extensions/:objectName
// // Zweck: Ruft Erweiterungsinformationen für ein Objekt in einem Netzwerk ab.
// // -------------------------------------------------------------------
// router.get(
//  "/translate/networks/:networkName/extensions/:objectName",
//  authMiddleware,
//  (req, res) => {
//   const { networkName, objectName } = req.params;

//   const encodedNetwork = encodeURIComponent(networkName);
//   const encodedObject = encodeURIComponent(objectName);

//   forwardRequest(
//    req,
//    res,
//    "GET",
//    `/v1/translate/networks/${encodedNetwork}/extensions/${encodedObject}`
//   );
//  }
// );

// // -------------------------------------------------------------------
// // GET /api/simone/translate/extid
// // Zweck: Übersetzt eine EXTID (External ID).
// // -------------------------------------------------------------------
// router.get("/translate/extid", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "GET",
//   "/v1/translate/extid",
//   req.query
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/rtime/set
// // Zweck: Setzt die Retrieval Time (rtime) für Datenzugriffe im Szenario.
// // -------------------------------------------------------------------
// router.post("/scenarios/rtime/set", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/scenarios/current/rtime/set",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // GET /api/simone/scenarios/rtime/get
// // Zweck: Ruft die aktuelle Retrieval Time (rtime) des Szenarios ab.
// // -------------------------------------------------------------------
// router.get("/scenarios/rtime/get", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "GET",
//   "/v1/scenarios/current/rtime/get"
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/rtime/next
// // Zweck: Schaltet die Retrieval Time (rtime) auf den nächsten Wert vor.
// // -------------------------------------------------------------------
// router.post("/scenarios/rtime/next", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/scenarios/current/rtime/next",
//   {}
//  )
// );

// // -------------------------------------------------------------------
// // GET /api/simone/translate/varid-info
// // Zweck: Ruft Informationen zu einer VARID ab.
// // -------------------------------------------------------------------
// router.get("/translate/varid-info", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "GET",
//   "/v1/translate/varid-info",
//   req.query
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/read-array
// // Zweck: Liest ein Array von Float-Werten für das aktuelle Szenario.
// // Leitet an den Java-Dienst-Endpunkt 'read-float-array' weiter.
// // -------------------------------------------------------------------
// router.post("/scenarios/read-array", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/scenarios/current/read-float-array",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/read-string
// // Zweck: Liest einen einzelnen String-Wert für das aktuelle Szenario.
// // -------------------------------------------------------------------
// router.post("/scenarios/read-string", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/scenarios/current/read-string-data",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/write-array
// // Zweck: Schreibt ein Array von Float-Werten in das aktuelle Szenario.
// // -------------------------------------------------------------------
// router.post("/scenarios/write-array", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/scenarios/current/write-float-array",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/write-ex
// // Zweck: Schreibt einen einzelnen Wert mit erweiterten Optionen in das aktuelle Szenario.
// // -------------------------------------------------------------------
// router.post("/scenarios/write-ex", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "POST",
//   "/v1/scenarios/current/write-float-ex",
//   req.body
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/execute
// // Zweck: Führt das aktuell geöffnete SIMONE-Szenario aus.
// // Authentifizierung erforderlich, Rollenprüfung (Admin) ist auskommentiert.
// // -------------------------------------------------------------------
// router.post(
//  "/scenarios/execute",
//  authMiddleware,
//  // rbacMiddleware(["admin"]), // Auskommentiert: Rollenprüfung für Administratoren
//  (req, res) =>
//   forwardRequest(
//    req,
//    res,
//    "POST",
//    "/v1/scenarios/current/execute-ex",
//    req.body
//   )
// );

// // -------------------------------------------------------------------
// // GET /api/simone/scenarios/:scenarioName/status
// // Zweck: Ruft den Berechnungsstatus eines bestimmten Szenarios ab.
// // Authentifizierung erforderlich, Rollenprüfung (Admin) ist auskommentiert.
// // -------------------------------------------------------------------
// router.get(
//  "/scenarios/:scenarioName/status",
//  authMiddleware,
//  // rbacMiddleware(["admin"]), // Auskommentiert: Rollenprüfung für Administratoren
//  (req, res) =>
//   forwardRequest(
//    req,
//    res,
//    "GET",
//    `/v1/scenarios/${req.params.scenarioName}/calculation-status-ex`
//   )
// );

// // -------------------------------------------------------------------
// // GET /api/simone/scenarios/messages/first
// // Zweck: Ruft die erste Berechnungsnachricht des aktuellen Szenarios ab.
// // Authentifizierung erforderlich, Rollenprüfung (Admin) ist auskommentiert.
// // -------------------------------------------------------------------
// router.get(
//  "/scenarios/messages/first",
//  authMiddleware,
//  // rbacMiddleware(["admin"]), // Auskommentiert: Rollenprüfung für Administratoren
//  (req, res) =>
//   forwardRequest(
//    req,
//    res,
//    "GET",
//    "/v1/scenarios/current/messages/first"
//   )
// );

// // -------------------------------------------------------------------
// // GET /api/simone/scenarios/messages/next
// // Zweck: Ruft die nächste Berechnungsnachricht des aktuellen Szenarios ab.
// // Authentifizierung erforderlich, Rollenprüfung (Admin) ist auskommentiert.
// // -------------------------------------------------------------------
// router.get(
//  "/scenarios/messages/next",
//  authMiddleware,
//  // rbacMiddleware(["admin"]), // Auskommentiert: Rollenprüfung für Administratoren
//  (req, res) =>
//   forwardRequest(
//    req,
//    res,
//    "GET",
//    "/v1/scenarios/current/messages/next"
//   )
// );

// // -------------------------------------------------------------------
// // GET /api/simone/scenarios/messages/all
// // Zweck: Ruft alle Berechnungsnachrichten des aktuellen Szenarios ab.
// // -------------------------------------------------------------------
// router.get("/scenarios/messages/all", authMiddleware, (req, res) =>
//  forwardRequest(
//   req,
//   res,
//   "GET",
//   "/v1/scenarios/current/messages/all"
//  )
// );

// // -------------------------------------------------------------------
// // POST /api/simone/scenarios/create
// // Zweck: Erstellt ein neues Szenario.
// // -------------------------------------------------------------------
// router.post(
//  "/scenarios/create",
//  authMiddleware,
//  (req: Request, res: Response) =>
//   forwardRequest(
//    req,
//    res,
//    "POST",
//    "/v1/scenarios/create",
//    req.body
//   )
// );

// // -------------------------------------------------------------------
// // DELETE /api/simone/scenarios/delete
// // Zweck: Löscht ein Szenario.
// // -------------------------------------------------------------------
// router.delete(
//  "/scenarios/delete",
//  authMiddleware,
//  (req: Request, res: Response) =>
//   forwardRequest(
//    req,
//    res,
//    "DELETE",
//    "/v1/scenarios/delete",
//    req.body
//   )
// );



// export default router;

import express, { Request, Response } from "express";
import axios, { AxiosError, Method } from "axios";
import { protect as authMiddleware } from "../middleware/authMiddleware";
import { authorize as rbacMiddleware } from "../middleware/rbacMiddleware";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

/**
 * Die Basis-URL für den SIMONE Java-Dienst wird aus den Umgebungsvariablen gelesen.
 * Sie sollte in der .env-Datei (z.B. SIMONE_JAVA_SERVICE_URL=http://localhost:8081) definiert sein.
 */
const JAVA_SERVICE_BASE_URL = process.env.SIMONE_JAVA_SERVICE_URL;

const configFilePath = path.resolve(process.cwd(), "simone.config.json");

/**
 * Liest die Konfigurationsdatei des SIMONE-Dienstes.
 * @returns {Promise<any>} Die JSON-Konfigurationsdaten.
 * @throws {Error} Wenn die Datei nicht gelesen werden kann.
 */
const readConfig = async () => {
  try {
    const data = await fs.readFile(configFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("[Proxy] Konnte simone.config.json nicht lesen:", error);
    throw new Error(
      "Konnte SIMONE-Konfigurationsdatei im Backend nicht lesen."
    );
  }
};

/**
 * Leitet eine HTTP-Anfrage an den SIMONE Java-Dienst weiter.
 * Handhabt Anfragen, Antworten, Umleitungen und Fehler.
 * @param {Request} req - Die eingehende Express-Anfrage.
 * @param {Response} res - Die ausgehende Express-Antwort.
 * @param {Method} method - Die HTTP-Methode (z.B. 'GET', 'POST').
 * @param {string} javaServicePath - Der Pfad zum Endpunkt des Java-Dienstes.
 * @param {any} [requestData] - Optionale Daten, die im Body der Anfrage gesendet werden sollen.
 */
// const forwardRequest = async (
//   req: Request,
//   res: Response,
//   method: Method,
//   javaServicePath: string,
//   requestData?: any
// ) => {
//   const url = `${JAVA_SERVICE_BASE_URL}${javaServicePath}`;
//   console.log(
//     `[Proxy] Leite ${method.toUpperCase()}-Anfrage von ${
//       req.originalUrl
//     } an den Java-Dienst weiter unter: ${url}`
//   );

//   try {
//     const isForm = (req.headers["content-type"] || "").includes("application/x-www-form-urlencoded");
//     // const axiosConfig = {
//     //   method: method,
//     //   url: url,
//     //   // Parameter für GET-Anfragen oder Query-Parameter für alle Anfragen
//     //   params: method.toLowerCase() === "get" ? requestData || req.query : req.query,
//     //   // Body-Daten für Nicht-GET-Anfragen
//     //   data: method.toLowerCase() !== "get" ? requestData || req.body : undefined,
//     //   timeout: 60000,
//     //   maxRedirects: 0,
//     //   validateStatus: (status: number) => status >= 200 && status < 400,
//     //   headers: {
//     //     ...(req.headers.cookie && { Cookie: req.headers.cookie }),
//     //     ...(req.headers["content-type"] && {
//     //       "Content-Type": req.headers["content-type"],
//     //     }),
//     //   },
//     // };

//     const axiosConfig = {
//   method,
//   url,
//   params: method.toLowerCase() === "get" ? (requestData || req.query) : req.query,
//   data:
//     method.toLowerCase() !== "get"
//       ? isForm
//         ? new URLSearchParams(Object.entries(requestData || req.body) as [string, string][])
//             .toString()
//         : (requestData || req.body)
//       : undefined,
//   timeout: 60000,
//   maxRedirects: 0,
//   validateStatus: (s: number) => s >= 200 && s < 400,
//   headers: {
//     ...(req.headers.cookie && { Cookie: req.headers.cookie }),
//     ...(req.headers["content-type"] && { "Content-Type": req.headers["content-type"] }),
//   },
// };

//     console.log(`[Proxy] Sende Anfrage an Java-Dienst. Header: ${JSON.stringify(axiosConfig.headers)}`);

//     const response = await axios(axiosConfig);

//     // Weiterleitung der Cookies aus der Antwort des Java-Dienstes
//     // if (response.headers["set-cookie"]) {
//     //   res.setHeader("Set-Cookie", response.headers["set-cookie"]);
//     // }

//     if (response.headers["set-cookie"]) {
//   const rewritten = (response.headers["set-cookie"] as string[]).map((c) => {
//     let s = c.replace(/Path=\/simone-api-java/gi, "Path=/api/simone");
//     // ensure modern browser rules
//     if (!/;\s*SameSite=/i.test(s)) s += "; SameSite=None";
//     s = s.replace(/;\s*SameSite=(Lax|Strict)/gi, "; SameSite=None");
//     if (!/;\s*Secure/i.test(s)) s += "; Secure";
//     return s;
//   });
//   res.setHeader("Set-Cookie", rewritten);
// }


//     // Handhabung von Umleitungen (Redirects)
//     if (
//       response.status >= 300 &&
//       response.status < 400 &&
//       response.headers.location
//     ) {
//       console.log(
//         `[Proxy] Umleitung vom Java-Dienst erkannt für ${req.originalUrl}. Leite Client um zu: ${response.headers.location}`
//       );
//       res.setHeader("Location", response.headers.location);
//       res.status(response.status).send();
//       return;
//     }

//     // Normale Antwort an den Client senden
//     res.status(response.status).json(response.data);
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       const axiosError = error as AxiosError;
//       if (axiosError.response) {
//         // Fehler, die vom Java-Dienst zurückgegeben werden
//         console.error(
//           `[Proxy] Fehlerantwort vom Java-Dienst (${url}):`,
//           axiosError.response.data
//         );
//         if (
//           axiosError.response.headers["content-type"] &&
//           axiosError.response.headers["content-type"].includes("text/html")
//         ) {
//           res.setHeader("Content-Type", axiosError.response.headers["content-type"]);
//           res.status(axiosError.response.status).send(axiosError.response.data);
//         } else {
//           res.status(axiosError.response.status).json(axiosError.response.data);
//         }
//       } else if (axiosError.request) {
//         // Der Java-Dienst hat nicht geantwortet (Timeout, Verbindungsproblem)
//         console.error(
//           `[Proxy] Keine Antwort vom Java-Dienst (${url}):`,
//           axiosError.message
//         );
//         res.status(503).json({
//           message:
//             "Dienst nicht verfügbar: Verbindung zum SIMONE-Dienst nicht möglich.",
//         });
//       } else {
//         // Fehler bei der Einrichtung der Anfrage im Proxy
//         console.error(
//           `[Proxy] Proxy-Fehler bei Anfrageeinrichtung: ${axiosError.message}`
//         );
//         res.status(500).json({ message: `Proxy-Fehler: ${axiosError.message}` });
//       }
//     } else {
//       // Unerwartete Fehler
//       console.error(
//         "[Proxy] Ein unerwarteter Fehler im Proxy ist aufgetreten:",
//         error
//       );
//       res.status(500).json({ message: "Ein unerwarteter Fehler ist im Proxy aufgetreten." });
//     }
//   }
// };

const forwardRequest = async (
  req: Request,
  res: Response,
  method: Method,
  javaServicePath: string,
  requestData?: any
) => {
  const url = `${JAVA_SERVICE_BASE_URL}${javaServicePath}`;
  console.log(
    `[Proxy] Leite ${method.toUpperCase()}-Anfrage von ${req.originalUrl} an den Java-Dienst weiter unter: ${url}`
  );

  // helper: form body builder
  const isForm = (req.headers["content-type"] || "").includes(
    "application/x-www-form-urlencoded"
  );
  const buildFormBody = (data: any) => {
    const p = new URLSearchParams();
    Object.entries(data || {}).forEach(([k, v]) =>
      p.append(k, typeof v === "string" ? v : String(v))
    );
    return p.toString();
  };

  try {
    const lower = method.toLowerCase();
    const dataPayload =
      lower !== "get"
        ? isForm
          ? buildFormBody(requestData ?? req.body)
          : (requestData ?? req.body)
        : undefined;

    const axiosConfig = {
      method,
      url,
      params: lower === "get" ? (requestData ?? req.query) : req.query,
      data: dataPayload,
      timeout: 60_000,
      maxRedirects: 0,
      validateStatus: (s: number) => s >= 200 && s < 400,
      headers: {
        ...(req.headers.cookie && { Cookie: req.headers.cookie }),
        ...(req.headers["content-type"] && {
          "Content-Type": req.headers["content-type"]!,
        }),
        ...(isForm && !req.headers["content-type"] && {
          "Content-Type": "application/x-www-form-urlencoded",
        }),
        "X-Forwarded-Host": req.headers.host || "simoneapi.gascade.de",
        "X-Forwarded-Proto":
          (req.headers["x-forwarded-proto"] as string) ||
          (req as any).protocol ||
          "https",
        "X-Forwarded-For":
          (req.headers["x-forwarded-for"] as string) || req.ip || "",
      },
    } as const;

    console.log(
      `[Proxy] Sende Anfrage an Java-Dienst. Header: ${JSON.stringify(
        axiosConfig.headers
      )}`
    );

    const response = await axios(axiosConfig);

    // --- Cookies vom Java-Dienst an den Browser weitergeben (Pfad anpassen) ---
    if (response.headers["set-cookie"]) {
      const rewritten = (response.headers["set-cookie"] as string[]).map((c) => {
        // Java setzt häufig Path=/simone-api-java -> für unsere öffentlichen Routen anpassen
        let s = c.replace(/Path=\/simone-api-java/gi, "Path=/api/simone");
        if (!/;\s*SameSite=/i.test(s)) s += "; SameSite=None";
        s = s.replace(/;\s*SameSite=(Lax|Strict)/gi, "; SameSite=None");
        if (!/;\s*Secure/i.test(s)) s += "; Secure";
        return s;
      });
      res.setHeader("Set-Cookie", rewritten);
    }

    // --- Redirects des Java-Dienstes auf öffentliche Routen umschreiben ---
    if (response.status >= 300 && response.status < 400 && response.headers.location) {
      const originalLocation = String(response.headers.location);
      let location = originalLocation;

      // remove java base (absolute) or context-path prefix to get suffix
      const getSuffixFromJavaLocation = (loc: string): string | null => {
        // absolute URL?
        if (/^https?:\/\//i.test(loc)) {
          try {
            const locUrl = new URL(loc);
            const base = (process.env.SIMONE_JAVA_SERVICE_URL || "").replace(/\/+$/, "");
            if (base) {
              const b = new URL(base); // e.g. http://localhost:8081/simone-api-java
              const absPrefix = (b.origin + b.pathname).replace(/\/+$/, "");
              if ((locUrl.origin + locUrl.pathname).startsWith(absPrefix)) {
                return locUrl.pathname.substring(b.pathname.replace(/\/+$/, "").length) + (locUrl.search || "") + (locUrl.hash || "");
              }
            }
            // if path still starts with context-path, strip it
            if (locUrl.pathname.startsWith("/simone-api-java")) {
              return locUrl.pathname.replace(/^\/simone-api-java/, "") + (locUrl.search || "") + (locUrl.hash || "");
            }
            return null;
          } catch {
            return null;
          }
        }
        // relative path
        if (/^\/simone-api-java(\/|$)/i.test(loc)) {
          return loc.replace(/^\/simone-api-java/i, "");
        }
        return null;
      };

      const suffix = getSuffixFromJavaLocation(originalLocation);

      if (suffix !== null) {
        // Route-Ableitung:
        // - SAML Flows (saml2/*, login/saml2/*, logout/saml2/*) unter /simone/...
        // - Erfolgscallback der App unter /simone/api/...
        // - alle anderen REST-Routen unter /api/simone/...
        if (/^\/(saml2|login\/saml2|logout\/saml2)\//i.test(suffix)) {
          location = `/simone${suffix}`;
        } else if (/^\/api\/auth\/sso\/azure-ad-callback/i.test(suffix)) {
          location = `/simone${suffix}`; // -> /simone/api/auth/sso/azure-ad-callback...
        } else {
          location = `/api/simone${suffix}`;
        }

        // normalize double slashes
        location = location.replace(/\/{2,}/g, "/");

        // if original was absolute, keep its scheme+host
        if (/^https?:\/\//i.test(originalLocation) && location.startsWith("/")) {
          try {
            const u = new URL(originalLocation);
            location = `${u.protocol}//${u.host}${location}`;
          } catch {
            /* keep relative */
          }
        }
      }

      console.log(
        `[Proxy] Umleitung vom Java-Dienst erkannt für ${req.originalUrl}. Leite Client um zu: ${location}`
      );
      res.setHeader("Location", location);
      res.status(response.status).send();
      return;
    }

    // --- Normale Antwort an den Client ---
    const ct = String(response.headers["content-type"] || "");
    if (ct.includes("text/html") || ct.includes("application/xml")) {
      res.setHeader("Content-Type", ct);
      res.status(response.status).send(response.data);
    } else {
      res.status(response.status).json(response.data);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error(
          `[Proxy] Fehlerantwort vom Java-Dienst (${url}):`,
          axiosError.response.data
        );
        const ct = String(axiosError.response.headers?.["content-type"] || "");
        if (ct.includes("text/html")) {
          res.setHeader("Content-Type", ct);
          res.status(axiosError.response.status).send(axiosError.response.data);
        } else {
          res.status(axiosError.response.status).json(axiosError.response.data);
        }
      } else if (axiosError.request) {
        console.error(
          `[Proxy] Keine Antwort vom Java-Dienst (${url}):`,
          axiosError.message
        );
        res.status(503).json({
          message:
            "Dienst nicht verfügbar: Verbindung zum SIMONE-Dienst nicht möglich.",
        });
      } else {
        console.error(
          `[Proxy] Proxy-Fehler bei Anfrageeinrichtung: ${axiosError.message}`
        );
        res.status(500).json({ message: `Proxy-Fehler: ${axiosError.message}` });
      }
    } else {
      console.error("[Proxy] Ein unerwarteter Fehler im Proxy ist aufgetreten:", error);
      res
        .status(500)
        .json({ message: "Ein unerwarteter Fehler ist im Proxy aufgetreten." });
    }
  }
};


const adminOnly = rbacMiddleware(["admin"]);

// --- ROUTEN-DEFINITIONEN ---

// Allgemeiner Health Check (keine Authentifizierung erforderlich)
router.get("/health", (req, res) => forwardRequest(req, res, "GET", "/v1/health"));

// -------------------------------------------------------------------
// SAML Proxy Routen (Azure AD SSO)
// Leiten SAML-bezogenen Verkehr an den SIMONE Java-Dienst weiter.
// -------------------------------------------------------------------

// Startet den SAML-Authentifizierungsfluss
router.get("/saml2/authenticate/:registrationId", (req, res) => {
  const javaServicePath = `/saml2/authenticate/${req.params.registrationId}`;
  forwardRequest(req, res, "GET", javaServicePath);
});

// Empfängt die SAML-Antwort (Assertion Consumer Service - ACS)
router.post("/saml2/authenticate/:registrationId", (req, res) => {
  const javaServicePath = `/saml2/authenticate/${req.params.registrationId}`;
  forwardRequest(req, res, "POST", javaServicePath, req.body);
});

// Stellt die SAML Service Provider Metadaten-XML-Datei bereit
router.get("/saml2/service-provider-metadata/:registrationId", (req, res) => {
  const javaServicePath = `/saml2/service-provider-metadata/${req.params.registrationId}`;
  forwardRequest(req, res, "GET", javaServicePath);
});

// ACS – Azure posts the SAMLResponse here
router.post("/login/saml2/sso/:registrationId", (req, res) => {
  const javaServicePath = `/login/saml2/sso/${req.params.registrationId}`;
  forwardRequest(req, res, "POST", javaServicePath, req.body);
});


// --- Lifecycle-Operationen (Admin-Bereich) ---

router.post("/initialize", authMiddleware, async (req, res) => {
  try {
    const config = await readConfig();
    const requestBody = {
      configFilePath: req.body.configFilePath || config.defaultConfigFilePath,
      useTemporaryConfigCopy: req.body.useTemporaryConfigCopy || true,
    };
    await forwardRequest(req, res, "POST", "/v1/initialize", requestBody);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post("/terminate", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/terminate", {})
);

router.post("/lifecycle/shutdown", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/terminate", {})
);

// --- Admin Netzwerk-/Archiv-Operationen (Admin-Bereich) ---

router.post("/admin/networks", authMiddleware, adminOnly, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/admin/networks/create", req.body)
);

router.post("/admin/networks/import", authMiddleware, adminOnly, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/admin/networks/import-from-file", req.body)
);

router.post("/admin/networks/activate", authMiddleware, adminOnly, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/admin/networks/current/activate", req.body)
);

router.post("/admin/networks/save-as", authMiddleware, adminOnly, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/admin/networks/current/save-as", req.body)
);

router.delete("/admin/networks/:networkName", authMiddleware, adminOnly, (req, res) =>
  forwardRequest(req, res, "DELETE", `/v1/admin/networks/${req.params.networkName}`)
);

router.post("/admin/archives/list", authMiddleware, adminOnly, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/admin/archives/list", req.body)
);

router.post("/admin/archives/create", authMiddleware, adminOnly, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/admin/archives/create", req.body)
);

router.post("/admin/archives/add-network", authMiddleware, adminOnly, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/admin/archives/add-network", req.body)
);

router.post("/admin/archives/extract-network", authMiddleware, adminOnly, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/admin/archives/extract-network", req.body)
);

router.post("/admin/archives/delete-network", authMiddleware, adminOnly, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/admin/archives/delete-network", req.body)
);

// --- Allgemeine Benutzer-Routen (Authentifiziert) ---

router.post("/set-network-directory", authMiddleware, (req, res) => {
  forwardRequest(req, res, "POST", "/v1/networks/set-network-directory", req.body);
});

router.get("/networks", authMiddleware, async (req, res) => {
  try {
    const queryParams: any = {};
    if (req.query.directoryPath) {
      queryParams.directoryPath = req.query.directoryPath;
    } else {
      const config = await readConfig();
      queryParams.directoryPath = config.defaultNetworkDirectory;
    }
    await forwardRequest(req, res, "GET", "/v1/networks", queryParams);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post("/networks/select", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/networks/current/select", req.body)
);

router.get("/networks/current", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", "/v1/networks/current")
);

router.get("/networks/objects", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", "/v1/networks/current/objects")
);

router.post("/scenarios/copy", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/copy", req.body)
);

router.get("/scenarios", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", "/v1/scenarios")
);

router.post("/scenarios/open", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/open", req.body)
);

router.post("/scenarios/close", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/close", {})
);

router.get("/scenarios/current/status", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", "/v1/scenarios/current/status")
);

router.post("/translate/varid", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/translate/varid", req.body)
);

router.post("/translate/varids", (req, res) =>
  forwardRequest(req, res, "POST", "/v1/translate/varids", req.body)
);

router.get("/translate/networks/:networkName/extensions/:objectName", authMiddleware, (req, res) => {
  const { networkName, objectName } = req.params;
  const encodedNetwork = encodeURIComponent(networkName);
  const encodedObject = encodeURIComponent(objectName);
  forwardRequest(req, res, "GET", `/v1/translate/networks/${encodedNetwork}/extensions/${encodedObject}`);
});

router.get("/translate/extid", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", "/v1/translate/extid", req.query)
);

router.post("/scenarios/rtime/set", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/current/rtime/set", req.body)
);

router.get("/scenarios/rtime/get", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", "/v1/scenarios/current/rtime/get")
);

router.post("/scenarios/rtime/next", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/current/rtime/next", {})
);

router.get("/translate/varid-info", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", "/v1/translate/varid-info", req.query)
);

router.post("/scenarios/read-array", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/current/read-float-array", req.body)
);

router.post("/scenarios/read-string", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/current/read-string-data", req.body)
);

router.post("/scenarios/write-array", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/current/write-float-array", req.body)
);

router.post("/scenarios/write-ex", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/current/write-float-ex", req.body)
);

router.post("/scenarios/execute", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/current/execute-ex", req.body)
);

router.get("/scenarios/:scenarioName/status", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", `/v1/scenarios/${req.params.scenarioName}/calculation-status-ex`)
);

router.get("/scenarios/messages/first", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", "/v1/scenarios/current/messages/first")
);

router.get("/scenarios/messages/next", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", "/v1/scenarios/current/messages/next")
);

router.get("/scenarios/messages/all", authMiddleware, (req, res) =>
  forwardRequest(req, res, "GET", "/v1/scenarios/current/messages/all")
);

router.post("/scenarios/create", authMiddleware, (req, res) =>
  forwardRequest(req, res, "POST", "/v1/scenarios/create", req.body)
);

router.delete("/scenarios/delete", authMiddleware, (req, res) =>
  forwardRequest(req, res, "DELETE", "/v1/scenarios/delete", req.body)
);

export default router;