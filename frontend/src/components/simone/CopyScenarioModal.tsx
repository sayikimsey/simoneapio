// "use client";

// import React, { useState, useEffect } from "react";
// import Modal from "@/components/common/Modal";
// import { apiClient, ApiError } from "@/lib/apiClient";
// import toast from "react-hot-toast";
// import { FiLoader, FiSave } from "react-icons/fi";
// import type { CopyScenarioRequest } from "@/types";

// interface CopyScenarioModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
//   sourceScenarioName: string | null;
// }

// export default function CopyScenarioModal({
//   isOpen,
//   onClose,
//   onSuccess,
//   sourceScenarioName,
// }: CopyScenarioModalProps) {
//   const [newScenarioName, setNewScenarioName] = useState("");
//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     if (isOpen && sourceScenarioName) {
//       setNewScenarioName(`${sourceScenarioName}_Kopie`);
//     } else if (!isOpen) {
//       setNewScenarioName("");
//     }
//   }, [isOpen, sourceScenarioName]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!sourceScenarioName || !newScenarioName.trim()) {
//       toast.error("Der neue Szenarioname darf nicht leer sein.");
//       return;
//     }

//     setIsSaving(true);
//     const toastId = toast.loading("Szenario wird kopiert...");

//     const payload: CopyScenarioRequest = {
//       sourceScenarioName,
//       newScenarioName: newScenarioName.trim(),
//     };

//     try {
//       await apiClient("/simone/scenarios/copy", {
//         method: "POST",
//         body: JSON.stringify(payload),
//       });

//       toast.success(
//         `Szenario '${sourceScenarioName}' erfolgreich nach '${newScenarioName}' kopiert.`,
//         { id: toastId }
//       );
//       onSuccess();
//       onClose();
//     } catch (error) {
//       const errorMessage =
//         error instanceof ApiError
//           ? error.message
//           : "Ein unerwarteter Fehler ist aufgetreten.";
//       toast.error(errorMessage, { id: toastId });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={onClose} title="Szenario Speichern Unter">
//       <div className="p-1">
//         <p className="text-sm text-[var(--color-text-secondary)] mb-4">
//           Eine Kopie von{" "}
//           <strong className="text-[var(--color-text-primary)]">
//             {sourceScenarioName}
//           </strong>{" "}
//           wird mit dem folgenden neuen Namen erstellt.
//         </p>

//         <form onSubmit={handleSubmit}>
//           <div className="space-y-4">
//             <div>
//               <label
//                 htmlFor="new-scenario-name"
//                 className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
//               >
//                 Neuer Szenarioname
//               </label>
//               <input
//                 id="new-scenario-name"
//                 type="text"
//                 value={newScenarioName}
//                 onChange={(e) => setNewScenarioName(e.target.value)}
//                 className="input-text w-full"
//                 placeholder="Name der Kopie eingeben"
//                 required
//                 disabled={isSaving}
//               />
//             </div>
//           </div>
//           <div className="mt-6 flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="btn-secondary"
//               disabled={isSaving}
//             >
//               Abbrechen
//             </button>
//             <button
//               type="submit"
//               className="btn-primary flex items-center gap-2"
//               disabled={isSaving || !newScenarioName.trim()}
//             >
//               {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
//               Speichern
//             </button>
//           </div>
//         </form>
//       </div>
//     </Modal>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, { useState, useEffect } from "react"; // React Hooks für Zustand und Lebenszyklus.
import Modal from "@/components/common/Modal"; // Importiert die allgemeine Modal-Komponente.
import { apiClient, ApiError } from "@/lib/apiClient"; // Importiert den API-Client und den benutzerdefinierten Fehler-Typ.
import toast from "react-hot-toast"; // Bibliothek für Pop-up-Benachrichtigungen.
import { FiLoader, FiSave } from "react-icons/fi"; // Importiert Icons (Lade-Spinner, Speichern).
import type { CopyScenarioRequest } from "@/types"; // Importiert den Typ für die CopyScenarioRequest-Payload.

/**
 * -------------------------------------------------------------------
 * ✅ Interface: CopyScenarioModalProps
 * Definiert die Props (Eigenschaften), die an die CopyScenarioModal-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface CopyScenarioModalProps {
  isOpen: boolean; // Steuert, ob das Modal sichtbar ist.
  onClose: () => void; // Callback-Funktion, die aufgerufen wird, wenn das Modal geschlossen werden soll.
  onSuccess: () => void; // Callback-Funktion, die bei erfolgreichem Kopiervorgang aufgerufen wird.
  sourceScenarioName: string | null; // Der Name des Quellszenarios, das kopiert werden soll. Null, wenn keines ausgewählt ist.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: CopyScenarioModal
 * Eine modale Komponente, die es Benutzern ermöglicht, ein Szenario
 * zu kopieren (ähnlich "Speichern unter").
 * -------------------------------------------------------------------
 */
export default function CopyScenarioModal({
  isOpen, // Steuert die Sichtbarkeit des Modals.
  onClose, // Funktion zum Schließen des Modals.
  onSuccess, // Funktion, die bei Erfolg aufgerufen wird.
  sourceScenarioName, // Name des Quellszenarios.
}: CopyScenarioModalProps) {
  // Zustandsvariable für den Namen des neuen Szenarios.
  const [newScenarioName, setNewScenarioName] = useState("");
  // Zustandsvariable, die anzeigt, ob der Speichervorgang läuft.
  const [isSaving, setIsSaving] = useState(false);

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Szenarioname initialisieren und zurücksetzen
   * Dieser Hook wird ausgeführt, wenn sich der 'isOpen'-Status
   * oder der 'sourceScenarioName' ändert.
   * Er setzt den 'newScenarioName' initial auf einen Vorschlag
   * (z.B. "Originalname_Kopie") oder leert ihn, wenn das Modal geschlossen wird.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    if (isOpen && sourceScenarioName) {
      // Wenn das Modal geöffnet wird und ein Quellszenario vorhanden ist.
      setNewScenarioName(`${sourceScenarioName}_Kopie`); // Vorschlag für den neuen Namen.
    } else if (!isOpen) {
      // Wenn das Modal geschlossen wird.
      setNewScenarioName(""); // Leert das Eingabefeld.
    }
  }, [isOpen, sourceScenarioName]); // Abhängigkeiten des Hooks.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleSubmit
   * Behandelt das Absenden des Formulars zum Kopieren des Szenarios.
   * Führt eine grundlegende Validierung durch und sendet die Anfrage an die API.
   * -------------------------------------------------------------------
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Verhindert das standardmäßige Neuladen der Seite.

    // Client-seitige Validierung.
    if (!sourceScenarioName || !newScenarioName.trim()) {
      toast.error("Der neue Szenarioname darf nicht leer sein."); // Fehlermeldung, wenn der Name leer ist.
      return;
    }

    setIsSaving(true); // Setzt den Ladezustand für den Speichervorgang.
    const toastId = toast.loading("Szenario wird kopiert..."); // Zeigt einen Lade-Toast an.

    // Erstellt den Payload für die API-Anfrage.
    const payload: CopyScenarioRequest = {
      sourceScenarioName, // Name des zu kopierenden Szenarios.
      newScenarioName: newScenarioName.trim(), // Der neue Name für die Kopie (bereinigt um Leerzeichen).
    };

    try {
      // Sendet die POST-Anfrage an den "/simone/scenarios/copy"-Endpunkt.
      await apiClient("/simone/scenarios/copy", {
        method: "POST",
        body: JSON.stringify(payload), // Sendet den Payload als JSON.
      });

      // Erfolgsmeldung und Aktionen nach erfolgreichem Kopieren.
      toast.success(
        `Szenario '${sourceScenarioName}' erfolgreich nach '${newScenarioName}' kopiert.`,
        { id: toastId } // Toast-Benachrichtigung mit spezifischer ID.
      );
      onSuccess(); // Ruft den Erfolgs-Callback auf (z.B. um die Szenarienliste zu aktualisieren).
      onClose(); // Schließt das Modal.
    } catch (error) {
      // Fehlerbehandlung: Zeigt eine Fehlermeldung an.
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Ein unerwarteter Fehler ist aufgetreten.";
      toast.error(errorMessage, { id: toastId }); // Fehler-Toast.
    } finally {
      setIsSaving(false); // Setzt den Ladezustand zurück.
    }
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der CopyScenarioModal-Komponente
  // Das Modal enthält eine Beschreibung, ein Eingabefeld für den neuen Namen
  // und Buttons zum Abbrechen oder Speichern.
  // -------------------------------------------------------------------
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Szenario Speichern Unter">
      <div className="p-1">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Eine Kopie von{" "}
          <strong className="text-[var(--color-text-primary)]">
            {sourceScenarioName}{" "}
            {/* Zeigt den Namen des Originalszenarios an. */}
          </strong>{" "}
          wird mit dem folgenden neuen Namen erstellt.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="new-scenario-name"
                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
              >
                Neuer Szenarioname
              </label>
              <input
                id="new-scenario-name"
                type="text"
                value={newScenarioName}
                onChange={(e) => setNewScenarioName(e.target.value)} // Aktualisiert den neuen Szenarionamen.
                className="input-text w-full"
                placeholder="Name der Kopie eingeben"
                required // Feld ist erforderlich.
                disabled={isSaving} // Deaktiviert während des Speichervorgangs.
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose} // Schließt das Modal beim Klick.
              className="btn-secondary" // Sekundärer Button-Stil.
              disabled={isSaving} // Deaktiviert während des Speichervorgangs.
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2" // Primärer Button-Stil mit Icon und Text.
              disabled={isSaving || !newScenarioName.trim()} // Deaktiviert, wenn gespeichert wird oder Name leer ist.
            >
              {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}{" "}
              {/* Spinner oder Speichern-Icon. */}
              Speichern
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
