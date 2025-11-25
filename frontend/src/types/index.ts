// export interface UserData {
//   id: string;
//   email: string;
//   firstName?: string;
//   lastName?: string;
//   role: string;
//   isActive?: boolean;
//   createdAt?: string;
//   isMfaEnabled?: boolean;
//   authProvider?: string;
//   updatedAt?: string; // Ensure this is present
//   lastLoginAt?: string | null; // Ensure this is present (can be null)
// }

// // You might also have other types here, for example:
// export interface GenerateMfaSecretResponse {
//   message: string;
//   mfaSecret: string; // The Base32 secret key for manual entry
//   qrCodeDataURL: string; // The data URL for the QR code image
//   otpAuthUrl: string; // The otpauth:// URI
// }

// // New type for an individual role count object
// export interface RoleCount {
//   Role: string; // Matches the 'Role' property from backend GROUP BY query
//   count: number;
// }

// // New type for the overall dashboard statistics object
// export interface AdminDashboardStats {
//   totalUsers: number;
//   newUsersLast7Days: number;
//   usersByRole: RoleCount[]; // This will be an array of { Role: 'admin', count: 2 }, { Role: 'user', count: 148 }
//   activeUsers: number;
//   inactiveUsers: number;
// }

// export interface UserActivityDataPoint {
//   date: string; // "YYYY-MM-DD"
//   count: number;
// }

// export interface AdminNewUserActivityStats {
//   activity: UserActivityDataPoint[];
// }
// export interface NetworkObjectDto {
//   objId: number;
//   objName: string;
//   objectTypeCode: number;
//   objectTypeName: string;
//   subsystemName: string;
// }
// export interface VarIdResponseDto {
//   originalName: string;
//   objId: number;
//   extId: number;
//   simoneStatus: number; // The status code from the simone_varid call
//   statusMessage: string;
// }

// export interface VarIdRequestDto {
//   variableName: string;
//   networkName: string;
// }
// export interface VarIdBatchRequestDto {
//   networkName: string;
//   variableNames: string[];
// }

// export interface VarIdBatchResponseDto {
//   results: VarIdResponseDto[];
// }

// export interface ScenarioListItemDto {
//   name: string;
//   runType: number;
//   initialCondition: string;
//   initialTime: number;
//   terminalTime: number;
//   owner: string;
//   comment: string;
// }

// // Matches the ReadDataResponseItemDto from the Java service
// export interface ReadDataResponseItemDto {
//   objId: number;
//   extId: number;
//   value: number | null; // Changed to number
//   simoneStatus: number;
//   statusMessage: string;
// }

// // Matches the ReadDataResponseDto from the Java service
// export interface ReadDataResponseDto {
//   message: string;
//   results: ReadDataResponseItemDto[];
// }

// // *** NEWLY ADDED/CORRECTED FOR CalculateTabContent ***

// // From ScenarioCalculationStatusResponseDto.java
// export interface ScenarioCalculationStatusResponseDto {
//   scenarioName: string;
//   simoneStatus: number;
//   calculationStatusText: string | null;
//   serviceMessage: string | null;
// }

// // From ExecuteScenarioResponseDto.java
// export interface ExecuteScenarioResponseDto {
//   simoneStatus: number;
//   executionStatusText: string | null;
//   serviceMessage: string | null;
// }

// // From MessageResponseDto.java (used for simple message responses)
// export interface MessageResponseDto {
//   message: string;
// }

// /**
//  * Represents a single item in the list of scenarios.
//  */
// export interface ScenarioListItemDto {
//   name: string;
//   comment: string;
//   // Add other properties if they exist in your backend DTO
// }

// /**
//  * Defines the payload for the create scenario API endpoint.
//  * This should match the CreateScenarioRequestDto in the Java backend.
//  */
// export interface CreateScenarioPayload {
//   scenarioName: string;
//   runtype: number;
//   initialConditions: string;
//   comment?: string;
//   initTime: number; // as a timestamp
//   termTime: number; // as a timestamp
// }

// export interface RunType {
//   id: number;
//   name: string;
// }

// /**
//  * Defines the request payload for copying a scenario.
//  */
// export interface CopyScenarioRequest {
//   sourceScenarioName: string;
//   newScenarioName: string;
// }

// /**
//  * Corresponds to RunTypeListResponseDto.java
//  * Defines the shape of the API response for a list of run types.
//  */
// export interface RunTypeListResponse {
//   runTypes: RunType[];
// }

// export interface DeleteScenarioPayload {
//   scenarioName: string;
// }

// // +++ NEU HINZUGEFÜGT +++
// /**
//  * DTO für die API-Antwort, die eine Liste gültiger Erweiterungen enthält.
//  * Entspricht dem ValidExtensionsDto im Java-Backend.
//  */
// export interface ValidExtensionsDto {
//   extensions: string[];
// }

// frontend/src/types.ts

/**
 * -------------------------------------------------------------------
 * ✅ Interface: UserData
 * Definiert die Struktur der Benutzerdaten, wie sie vom Backend (Node.js)
 * gesendet und im Frontend verwendet werden.
 * -------------------------------------------------------------------
 */
export interface UserData {
  id: string; // Eindeutige Benutzer-ID (UUID).
  email: string; // E-Mail-Adresse des Benutzers.
  firstName?: string; // Optionaler Vorname des Benutzers.
  lastName?: string; // Optionaler Nachname des Benutzers.
  role: string; // Die Rolle des Benutzers (z.B. "user", "admin").
  isActive?: boolean; // Optional: Status, ob das Benutzerkonto aktiv ist.
  createdAt?: string; // Optional: Datum und Uhrzeit der Kontoerstellung im ISO-Format.
  isMfaEnabled?: boolean; // Optional: Gibt an, ob Multi-Faktor-Authentifizierung aktiviert ist.
  authProvider?: string; // Optional: Der Authentifizierungsanbieter (z.B. "email", "google").
  updatedAt?: string; // Optional: Datum und Uhrzeit der letzten Aktualisierung des Benutzerdatensatzes im ISO-Format.
  lastLoginAt?: string | null; // Optional: Datum und Uhrzeit des letzten Logins im ISO-Format, kann null sein.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: GenerateMfaSecretResponse
 * Entspricht der API-Antwort, wenn ein neues MFA-Secret generiert wird.
 * -------------------------------------------------------------------
 */
export interface GenerateMfaSecretResponse {
  message: string; // Eine Bestätigungsnachricht.
  mfaSecret: string; // Der Base32-Secret-Schlüssel für die manuelle Eingabe in die Authenticator-App.
  qrCodeDataURL: string; // Die Data-URL für das QR-Code-Bild, das gescannt werden kann.
  otpAuthUrl: string; // Der 'otpauth://'-URI, der den QR-Code generiert.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: RoleCount
 * Typ für ein einzelnes Objekt, das die Zählung von Benutzern pro Rolle darstellt.
 * Wird typischerweise in Dashboard-Statistiken verwendet.
 * -------------------------------------------------------------------
 */
export interface RoleCount {
  Role: string; // Die Rolle des Benutzers (entspricht der Eigenschaft 'Role' aus der Backend-GROUP BY-Abfrage).
  count: number; // Die Anzahl der Benutzer mit dieser Rolle.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: AdminDashboardStats
 * Typ für das gesamte Dashboard-Statistikobjekt, das dem Administrator
 * eine Übersicht über die Benutzerbasis gibt.
 * -------------------------------------------------------------------
 */
export interface AdminDashboardStats {
  totalUsers: number; // Gesamtzahl der registrierten Benutzer.
  newUsersLast7Days: number; // Anzahl der neuen Benutzer in den letzten 7 Tagen.
  usersByRole: RoleCount[]; // Ein Array von Objekten, das die Benutzerverteilung nach Rollen anzeigt (z.B. { Role: 'admin', count: 2 }).
  activeUsers: number; // Anzahl der aktiven Benutzer.
  inactiveUsers: number; // Anzahl der inaktiven Benutzer.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: UserActivityDataPoint
 * Typ für einen einzelnen Datenpunkt in der Benutzeraktivitätsgrafik.
 * -------------------------------------------------------------------
 */
export interface UserActivityDataPoint {
  date: string; // Das Datum im Format "JJJJ-MM-TT".
  count: number; // Die Anzahl der Ereignisse (z.B. neue Registrierungen) an diesem Datum.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: AdminNewUserActivityStats
 * Typ für die Antwort der API, die Daten zur Aktivität neuer Benutzer enthält.
 * -------------------------------------------------------------------
 */
export interface AdminNewUserActivityStats {
  activity: UserActivityDataPoint[]; // Ein Array von Datenpunkten zur Benutzeraktivität.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: NetworkObjectDto
 * Entspricht dem NetworkObjectDto im Java-Backend.
 * Definiert die Struktur eines Netzwerkobjekts in SIMONE.
 * -------------------------------------------------------------------
 */
export interface NetworkObjectDto {
  objId: number; // Eindeutige ID des Objekts.
  objName: string; // Name des Objekts.
  objectTypeCode: number; // Numerischer Typcode des Objekts.
  objectTypeName: string; // Name des Objekttyps (z.B. "Pipe", "Node").
  subsystemName: string; // Name des Teilsystems, zu dem das Objekt gehört.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: VarIdResponseDto
 * Entspricht der Antwort vom Java-Backend für die Übersetzung eines
 * Variablennamens (z.B. "Pipe1.Flow") in seine SIMONE-internen IDs (objId, extId).
 * -------------------------------------------------------------------
 */
export interface VarIdResponseDto {
  originalName: string; // Der ursprünglich angefragte Variablenname.
  objId: number; // Die interne Objekt-ID.
  extId: number; // Die interne Erweiterungs-ID.
  simoneStatus: number; // Der Statuscode des SIMONE-API-Aufrufs (z.B. 0 für Erfolg).
  statusMessage: string; // Eine Statusmeldung zum Übersetzungsergebnis.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: VarIdRequestDto
 * Definiert die Payload für eine Anfrage zur Übersetzung eines einzelnen
 * Variablennamens (für `apiClient('/simone/translate/varid')`).
 * -------------------------------------------------------------------
 */
export interface VarIdRequestDto {
  variableName: string; // Der zu übersetzende Variablenname.
  networkName: string; // Der Name des Netzwerks, in dem die Variable gesucht wird.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: VarIdBatchRequestDto
 * Definiert die Payload für eine Anfrage zur Batch-Übersetzung mehrerer
 * Variablennamen (für `apiClient('/simone/translate/varids')`).
 * -------------------------------------------------------------------
 */
export interface VarIdBatchRequestDto {
  networkName: string; // Der Name des Netzwerks.
  variableNames: string[]; // Ein Array von Variablennamen, die übersetzt werden sollen.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: VarIdBatchResponseDto
 * Definiert die Antwort für die Batch-Übersetzung von Variablennamen.
 * -------------------------------------------------------------------
 */
export interface VarIdBatchResponseDto {
  results: VarIdResponseDto[]; // Ein Array von individuellen Übersetzungsergebnissen.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ScenarioListItemDto
 * Entspricht dem ScenarioListItemDto im Java-Backend.
 * Stellt ein einzelnes Element in der Liste der verfügbaren Szenarien dar.
 * (Hinweis: Die Liste der Eigenschaften hier sollte die tatsächlichen
 * Eigenschaften des DTOs im Java-Backend widerspiegeln.)
 * -------------------------------------------------------------------
 */
export interface ScenarioListItemDto {
  name: string; // Der eindeutige Name des Szenarios.
  runType: number; // Der Typ des Laufs (z.B. 1 für DYN, 2 für SS).
  initialCondition: string; // Die Anfangsbedingungen des Szenarios.
  initialTime: number; // Die Startzeit des Szenarios (Unix-Timestamp in Millisekunden).
  terminalTime: number; // Die Endzeit des Szenarios (Unix-Timestamp in Millisekunden).
  owner: string; // Der Ersteller/Besitzer des Szenarios.
  comment: string; // Ein optionaler Kommentar zum Szenario.
  // Fügen Sie hier weitere Eigenschaften hinzu, wenn sie in Ihrem Backend-DTO existieren.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ReadDataResponseItemDto
 * Entspricht dem ReadDataResponseItemDto vom Java-Dienst.
 * Repräsentiert ein einzelnes Ergebnis beim Lesen von Daten für eine Variable.
 * -------------------------------------------------------------------
 */
export interface ReadDataResponseItemDto {
  objId: number; // Die Objekt-ID der Variable.
  extId: number; // Die Erweiterungs-ID der Variable.
  value: number | null; // Der gelesene Wert der Variable (null, wenn kein Wert vorhanden).
  simoneStatus: number; // Der SIMONE-Statuscode des Lese-Vorgangs für diese Variable.
  statusMessage: string; // Eine Statusmeldung zum Lese-Vorgang.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ReadDataResponseDto
 * Entspricht dem ReadDataResponseDto vom Java-Dienst.
 * Die Gesamtantwort beim Lesen von Daten für mehrere Variablen.
 * -------------------------------------------------------------------
 */
export interface ReadDataResponseDto {
  message: string; // Eine allgemeine Meldung zum gesamten Lese-Vorgang.
  results: ReadDataResponseItemDto[]; // Ein Array von Ergebnissen für jede gelesene Variable.
}

// -------------------------------------------------------------------
// *** NEU HINZUGEFÜGT/KORRIGIERT FÜR CalculateTabContent ***
// -------------------------------------------------------------------

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ScenarioCalculationStatusResponseDto
 * Entspricht dem ScenarioCalculationStatusResponseDto.java im Java-Backend.
 * Definiert die Antwort für den Berechnungsstatus eines Szenarios.
 * -------------------------------------------------------------------
 */
export interface ScenarioCalculationStatusResponseDto {
  scenarioName: string; // Der Name des Szenarios.
  simoneStatus: number; // Der Statuscode des SIMONE-API-Aufrufs.
  calculationStatusText: string | null; // Textuelle Beschreibung des Berechnungsstatus (z.B. "RUNOK", "CALCULATING").
  serviceMessage: string | null; // Eine zusätzliche Servicemeldung.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ExecuteScenarioResponseDto
 * Entspricht dem ExecuteScenarioResponseDto.java im Java-Backend.
 * Definiert die Antwort nach der Ausführung eines Szenarios.
 * -------------------------------------------------------------------
 */
export interface ExecuteScenarioResponseDto {
  simoneStatus: number; // Der Statuscode des SIMONE-API-Aufrufs.
  executionStatusText: string | null; // Textuelle Beschreibung des Ausführungsstatus.
  serviceMessage: string | null; // Eine zusätzliche Servicemeldung.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: MessageResponseDto
 * Entspricht dem MessageResponseDto.java im Java-Backend.
 * Wird für einfache API-Antworten verwendet, die nur eine Nachricht enthalten.
 * -------------------------------------------------------------------
 */
export interface MessageResponseDto {
  message: string; // Die Nachricht.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: CreateScenarioPayload
 * Definiert die Payload für den API-Endpunkt zum Erstellen eines Szenarios.
 * Dies sollte mit dem CreateScenarioRequestDto im Java-Backend übereinstimmen.
 * -------------------------------------------------------------------
 */
export interface CreateScenarioPayload {
  scenarioName: string; // Der Name des zu erstellenden Szenarios.
  runtype: number; // Der Lauftyp des Szenarios (numerischer Code).
  initialConditions: string; // Die Anfangsbedingungen.
  comment?: string; // Optionaler Kommentar.
  initTime: number; // Startzeit als Unix-Timestamp (in Millisekunden).
  termTime: number; // Endzeit als Unix-Timestamp (in Millisekunden).
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: RunType
 * Definiert die Struktur eines Lauftyps.
 * -------------------------------------------------------------------
 */
export interface RunType {
  id: number; // Eindeutige ID des Lauftyps.
  name: string; // Name des Lauftyps (z.B. "Dynamische Simulation").
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: CopyScenarioRequest
 * Definiert die Anfragennutzlast zum Kopieren eines Szenarios.
 * -------------------------------------------------------------------
 */
export interface CopyScenarioRequest {
  sourceScenarioName: string; // Der Name des Quellszenarios.
  newScenarioName: string; // Der Name für die neue Szenariokopie.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: RunTypeListResponse
 * Entspricht dem RunTypeListResponseDto.java.
 * Definiert die Form der API-Antwort für eine Liste von Lauftypen.
 * -------------------------------------------------------------------
 */
export interface RunTypeListResponse {
  runTypes: RunType[]; // Ein Array von Lauftyp-Objekten.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: DeleteScenarioPayload
 * Definiert die Payload für das Löschen eines Szenarios.
 * -------------------------------------------------------------------
 */
export interface DeleteScenarioPayload {
  scenarioName: string; // Der Name des zu löschenden Szenarios.
}

// +++ NEU HINZUGEFÜGT +++
/**
 * -------------------------------------------------------------------
 * ✅ Interface: ValidExtensionsDto
 * Entspricht dem ValidExtensionsDto im Java-Backend.
 * DTO für die API-Antwort, die eine Liste gültiger Erweiterungen für
 * ein bestimmtes Netzwerkobjekt enthält.
 * -------------------------------------------------------------------
 */
export interface ValidExtensionsDto {
  extensions: string[]; // Ein Array von Strings, die die gültigen Erweiterungen darstellen.
}
