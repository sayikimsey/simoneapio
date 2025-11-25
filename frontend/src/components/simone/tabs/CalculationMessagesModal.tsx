// "use client";

// import React from "react";
// import Modal from "@/components/common/Modal";
// import {
//   FiMessageSquare,
//   FiAlertTriangle,
//   FiLoader,
//   FiClock,
//   FiTag,
//   FiServer,
// } from "react-icons/fi";

// /**
//  * Definiert die Struktur für eine Berechnungsmeldung, die vom Backend empfangen wird.
//  */
// export interface CalculationMessage {
//   simoneStatus: number;
//   statusMessage: string;
//   messageText: string | null;
//   messageTime: number | null;
//   severity: number | null;
//   objectName: string | null;
//   messageName: string | null;
// }

// /**
//  * Definiert die Props für die `CalculationMessagesModal`-Komponente.
//  */
// interface CalculationMessagesModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   scenarioName: string;
//   messages: CalculationMessage[];
//   isLoading: boolean;
//   error: string | null;
// }

// /**
//  * Formatiert einen Unix-Zeitstempel (in Sekunden) in ein lesbares, lokalisiertes Datums- und Zeitformat.
//  * @param epochSeconds - Der zu formatierende Zeitstempel.
//  * @returns Der formatierte Zeit-String oder "N/A".
//  */
// const formatTime = (epochSeconds: number | null) => {
//   if (epochSeconds === null || epochSeconds < 0) return "N/A";
//   return new Date(epochSeconds * 1000).toLocaleString("de-DE");
// };

// /**
//  * Eine modale Komponente zur Anzeige von Berechnungsmeldungen für ein bestimmtes Szenario.
//  */
// export default function CalculationMessagesModal({
//   isOpen,
//   onClose,
//   scenarioName,
//   messages,
//   isLoading,
//   error,
// }: CalculationMessagesModalProps) {
//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       title={`Berechnungsmeldungen für "${scenarioName}"`}
//       size="3xl"
//     >
//       <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
//         {isLoading && (
//           <div className="flex flex-col items-center justify-center py-12 text-center">
//             <FiLoader className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
//             <p className="mt-3 text-lg font-medium text-[var(--color-text-secondary)]">
//               Lade Meldungen...
//             </p>
//           </div>
//         )}
//         {error && (
//           <div className="alert alert-danger flex flex-col items-center justify-center py-12 text-center">
//             <FiAlertTriangle className="h-8 w-8" />
//             <p className="mt-3 text-lg font-semibold">
//               Meldungen konnten nicht geladen werden
//             </p>
//             <p className="mt-1 text-sm">{error}</p>
//           </div>
//         )}
//         {!isLoading && !error && messages.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-12 text-center bg-[var(--color-surface-2)] p-6 rounded-lg">
//             <FiMessageSquare className="h-8 w-8 text-[var(--color-text-secondary)]" />
//             <p className="mt-3 text-lg font-medium text-[var(--color-text-secondary)]">
//               Für diese Berechnung wurden keine Meldungen gemeldet.
//             </p>
//           </div>
//         )}
//         {!isLoading && !error && messages.length > 0 && (
//           <ul className="space-y-3">
//             {messages.map((msg, index) => (
//               <li
//                 key={index}
//                 className="p-4 bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--border-color)]"
//               >
//                 <p className="text-base text-[var(--color-text-primary)] font-medium">
//                   {msg.messageText || "Kein Meldungstext vorhanden."}
//                 </p>
//                 <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-xs text-[var(--color-text-secondary)] grid grid-cols-2 sm:grid-cols-3 gap-2">
//                   <span
//                     className="flex items-center"
//                     title="Zeitpunkt der Meldung"
//                   >
//                     <FiClock className="mr-1.5" /> {formatTime(msg.messageTime)}
//                   </span>
//                   <span className="flex items-center" title="Objektname">
//                     <FiTag className="mr-1.5" /> {msg.objectName || "N/A"}
//                   </span>
//                   <span className="flex items-center" title="Meldungsname">
//                     <FiServer className="mr-1.5" /> {msg.messageName || "N/A"}
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </Modal>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React from "react"; // Importiert die React-Bibliothek.
import Modal from "@/components/common/Modal"; // Importiert die allgemeine Modal-Komponente.
import {
  FiMessageSquare, // Icon für Nachrichten/Meldungen.
  FiAlertTriangle, // Icon für Warnungen/Fehler.
  FiLoader, // Icon für Lade-Spinner.
  FiClock, // Icon für Zeit.
  FiTag, // Icon für Tags/Objektname.
  FiServer, // Icon für Server/Meldungsname.
} from "react-icons/fi"; // Importiert Icons von Feather Icons.

/**
 * -------------------------------------------------------------------
 * ✅ Interface: CalculationMessage
 * Definiert die Struktur für eine Berechnungsmeldung, die vom Backend
 * (z.B. dem SIMONE Java-Dienst) empfangen wird.
 * -------------------------------------------------------------------
 */
export interface CalculationMessage {
  simoneStatus: number; // Der SIMONE-Statuscode der Meldung.
  statusMessage: string; // Eine allgemeine Statusmeldung.
  messageText: string | null; // Der eigentliche Text der Berechnungsmeldung.
  messageTime: number | null; // Der Unix-Zeitstempel der Meldung (in Sekunden).
  severity: number | null; // Der Schweregrad der Meldung (z.B. Info, Warnung, Fehler).
  objectName: string | null; // Der Name des Objekts, auf das sich die Meldung bezieht.
  messageName: string | null; // Der Name oder Typ der Meldung (z.B. "StartCalculation").
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: CalculationMessagesModalProps
 * Definiert die Props (Eigenschaften), die an die `CalculationMessagesModal`-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface CalculationMessagesModalProps {
  isOpen: boolean; // Steuert, ob das Modal sichtbar ist.
  onClose: () => void; // Callback-Funktion, die aufgerufen wird, wenn das Modal geschlossen werden soll.
  scenarioName: string; // Der Name des Szenarios, dessen Meldungen angezeigt werden.
  messages: CalculationMessage[]; // Ein Array der anzuzeigenden Berechnungsmeldungen.
  isLoading: boolean; // Zeigt an, ob die Meldungen gerade geladen werden.
  error: string | null; // Eine Fehlermeldung, falls beim Laden der Meldungen ein Fehler auftrat.
}

/**
 * -------------------------------------------------------------------
 * ✅ Funktion: formatTime
 * Formatiert einen Unix-Zeitstempel (in Sekunden) in ein lesbares,
 * lokalisiertes Datums- und Zeitformat (z.B. "17. Juli 2025, 14:30:00").
 * @param epochSeconds - Der zu formatierende Unix-Zeitstempel (in Sekunden seit Epoch).
 * @returns Der formatierte Zeit-String oder "N/A", wenn der Zeitstempel ungültig ist.
 * -------------------------------------------------------------------
 */
const formatTime = (epochSeconds: number | null) => {
  if (epochSeconds === null || epochSeconds < 0) return "N/A"; // Prüft auf ungültige oder fehlende Zeitstempel.
  return new Date(epochSeconds * 1000).toLocaleString("de-DE"); // Konvertiert Sekunden in Millisekunden und formatiert.
};

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: CalculationMessagesModal
 * Eine modale Komponente zur Anzeige von Berechnungsmeldungen für ein
 * bestimmtes Szenario. Sie bietet eine Ladeanzeige, Fehlerbehandlung
 * und listet die Meldungen mit ihren Details auf.
 * -------------------------------------------------------------------
 */
export default function CalculationMessagesModal({
  isOpen, // Steuert die Sichtbarkeit des Modals.
  onClose, // Funktion zum Schließen des Modals.
  scenarioName, // Name des Szenarios für den Modal-Titel.
  messages, // Die anzuzeigenden Meldungen.
  isLoading, // Zeigt an, ob Meldungen geladen werden.
  error, // Fehlermeldung beim Laden.
}: CalculationMessagesModalProps) {
  return (
    <Modal
      isOpen={isOpen} // Steuert die Sichtbarkeit.
      onClose={onClose} // Funktion zum Schließen.
      title={`Berechnungsmeldungen für "${scenarioName}"`} // Dynamischer Modal-Titel.
      size="3xl" // Größe des Modals (extra groß).
    >
      <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* Ladeanzeige: Wird angezeigt, wenn isLoading true ist. */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiLoader className="h-8 w-8 animate-spin text-[var(--color-accent)]" /> {/* Spinner-Icon. */}
            <p className="mt-3 text-lg font-medium text-[var(--color-text-secondary)]">
              Lade Meldungen...
            </p>
          </div>
        )}

        {/* Fehleranzeige: Wird angezeigt, wenn ein Fehler auftrat. */}
        {error && (
          <div className="alert alert-danger flex flex-col items-center justify-center py-12 text-center">
            <FiAlertTriangle className="h-8 w-8" /> {/* Warn-Icon. */}
            <p className="mt-3 text-lg font-semibold">
              Meldungen konnten nicht geladen werden
            </p>
            <p className="mt-1 text-sm">{error}</p> {/* Detaillierte Fehlermeldung. */}
          </div>
        )}

        {/* Keine Meldungen gefunden: Wird angezeigt, wenn keine Meldungen vorhanden sind und keine Fehler/Ladezustände vorliegen. */}
        {!isLoading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-[var(--color-surface-2)] p-6 rounded-lg">
            <FiMessageSquare className="h-8 w-8 text-[var(--color-text-secondary)]" /> {/* Nachrichten-Icon. */}
            <p className="mt-3 text-lg font-medium text-[var(--color-text-secondary)]">
              Für diese Berechnung wurden keine Meldungen gemeldet.
            </p>
          </div>
        )}

        {/* Meldungsliste: Wird angezeigt, wenn Meldungen vorhanden sind. */}
        {!isLoading && !error && messages.length > 0 && (
          <ul className="space-y-3">
            {messages.map((msg, index) => (
              <li
                key={index} // Index als Key verwenden (besser wäre eine eindeutige ID, falls vorhanden).
                className="p-4 bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--border-color)]"
              >
                <p className="text-base text-[var(--color-text-primary)] font-medium">
                  {msg.messageText || "Kein Meldungstext vorhanden."}{" "}
                  {/* Der eigentliche Meldungstext. */}
                </p>
                <div className="mt-2 pt-2 border-t border-[var(--border-color)] text-xs text-[var(--color-text-secondary)] grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <span
                    className="flex items-center"
                    title="Zeitpunkt der Meldung"
                  >
                    <FiClock className="mr-1.5" /> {formatTime(msg.messageTime)}{" "}
                    {/* Formatierter Zeitstempel. */}
                  </span>
                  <span className="flex items-center" title="Objektname">
                    <FiTag className="mr-1.5" /> {msg.objectName || "N/A"}{" "}
                    {/* Objektname. */}
                  </span>
                  <span className="flex items-center" title="Meldungsname">
                    <FiServer className="mr-1.5" /> {msg.messageName || "N/A"}{" "}
                    {/* Meldungsname/Typ. */}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Footer mit Schließen-Button (automatisch von Modal-Komponente hinzugefügt). */}
    </Modal>
  );
}