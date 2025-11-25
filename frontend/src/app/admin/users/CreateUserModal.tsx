// "use client";

// import React, { useState, FormEvent, useEffect } from "react";
// import Modal from "@/components/common/Modal";
// import { apiClient, ApiError } from "@/lib/apiClient";
// import { FiUserPlus, FiLoader, FiAlertTriangle } from "react-icons/fi";

// /**
//  * Defines the props for the CreateUserModal component.
//  */
// interface CreateUserModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onUserCreated: () => void;
// }

// // Available user roles
// const availableRoles = ["user", "admin"];

// /**
//  * A modal component for creating a new user.
//  */
// export default function CreateUserModal({
//   isOpen,
//   onClose,
//   onUserCreated,
// }: CreateUserModalProps) {
//   // Initial state for the form data
//   const initialFormData = {
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     passwordConfirmation: "",
//     role: "user",
//     isActive: true,
//   };

//   const [formData, setFormData] = useState(initialFormData);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [fieldErrors, setFieldErrors] = useState<{
//     [key: string]: string[] | undefined;
//   } | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   // Resets the form when the modal is opened.
//   useEffect(() => {
//     if (isOpen) {
//       setFormData(initialFormData);
//       setError(null);
//       setFieldErrors(null);
//       setSuccessMessage(null);
//     }
//   }, [isOpen]);

//   /**
//    * Handles changes in the form fields.
//    * @param e - The change event of the input or select element.
//    */
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value, type } = e.target;
//     const isCheckbox = type === "checkbox";

//     setFormData((prev) => ({
//       ...prev,
//       [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
//     }));
//   };

//   /**
//    * Handles form submission.
//    * @param event - The form submit event.
//    */
//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setError(null);
//     setFieldErrors(null);
//     setSuccessMessage(null);

//     // Password validation
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
//         firstName: formData.firstName || undefined,
//         lastName: formData.lastName || undefined,
//         role: formData.role,
//         isActive: formData.isActive,
//       };

//       const response = await apiClient("/admin/users", {
//         method: "POST",
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       setSuccessMessage(data.message || "Benutzer erfolgreich erstellt!");
//       onUserCreated(); // Callback to refresh the user list

//       // Closes the modal after a short delay
//       setTimeout(() => {
//         onClose();
//       }, 1500);
//     } catch (err) {
//       console.error(`🔥 Fehler beim Erstellen des Benutzers:`, err);
//       if (err instanceof ApiError) {
//         setError(err.message);
//         if (err.fieldErrors) {
//           setFieldErrors(err.fieldErrors);
//           setError("Bitte korrigieren Sie die markierten Fehler.");
//         }
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Ein unerwarteter Fehler ist aufgetreten.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderFieldError = (fieldName: keyof typeof formData) => {
//     if (fieldErrors?.[fieldName]) {
//       return (
//         <p className="mt-1 text-xs text-[var(--color-danger)]">
//           {fieldErrors[fieldName]?.join(", ")}
//         </p>
//       );
//     }
//     return null;
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title="Neuen Benutzer erstellen"
//       size="2xl"
//     >
//       {/* Loading indicator */}
//       {isLoading && (
//         <div className="flex justify-center items-center py-10">
//           <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)]" />
//           <p className="ml-3 text-[var(--color-text-secondary)]">
//             Benutzer wird erstellt...
//           </p>
//         </div>
//       )}

//       {/* Success and error messages */}
//       {!isLoading && error && !fieldErrors && !successMessage && (
//         <div className="alert alert-danger my-4">
//           <div className="flex items-center">
//             <FiAlertTriangle className="h-5 w-5 mr-2" />
//             <p>{error}</p>
//           </div>
//         </div>
//       )}
//       {!isLoading && successMessage && (
//         <div className="alert alert-success my-4">
//           <p>{successMessage}</p>
//         </div>
//       )}

//       {/* User creation form */}
//       {!isLoading && !successMessage && (
//         <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
//           {error && fieldErrors && (
//             <div className="alert alert-danger p-3 mb-4">
//               <p className="text-sm font-medium">{error}</p>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label
//                 htmlFor="firstName"
//                 className="block text-sm font-medium text-[var(--color-text-primary)]"
//               >
//                 Vorname
//               </label>
//               <input
//                 type="text"
//                 name="firstName"
//                 id="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 className="mt-1"
//               />
//               {renderFieldError("firstName")}
//             </div>
//             <div>
//               <label
//                 htmlFor="lastName"
//                 className="block text-sm font-medium text-[var(--color-text-primary)]"
//               >
//                 Nachname
//               </label>
//               <input
//                 type="text"
//                 name="lastName"
//                 id="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//                 className="mt-1"
//               />
//               {renderFieldError("lastName")}
//             </div>
//           </div>

//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               E-Mail-Adresse{" "}
//               <span className="text-[var(--color-danger)]">*</span>
//             </label>
//             <input
//               type="email"
//               name="email"
//               id="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               className="mt-1"
//             />
//             {renderFieldError("email")}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-[var(--color-text-primary)]"
//               >
//                 Passwort <span className="text-[var(--color-danger)]">*</span>
//               </label>
//               <input
//                 type="password"
//                 name="password"
//                 id="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 minLength={8}
//                 className="mt-1"
//               />
//               {renderFieldError("password")}
//             </div>
//             <div>
//               <label
//                 htmlFor="passwordConfirmation"
//                 className="block text-sm font-medium text-[var(--color-text-primary)]"
//               >
//                 Passwort bestätigen{" "}
//                 <span className="text-[var(--color-danger)]">*</span>
//               </label>
//               <input
//                 type="password"
//                 name="passwordConfirmation"
//                 id="passwordConfirmation"
//                 value={formData.passwordConfirmation}
//                 onChange={handleChange}
//                 required
//                 className="mt-1"
//               />
//               {renderFieldError("passwordConfirmation")}
//             </div>
//           </div>

//           <div>
//             <label
//               htmlFor="role"
//               className="block text-sm font-medium text-[var(--color-text-primary)]"
//             >
//               Rolle
//             </label>
//             <select
//               id="role"
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               className="mt-1"
//             >
//               {availableRoles.map((role) => (
//                 <option key={role} value={role} className="capitalize">
//                   {role.charAt(0).toUpperCase() + role.slice(1)}
//                 </option>
//               ))}
//             </select>
//             {renderFieldError("role")}
//           </div>

//           <div className="flex items-start">
//             <div className="flex items-center h-5">
//               <input
//                 id="isActive"
//                 name="isActive"
//                 type="checkbox"
//                 checked={formData.isActive}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="ml-3 text-sm">
//               <label
//                 htmlFor="isActive"
//                 className="font-medium text-[var(--color-text-primary)]"
//               >
//                 Konto ist aktiv
//               </label>
//               <p className="text-xs text-[var(--color-text-secondary)]">
//                 Deaktivieren, um das Konto in einem deaktivierten Zustand zu
//                 erstellen.
//               </p>
//             </div>
//             {renderFieldError("isActive")}
//           </div>

//           <div className="pt-5">
//             <div className="flex justify-end space-x-3">
//               <button type="button" onClick={onClose}>
//                 Abbrechen
//               </button>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="btn-primary disabled:opacity-50"
//               >
//                 <FiUserPlus className="inline-block h-4 w-4 mr-2" />
//                 {isLoading ? "Benutzer wird erstellt..." : "Benutzer erstellen"}
//               </button>
//             </div>
//           </div>
//         </form>
//       )}
//     </Modal>
//   );
// }
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import React, { useState, FormEvent, useEffect } from "react";
import Modal from "@/components/common/Modal"; // Importiert die allgemeine Modal-Komponente
import { apiClient, ApiError } from "@/lib/apiClient"; // Importiert den API-Client und den benutzerdefinierten Fehler-Typ
import { FiUserPlus, FiLoader, FiAlertTriangle } from "react-icons/fi"; // Importiert Icons aus 'react-icons'

/**
 * -------------------------------------------------------------------
 * ✅ Interface: CreateUserModalProps
 * Definiert die Props (Eigenschaften), die an die CreateUserModal-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface CreateUserModalProps {
  isOpen: boolean; // Steuert, ob das Modal sichtbar ist
  onClose: () => void; // Callback-Funktion, die aufgerufen wird, wenn das Modal geschlossen werden soll
  onUserCreated: () => void; // Callback-Funktion, die aufgerufen wird, nachdem ein Benutzer erfolgreich erstellt wurde
}

// Verfügbare Benutzerrollen, die im Dropdown-Menü angezeigt werden
const availableRoles = ["user", "admin"];

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: CreateUserModal
 * Eine modale Komponente zum Erstellen eines neuen Benutzers.
 * Bietet ein Formular zur Eingabe von Benutzerdaten und zur Rollenzuweisung.
 * -------------------------------------------------------------------
 */
export default function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
  // Initialer Zustand für die Formulardaten
  const initialFormData = {
    firstName: "", // Vorname des Benutzers
    lastName: "", // Nachname des Benutzers
    email: "", // E-Mail-Adresse des Benutzers
    password: "", // Passwort des Benutzers
    passwordConfirmation: "", // Bestätigung des Passworts
    role: "user", // Standardrolle für neue Benutzer
    isActive: true, // Standardmäßig ist das Konto aktiv
  };

  // Zustandsvariablen für das Formular und den UI-Status
  const [formData, setFormData] = useState(initialFormData); // Speichert die aktuellen Formulardaten
  const [isLoading, setIsLoading] = useState(false); // Zeigt an, ob die Anfrage läuft
  const [error, setError] = useState<string | null>(null); // Speichert allgemeine Fehlermeldungen
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string[] | undefined; // Speichert feldspezifische Fehlermeldungen (z.B. von Zod-Validierung)
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Speichert Erfolgsmeldungen

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Formular zurücksetzen beim Öffnen des Modals
   * Dieser Hook wird ausgelöst, wenn sich der 'isOpen'-Zustand ändert.
   * Wenn das Modal geöffnet wird, werden alle Formularfelder und Statusmeldungen zurückgesetzt.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData); // Setzt die Formulardaten auf den Anfangszustand zurück
      setError(null); // Löscht allgemeine Fehlermeldungen
      setFieldErrors(null); // Löscht feldspezifische Fehlermeldungen
      setSuccessMessage(null); // Löscht Erfolgsmeldungen
    }
  }, [isOpen]); // Abhängigkeit: Effekt wird nur bei Änderung von 'isOpen' ausgeführt

  /**
   * -------------------------------------------------------------------
   * ✅ handleChange
   * Behandelt Änderungen in den Formularfeldern (Input- und Select-Elemente).
   * Aktualisiert den 'formData'-Zustand entsprechend der Benutzereingabe.
   * @param e - Das Änderungsereignis des Input- oder Select-Elements.
   * -------------------------------------------------------------------
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target; // Extrahiert Name, Wert und Typ des geänderten Elements
    const isCheckbox = type === "checkbox"; // Prüft, ob es sich um eine Checkbox handelt

    // Aktualisiert den Zustand des Formulars. Bei Checkboxen wird 'checked' statt 'value' verwendet.
    setFormData((prev) => ({
      ...prev, // Kopiert den vorherigen Zustand
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value, // Setzt den neuen Wert für das betreffende Feld
    }));
  };

  /**
   * -------------------------------------------------------------------
   * ✅ handleSubmit
   * Behandelt die Formularübermittlung.
   * Führt eine Client-seitige Validierung durch und sendet die Daten an die API,
   * um einen neuen Benutzer zu erstellen.
   * -------------------------------------------------------------------
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Verhindert das standardmäßige Neuladen der Seite
    setError(null); // Löscht vorherige Fehler
    setFieldErrors(null); // Löscht vorherige Feldfelher
    setSuccessMessage(null); // Löscht vorherige Erfolgsmeldungen

    // -----------------------------------------------------------
    // Client-seitige Passwort-Validierung vor dem API-Aufruf
    // Diese grundlegende Validierung verbessert die Benutzerfreundlichkeit.
    // Detailliertere Validierungen (z.B. mit Zod) finden im Backend statt.
    // -----------------------------------------------------------
    if (formData.password !== formData.passwordConfirmation) {
      setFieldErrors({
        passwordConfirmation: ["Die Passwörter stimmen nicht überein."], // Setzt spezifischen Fehler für Passwortbestätigung
      });
      return; // Beendet die Funktion, wenn Passwörter nicht übereinstimmen
    }
    if (formData.password.length < 8) {
      setFieldErrors({
        password: ["Das Passwort muss mindestens 8 Zeichen lang sein."], // Setzt spezifischen Fehler für Passwortlänge
      });
      return; // Beendet die Funktion, wenn Passwort zu kurz ist
    }

    setIsLoading(true); // Setzt den Ladezustand auf true

    try {
      // Erstellt den Payload für die API-Anfrage.
      // Leere Strings für firstName/lastName werden zu 'undefined',
      // damit sie nicht als leere Werte an die API gesendet werden,
      // falls das Backend 'null' oder das Fehlen erwartet.
      const payload = {
        email: formData.email,
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
        firstName: formData.firstName || undefined, // Setzt auf undefined, wenn leer
        lastName: formData.lastName || undefined, // Setzt auf undefined, wenn leer
        role: formData.role,
        isActive: formData.isActive,
      };

      // Führt den API-Aufruf zum Erstellen eines Benutzers durch (POST-Anfrage an /admin/users)
      const response = await apiClient("/admin/users", {
        method: "POST",
        body: JSON.stringify(payload), // Konvertiert den Payload in einen JSON-String
      });

      const data = await response.json(); // Parsed die JSON-Antwort vom Server

      // Setzt die Erfolgsmeldung basierend auf der Serverantwort
      setSuccessMessage(data.message || "Benutzer erfolgreich erstellt!");
      onUserCreated(); // Ruft den Callback auf, um z.B. die Benutzerliste zu aktualisieren

      // Schließt das Modal nach einer kurzen Verzögerung, um die Erfolgsmeldung anzuzeigen
      setTimeout(() => {
        onClose();
      }, 1500); // 1,5 Sekunden Verzögerung
    } catch (err) {
      // Fehlerbehandlung
      console.error(`🔥 Fehler beim Erstellen des Benutzers:`, err);
      if (err instanceof ApiError) {
        // Wenn es ein Fehler vom apiClient ist (z.B. HTTP-Fehler vom Backend)
        setError(err.message); // Setzt die Hauptfehlermeldung
        if (err.fieldErrors) {
          // Wenn feldspezifische Fehler vom Backend zurückgegeben wurden (z.B. von Zod)
          setFieldErrors(err.fieldErrors); // Setzt die feldspezifischen Fehler
          setError("Bitte korrigieren Sie die markierten Fehler."); // Überschreibt die Hauptmeldung mit einem Hinweis auf Feldfehler
        }
      } else if (err instanceof Error) {
        // Wenn es ein allgemeiner JavaScript-Fehler ist
        setError(err.message);
      } else {
        // Für alle anderen unerwarteten Fehlertypen
        setError("Ein unerwarteter Fehler ist aufgetreten.");
      }
    } finally {
      setIsLoading(false); // Setzt den Ladezustand auf false, unabhängig vom Ergebnis
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ renderFieldError
   * Hilfsfunktion zum Rendern von feldspezifischen Fehlermeldungen.
   * @param fieldName - Der Name des Formularfeldes, für das Fehler angezeigt werden sollen.
   * @returns Ein JSX-Element mit der Fehlermeldung oder null, wenn keine Fehler vorliegen.
   * -------------------------------------------------------------------
   */
  const renderFieldError = (fieldName: keyof typeof formData) => {
    // Prüft, ob es feldspezifische Fehler für dieses Feld gibt
    if (fieldErrors?.[fieldName]) {
      return (
        <p className="mt-1 text-xs text-[var(--color-danger)]">
          {fieldErrors[fieldName]?.join(", ")}{" "}
          {/* Zeigt alle Fehler für das Feld, durch Komma getrennt */}
        </p>
      );
    }
    return null; // Keine Fehler, nichts rendern
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der CreateUserModal-Komponente
  // Das Modal enthält Ladeindikatoren, Erfolgs-/Fehlermeldungen und das Benutzererstellungsformular.
  // -------------------------------------------------------------------
  return (
    <Modal
      isOpen={isOpen} // Steuert die Sichtbarkeit des Modals
      onClose={onClose} // Callback zum Schließen des Modals
      title="Neuen Benutzer erstellen" // Titel des Modals
      size="2xl" // Größe des Modals (z.B. "2xl" für größere Ansicht)
    >
      {/* Ladeindikator: Wird angezeigt, wenn isLoading true ist */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)]" />{" "}
          {/* Spinner-Icon */}
          <p className="ml-3 text-[var(--color-text-secondary)]">
            Benutzer wird erstellt...
          </p>
        </div>
      )}

      {/* Erfolgs- und Fehlermeldungen (die nicht feldspezifisch sind) */}
      {/* Allgemeiner Fehler (ohne Feldfeldher), wenn keine Lade- oder Erfolgsmeldung aktiv ist */}
      {!isLoading && error && !fieldErrors && !successMessage && (
        <div className="alert alert-danger my-4">
          <div className="flex items-center">
            <FiAlertTriangle className="h-5 w-5 mr-2" /> {/* Warn-Icon */}
            <p>{error}</p>
          </div>
        </div>
      )}
      {/* Erfolgsmeldung, wenn isLoading false und successMessage aktiv ist */}
      {!isLoading && successMessage && (
        <div className="alert alert-success my-4">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Formular zur Benutzererstellung: Wird angezeigt, wenn nicht geladen wird und keine Erfolgsmeldung aktiv ist */}
      {!isLoading && !successMessage && (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Allgemeine Fehlermeldung, wenn auch Feldfelher vorhanden sind */}
          {error && fieldErrors && (
            <div className="alert alert-danger p-3 mb-4">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Formularfelder in einem responsiven Raster (1 oder 2 Spalten) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vorname */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-[var(--color-text-primary)]"
              >
                Vorname
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1" // CSS-Klasse für Styling
              />
              {renderFieldError("firstName")}{" "}
              {/* Zeigt Fehler für dieses Feld an */}
            </div>
            {/* Nachname */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-[var(--color-text-primary)]"
              >
                Nachname
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1"
              />
              {renderFieldError("lastName")}
            </div>
          </div>

          {/* E-Mail-Adresse */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--color-text-primary)]"
            >
              E-Mail-Adresse{" "}
              <span className="text-[var(--color-danger)]">*</span>{" "}
              {/* Pflichtfeld-Indikator */}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required // HTML5-Pflichtfeld
              className="mt-1"
            />
            {renderFieldError("email")}
          </div>

          {/* Passwort und Passwort bestätigen im responsiven Raster */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Passwort */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--color-text-primary)]"
              >
                Passwort <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8} // HTML5-Validierung für Mindestlänge
                className="mt-1"
              />
              {renderFieldError("password")}
            </div>
            {/* Passwort bestätigen */}
            <div>
              <label
                htmlFor="passwordConfirmation"
                className="block text-sm font-medium text-[var(--color-text-primary)]"
              >
                Passwort bestätigen{" "}
                <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                type="password"
                name="passwordConfirmation"
                id="passwordConfirmation"
                value={formData.passwordConfirmation}
                onChange={handleChange}
                required
                className="mt-1"
              />
              {renderFieldError("passwordConfirmation")}
            </div>
          </div>

          {/* Rolle auswählen */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Rolle
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role} className="capitalize">
                  {role.charAt(0).toUpperCase() + role.slice(1)}{" "}
                  {/* Rollennamen formatieren (z.B. "user" zu "User") */}
                </option>
              ))}
            </select>
            {renderFieldError("role")}
          </div>

          {/* Konto ist aktiv Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="isActive"
                className="font-medium text-[var(--color-text-primary)]"
              >
                Konto ist aktiv
              </label>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Deaktivieren, um das Konto in einem deaktivierten Zustand zu
                erstellen.
              </p>
            </div>
            {renderFieldError("isActive")}
          </div>

          {/* Aktionsbuttons (Abbrechen und Benutzer erstellen) */}
          <div className="pt-5">
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="btn-secondary">
                {" "}
                {/* Sekundärer Button-Stil */}
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isLoading} // Deaktiviert den Button während des Ladens
                className="btn-primary disabled:opacity-50" // Primärer Button-Stil, opaker wenn deaktiviert
              >
                <FiUserPlus className="inline-block h-4 w-4 mr-2" />{" "}
                {/* Icon für "Benutzer erstellen" */}
                {isLoading
                  ? "Benutzer wird erstellt..."
                  : "Benutzer erstellen"}{" "}
                {/* Text ändert sich während des Ladens */}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
