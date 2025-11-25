// // frontend/src/components/auth/MfaSetup.tsx
// "use client";

// import React, { useState, FormEvent, useEffect } from "react";
// import Image from "next/image";
// import { apiClient, ApiError } from "@/lib/apiClient";
// import { FiLoader, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

// /**
//  * Definiert die Props für die MfaSetup-Komponente.
//  */
// interface MfaSetupProps {
//   initialIsMfaEnabled: boolean;
//   onMfaStatusChange: () => void;
// }

// /**
//  * Definiert die Struktur der Antwort für die Generierung eines MFA-Geheimnisses.
//  */
// interface GenerateSecretResponse {
//   message: string;
//   mfaSecret: string;
//   qrCodeDataURL: string;
//   otpAuthUrl: string;
// }

// /**
//  * Eine Komponente zur Verwaltung der Multi-Faktor-Authentifizierung (MFA) für das Benutzerprofil.
//  * Ermöglicht das Aktivieren, Deaktivieren und Verifizieren der MFA.
//  */
// export default function MfaSetup({
//   initialIsMfaEnabled,
//   onMfaStatusChange,
// }: MfaSetupProps) {
//   const [isMfaEnabledLocally, setIsMfaEnabledLocally] =
//     useState<boolean>(initialIsMfaEnabled);
//   const [setupStage, setSetupStage] = useState<
//     "initial" | "pendingVerification" | "enabled" | "promptDisable"
//   >(initialIsMfaEnabled ? "enabled" : "initial");

//   const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
//   const [manualSetupKey, setManualSetupKey] = useState<string | null>(null);
//   const [tempMfaSecretForVerification, setTempMfaSecretForVerification] =
//     useState<string | null>(null);

//   const [totpCode, setTotpCode] = useState<string>("");

//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [fieldErrors, setFieldErrors] = useState<{
//     [key: string]: string[] | undefined;
//   } | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   // Setzt den Zustand zurück, wenn sich der MFA-Status von außen ändert.
//   useEffect(() => {
//     setIsMfaEnabledLocally(initialIsMfaEnabled);
//     setSetupStage(initialIsMfaEnabled ? "enabled" : "initial");
//     if (initialIsMfaEnabled) {
//       setQrCodeDataURL(null);
//       setManualSetupKey(null);
//       setTempMfaSecretForVerification(null);
//     }
//     setError(null);
//     setFieldErrors(null);
//     setSuccessMessage(null);
//   }, [initialIsMfaEnabled]);

//   /**
//    * Fordert ein neues MFA-Geheimnis und einen QR-Code vom Server an.
//    */
//   const handleGenerateSecret = async () => {
//     setIsLoading(true);
//     setError(null);
//     setFieldErrors(null);
//     setSuccessMessage(null);
//     setQrCodeDataURL(null);
//     setManualSetupKey(null);
//     setTempMfaSecretForVerification(null);
//     try {
//       const response = await apiClient("/mfa/generate-secret", {
//         method: "POST",
//       });
//       const data = (await response.json()) as GenerateSecretResponse;
//       setQrCodeDataURL(data.qrCodeDataURL);
//       setManualSetupKey(data.mfaSecret);
//       setTempMfaSecretForVerification(data.mfaSecret);
//       setSetupStage("pendingVerification");
//       setSuccessMessage(
//         data.message ||
//           "QR-Code generiert. Scannen Sie ihn mit Ihrer Authentifizierungs-App und geben Sie den Code unten zur Bestätigung ein."
//       );
//     } catch (err) {
//       console.error("🔥 Fehler beim Generieren des MFA-Geheimnisses:", err);
//       if (err instanceof ApiError) {
//         setError(err.message);
//         if (err.fieldErrors) setFieldErrors(err.fieldErrors);
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError(
//           "Fehler beim Generieren des MFA-Geheimnisses. Bitte versuchen Sie es erneut."
//         );
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Behandelt die Formularübermittlung zur Aktivierung der MFA.
//    * @param event - Das Form-Submit-Event.
//    */
//   const handleEnableMfa = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setError(null);
//     setFieldErrors(null);
//     setSuccessMessage(null);
//     if (!tempMfaSecretForVerification) {
//       setError(
//         "MFA-Einrichtungsgeheimnis fehlt. Bitte versuchen Sie, den QR-Code erneut zu generieren."
//       );
//       return;
//     }
//     if (
//       !totpCode.trim() ||
//       totpCode.trim().length !== 6 ||
//       !/^\d{6}$/.test(totpCode.trim())
//     ) {
//       setError(
//         "Bitte geben Sie einen gültigen 6-stelligen TOTP-Code aus Ihrer Authentifizierungs-App ein."
//       );
//       return;
//     }
//     setIsLoading(true);
//     try {
//       await apiClient("/mfa/enable", {
//         method: "POST",
//         body: JSON.stringify({
//           totpCode: totpCode.trim(),
//           mfaSecret: tempMfaSecretForVerification,
//         }),
//       });
//       setSuccessMessage("MFA wurde erfolgreich aktiviert!");
//       setIsMfaEnabledLocally(true);
//       setSetupStage("enabled");
//       setQrCodeDataURL(null);
//       setManualSetupKey(null);
//       setTempMfaSecretForVerification(null);
//       setTotpCode("");
//       onMfaStatusChange();
//     } catch (err) {
//       console.error("🔥 Fehler beim Aktivieren der MFA:", err);
//       if (err instanceof ApiError) {
//         setError(err.message);
//         if (err.fieldErrors) setFieldErrors(err.fieldErrors);
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError(
//           "Fehler beim Aktivieren der MFA. Der Code könnte falsch, abgelaufen oder bereits verwendet sein."
//         );
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Wechselt in den Modus zur Bestätigung der MFA-Deaktivierung.
//    */
//   const promptForDisableMfa = () => {
//     setSetupStage("promptDisable");
//     setError(null);
//     setFieldErrors(null);
//     setSuccessMessage(null);
//     setTotpCode("");
//   };

//   /**
//    * Behandelt die Formularübermittlung zur Bestätigung der MFA-Deaktivierung.
//    * @param event - Das Form-Submit-Event.
//    */
//   const handleConfirmDisableMfa = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setError(null);
//     setFieldErrors(null);
//     setSuccessMessage(null);
//     if (
//       !totpCode.trim() ||
//       totpCode.trim().length !== 6 ||
//       !/^\d{6}$/.test(totpCode.trim())
//     ) {
//       setError(
//         "Bitte geben Sie einen gültigen 6-stelligen TOTP-Code ein, um die Deaktivierung der MFA zu bestätigen."
//       );
//       return;
//     }
//     setIsLoading(true);
//     try {
//       await apiClient("/mfa/disable", {
//         method: "POST",
//         body: JSON.stringify({ totpCode: totpCode.trim() }),
//       });
//       setSuccessMessage("MFA wurde erfolgreich deaktiviert.");
//       setIsMfaEnabledLocally(false);
//       setSetupStage("initial");
//       setTotpCode("");
//       onMfaStatusChange();
//     } catch (err) {
//       console.error("🔥 Fehler beim Deaktivieren der MFA:", err);
//       if (err instanceof ApiError) {
//         setError(err.message);
//         if (err.fieldErrors) setFieldErrors(err.fieldErrors);
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError(
//           "Fehler beim Deaktivieren der MFA. Der Code könnte falsch sein."
//         );
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Rendert eine Fehlerkomponente, wenn eine Fehlermeldung vorhanden ist.
//    * @param errMessage - Die anzuzeigende Fehlermeldung.
//    * @param errFieldErrors - Optionale Feldfehler zur Anzeige.
//    * @returns Die Fehlerkomponente oder null.
//    */
//   const renderError = (
//     errMessage: string | null,
//     errFieldErrors?: typeof fieldErrors
//   ) => {
//     if (!errMessage) return null;
//     return (
//       <div className="alert alert-danger my-4 text-sm">
//         <div className="flex items-center">
//           <FiAlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
//           <p>{errMessage}</p>
//         </div>
//         {errFieldErrors && Object.keys(errFieldErrors).length > 0 && (
//           <ul className="list-disc list-inside pl-7 mt-1">
//             {Object.entries(errFieldErrors).map(
//               ([field, messages]) =>
//                 messages &&
//                 messages.map((msg, idx) => (
//                   <li key={`${field}-${idx}`}>{msg}</li>
//                 ))
//             )}
//           </ul>
//         )}
//       </div>
//     );
//   };

//   if (isMfaEnabledLocally && setupStage === "enabled") {
//     return (
//       <div className="alert alert-success p-6">
//         <div className="flex items-center mb-3">
//           <FiCheckCircle className="h-7 w-7 mr-3" />
//           <p className="text-lg font-semibold">
//             Multi-Faktor-Authentifizierung ist AKTIVIERT.
//           </p>
//         </div>
//         <p className="text-sm mb-4">
//           Ihr Konto ist mit einer zusätzlichen Sicherheitsebene geschützt.
//         </p>
//         {renderError(error, fieldErrors)}
//         {successMessage && (
//           <p className="mt-3 text-sm text-[var(--color-success)]">
//             {successMessage}
//           </p>
//         )}
//         <button
//           onClick={promptForDisableMfa}
//           disabled={isLoading}
//           className="btn-danger w-full sm:w-auto mt-2 text-sm"
//         >
//           {isLoading ? (
//             <FiLoader className="animate-spin inline-block mr-2 h-4 w-4" />
//           ) : null}
//           {isLoading ? "Wird verarbeitet..." : "MFA deaktivieren..."}
//         </button>
//       </div>
//     );
//   }

//   if (setupStage === "promptDisable") {
//     return (
//       <div className="p-6 rounded-lg shadow-sm alert alert-warning">
//         <h3 className="text-lg font-semibold mb-3">
//           MFA-Deaktivierung bestätigen
//         </h3>
//         <p className="text-sm mb-4">
//           Um die Multi-Faktor-Authentifizierung zu deaktivieren, geben Sie bitte
//           einen aktuellen Code aus Ihrer Authentifizierungs-App ein.
//         </p>
//         {renderError(error, fieldErrors)}
//         <form onSubmit={handleConfirmDisableMfa} className="space-y-4">
//           <div>
//             <label
//               htmlFor="disableTotpCode"
//               className="block text-sm font-medium"
//             >
//               Authentifizierungscode:
//             </label>
//             <input
//               type="text"
//               id="disableTotpCode"
//               name="disableTotpCode"
//               value={totpCode}
//               onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
//               maxLength={6}
//               required
//               disabled={isLoading}
//               className="mt-1 max-w-xs"
//               placeholder="123456"
//               pattern="\d{6}"
//               inputMode="numeric"
//             />
//           </div>
//           <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
//             <button
//               type="submit"
//               disabled={isLoading || totpCode.length !== 6}
//               className="btn-danger w-full sm:w-auto order-1 sm:order-none"
//             >
//               {isLoading ? (
//                 <FiLoader className="animate-spin inline-block mr-2 h-4 w-4" />
//               ) : null}
//               {isLoading
//                 ? "Wird deaktiviert..."
//                 : "Bestätigen & MFA deaktivieren"}
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 setSetupStage("enabled");
//                 setError(null);
//                 setSuccessMessage(null);
//               }}
//               disabled={isLoading}
//               className="w-full sm:w-auto order-2 sm:order-none text-sm"
//             >
//               Abbrechen
//             </button>
//           </div>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 border border-[var(--border-color)] rounded-lg shadow-sm bg-[var(--color-surface)]">
//       {setupStage === "initial" && (
//         <>
//           {renderError(error, fieldErrors)}
//           {successMessage && (
//             <p className="alert alert-success mb-4 text-sm">{successMessage}</p>
//           )}
//           <div className="flex items-center mb-3">
//             <FiAlertTriangle className="h-7 w-7 text-[var(--color-warning)] mr-3" />
//             <p className="text-lg font-semibold text-[var(--color-text-primary)]">
//               Multi-Faktor-Authentifizierung ist DEAKTIVIERT.
//             </p>
//           </div>
//           <p className="text-sm text-[var(--color-text-secondary)] mb-4">
//             Fügen Sie eine zusätzliche Sicherheitsebene hinzu. Wenn aktiviert,
//             benötigen Sie zum Anmelden einen Code aus einer
//             Authentifizierungs-App und Ihr Passwort.
//           </p>
//           <button
//             onClick={handleGenerateSecret}
//             disabled={isLoading}
//             className="btn-primary w-full sm:w-auto"
//           >
//             {isLoading ? (
//               <FiLoader className="animate-spin inline-block mr-2 h-4 w-4" />
//             ) : null}
//             {isLoading
//               ? "Geheimnis wird generiert..."
//               : "Multi-Faktor-Authentifizierung einrichten"}
//           </button>
//         </>
//       )}

//       {setupStage === "pendingVerification" &&
//         qrCodeDataURL &&
//         manualSetupKey && (
//           <div className="mt-2 space-y-6">
//             {successMessage && (
//               <div className="alert alert-info mb-4 text-sm">
//                 {successMessage}
//               </div>
//             )}
//             {renderError(error, fieldErrors)}
//             <div className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--color-background)]">
//               <h3 className="text-md font-semibold text-[var(--color-text-primary)] mb-2">
//                 Schritt 1: QR-Code scannen
//               </h3>
//               <p className="text-sm text-[var(--color-text-secondary)] mb-3">
//                 Verwenden Sie eine Authentifizierungs-App, um diesen Code zu
//                 scannen.
//               </p>
//               <div className="flex justify-center p-2 border border-[var(--border-color)] rounded-md bg-white max-w-xs mx-auto my-4">
//                 <Image
//                   src={qrCodeDataURL}
//                   alt="MFA-Einrichtungs-QR-Code"
//                   width={208}
//                   height={208}
//                   className="w-48 h-48 md:w-52 md:h-52"
//                 />
//               </div>
//               <h3 className="text-md font-semibold text-[var(--color-text-primary)] mb-2 mt-4">
//                 Oder, Einrichtungsschlüssel manuell eingeben
//               </h3>
//               <p className="text-sm text-[var(--color-text-secondary)] mb-1">
//                 Wenn Sie nicht scannen können, geben Sie diesen Schlüssel in
//                 Ihre App ein:
//               </p>
//               <div
//                 className="mt-1 p-3 bg-[var(--color-surface-2)] rounded-md text-sm font-mono text-[var(--color-text-primary)] break-all shadow-inner select-all cursor-pointer"
//                 title="Klicken, um den Schlüssel auszuwählen"
//               >
//                 {manualSetupKey}
//               </div>
//             </div>
//             <form
//               onSubmit={handleEnableMfa}
//               className="space-y-4 pt-6 border-t border-[var(--border-color)]"
//             >
//               <div>
//                 <h3 className="text-md font-semibold text-[var(--color-text-primary)] mb-2">
//                   Schritt 2: Überprüfen & Aktivieren
//                 </h3>
//                 <label
//                   htmlFor="enableTotpCode"
//                   className="block text-sm font-medium text-[var(--color-text-primary)] mt-1 mb-1"
//                 >
//                   Geben Sie den 6-stelligen Bestätigungscode aus Ihrer App ein:
//                 </label>
//                 <input
//                   type="text"
//                   id="enableTotpCode"
//                   name="enableTotpCode"
//                   value={totpCode}
//                   onChange={(e) =>
//                     setTotpCode(e.target.value.replace(/\D/g, ""))
//                   }
//                   maxLength={6}
//                   required
//                   disabled={isLoading}
//                   className="mt-1 max-w-xs"
//                   placeholder="123456"
//                   pattern="\d{6}"
//                   inputMode="numeric"
//                 />
//               </div>
//               <button
//                 type="submit"
//                 disabled={isLoading || totpCode.length !== 6}
//                 className="btn-primary w-full sm:w-auto"
//               >
//                 {isLoading ? (
//                   <FiLoader className="animate-spin inline-block mr-2 h-4 w-4" />
//                 ) : null}
//                 {isLoading
//                   ? "Code wird überprüft..."
//                   : "Überprüfen & MFA aktivieren"}
//               </button>
//             </form>
//           </div>
//         )}
//       {setupStage === "initial" && error && !fieldErrors && (
//         <div className="alert alert-danger mt-4 text-sm flex items-center">
//           <FiAlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" /> {error}
//         </div>
//       )}
//     </div>
//   );
// }

// frontend/src/components/auth/MfaSetup.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, { useState, FormEvent, useEffect } from "react"; // React Hooks für Zustand, Formularereignisse und Lebenszyklus.
import Image from "next/image"; // Next.js Image-Komponente für optimierte Bildanzeige (hier für QR-Code).
import { apiClient, ApiError } from "@/lib/apiClient"; // Importiert den API-Client und den benutzerdefinierten Fehler-Typ.
import { FiLoader, FiAlertTriangle, FiCheckCircle } from "react-icons/fi"; // Importiert Icons (Lade-Spinner, Warnung, Erfolg).

/**
 * -------------------------------------------------------------------
 * ✅ Interface: MfaSetupProps
 * Definiert die Props (Eigenschaften), die an die MfaSetup-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface MfaSetupProps {
  initialIsMfaEnabled: boolean; // Der anfängliche MFA-Status des Benutzers (aus dem übergeordneten Element, z.B. Profilseite).
  onMfaStatusChange: () => void; // Callback-Funktion, die aufgerufen wird, wenn sich der MFA-Status ändert (Aktivierung/Deaktivierung).
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: GenerateSecretResponse
 * Definiert die erwartete Struktur der Antwort vom Backend,
 * wenn ein neues MFA-Geheimnis generiert wird.
 * -------------------------------------------------------------------
 */
interface GenerateSecretResponse {
  message: string; // Eine Bestätigungsnachricht vom Server.
  mfaSecret: string; // Das generierte MFA-Geheimnis (Klartext, temporär für die Einrichtung).
  qrCodeDataURL: string; // Der QR-Code als Data URL (Base64-kodiertes Bild).
  otpAuthUrl: string; // Die OTPAuth-URL, die den QR-Code darstellt.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: MfaSetup
 * Eine Komponente zur Verwaltung der Multi-Faktor-Authentifizierung (MFA)
 * für das Benutzerprofil. Sie ermöglicht Benutzern, MFA zu aktivieren,
 * zu deaktivieren und den Einrichtungsprozess zu durchlaufen.
 * -------------------------------------------------------------------
 */
export default function MfaSetup({
  initialIsMfaEnabled,
  onMfaStatusChange,
}: MfaSetupProps) {
  // Lokaler Zustand, der den MFA-Status des Benutzers widerspiegelt.
  const [isMfaEnabledLocally, setIsMfaEnabledLocally] =
    useState<boolean>(initialIsMfaEnabled);

  // Der aktuelle Schritt im MFA-Einrichtungsprozess.
  // "initial": MFA ist deaktiviert, Option zum Einrichten anzeigen.
  // "pendingVerification": Secret generiert, QR-Code angezeigt, wartet auf TOTP-Code zur Verifizierung.
  // "enabled": MFA ist aktiviert.
  // "promptDisable": MFA ist aktiviert, Benutzer wird zur Deaktivierung aufgefordert (Code-Eingabe).
  const [setupStage, setSetupStage] = useState<
    "initial" | "pendingVerification" | "enabled" | "promptDisable"
  >(initialIsMfaEnabled ? "enabled" : "initial"); // Initialer Zustand basierend auf dem übergebenen Prop.

  // Zustandsvariablen für die Einrichtungsschritte.
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null); // Data URL des generierten QR-Codes.
  const [manualSetupKey, setManualSetupKey] = useState<string | null>(null); // Das MFA-Secret als Klartext für manuelle Eingabe.
  const [tempMfaSecretForVerification, setTempMfaSecretForVerification] =
    useState<string | null>(null); // Temporäres Secret, das für die Verifizierung verwendet wird.

  const [totpCode, setTotpCode] = useState<string>(""); // Der vom Benutzer eingegebene TOTP-Code.

  // Zustandsvariablen für UI-Feedback.
  const [isLoading, setIsLoading] = useState<boolean>(false); // Zeigt an, ob eine Anfrage läuft.
  const [error, setError] = useState<string | null>(null); // Allgemeine Fehlermeldung.
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string[] | undefined; // Feldspezifische Fehlermeldungen (z.B. von Zod-Validierung).
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Erfolgsmeldung.

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Zustand zurücksetzen/synchronisieren
   * Dieser Hook wird ausgelöst, wenn sich der 'initialIsMfaEnabled'-Prop ändert.
   * Er synchronisiert den internen Zustand mit dem externen Prop und setzt
   * alle temporären Setup-Daten zurück, wenn MFA aktiviert wird.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    setIsMfaEnabledLocally(initialIsMfaEnabled); // Aktualisiert den lokalen MFA-Status.
    setSetupStage(initialIsMfaEnabled ? "enabled" : "initial"); // Setzt die Setup-Stufe.
    if (initialIsMfaEnabled) {
      // Wenn MFA aktiviert ist, temporäre Daten löschen.
      setQrCodeDataURL(null);
      setManualSetupKey(null);
      setTempMfaSecretForVerification(null);
    }
    // Setzt alle Feedback-Nachrichten zurück.
    setError(null);
    setFieldErrors(null);
    setSuccessMessage(null);
  }, [initialIsMfaEnabled]); // Abhängigkeit: Effekt wird nur bei Änderung von 'initialIsMfaEnabled' ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleGenerateSecret
   * Fordert ein neues MFA-Geheimnis und einen QR-Code vom Server an.
   * Dies ist der erste Schritt zur Aktivierung von MFA.
   * -------------------------------------------------------------------
   */
  const handleGenerateSecret = async () => {
    setIsLoading(true); // Setzt Ladezustand auf true.
    // Setzt alle Feedback-Nachrichten und temporären Daten zurück.
    setError(null);
    setFieldErrors(null);
    setSuccessMessage(null);
    setQrCodeDataURL(null);
    setManualSetupKey(null);
    setTempMfaSecretForVerification(null);

    try {
      // API-Aufruf zum Generieren des Secrets.
      const response = await apiClient("/mfa/generate-secret", {
        method: "POST",
      });
      const data = (await response.json()) as GenerateSecretResponse; // Erwartet die spezifische Antwortstruktur.

      // Speichert die erhaltenen Daten im Zustand.
      setQrCodeDataURL(data.qrCodeDataURL);
      setManualSetupKey(data.mfaSecret);
      setTempMfaSecretForVerification(data.mfaSecret); // Speichert das Secret für den nächsten Verifizierungsschritt.
      setSetupStage("pendingVerification"); // Wechselt zur Stufe der ausstehenden Verifizierung.
      setSuccessMessage(
        data.message ||
          "QR-Code generiert. Scannen Sie ihn mit Ihrer Authentifizierungs-App und geben Sie den Code unten zur Bestätigung ein."
      );
    } catch (err) {
      console.error("🔥 Fehler beim Generieren des MFA-Geheimnisses:", err);
      // Fehlerbehandlung: Setzt Fehlermeldungen basierend auf dem Fehlertyp.
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Fehler beim Generieren des MFA-Geheimnisses. Bitte versuchen Sie es erneut."
        );
      }
    } finally {
      setIsLoading(false); // Setzt Ladezustand auf false.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleEnableMfa
   * Behandelt die Formularübermittlung zur Aktivierung der MFA.
   * Verifiziert den eingegebenen TOTP-Code mit dem temporären Secret.
   * -------------------------------------------------------------------
   */
  const handleEnableMfa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Verhindert das Neuladen der Seite.
    // Setzt Feedback-Nachrichten zurück.
    setError(null);
    setFieldErrors(null);
    setSuccessMessage(null);

    // Client-seitige Validierung: Prüft, ob das Secret und der TOTP-Code vorhanden sind.
    if (!tempMfaSecretForVerification) {
      setError(
        "MFA-Einrichtungsgeheimnis fehlt. Bitte versuchen Sie, den QR-Code erneut zu generieren."
      );
      return;
    }
    if (
      !totpCode.trim() ||
      totpCode.trim().length !== 6 ||
      !/^\d{6}$/.test(totpCode.trim())
    ) {
      setError(
        "Bitte geben Sie einen gültigen 6-stelligen TOTP-Code aus Ihrer Authentifizierungs-App ein."
      );
      return;
    }

    setIsLoading(true); // Setzt Ladezustand auf true.
    try {
      // API-Aufruf zur Aktivierung der MFA.
      await apiClient("/mfa/enable", {
        method: "POST",
        body: JSON.stringify({
          totpCode: totpCode.trim(),
          mfaSecret: tempMfaSecretForVerification,
        }),
      });
      setSuccessMessage("MFA wurde erfolgreich aktiviert!"); // Erfolgsmeldung.
      setIsMfaEnabledLocally(true); // Aktualisiert den lokalen MFA-Status.
      setSetupStage("enabled"); // Wechselt zur Stufe "aktiviert".
      // Setzt alle temporären Setup-Daten zurück.
      setQrCodeDataURL(null);
      setManualSetupKey(null);
      setTempMfaSecretForVerification(null);
      setTotpCode(""); // Leert das TOTP-Code-Feld.
      onMfaStatusChange(); // Ruft den Callback im übergeordneten Element auf.
    } catch (err) {
      console.error("🔥 Fehler beim Aktivieren der MFA:", err);
      // Fehlerbehandlung.
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Fehler beim Aktivieren der MFA. Der Code könnte falsch, abgelaufen oder bereits verwendet sein."
        );
      }
    } finally {
      setIsLoading(false); // Setzt Ladezustand auf false.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: promptForDisableMfa
   * Wechselt die Setup-Stufe, um den Benutzer zur Bestätigung der
   * MFA-Deaktivierung aufzufordern (Eingabe des TOTP-Codes).
   * -------------------------------------------------------------------
   */
  const promptForDisableMfa = () => {
    setSetupStage("promptDisable"); // Wechselt zur Stufe "Deaktivierung bestätigen".
    // Setzt alle Feedback-Nachrichten und den TOTP-Code zurück.
    setError(null);
    setFieldErrors(null);
    setSuccessMessage(null);
    setTotpCode("");
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleConfirmDisableMfa
   * Behandelt die Formularübermittlung zur Bestätigung der MFA-Deaktivierung.
   * Verifiziert den eingegebenen TOTP-Code und sendet die Anfrage an das Backend.
   * -------------------------------------------------------------------
   */
  const handleConfirmDisableMfa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Verhindert das Neuladen der Seite.
    // Setzt Feedback-Nachrichten zurück.
    setError(null);
    setFieldErrors(null);
    setSuccessMessage(null);

    // Client-seitige Validierung des TOTP-Codes.
    if (
      !totpCode.trim() ||
      totpCode.trim().length !== 6 ||
      !/^\d{6}$/.test(totpCode.trim())
    ) {
      setError(
        "Bitte geben Sie einen gültigen 6-stelligen TOTP-Code ein, um die Deaktivierung der MFA zu bestätigen."
      );
      return;
    }

    setIsLoading(true); // Setzt Ladezustand auf true.
    try {
      // API-Aufruf zur Deaktivierung der MFA.
      await apiClient("/mfa/disable", {
        method: "POST",
        body: JSON.stringify({ totpCode: totpCode.trim() }),
      });
      setSuccessMessage("MFA wurde erfolgreich deaktiviert."); // Erfolgsmeldung.
      setIsMfaEnabledLocally(false); // Aktualisiert den lokalen MFA-Status.
      setSetupStage("initial"); // Wechselt zurück zur Stufe "initial".
      setTotpCode(""); // Leert das TOTP-Code-Feld.
      onMfaStatusChange(); // Ruft den Callback im übergeordneten Element auf.
    } catch (err) {
      console.error("🔥 Fehler beim Deaktivieren der MFA:", err);
      // Fehlerbehandlung.
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Fehler beim Deaktivieren der MFA. Der Code könnte falsch sein."
        );
      }
    } finally {
      setIsLoading(false); // Setzt Ladezustand auf false.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: renderError
   * Eine Hilfsfunktion zum Rendern von Fehlermeldungen,
   * einschließlich feldspezifischer Fehler.
   * @param errMessage - Die anzuzeigende Fehlermeldung.
   * @param errFieldErrors - Optionale feldspezifische Fehler.
   * @returns Das Fehler-JSX-Element oder null, wenn keine Nachricht vorhanden ist.
   * -------------------------------------------------------------------
   */
  const renderError = (
    errMessage: string | null,
    errFieldErrors?: typeof fieldErrors
  ) => {
    if (!errMessage) return null; // Nichts rendern, wenn keine Fehlermeldung vorhanden ist.
    return (
      <div className="alert alert-danger my-4 text-sm">
        <div className="flex items-center">
          <FiAlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />{" "}
          {/* Warn-Icon. */}
          <p>{errMessage}</p> {/* Die Hauptfehlermeldung. */}
        </div>
        {/* Anzeige von feldspezifischen Fehlern, falls vorhanden. */}
        {errFieldErrors && Object.keys(errFieldErrors).length > 0 && (
          <ul className="list-disc list-inside pl-7 mt-1">
            {Object.entries(errFieldErrors).map(
              ([field, messages]) =>
                messages &&
                messages.map((msg, idx) => (
                  <li key={`${field}-${idx}`}>{msg}</li> // Listet jeden Feldfehler auf.
                ))
            )}
          </ul>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der MfaSetup-Komponente
  // Der gerenderte Inhalt hängt von der aktuellen 'setupStage' ab.
  // -------------------------------------------------------------------

  // Zustand 1: MFA ist aktiviert ("enabled")
  if (isMfaEnabledLocally && setupStage === "enabled") {
    return (
      <div className="alert alert-success p-6">
        <div className="flex items-center mb-3">
          <FiCheckCircle className="h-7 w-7 mr-3" /> {/* Erfolgs-Icon. */}
          <p className="text-lg font-semibold">
            Multi-Faktor-Authentifizierung ist AKTIVIERT.
          </p>
        </div>
        <p className="text-sm mb-4">
          Ihr Konto ist mit einer zusätzlichen Sicherheitsebene geschützt.
        </p>
        {renderError(error, fieldErrors)}{" "}
        {/* Zeigt Fehler an, falls vorhanden. */}
        {successMessage && (
          <p className="mt-3 text-sm text-[var(--color-success)]">
            {successMessage}
          </p>
        )}
        <button
          onClick={promptForDisableMfa} // Button zum Initiieren der Deaktivierung.
          disabled={isLoading} // Deaktiviert während des Ladens.
          className="btn-danger w-full sm:w-auto mt-2 text-sm" // Gefahr-Button-Stil.
        >
          {isLoading ? (
            <FiLoader className="animate-spin inline-block mr-2 h-4 w-4" /> // Spinner beim Laden.
          ) : null}
          {isLoading ? "Wird verarbeitet..." : "MFA deaktivieren..."}
        </button>
      </div>
    );
  }

  // Zustand 2: Bestätigung der MFA-Deaktivierung ("promptDisable")
  if (setupStage === "promptDisable") {
    return (
      <div className="p-6 rounded-lg shadow-sm alert alert-warning">
        <h3 className="text-lg font-semibold mb-3">
          MFA-Deaktivierung bestätigen
        </h3>
        <p className="text-sm mb-4">
          Um die Multi-Faktor-Authentifizierung zu deaktivieren, geben Sie bitte
          einen aktuellen Code aus Ihrer Authentifizierungs-App ein.
        </p>
        {renderError(error, fieldErrors)}{" "}
        {/* Zeigt Fehler an, falls vorhanden. */}
        <form onSubmit={handleConfirmDisableMfa} className="space-y-4">
          <div>
            <label
              htmlFor="disableTotpCode"
              className="block text-sm font-medium"
            >
              Authentifizierungscode:
            </label>
            <input
              type="text"
              id="disableTotpCode"
              name="disableTotpCode"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))} // Erlaubt nur Ziffern.
              maxLength={6} // Max. 6 Ziffern.
              required
              disabled={isLoading}
              className="mt-1 max-w-xs"
              placeholder="123456"
              pattern="\d{6}" // HTML5-Muster für 6 Ziffern.
              inputMode="numeric" // Optimiert Tastatur für numerische Eingabe.
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || totpCode.length !== 6} // Deaktiviert, wenn geladen wird oder Code nicht 6 Ziffern hat.
              className="btn-danger w-full sm:w-auto order-1 sm:order-none" // Gefahr-Button-Stil.
            >
              {isLoading ? (
                <FiLoader className="animate-spin inline-block mr-2 h-4 w-4" />
              ) : null}
              {isLoading
                ? "Wird deaktiviert..."
                : "Bestätigen & MFA deaktivieren"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSetupStage("enabled"); // Bricht ab und wechselt zurück zur Stufe "aktiviert".
                setError(null);
                setSuccessMessage(null);
              }}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-none text-sm btn-secondary" // Sekundärer Button-Stil.
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Zustand 3: MFA ist initial deaktiviert ("initial") oder
  // Zustand 4: MFA ist in der Verifizierung ausstehend ("pendingVerification")
  // Diese beiden Zustände werden im folgenden Block gerendert.
  return (
    <div className="p-6 border border-[var(--border-color)] rounded-lg shadow-sm bg-[var(--color-surface)]">
      {/* Fehlermeldung und Erfolgsmeldung für den initialen Zustand */}
      {setupStage === "initial" && renderError(error, fieldErrors)}
      {setupStage === "initial" && successMessage && (
        <p className="alert alert-success mb-4 text-sm">{successMessage}</p>
      )}

      {/* Inhalt für den initialen Zustand (MFA deaktiviert) */}
      {setupStage === "initial" && (
        <>
          <div className="flex items-center mb-3">
            <FiAlertTriangle className="h-7 w-7 text-[var(--color-warning)] mr-3" />{" "}
            {/* Warn-Icon. */}
            <p className="text-lg font-semibold text-[var(--color-text-primary)]">
              Multi-Faktor-Authentifizierung ist DEAKTIVIERT.
            </p>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Fügen Sie eine zusätzliche Sicherheitsebene hinzu. Wenn aktiviert,
            benötigen Sie zum Anmelden einen Code aus einer
            Authentifizierungs-App und Ihr Passwort.
          </p>
          <button
            onClick={handleGenerateSecret} // Button zum Generieren des Secrets.
            disabled={isLoading} // Deaktiviert während des Ladens.
            className="btn-primary w-full sm:w-auto" // Primärer Button-Stil.
          >
            {isLoading ? (
              <FiLoader className="animate-spin inline-block mr-2 h-4 w-4" /> // Spinner beim Laden.
            ) : null}
            {isLoading
              ? "Geheimnis wird generiert..."
              : "Multi-Faktor-Authentifizierung einrichten"}
          </button>
        </>
      )}

      {/* Inhalt für den Zustand "pendingVerification" (QR-Code anzeigen und Code eingeben) */}
      {setupStage === "pendingVerification" &&
        qrCodeDataURL && // Sicherstellen, dass QR-Code-Daten vorhanden sind.
        manualSetupKey && ( // Sicherstellen, dass der manuelle Schlüssel vorhanden ist.
          <div className="mt-2 space-y-6">
            {successMessage && (
              <div className="alert alert-info mb-4 text-sm">
                {successMessage}
              </div>
            )}
            {renderError(error, fieldErrors)}{" "}
            {/* Zeigt Fehler an, falls vorhanden. */}
            <div className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--color-background)]">
              <h3 className="text-md font-semibold text-[var(--color-text-primary)] mb-2">
                Schritt 1: QR-Code scannen
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                Verwenden Sie eine Authentifizierungs-App, um diesen Code zu
                scannen.
              </p>
              <div className="flex justify-center p-2 border border-[var(--border-color)] rounded-md bg-white max-w-xs mx-auto my-4">
                <Image
                  src={qrCodeDataURL} // Die QR-Code-Data-URL.
                  alt="MFA-Einrichtungs-QR-Code"
                  width={208} // Feste Breite für das Bild.
                  height={208} // Feste Höhe für das Bild.
                  className="w-48 h-48 md:w-52 md:h-52" // Responsive Größen.
                />
              </div>
              <h3 className="text-md font-semibold text-[var(--color-text-primary)] mb-2 mt-4">
                Oder, Einrichtungsschlüssel manuell eingeben
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                Wenn Sie nicht scannen können, geben Sie diesen Schlüssel in
                Ihre App ein:
              </p>
              <div
                className="mt-1 p-3 bg-[var(--color-surface-2)] rounded-md text-sm font-mono text-[var(--color-text-primary)] break-all shadow-inner select-all cursor-pointer"
                title="Klicken, um den Schlüssel auszuwählen"
              >
                {manualSetupKey} {/* Der manuelle Einrichtungsschlüssel. */}
              </div>
            </div>
            <form
              onSubmit={handleEnableMfa} // Formular zum Überprüfen des Codes und Aktivieren der MFA.
              className="space-y-4 pt-6 border-t border-[var(--border-color)]"
            >
              <div>
                <h3 className="text-md font-semibold text-[var(--color-text-primary)] mb-2">
                  Schritt 2: Überprüfen & Aktivieren
                </h3>
                <label
                  htmlFor="enableTotpCode"
                  className="block text-sm font-medium text-[var(--color-text-primary)] mt-1 mb-1"
                >
                  Geben Sie den 6-stelligen Bestätigungscode aus Ihrer App ein:
                </label>
                <input
                  type="text"
                  id="enableTotpCode"
                  name="enableTotpCode"
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, ""))
                  } // Erlaubt nur Ziffern.
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="mt-1 max-w-xs"
                  placeholder="123456"
                  pattern="\d{6}"
                  inputMode="numeric"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || totpCode.length !== 6} // Deaktiviert, wenn geladen wird oder Code nicht 6 Ziffern hat.
                className="btn-primary w-full sm:w-auto"
              >
                {isLoading ? (
                  <FiLoader className="animate-spin inline-block mr-2 h-4 w-4" />
                ) : null}
                {isLoading
                  ? "Code wird überprüft..."
                  : "Überprüfen & MFA aktivieren"}
              </button>
            </form>
          </div>
        )}
      {/* Allgemeine Fehlermeldung für den initialen Zustand, wenn keine Feldfehler vorliegen */}
      {setupStage === "initial" && error && !fieldErrors && (
        <div className="alert alert-danger mt-4 text-sm flex items-center">
          <FiAlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
