// "use client";

// import React from "react";
// import Modal from "@/components/common/Modal";
// import { FiAlertTriangle, FiLoader } from "react-icons/fi";

// /**
//  * Definiert die Props für die ConfirmActionModal-Komponente.
//  */
// interface ConfirmActionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
//   title: string;
//   message: React.ReactNode;
//   confirmButtonText?: string;
//   cancelButtonText?: string;
//   isConfirming?: boolean;
//   actionType?: "danger" | "primary" | "warning";
// }

// /**
//  * Eine wiederverwendbare modale Komponente, um eine Bestätigung vom Benutzer für eine Aktion einzuholen.
//  * Sie zeigt eine Nachricht und Schaltflächen zum Bestätigen oder Abbrechen an.
//  */
// export default function ConfirmActionModal({
//   isOpen,
//   onClose,
//   onConfirm,
//   title,
//   message,
//   confirmButtonText = "Bestätigen",
//   cancelButtonText = "Abbrechen",
//   isConfirming = false,
//   actionType = "danger",
// }: ConfirmActionModalProps) {
//   // Bestimmt die Button-Klassen basierend auf dem actionType
//   const getConfirmButtonClasses = () => {
//     const baseClasses = "w-full sm:w-auto sm:ml-3 disabled:opacity-50";
//     switch (actionType) {
//       case "danger":
//         return `${baseClasses} btn-danger`;
//       case "warning":
//         // Assuming you might add a .btn-warning class in the future
//         return `${baseClasses} btn-primary bg-yellow-500 hover:bg-yellow-600`;
//       default:
//         return `${baseClasses} btn-primary`;
//     }
//   };

//   const getIconContainerClasses = () => {
//     const baseClasses =
//       "mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10";
//     switch (actionType) {
//       case "danger":
//         return `${baseClasses} bg-red-100 dark:bg-red-800/20`;
//       case "warning":
//         return `${baseClasses} bg-yellow-100 dark:bg-yellow-800/20`;
//       default:
//         return `${baseClasses} bg-indigo-100 dark:bg-indigo-800/20`;
//     }
//   };

//   const getIconClasses = () => {
//     const baseClasses = "h-6 w-6";
//     switch (actionType) {
//       case "danger":
//         return `${baseClasses} text-red-600 dark:text-red-400`;
//       case "warning":
//         return `${baseClasses} text-yellow-600 dark:text-yellow-400`;
//       default:
//         return `${baseClasses} text-indigo-600 dark:text-indigo-400`;
//     }
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} size="md" title={title}>
//       <div className="sm:flex sm:items-start">
//         <div className={getIconContainerClasses()}>
//           <FiAlertTriangle className={getIconClasses()} aria-hidden="true" />
//         </div>
//         <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
//           <div className="mt-2">
//             <div className="text-sm text-[var(--color-text-secondary)]">
//               {message}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
//         <button
//           type="button"
//           onClick={onConfirm}
//           disabled={isConfirming}
//           className={getConfirmButtonClasses()}
//         >
//           {isConfirming ? (
//             <div className="flex items-center justify-center">
//               <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
//               Wird verarbeitet...
//             </div>
//           ) : (
//             confirmButtonText
//           )}
//         </button>
//         <button
//           type="button"
//           onClick={onClose}
//           disabled={isConfirming}
//           className="mt-3 sm:mt-0 w-full sm:w-auto disabled:opacity-50"
//         >
//           {cancelButtonText}
//         </button>
//       </div>
//     </Modal>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js, notwendig für Hooks und Interaktivität.

import React from "react"; // Importiert die React-Bibliothek.
import Modal from "@/components/common/Modal"; // Importiert die allgemeine Modal-Komponente.
import { FiAlertTriangle, FiLoader } from "react-icons/fi"; // Importiert Icons (Warndreieck, Lade-Spinner).

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ConfirmActionModalProps
 * Definiert die Props (Eigenschaften), die an die ConfirmActionModal-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface ConfirmActionModalProps {
  isOpen: boolean; // Steuert, ob das Modal sichtbar ist.
  onClose: () => void; // Callback-Funktion, die aufgerufen wird, wenn das Modal geschlossen werden soll.
  onConfirm: () => void; // Callback-Funktion, die aufgerufen wird, wenn der Benutzer die Aktion bestätigt.
  title: string; // Der Titel des Modals (z.B. "Aktion bestätigen").
  message: React.ReactNode; // Die Hauptnachricht, die dem Benutzer angezeigt wird (kann Text oder JSX sein).
  confirmButtonText?: string; // Optionaler Text für den Bestätigungsbutton (Standard: "Bestätigen").
  cancelButtonText?: string; // Optionaler Text für den Abbrechen-Button (Standard: "Abbrechen").
  isConfirming?: boolean; // Zeigt an, ob die Bestätigungsaktion gerade läuft (aktiviert Lade-Spinner im Button).
  actionType?: "danger" | "primary" | "warning"; // Definiert den Typ der Aktion, um die Farbgebung anzupassen.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ConfirmActionModal
 * Eine wiederverwendbare modale Komponente, um eine Bestätigung vom Benutzer
 * für eine bevorstehende Aktion einzuholen.
 * Sie zeigt eine Warnmeldung, eine anpassbare Nachricht und Buttons zum Bestätigen
 * oder Abbrechen der Aktion an. Das Design passt sich dem 'actionType' an.
 * -------------------------------------------------------------------
 */
export default function ConfirmActionModal({
  isOpen, // Steuert die Sichtbarkeit des Modals.
  onClose, // Funktion zum Schließen des Modals.
  onConfirm, // Funktion, die bei Bestätigung ausgeführt wird.
  title, // Titel des Modals.
  message, // Inhalt der Hauptnachricht.
  confirmButtonText = "Bestätigen", // Standardtext für den Bestätigungsbutton.
  cancelButtonText = "Abbrechen", // Standardtext für den Abbrechen-Button.
  isConfirming = false, // Standardmäßig nicht im Bestätigungs-Ladezustand.
  actionType = "danger", // Standard-Aktionstyp ist 'danger' (rot).
}: ConfirmActionModalProps) {
  /**
   * -------------------------------------------------------------------
   * ✅ Hilfsfunktion: getConfirmButtonClasses
   * Bestimmt die CSS-Klassen für den Bestätigungsbutton basierend auf dem 'actionType'.
   * -------------------------------------------------------------------
   */
  const getConfirmButtonClasses = () => {
    const baseClasses = "w-full sm:w-auto sm:ml-3 disabled:opacity-50"; // Grundlegende Klassen für Layout und Deaktivierungsstatus.
    switch (actionType) {
      case "danger":
        return `${baseClasses} btn-danger`; // Verwendet den roten 'btn-danger'-Stil.
      case "warning":
        // Spezielles Styling für 'warning'-Buttons, falls keine eigene '.btn-warning'-Klasse existiert.
        // Verwendet 'btn-primary' als Basis und überschreibt Farben.
        return `${baseClasses} btn-primary bg-yellow-500 hover:bg-yellow-600`;
      case "primary":
      default:
        return `${baseClasses} btn-primary`; // Verwendet den blauen 'btn-primary'-Stil als Standard und für 'primary'.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Hilfsfunktion: getIconContainerClasses
   * Bestimmt die CSS-Klassen für den Container des Icons, der die Farbe des Kreises steuert.
   * -------------------------------------------------------------------
   */
  const getIconContainerClasses = () => {
    const baseClasses =
      "mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"; // Grundlegende Klassen für Größe und Zentrierung.
    switch (actionType) {
      case "danger":
        return `${baseClasses} bg-red-100 dark:bg-red-800/20`; // Roter Hintergrund für 'danger'.
      case "warning":
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-800/20`; // Gelber Hintergrund für 'warning'.
      case "primary":
      default:
        return `${baseClasses} bg-indigo-100 dark:bg-indigo-800/20`; // Indigo-Hintergrund für 'primary' und Standard.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Hilfsfunktion: getIconClasses
   * Bestimmt die CSS-Klassen für das Warndreieck-Icon selbst (dessen Farbe).
   * -------------------------------------------------------------------
   */
  const getIconClasses = () => {
    const baseClasses = "h-6 w-6"; // Grundlegende Größe des Icons.
    switch (actionType) {
      case "danger":
        return `${baseClasses} text-red-600 dark:text-red-400`; // Rote Farbe für 'danger'-Icon.
      case "warning":
        return `${baseClasses} text-yellow-600 dark:text-yellow-400`; // Gelbe Farbe für 'warning'-Icon.
      case "primary":
      default:
        return `${baseClasses} text-indigo-600 dark:text-indigo-400`; // Indigo-Farbe für 'primary'-Icon und Standard.
    }
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der ConfirmActionModal-Komponente
  // Das Modal enthält ein Icon, eine Nachricht und die Aktions-Buttons.
  // -------------------------------------------------------------------
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title={title}>
      {" "}
      {/* Nutzt die allgemeine Modal-Komponente. */}
      <div className="sm:flex sm:items-start">
        {" "}
        {/* Flex-Container für Icon und Nachricht auf kleineren Bildschirmen. */}
        <div className={getIconContainerClasses()}>
          {" "}
          {/* Container für das Icon, mit dynamischen Klassen. */}
          <FiAlertTriangle
            className={getIconClasses()}
            aria-hidden="true"
          />{" "}
          {/* Das Warndreieck-Icon. */}
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          {" "}
          {/* Container für die Nachricht. */}
          {/* Hinweis: Hier könnte direkt der Titel des Modals (aus den Props) platziert werden,
              da die Modal-Komponente bereits einen Titel-Prop hat. */}
          {/* <h3 className="text-base font-semibold leading-6 text-[var(--color-text-primary)]" id="modal-title">{title}</h3> */}
          <div className="mt-2">
            <div className="text-sm text-[var(--color-text-secondary)]">
              {message} {/* Die übergebene Nachricht/Bestätigungsfrage. */}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        {" "}
        {/* Button-Container, rechtsbündig auf kleinen Bildschirmen. */}
        <button
          type="button"
          onClick={onConfirm} // Ruft die onConfirm-Funktion auf, wenn der Button geklickt wird.
          disabled={isConfirming} // Deaktiviert den Button, wenn die Aktion läuft.
          className={getConfirmButtonClasses()} // Dynamische CSS-Klassen für den Bestätigungsbutton.
        >
          {isConfirming ? ( // Zeigt Spinner und Text an, wenn die Aktion läuft.
            <div className="flex items-center justify-center">
              <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />{" "}
              {/* Lade-Spinner. */}
              Wird verarbeitet...
            </div>
          ) : (
            confirmButtonText // Zeigt den Standard- oder benutzerdefinierten Text an.
          )}
        </button>
        <button
          type="button"
          onClick={onClose} // Ruft die onClose-Funktion auf, wenn der Button geklickt wird.
          disabled={isConfirming} // Deaktiviert den Button, wenn die Aktion läuft.
          className="mt-3 sm:mt-0 w-full btn-secondary sm:w-auto disabled:opacity-50" // Stil für den Abbrechen-Button.
        >
          {cancelButtonText}{" "}
          {/* Zeigt den Standard- oder benutzerdefinierten Text an. */}
        </button>
      </div>
    </Modal>
  );
}
