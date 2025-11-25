// frontend/src/lib/apiClient.ts

// Router aus 'next/router' wird für die Seiten-Router-Navigation verwendet.
// Falls Sie ausschließlich den App Router verwenden, könnte dieser Import durch 'next/navigation' ersetzt oder entfernt werden.
import Router from "next/router";
import { CreateScenarioPayload } from "@/types"; // Importiert den Typ für die Szenario-Erstellungs-Payload.
import { DeleteScenarioPayload } from "@/types"; // Importiert den Typ für die Szenario-Lösch-Payload.
import { RunTypeListResponse } from "@/types"; // Importiert den Antworttyp für Lauftypen.

// Basis-URL für die API-Aufrufe.
// Für die lokale Entwicklung sollte dies auf http://localhost:3001/api zeigen,
// in der Produktion auf die öffentliche URL des Backends, z.B. https://simoneapi.gascade.de/api.
// Der Fallback-Wert wird verwendet, falls NEXT_PUBLIC_API_BASE_URL nicht gesetzt ist.
const FALLBACK_API_BASE_URL = "https://simoneapi.gascade.de/api"; // Angepasst an die neue Produktions-Basis-URL für Konsistenz.
const API_BASE_URL_FROM_ENV = process.env.NEXT_PUBLIC_API_BASE_URL; // Wird von der Umgebungsvariable geladen (Next.js Public Env Var).

/**
 * -------------------------------------------------------------------
 * ✅ Benutzerdefinierte Fehlerklasse: ApiError
 * Diese Klasse wird geworfen, wenn ein API-Aufruf fehlschlägt (z.B. HTTP-Status != 2xx).
 * Sie erweitert die Standard `Error`-Klasse um spezifische Details wie
 * HTTP-Statuscode und feldspezifische Validierungsfehler.
 * -------------------------------------------------------------------
 */
export class ApiError extends Error {
  status?: number; // Optionaler HTTP-Statuscode des Fehlers.
  fieldErrors?: { [key: string]: string[] | undefined }; // Optionale feldspezifische Fehler (z.B. von Zod-Validierung).

  constructor(
    message: string,
    status?: number,
    fieldErrors?: { [key: string]: string[] | undefined }
  ) {
    super(message); // Ruft den Konstruktor der übergeordneten Error-Klasse auf.
    this.name = "ApiError"; // Setzt den Namen des Fehlers für bessere Identifizierung.
    this.status = status; // Speichert den HTTP-Statuscode.
    this.fieldErrors = fieldErrors; // Speichert feldspezifische Fehler.
    // Setzt den Prototyp explizit, um sicherzustellen, dass `instanceof ApiError` korrekt funktioniert,
    // besonders nach Transpilierung.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// -------------------------------------------------------------------
// ✅ Token-Aktualisierungs-Warteschlange (Request Queuing)
// Diese Logik stellt sicher, dass, wenn ein Access Token abgelaufen ist und
// ein Refresh Token angefordert wird, alle währenddessen eintreffenden
// weiteren API-Anfragen nicht sofort fehlschlagen, sondern in eine
// Warteschlange gestellt und nach erfolgreicher Token-Aktualisierung
// wiederholt werden.
// -------------------------------------------------------------------

let isRefreshing = false; // Flag, das anzeigt, ob gerade eine Token-Aktualisierung läuft.
let failedQueue: Array<{
  resolve: (value: Response | PromiseLike<Response>) => void; // Resolve-Funktion des Promises der ursprünglichen Anfrage.
  reject: (reason?: Error) => void; // Reject-Funktion des Promises der ursprünglichen Anfrage.
  options: RequestInit; // Optionen der ursprünglichen Anfrage.
  url: string; // URL der ursprünglichen Anfrage.
}> = []; // Warteschlange für fehlgeschlagene Anfragen, die wiederholt werden sollen.

/**
 * -------------------------------------------------------------------
 * ✅ Funktion: processQueue
 * Verarbeitet die Warteschlange der fehlgeschlagenen Anfragen.
 * Wird aufgerufen, nachdem der Token-Aktualisierungsvorgang abgeschlossen ist (Erfolg oder Fehler).
 * -------------------------------------------------------------------
 */
const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); // Wenn die Token-Aktualisierung fehlschlug, lehne alle Anfragen in der Warteschlange ab.
    } else {
      // Wenn die Token-Aktualisierung erfolgreich war, wiederhole die ursprüngliche Anfrage.
      originalRequest(prom.url, prom.options)
        .then(prom.resolve) // Bei Erfolg auflösen.
        .catch(prom.reject); // Bei Fehler ablehnen.
    }
  });
  failedQueue = []; // Leere die Warteschlange.
};

/**
 * -------------------------------------------------------------------
 * ✅ Funktion: originalRequest
 * Führt die eigentliche Fetch-Anfrage aus.
 * Dies ist eine Helper-Funktion, die sowohl vom `apiClient` als auch
 * von `processQueue` verwendet wird.
 * -------------------------------------------------------------------
 */
async function originalRequest(
  url: string,
  options: RequestInit
): Promise<Response> {
  console.log("[apiClient originalRequest] Rufe ab:", url); // Debug-Meldung.
  const response = await fetch(url, options); // Führt den Fetch-Aufruf aus.
  return response;
}

/**
 * -------------------------------------------------------------------
 * ✅ Hauptfunktion: apiClient
 * Der zentrale API-Client für alle Frontend-Backend-Kommunikation.
 * Implementiert automatische Token-Aktualisierung und Fehlerbehandlung.
 * @param endpoint - Der API-Endpunkt (z.B. "/profile/me").
 * @param options - Optionen für die Fetch-Anfrage (z.B. method, body, headers).
 * @returns Ein Promise, das mit der `Response` der Fetch-Anfrage aufgelöst wird.
 * @throws `ApiError` bei API-spezifischen Fehlern oder `Error` bei allgemeinen Fehlern.
 * -------------------------------------------------------------------
 */
export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Standardoptionen für alle Anfragen.
  const defaultOptions: RequestInit = {
    headers: { "Content-Type": "application/json", ...options.headers }, // Setzt JSON-Header und erlaubt Überschreibungen.
    credentials: "include", // Stellt sicher, dass Cookies (inkl. HttpOnly Tokens) gesendet werden.
    ...options, // Überschreibt Standardoptionen mit spezifischen.
  };

  // Konstruiert die vollständige URL für die Anfrage.
  const currentApiBaseUrl = API_BASE_URL_FROM_ENV || FALLBACK_API_BASE_URL;
  console.log("[apiClient] API-Basis-URL aus Umgebung:", currentApiBaseUrl); // Debug-Ausgabe der Umgebungsvariable.
  // Entfernt einen eventuellen Schrägstrich am Ende der Basis-URL.
  const cleanApiBaseUrl = currentApiBaseUrl.endsWith("/")
    ? currentApiBaseUrl.slice(0, -1)
    : currentApiBaseUrl;
  // Stellt sicher, dass der Endpunkt mit einem Schrägstrich beginnt.
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${cleanApiBaseUrl}${cleanEndpoint}`; // Die finale URL.
  console.log("[apiClient] Finale Fetch-URL:", url); // Debug-Ausgabe der finalen URL.

  let response: Response; // Variable zum Speichern der Antwort.

  try {
    response = await fetch(url, defaultOptions); // Führt die ursprüngliche Anfrage aus.

    // -----------------------------------------------------------
    // ✅ Automatisches Token-Refresh bei 401 Unauthorized
    // -----------------------------------------------------------
    if (response.status === 401) {
      console.log(
        "[apiClient] Erhielt 401 von",
        url,
        ". Versuche Token-Aktualisierung."
      );
      if (!isRefreshing) {
        // Wenn noch keine Aktualisierung läuft:
        isRefreshing = true; // Setze Flag auf true.
        try {
          // Der Refresh-Token-Endpunkt ist relativ zur API_BASE_URL.
          const refreshTokenEndpoint = `${cleanApiBaseUrl}/auth/refresh-token`;
          console.log(
            "[apiClient] Versuche Refresh-Token-Aufruf an:",
            refreshTokenEndpoint
          );
          // Führt den Refresh-Token-Aufruf aus.
          const refreshResponse = await fetch(refreshTokenEndpoint, {
            method: "POST",
            credentials: "include", // Muss Cookies (Refresh Token) senden.
          });

          if (refreshResponse.ok) {
            // Token-Aktualisierung erfolgreich.
            console.log("[apiClient] Token-Aktualisierung erfolgreich.");
            isRefreshing = false; // Setze Flag zurück.
            processQueue(null); // Verarbeite die Warteschlange (wiederhole Anfragen).
            console.log(
              "[apiClient] Wiederhole ursprüngliche Anfrage an:",
              url
            );
            // Wiederhole die ursprünglich fehlgeschlagene Anfrage.
            response = await fetch(url, defaultOptions);
          } else {
            // Token-Aktualisierung fehlgeschlagen.
            const refreshErrorStatus = refreshResponse.status;
            const refreshErrorText = await refreshResponse
              .text()
              .catch(() => refreshResponse.statusText); // Versuche, Fehlermeldung zu holen.
            console.error(
              "[apiClient] Token-Aktualisierung fehlgeschlagen. Status:",
              refreshErrorStatus,
              "Antwort:",
              refreshErrorText
            );
            isRefreshing = false; // Setze Flag zurück.
            const refreshFailedError = new ApiError(
              `Sitzung abgelaufen oder Aktualisierung fehlgeschlagen: ${refreshErrorText}`,
              refreshErrorStatus
            );
            processQueue(refreshFailedError); // Informiere Warteschlange über Fehler.
            // Leite zur Anmeldeseite um, wenn die Sitzung abgelaufen ist und nicht bereits auf der Anmeldeseite.
            if (
              typeof window !== "undefined" &&
              Router.pathname &&
              Router.pathname !== "/auth/signin"
            )
              Router.push("/auth/signin");
            throw refreshFailedError; // Werfe Fehler, um weitere Verarbeitung zu stoppen.
          }
        } catch (refreshException) {
          // Allgemeine Ausnahme während des Refresh-Prozesses.
          console.error(
            "[apiClient] Ausnahme während des Token-Aktualisierungsprozesses:",
            refreshException
          );
          isRefreshing = false; // Setze Flag zurück.
          const errorToProcess =
            refreshException instanceof Error
              ? refreshException
              : new Error(String(refreshException));
          processQueue(errorToProcess); // Verarbeite Warteschlange mit diesem Fehler.
          // Leite zur Anmeldeseite um.
          if (
            typeof window !== "undefined" &&
            Router.pathname &&
            Router.pathname !== "/auth/signin"
          )
            Router.push("/auth/signin");
          throw refreshException; // Werfe die Ausnahme weiter.
        }
      } else {
        // Wenn bereits eine Aktualisierung läuft, stelle die aktuelle Anfrage in die Warteschlange.
        console.log(
          "[apiClient] Stelle Anfrage in Warteschlange, während Token aktualisiert wird:",
          url
        );
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, options: defaultOptions, url });
        });
      }
    }

    // -----------------------------------------------------------
    // ✅ Allgemeine Fehlerbehandlung für nicht-OK-Antworten (außer 401)
    // -----------------------------------------------------------
    if (!response.ok) {
      let errorJsonPayload: {
        serviceMessage?: string; // Neues Feld für Backend-Nachrichten (z.B. von Java-Dienst).
        message?: string; // Allgemeine Fehlermeldung vom Backend.
        errors?: { [key: string]: string[] | undefined }; // Feldspezifische Validierungsfehler (Zod-Stil).
      } = {};

      let errorMessageFromServer = `Anfrage fehlgeschlagen: ${response.statusText} (${response.status}) für ${url}`; // Standard-Fehlermeldung.
      let fieldErrorsFromServer:
        | { [key: string]: string[] | undefined }
        | undefined;

      try {
        // Versuche, den JSON-Fehler-Body zu parsen.
        errorJsonPayload = await response.json();

        // Extrahiere Zod-ähnliche Feldfelher.
        if (errorJsonPayload.errors) {
          fieldErrorsFromServer = errorJsonPayload.errors;
        }

        // NEU: `serviceMessage` bevorzugen, dann `message` für die Fehlermeldung.
        if (errorJsonPayload.serviceMessage) {
          errorMessageFromServer = errorJsonPayload.serviceMessage;
        } else if (errorJsonPayload.message) {
          errorMessageFromServer = errorJsonPayload.message;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (jsonParseError) {
        // JSON-Parse-Fehler ignorieren; wir fallen auf den Standard-Fehlertext zurück.
      }

      console.error(
        `[apiClient] Antwort nicht OK für ${url}. Status: ${response.status}. Nachricht: ${errorMessageFromServer}`,
        fieldErrorsFromServer || ""
      );

      // Werfe `ApiError` mit der reichhaltigeren Meldung und Details.
      throw new ApiError(
        errorMessageFromServer,
        response.status,
        fieldErrorsFromServer
      );
    }
    return response; // Gib die erfolgreiche Antwort zurück.
  } catch (error) {
    // -----------------------------------------------------------
    // ✅ Gesamte Fehlerbehandlung für Fetch-Fehler (z.B. Netzwerk offline)
    // -----------------------------------------------------------
    console.error(
      "[apiClient] Gesamtfehler während des API-Aufrufs an",
      url,
      ":",
      error
    );
    if (error instanceof ApiError) throw error; // Wenn es bereits ein ApiError ist, werfe ihn einfach weiter.
    // Ansonsten werfe einen allgemeinen Error.
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

/**
 * -------------------------------------------------------------------
 * ✅ Funktion: createScenario
 * Sendet eine Anfrage an das Backend, um ein neues Szenario zu erstellen.
 * -------------------------------------------------------------------
 */
export const createScenario = async (
  payload: CreateScenarioPayload
): Promise<Response> => {
  return apiClient("/simone/scenarios/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/**
 * -------------------------------------------------------------------
 * ✅ Funktion: getRunTypes
 * Ruft die verfügbaren Lauftypen vom Backend ab.
 * -------------------------------------------------------------------
 */
export const getRunTypes = async (): Promise<RunTypeListResponse> => {
  const response = await apiClient("/simone/translations/runtypes"); // API-Aufruf für Lauftypen.
  return response.json(); // Parsed und gibt die JSON-Antwort zurück.
};

/**
 * -------------------------------------------------------------------
 * ✅ Funktion: deleteScenario
 * Sendet eine Anfrage an das Backend, um ein Szenario zu löschen.
 * -------------------------------------------------------------------
 */
export const deleteScenario = async (
  payload: DeleteScenarioPayload
): Promise<Response> => {
  return apiClient("/simone/scenarios/delete", {
    method: "DELETE", // HTTP DELETE-Methode.
    body: JSON.stringify(payload), // Payload für die Löschung.
  });
};