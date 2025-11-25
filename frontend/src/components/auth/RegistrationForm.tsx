// "use client";

// import React, { useState, FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import { apiClient, ApiError } from "@/lib/apiClient";
// import {
//   FiUserPlus,
//   FiLoader,
//   FiEye,
//   FiEyeOff,
//   FiAlertCircle,
//   FiCheckCircle,
// } from "react-icons/fi";

// /**
//  * Definiert die Props für die RegistrationForm-Komponente.
//  */
// interface RegistrationFormProps {
//   onSuccess?: () => void;
// }

// /**
//  * Eine Komponente, die ein Registrierungsformular für neue Benutzer rendert.
//  */
// export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     passwordConfirmation: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [fieldErrors, setFieldErrors] = useState<{
//     [key: string]: string[] | undefined;
//   } | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   /**
//    * Behandelt Änderungen in den Formularfeldern.
//    * @param e - Das Change-Event des Eingabe-Elements.
//    */
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   /**
//    * Behandelt das Absenden des Registrierungsformulars.
//    * @param event - Das Form-Submit-Event.
//    */
//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setError(null);
//     setFieldErrors(null);
//     setSuccessMessage(null);

//     if (formData.password !== formData.passwordConfirmation) {
//       setFieldErrors({
//         passwordConfirmation: ["Die Passwörter stimmen nicht überein."],
//       });
//       return;
//     }
//     if (formData.password.length < 8) {
//       setFieldErrors({
//         password: ["Das Passwort muss mindestens 8 Zeichen lang sein."],
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const payload = {
//         email: formData.email,
//         password: formData.password,
//         passwordConfirmation: formData.passwordConfirmation,
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//       };

//       const response = await apiClient("/auth/register", {
//         method: "POST",
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       setSuccessMessage(
//         data.message || "Registrierung erfolgreich! Bitte melden Sie sich an."
//       );
//       if (onSuccess) onSuccess();

//       setFormData({
//         firstName: "",
//         lastName: "",
//         email: "",
//         password: "",
//         passwordConfirmation: "",
//       });
//       setTimeout(() => {
//         router.push(
//           "/auth/signin?success=registration_complete&message=Registrierung erfolgreich! Bitte melden Sie sich an."
//         );
//       }, 2000);
//     } catch (err) {
//       console.error(`🔥 Fehler bei der Registrierung:`, err);
//       if (err instanceof ApiError) {
//         setError(err.message);
//         if (err.fieldErrors) {
//           setFieldErrors(err.fieldErrors);
//           if (err.message && Object.keys(err.fieldErrors).length > 0)
//             setError("Bitte korrigieren Sie die folgenden Fehler.");
//         }
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError(
//           "Bei der Registrierung ist ein unerwarteter Fehler aufgetreten."
//         );
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Rendert Feld-spezifische Fehlermeldungen.
//    * @param fieldName - Der Name des Formularfeldes.
//    * @returns Eine Fehler-Komponente oder null.
//    */
//   const renderFieldErrors = (fieldName: keyof typeof formData) => {
//     if (fieldErrors && fieldErrors[fieldName]) {
//       return (
//         <p className="mt-1 text-xs text-[var(--color-danger)]">
//           {fieldErrors[fieldName]?.join(", ")}
//         </p>
//       );
//     }
//     return null;
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {error && !Object.keys(fieldErrors || {}).length && (
//         <div className="alert alert-danger">
//           <div className="flex items-center">
//             <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
//             <p className="text-sm font-medium">{error}</p>
//           </div>
//         </div>
//       )}
//       {successMessage && (
//         <div className="alert alert-success">
//           <div className="flex items-center">
//             <FiCheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
//             <p className="text-sm font-medium">{successMessage}</p>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
//         <div>
//           <label
//             htmlFor="firstNameReg"
//             className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//           >
//             Vorname
//           </label>
//           <div className="mt-2">
//             <input
//               type="text"
//               name="firstName"
//               id="firstNameReg"
//               value={formData.firstName}
//               onChange={handleChange}
//               autoComplete="given-name"
//               required
//               disabled={isLoading}
//             />
//             {renderFieldErrors("firstName")}
//           </div>
//         </div>
//         <div>
//           <label
//             htmlFor="lastNameReg"
//             className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//           >
//             Nachname
//           </label>
//           <div className="mt-2">
//             <input
//               type="text"
//               name="lastName"
//               id="lastNameReg"
//               value={formData.lastName}
//               onChange={handleChange}
//               autoComplete="family-name"
//               required
//               disabled={isLoading}
//             />
//             {renderFieldErrors("lastName")}
//           </div>
//         </div>
//       </div>

//       <div>
//         <label
//           htmlFor="emailReg"
//           className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//         >
//           E-Mail-Adresse <span className="text-[var(--color-danger)]">*</span>
//         </label>
//         <div className="mt-2">
//           <input
//             type="email"
//             name="email"
//             id="emailReg"
//             value={formData.email}
//             onChange={handleChange}
//             autoComplete="email"
//             required
//             disabled={isLoading}
//           />
//           {renderFieldErrors("email")}
//         </div>
//       </div>

//       <div>
//         <label
//           htmlFor="passwordReg"
//           className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//         >
//           Passwort <span className="text-[var(--color-danger)]">*</span>
//         </label>
//         <div className="mt-2 relative">
//           <input
//             type={showPassword ? "text" : "password"}
//             name="password"
//             id="passwordReg"
//             value={formData.password}
//             onChange={handleChange}
//             autoComplete="new-password"
//             required
//             minLength={8}
//             disabled={isLoading}
//             className="pr-10"
//           />
//           <button
//             type="button"
//             onClick={() => setShowPassword(!showPassword)}
//             className="btn-icon-ghost absolute inset-y-0 right-0"
//             aria-label="Sichtbarkeit des Passworts umschalten"
//           >
//             {showPassword ? (
//               <FiEyeOff className="h-5 w-5" />
//             ) : (
//               <FiEye className="h-5 w-5" />
//             )}
//           </button>
//         </div>
//         {renderFieldErrors("password")}
//       </div>

//       <div>
//         <label
//           htmlFor="passwordConfirmationReg"
//           className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//         >
//           Passwort bestätigen{" "}
//           <span className="text-[var(--color-danger)]">*</span>
//         </label>
//         <div className="mt-2 relative">
//           <input
//             type={showConfirmPassword ? "text" : "password"}
//             name="passwordConfirmation"
//             id="passwordConfirmationReg"
//             value={formData.passwordConfirmation}
//             onChange={handleChange}
//             autoComplete="new-password"
//             required
//             disabled={isLoading}
//             className="pr-10"
//           />
//           <button
//             type="button"
//             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//             className="btn-icon-ghost absolute inset-y-0 right-0"
//             aria-label="Sichtbarkeit der Passwortbestätigung umschalten"
//           >
//             {showConfirmPassword ? (
//               <FiEyeOff className="h-5 w-5" />
//             ) : (
//               <FiEye className="h-5 w-5" />
//             )}
//           </button>
//         </div>
//         {renderFieldErrors("passwordConfirmation")}
//       </div>

//       <div className="pt-2">
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="btn-primary w-full disabled:opacity-50"
//         >
//           {isLoading ? (
//             <div className="flex items-center justify-center">
//               <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5" />
//               <span>Konto wird erstellt...</span>
//             </div>
//           ) : (
//             <div className="flex items-center justify-center">
//               <FiUserPlus className=" -ml-1 mr-2 h-5 w-5" />
//               <span>Konto erstellen</span>
//             </div>
//           )}
//         </button>
//       </div>
//     </form>
//   );
// }

// frontend/src/components/auth/RegistrationForm.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, { useState, FormEvent } from "react"; // React Hooks für Zustand und Formularereignisse.
import { useRouter } from "next/navigation"; // Next.js Hook für Navigation.
import { apiClient, ApiError } from "@/lib/apiClient"; // Importiert den API-Client und den benutzerdefinierten Fehler-Typ.
import {
  FiUserPlus, // Icon für "Benutzer hinzufügen".
  FiLoader, // Icon für "Laden/Spinner".
  FiEye, // Icon für "Passwort anzeigen".
  FiEyeOff, // Icon für "Passwort ausblenden".
  FiAlertCircle, // Icon für "Warnung/Fehler".
  FiCheckCircle, // Icon für "Erfolg".
} from "react-icons/fi"; // Importiert Icons aus 'react-icons'.

/**
 * -------------------------------------------------------------------
 * ✅ Interface: RegistrationFormProps
 * Definiert die Props (Eigenschaften), die an die RegistrationForm-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface RegistrationFormProps {
  onSuccess?: () => void; // Optionaler Callback, der bei erfolgreicher Registrierung aufgerufen wird.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: RegistrationForm
 * Eine Komponente, die ein Registrierungsformular für neue Benutzer rendert.
 * Sie handhabt die Formularfelder, Validierung (Client-seitig und vom Backend),
 * den API-Aufruf zur Registrierung und die Anzeige von Feedback.
 * -------------------------------------------------------------------
 */
export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const router = useRouter(); // Hook zum Navigieren nach erfolgreicher Registrierung.

  // Zustandsvariable für die Formulardaten.
  const [formData, setFormData] = useState({
    firstName: "", // Vorname.
    lastName: "", // Nachname.
    email: "", // E-Mail-Adresse.
    password: "", // Passwort.
    passwordConfirmation: "", // Passwortbestätigung.
  });

  // Zustandsvariablen zum Umschalten der Passwortsichtbarkeit.
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Zustandsvariablen für UI-Feedback (Ladezustand, Fehler, Erfolgsmeldungen).
  const [isLoading, setIsLoading] = useState(false); // Zeigt an, ob die Anfrage läuft.
  const [error, setError] = useState<string | null>(null); // Speichert allgemeine Fehlermeldungen.
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string[] | undefined; // Speichert feldspezifische Fehlermeldungen (z.B. von Zod-Validierung).
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Speichert Erfolgsmeldungen.

  /**
   * -------------------------------------------------------------------
   * ✅ handleChange
   * Behandelt Änderungen in den Formularfeldern.
   * Aktualisiert den 'formData'-Zustand entsprechend der Benutzereingabe.
   * @param e - Das Change-Event des Eingabe-Elements.
   * -------------------------------------------------------------------
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Aktualisiert das entsprechende Feld im 'formData'-Zustand.
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * -------------------------------------------------------------------
   * ✅ handleSubmit
   * Behandelt das Absenden des Registrierungsformulars.
   * Führt Client-seitige Validierungen durch und sendet die Daten an die API.
   * -------------------------------------------------------------------
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Verhindert das standardmäßige Neuladen der Seite.
    setError(null); // Löscht vorherige allgemeine Fehler.
    setFieldErrors(null); // Löscht vorherige feldspezifische Fehler.
    setSuccessMessage(null); // Löscht vorherige Erfolgsmeldungen.

    // -----------------------------------------------------------
    // Client-seitige Passwort-Validierung
    // Dies bietet sofortiges Feedback und reduziert unnötige Backend-Anfragen.
    // -----------------------------------------------------------
    if (formData.password !== formData.passwordConfirmation) {
      setFieldErrors({
        passwordConfirmation: ["Die Passwörter stimmen nicht überein."],
      });
      return; // Beendet die Funktion, wenn Passwörter nicht übereinstimmen.
    }
    if (formData.password.length < 8) {
      setFieldErrors({
        password: ["Das Passwort muss mindestens 8 Zeichen lang sein."],
      });
      return; // Beendet die Funktion, wenn Passwort zu kurz ist.
    }

    setIsLoading(true); // Setzt den Ladezustand auf true.

    try {
      // Erstellt den Payload für die API-Anfrage.
      // Sendet alle Formulardaten an das Backend.
      const payload = {
        email: formData.email,
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      // Sendet die POST-Anfrage an den "/auth/register"-Endpunkt der API.
      const response = await apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload), // Konvertiert den Payload in einen JSON-String.
      });

      const data = await response.json(); // Parsed die JSON-Antwort vom Server.

      setSuccessMessage(
        data.message || "Registrierung erfolgreich! Bitte melden Sie sich an."
      ); // Setzt die Erfolgsmeldung.
      if (onSuccess) onSuccess(); // Ruft den optionalen Callback auf.

      // Setzt das Formular nach erfolgreicher Registrierung zurück.
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirmation: "",
      });

      // Leitet den Benutzer nach einer kurzen Verzögerung zur Anmeldeseite weiter.
      setTimeout(() => {
        router.push(
          "/auth/signin?success=registration_complete&message=Registrierung erfolgreich! Bitte melden Sie sich an."
        );
      }, 2000); // 2 Sekunden Verzögerung.
    } catch (err) {
      console.error(`🔥 Fehler bei der Registrierung:`, err);
      // Fehlerbehandlung: Prüft den Typ des Fehlers, um spezifische Nachrichten anzuzeigen.
      if (err instanceof ApiError) {
        setError(err.message); // Setzt die Hauptfehlermeldung.
        if (err.fieldErrors) {
          // Wenn feldspezifische Fehler vom Backend zurückgegeben wurden (z.B. Zod-Validierung).
          setFieldErrors(err.fieldErrors); // Speichert die feldspezifischen Fehler.
          // Fügt einen allgemeinen Hinweis hinzu, wenn feldspezifische Fehler vorhanden sind.
          if (err.message && Object.keys(err.fieldErrors).length > 0)
            setError("Bitte korrigieren Sie die folgenden Fehler.");
        }
      } else if (err instanceof Error) {
        // Wenn es ein allgemeiner JavaScript-Fehler ist.
        setError(err.message);
      } else {
        // Für alle anderen unerwarteten Fehlertypen.
        setError(
          "Bei der Registrierung ist ein unerwarteter Fehler aufgetreten."
        );
      }
    } finally {
      setIsLoading(false); // Setzt den Ladezustand auf false, unabhängig vom Ergebnis.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ renderFieldErrors
   * Hilfsfunktion zum Rendern von feldspezifischen Fehlermeldungen.
   * @param fieldName - Der Name des Formularfeldes, für das Fehler angezeigt werden sollen.
   * @returns Ein JSX-Element mit der Fehlermeldung oder null, wenn keine Fehler vorliegen.
   * -------------------------------------------------------------------
   */
  const renderFieldErrors = (fieldName: keyof typeof formData) => {
    if (fieldErrors && fieldErrors[fieldName]) {
      return (
        <p className="mt-1 text-xs text-[var(--color-danger)]">
          {fieldErrors[fieldName]?.join(", ")}{" "}
          {/* Zeigt alle Fehler für das Feld, durch Komma getrennt */}
        </p>
      );
    }
    return null; // Keine Fehler, nichts rendern.
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der RegistrationForm-Komponente
  // Das Formular enthält Felder für Vorname, Nachname, E-Mail,
  // Passwort und Passwortbestätigung, sowie dynamische Fehler- und
  // Erfolgsmeldungen und Ladeindikatoren.
  // -------------------------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Allgemeine Fehlermeldung (wenn keine feldspezifischen Fehler vorhanden sind) */}
      {error && !Object.keys(fieldErrors || {}).length && (
        <div className="alert alert-danger">
          <div className="flex items-center">
            <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />{" "}
            {/* Warn-Icon */}
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}
      {/* Erfolgsmeldung */}
      {successMessage && (
        <div className="alert alert-success">
          <div className="flex items-center">
            <FiCheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />{" "}
            {/* Erfolgs-Icon */}
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Raster für Vor- und Nachname */}
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        {/* Vorname */}
        <div>
          <label
            htmlFor="firstNameReg"
            className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
          >
            Vorname
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="firstName"
              id="firstNameReg"
              value={formData.firstName}
              onChange={handleChange}
              autoComplete="given-name" // Auto-Vervollständigung für Vornamen.
              required // Pflichtfeld.
              disabled={isLoading} // Deaktiviert das Feld während des Ladens.
            />
            {renderFieldErrors("firstName")}{" "}
            {/* Zeigt Fehler für dieses Feld an. */}
          </div>
        </div>
        {/* Nachname */}
        <div>
          <label
            htmlFor="lastNameReg"
            className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
          >
            Nachname
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="lastName"
              id="lastNameReg"
              value={formData.lastName}
              onChange={handleChange}
              autoComplete="family-name" // Auto-Vervollständigung für Nachnamen.
              required // Pflichtfeld.
              disabled={isLoading} // Deaktiviert das Feld während des Ladens.
            />
            {renderFieldErrors("lastName")}
          </div>
        </div>
      </div>

      {/* E-Mail-Adresse */}
      <div>
        <label
          htmlFor="emailReg"
          className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
        >
          E-Mail-Adresse <span className="text-[var(--color-danger)]">*</span>{" "}
          {/* Pflichtfeld-Indikator. */}
        </label>
        <div className="mt-2">
          <input
            type="email"
            name="email"
            id="emailReg"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email" // Auto-Vervollständigung für E-Mail.
            required // Pflichtfeld.
            disabled={isLoading} // Deaktiviert das Feld während des Ladens.
          />
          {renderFieldErrors("email")}
        </div>
      </div>

      {/* Passwort */}
      <div>
        <label
          htmlFor="passwordReg"
          className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
        >
          Passwort <span className="text-[var(--color-danger)]">*</span>
        </label>
        <div className="mt-2 relative">
          <input
            type={showPassword ? "text" : "password"} // Umschaltet zwischen Text- und Passwort-Typ.
            name="password"
            id="passwordReg"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password" // Auto-Vervollständigung für neues Passwort.
            required // Pflichtfeld.
            minLength={8} // Mindestlänge für HTML5-Validierung.
            disabled={isLoading} // Deaktiviert das Feld während des Ladens.
            className="pr-10" // Padding rechts für das Auge-Icon.
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)} // Umschalter für Passwortsichtbarkeit.
            className="btn-icon-ghost absolute inset-y-0 right-0" // Stil für Ghost-Icon-Button.
            aria-label="Sichtbarkeit des Passworts umschalten"
          >
            {showPassword ? (
              <FiEyeOff className="h-5 w-5" /> // Icon: Auge durchgestrichen.
            ) : (
              <FiEye className="h-5 w-5" /> // Icon: Auge.
            )}
          </button>
        </div>
        {renderFieldErrors("password")}
      </div>

      {/* Passwort bestätigen */}
      <div>
        <label
          htmlFor="passwordConfirmationReg"
          className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
        >
          Passwort bestätigen{" "}
          <span className="text-[var(--color-danger)]">*</span>
        </label>
        <div className="mt-2 relative">
          <input
            type={showConfirmPassword ? "text" : "password"} // Umschaltet zwischen Text- und Passwort-Typ.
            name="passwordConfirmation"
            id="passwordConfirmationReg"
            value={formData.passwordConfirmation}
            onChange={handleChange}
            autoComplete="new-password" // Auto-Vervollständigung für neues Passwort.
            required // Pflichtfeld.
            disabled={isLoading} // Deaktiviert das Feld während des Ladens.
            className="pr-10" // Padding rechts für das Auge-Icon.
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Umschalter für Passwortsichtbarkeit.
            className="btn-icon-ghost absolute inset-y-0 right-0" // Stil für Ghost-Icon-Button.
            aria-label="Sichtbarkeit der Passwortbestätigung umschalten"
          >
            {showConfirmPassword ? (
              <FiEyeOff className="h-5 w-5" /> // Icon: Auge durchgestrichen.
            ) : (
              <FiEye className="h-5 w-5" /> // Icon: Auge.
            )}
          </button>
        </div>
        {renderFieldErrors("passwordConfirmation")}
      </div>

      {/* Submit-Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading} // Deaktiviert den Button während des Ladens.
          className="btn-primary w-full disabled:opacity-50" // Primärer Button-Stil, opaker wenn deaktiviert.
        >
          {isLoading ? (
            // Spinner und Lade-Text, wenn geladen wird.
            <div className="flex items-center justify-center">
              <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5" />
              <span>Konto wird erstellt...</span>
            </div>
          ) : (
            // Icon und Text, wenn nicht geladen wird.
            <div className="flex items-center justify-center">
              <FiUserPlus className=" -ml-1 mr-2 h-5 w-5" />
              <span>Konto erstellen</span>
            </div>
          )}
        </button>
      </div>
    </form>
  );
}
