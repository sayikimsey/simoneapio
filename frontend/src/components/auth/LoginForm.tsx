// // frontend/src/components/auth/LoginForm.tsx
// "use client";

// import React, { useState, FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { UserData } from "@/types";
// import { apiClient } from "@/lib/apiClient";
// import { FiEye, FiEyeOff, FiLoader, FiAlertCircle } from "react-icons/fi";

// /**
//  * Defines the props for the LoginForm component.
//  */
// interface LoginFormProps {
//   onLoginSuccess?: (userData: UserData) => void;
// }

// // Defines the possible stages of the login process
// type LoginStage = "credentials" | "mfa";

// /**
//  * A component that renders a login form with support for Multi-Factor Authentication (MFA).
//  */
// export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [totpCode, setTotpCode] = useState("");
//   const [loginStage, setLoginStage] = useState<LoginStage>("credentials");
//   const [userIdForMfa, setUserIdForMfa] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   /**
//    * Navigates the user to the profile page after a successful login.
//    * @param userData - The data of the logged-in user.
//    */
//   const handleLoginNavigation = (userData: UserData) => {
//     if (onLoginSuccess) {
//       onLoginSuccess(userData);
//     }
//     router.push("/profile");
//   };

//   /**
//    * Handles the submission of login credentials (email and password).
//    */
//   const handleCredentialSubmit = async () => {
//     setIsLoading(true);
//     setError(null);
//     if (!email.trim() || !password.trim()) {
//       setError("Bitte geben Sie sowohl E-Mail als auch Passwort ein.");
//       setIsLoading(false);
//       return;
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       setError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const response = await apiClient("/auth/login", {
//         method: "POST",
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await response.json();

//       if (data.mfaRequired === true && data.userId) {
//         setUserIdForMfa(data.userId);
//         setLoginStage("mfa");
//         setPassword("");
//         setError(null);
//       } else if (data.user && data.mfaRequired === false) {
//         handleLoginNavigation(data.user);
//       } else {
//         setError(data.message || "Anmeldung unerwartet fehlgeschlagen.");
//       }
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Anmeldeanforderung fehlgeschlagen."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Handles the submission of the MFA code.
//    */
//   const handleMfaSubmit = async () => {
//     setIsLoading(true);
//     setError(null);
//     if (!userIdForMfa || !/^\d{6}$/.test(totpCode.trim())) {
//       setError("Bitte geben Sie einen gültigen 6-stelligen MFA-Code ein.");
//       setIsLoading(false);
//       return;
//     }
//     try {
//       const response = await apiClient("/auth/verify-mfa", {
//         method: "POST",
//         body: JSON.stringify({
//           userId: userIdForMfa,
//           totpCode: totpCode.trim(),
//         }),
//       });
//       const data = await response.json();
//       if (data.user) {
//         handleLoginNavigation(data.user);
//       } else {
//         setError(data.message || "MFA-Überprüfung fehlgeschlagen.");
//       }
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "MFA-Überprüfung fehlgeschlagen."
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Handles form submission based on the current login stage.
//    * @param event - The form submit event.
//    */
//   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (loginStage === "credentials") handleCredentialSubmit();
//     else if (loginStage === "mfa") handleMfaSubmit();
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {error && (
//         <div className="alert alert-danger">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <FiAlertCircle className="h-5 w-5" aria-hidden="true" />
//             </div>
//             <div className="ml-3">
//               <p className="text-sm font-medium">{error}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {loginStage === "credentials" && (
//         <>
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//             >
//               E-Mail-Adresse
//             </label>
//             <div className="mt-2">
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 disabled={isLoading}
//                 placeholder="ihre@email.com"
//               />
//             </div>
//           </div>

//           <div>
//             <div className="flex items-center justify-between">
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//               >
//                 Passwort
//               </label>
//               <div className="text-sm">
//                 <Link href="/auth/forgot-password" className="font-semibold">
//                   Passwort vergessen?
//                 </Link>
//               </div>
//             </div>
//             <div className="mt-2 relative">
//               <input
//                 id="password"
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 autoComplete="current-password"
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 disabled={isLoading}
//                 className="pr-10"
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="btn-icon-ghost absolute inset-y-0 right-0"
//                 aria-label={
//                   showPassword ? "Passwort ausblenden" : "Passwort anzeigen"
//                 }
//               >
//                 {showPassword ? (
//                   <FiEyeOff className="h-5 w-5" aria-hidden="true" />
//                 ) : (
//                   <FiEye className="h-5 w-5" aria-hidden="true" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </>
//       )}

//       {loginStage === "mfa" && (
//         <div>
//           <label
//             htmlFor="totpCode"
//             className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//           >
//             Authentifizierungscode
//           </label>
//           <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-2">
//             Geben Sie den 6-stelligen Code aus Ihrer Authentifizierungs-App ein.
//           </p>
//           <div className="mt-2">
//             <input
//               id="totpCode"
//               name="totpCode"
//               type="text"
//               inputMode="numeric"
//               pattern="\d{6}"
//               maxLength={6}
//               required
//               value={totpCode}
//               onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
//               disabled={isLoading}
//               className="max-w-xs"
//               placeholder="123456"
//             />
//           </div>
//         </div>
//       )}

//       <div className="pt-2">
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="btn-primary w-full disabled:opacity-50"
//         >
//           {isLoading ? (
//             <div className="flex items-center justify-center">
//               <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5" />
//               <span>
//                 {loginStage === "credentials"
//                   ? "Anmelden..."
//                   : "Code wird überprüft..."}
//               </span>
//             </div>
//           ) : loginStage === "credentials" ? (
//             "Anmelden"
//           ) : (
//             "Code überprüfen & Anmelden"
//           )}
//         </button>
//       </div>
//       {loginStage === "mfa" && (
//         <button
//           type="button"
//           onClick={() => {
//             setLoginStage("credentials");
//             setError(null);
//             setTotpCode("");
//           }}
//           disabled={isLoading}
//           className="mt-3 w-full disabled:opacity-50"
//         >
//           Zurück zum Passwort
//         </button>
//       )}
//     </form>
//   );
// }

// frontend/src/components/auth/LoginForm.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, { useState, FormEvent } from "react"; // React Hooks für Zustand und Formularereignisse.
import { useRouter } from "next/navigation"; // Next.js Hook für Navigation.
import Link from "next/link"; // Next.js Komponente für client-seitige Navigation.
import { UserData } from "@/types"; // Importiert den Typ für Benutzerdaten.
import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client für HTTP-Anfragen.
import { FiEye, FiEyeOff, FiLoader, FiAlertCircle } from "react-icons/fi"; // Importiert Icons (Auge, Auge durchgestrichen, Lade-Spinner, Warnung).

/**
 * -------------------------------------------------------------------
 * ✅ Interface: LoginFormProps
 * Definiert die Props (Eigenschaften), die an die LoginForm-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface LoginFormProps {
  onLoginSuccess?: (userData: UserData) => void; // Optionaler Callback, der bei erfolgreichem Login mit den Benutzerdaten aufgerufen wird.
}

// Definiert die möglichen Stufen des Anmeldevorgangs (Anmeldeinformationen oder MFA-Code).
type LoginStage = "credentials" | "mfa";

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: LoginForm
 * Eine Komponente, die ein Anmeldeformular mit Unterstützung für
 * Multi-Faktor-Authentifizierung (MFA) rendert.
 * Sie handhabt den Anmeldefluss in zwei möglichen Stufen:
 * 1. Eingabe von E-Mail und Passwort.
 * 2. Eingabe des TOTP-Codes (falls MFA für den Benutzer aktiviert ist).
 * -------------------------------------------------------------------
 */
export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const router = useRouter(); // Hook zum Navigieren zwischen Routen.

  // Zustandsvariablen für Formularfelder und UI-Status.
  const [email, setEmail] = useState(""); // E-Mail-Adresse des Benutzers.
  const [password, setPassword] = useState(""); // Passwort des Benutzers.
  const [showPassword, setShowPassword] = useState(false); // Steuert die Sichtbarkeit des Passworts.
  const [totpCode, setTotpCode] = useState(""); // TOTP-Code für MFA.
  const [loginStage, setLoginStage] = useState<LoginStage>("credentials"); // Aktuelle Stufe des Login-Prozesses.
  const [userIdForMfa, setUserIdForMfa] = useState<string | null>(null); // Benutzer-ID, die für die MFA-Verifizierung benötigt wird.
  const [error, setError] = useState<string | null>(null); // Allgemeine Fehlermeldung.
  const [isLoading, setIsLoading] = useState(false); // Zeigt an, ob eine Anfrage läuft.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleLoginNavigation
   * Navigiert den Benutzer nach einem erfolgreichen Login zur Profilseite
   * und ruft optional einen übergebenen Callback auf.
   * @param userData - Die Daten des angemeldeten Benutzers.
   * -------------------------------------------------------------------
   */
  const handleLoginNavigation = (userData: UserData) => {
    if (onLoginSuccess) {
      onLoginSuccess(userData); // Ruft den optionalen Callback auf.
    }
    router.push("/profile"); // Leitet zur Profilseite um.
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleCredentialSubmit
   * Behandelt das Absenden der Anmeldeinformationen (E-Mail und Passwort).
   * Führt Client-seitige Validierungen durch und sendet die Anfrage an das Backend.
   * -------------------------------------------------------------------
   */
  const handleCredentialSubmit = async () => {
    setIsLoading(true); // Setzt Ladezustand auf true.
    setError(null); // Löscht vorherige Fehler.

    // Client-seitige Validierung der Eingabefelder.
    if (!email.trim() || !password.trim()) {
      setError("Bitte geben Sie sowohl E-Mail als auch Passwort ein.");
      setIsLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      setIsLoading(false);
      return;
    }

    try {
      // Sendet die POST-Anfrage an den "/auth/login"-Endpunkt der API.
      const response = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }), // E-Mail und Passwort im JSON-Format senden.
      });
      const data = await response.json(); // Parsed die JSON-Antwort.

      // Prüft, ob MFA erforderlich ist.
      if (data.mfaRequired === true && data.userId) {
        setUserIdForMfa(data.userId); // Speichert die Benutzer-ID für die MFA-Verifizierung.
        setLoginStage("mfa"); // Wechselt zur MFA-Stufe.
        setPassword(""); // Leert das Passwortfeld aus Sicherheitsgründen.
        setError(null); // Löscht Fehler, da MFA-Challenge erfolgreich ist.
      } else if (data.user && data.mfaRequired === false) {
        // Wenn MFA nicht erforderlich ist und Benutzerdaten vorhanden sind, ist der Login erfolgreich.
        handleLoginNavigation(data.user); // Navigiert den Benutzer.
      } else {
        // Unerwarteter Fehler oder generische Fehlermeldung vom Server.
        setError(data.message || "Anmeldung unerwartet fehlgeschlagen.");
      }
    } catch (err) {
      // Fehlerbehandlung bei API-Aufruf.
      setError(
        err instanceof Error
          ? err.message
          : "Anmeldeanforderung fehlgeschlagen."
      );
    } finally {
      setIsLoading(false); // Setzt Ladezustand auf false.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleMfaSubmit
   * Behandelt das Absenden des MFA-Codes.
   * -------------------------------------------------------------------
   */
  const handleMfaSubmit = async () => {
    setIsLoading(true); // Setzt Ladezustand auf true.
    setError(null); // Löscht vorherige Fehler.

    // Client-seitige Validierung des TOTP-Codes.
    if (!userIdForMfa || !/^\d{6}$/.test(totpCode.trim())) {
      setError("Bitte geben Sie einen gültigen 6-stelligen MFA-Code ein.");
      setIsLoading(false);
      return;
    }
    try {
      // Sendet die POST-Anfrage an den "/auth/verify-mfa"-Endpunkt der API.
      const response = await apiClient("/auth/verify-mfa", {
        method: "POST",
        body: JSON.stringify({
          userId: userIdForMfa,
          totpCode: totpCode.trim(), // Sendet den bereinigten TOTP-Code.
        }),
      });
      const data = await response.json(); // Parsed die JSON-Antwort.

      // Wenn die MFA-Verifizierung erfolgreich ist und Benutzerdaten vorhanden sind.
      if (data.user) {
        handleLoginNavigation(data.user); // Navigiert den Benutzer.
      } else {
        // MFA-Verifizierung fehlgeschlagen.
        setError(data.message || "MFA-Überprüfung fehlgeschlagen.");
      }
    } catch (err) {
      // Fehlerbehandlung bei API-Aufruf.
      setError(
        err instanceof Error ? err.message : "MFA-Überprüfung fehlgeschlagen."
      );
    } finally {
      setIsLoading(false); // Setzt Ladezustand auf false.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleSubmit (Haupt-Submit-Handler des Formulars)
   * Ruft den entsprechenden Submit-Handler basierend auf der aktuellen
   * Login-Stufe auf.
   * @param event - Das Formular-Submit-Ereignis.
   * -------------------------------------------------------------------
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Verhindert das standardmäßige Neuladen der Seite.
    if (loginStage === "credentials")
      handleCredentialSubmit(); // Wenn auf Stufe "credentials", rufe handleCredentialSubmit auf.
    else if (loginStage === "mfa") handleMfaSubmit(); // Wenn auf Stufe "mfa", rufe handleMfaSubmit auf.
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der LoginForm-Komponente
  // Das Formular passt sich dynamisch an die aktuelle Login-Stufe an
  // (Anmeldeinformationen oder MFA-Code-Eingabe).
  // -------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Anzeige von allgemeinen Fehlermeldungen */}
      {error && (
        <div className="alert alert-danger">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5" aria-hidden="true" />{" "}
              {/* Warn-Icon. */}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>{" "}
              {/* Die Fehlermeldung. */}
            </div>
          </div>
        </div>
      )}

      {/* Abschnitt für Anmeldeinformationen (E-Mail und Passwort) */}
      {loginStage === "credentials" && (
        <>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
            >
              E-Mail-Adresse
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email" // Auto-Vervollständigung für E-Mail.
                required // Pflichtfeld.
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Aktualisiert den E-Mail-Zustand.
                disabled={isLoading} // Deaktiviert das Feld während des Ladens.
                placeholder="ihre@email.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
              >
                Passwort
              </label>
              {/*<div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-semibold text-[var(--color-link)] hover:text-[var(--color-link-hover)]"
                >
                  Passwort vergessen? 
                </Link>
              </div>*/}
            </div>
            <div className="mt-2 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"} // Schaltet zwischen Text und Passwort-Typ um.
                autoComplete="current-password" // Auto-Vervollständigung für aktuelles Passwort.
                required // Pflichtfeld.
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Aktualisiert den Passwort-Zustand.
                disabled={isLoading} // Deaktiviert das Feld während des Ladens.
                className="pr-10" // Padding rechts für das Auge-Icon.
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Umschalter für Passwortsichtbarkeit.
                className="btn-icon-ghost absolute inset-y-0 right-0" // Stil für Ghost-Icon-Button.
                aria-label={
                  showPassword ? "Passwort ausblenden" : "Passwort anzeigen" // Zugänglichkeitslabel.
                }
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5" aria-hidden="true" /> // Icon: Auge durchgestrichen.
                ) : (
                  <FiEye className="h-5 w-5" aria-hidden="true" /> // Icon: Auge.
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Abschnitt für MFA-Code-Eingabe */}
      {loginStage === "mfa" && (
        <div>
          <label
            htmlFor="totpCode"
            className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
          >
            Authentifizierungscode
          </label>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 mb-2">
            Geben Sie den 6-stelligen Code aus Ihrer Authentifizierungs-App ein.
          </p>
          <div className="mt-2">
            <input
              id="totpCode"
              name="totpCode"
              type="text"
              inputMode="numeric" // Optimiert Tastatur für numerische Eingabe auf Mobilgeräten.
              pattern="\d{6}" // Erlaubt nur 6 Ziffern.
              maxLength={6} // Beschränkt die Eingabe auf 6 Zeichen.
              required // Pflichtfeld.
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))} // Aktualisiert den TOTP-Code-Zustand, entfernt Nicht-Ziffern.
              disabled={isLoading} // Deaktiviert das Feld während des Ladens.
              className="max-w-xs" // Begrenzt die Breite des Eingabefeldes.
              placeholder="123456"
            />
          </div>
        </div>
      )}

      {/* Submit-Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading} // Deaktiviert den Button während des Ladens.
          className="btn-primary w-full disabled:opacity-50" // Primärer Button-Stil, opaker wenn deaktiviert.
        >
          {isLoading ? (
            // Zeigt Spinner und Lade-Text an, wenn geladen wird.
            <div className="flex items-center justify-center">
              <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5" />
              <span>
                {loginStage === "credentials"
                  ? "Anmelden..."
                  : "Code wird überprüft..."}
              </span>
            </div>
          ) : loginStage === "credentials" ? (
            // Text für den Anmelde-Button.
            "Anmelden"
          ) : (
            // Text für den MFA-Verifizierungs-Button.
            "Code überprüfen & Anmelden"
          )}
        </button>
      </div>
      {/* Button zum Zurückwechseln zur Passwort-Eingabe (nur auf MFA-Stufe sichtbar) */}
      {loginStage === "mfa" && (
        <button
          type="button"
          onClick={() => {
            setLoginStage("credentials"); // Wechselt zurück zur Anmeldeinformationen-Stufe.
            setError(null); // Löscht Fehler.
            setTotpCode(""); // Leert den TOTP-Code.
          }}
          disabled={isLoading} // Deaktiviert den Button während des Ladens.
          className="mt-3 w-full disabled:opacity-50 btn-secondary" // Sekundärer Button-Stil.
        >
          Zurück zum Passwort
        </button>
      )}
    </form>
  );
}
