// "use client";

// import React, { useState, useCallback } from "react";
// import VariableSelector from "@/components/simone/VariableSelector";
// import VariableList from "@/components/simone/VariableList";
// import DataReaderMatrix from "@/components/simone/DataReaderMatrix";
// import CreateScenarioModal from "@/components/simone/CreateScenarioModal";
// import CopyScenarioModal from "@/components/simone/CopyScenarioModal";
// import ConfirmActionModal from "@/components/common/ConfirmActionModal";
// import { useSimoneContext } from "@/contexts/SimoneContext";
// import { ScenarioListItemDto } from "@/types";
// import { FiGrid, FiList, FiPlusCircle, FiTrash2, FiCopy } from "react-icons/fi";

// export default function ScenariosTabContent() {
//   const { simoneState, handleDeleteScenario, fetchScenarios } =
//     useSimoneContext();
//   const { isDeletingScenario } = simoneState;

//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

//   const [selectedScenarios, setSelectedScenarios] = useState<
//     ScenarioListItemDto[]
//   >([]);

//   const selectedScenarioName =
//     selectedScenarios.length === 1 ? selectedScenarios[0].name : null;

//   const handleSelectionChange = useCallback(
//     (scenarios: ScenarioListItemDto[]) => {
//       setSelectedScenarios(scenarios);
//     },
//     []
//   );

//   const confirmDeletion = async () => {
//     if (selectedScenarios.length > 0) {
//       await Promise.all(
//         selectedScenarios.map((scenario) =>
//           handleDeleteScenario({ scenarioName: scenario.name })
//         )
//       );
//       await fetchScenarios();
//       setIsDeleteModalOpen(false);
//       setSelectedScenarios([]);
//     }
//   };

//   const handleCreateSuccess = () => {
//     setIsCreateModalOpen(false);
//     fetchScenarios();
//   };

//   const handleCopySuccess = () => {
//     setIsCopyModalOpen(false);
//     fetchScenarios();
//   };

//   const getModalTitle = () => {
//     if (selectedScenarios.length === 1) {
//       return `Szenario "${selectedScenarios[0].name}" löschen?`;
//     }
//     return `${selectedScenarios.length} Szenarien löschen?`;
//   };

//   const getModalMessage = () => {
//     const scenarioNames = selectedScenarios.map((s) => s.name).join(", ");
//     return `Möchten Sie die folgenden Szenarien wirklich löschen: ${scenarioNames}? Diese Aktion kann nicht rückgängig gemacht werden.`;
//   };

//   return (
//     <>
//       <CreateScenarioModal
//         open={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         onSuccess={handleCreateSuccess}
//       />
//       <CopyScenarioModal
//         isOpen={isCopyModalOpen}
//         onClose={() => setIsCopyModalOpen(false)}
//         onSuccess={handleCopySuccess}
//         sourceScenarioName={selectedScenarioName}
//       />
//       <ConfirmActionModal
//         isOpen={isDeleteModalOpen}
//         onClose={() => setIsDeleteModalOpen(false)}
//         onConfirm={confirmDeletion}
//         title={getModalTitle()}
//         message={getModalMessage()}
//         confirmButtonText="Löschen"
//         isConfirming={isDeletingScenario}
//       />
//       <div className="max-w-[1600px] w-full mx-auto px-4 space-y-12">
//         <section>
//           <div className="flex items-center mb-1">
//             <FiList className="h-6 w-6 mr-3 text-[var(--color-accent)]" />
//             <h3 className="text-xl font-semibold leading-7 text-[var(--color-text-primary)]">
//               Schritt 1: Variablen für das Datenlesen definieren
//             </h3>
//           </div>
//           <p className="mt-1 max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
//             Verwenden Sie die Auswahl auf der linken Seite, um Ihre
//             Variablenliste zu erstellen. Die hinzugefügten Variablen erscheinen
//             als Spalten in der Datenmatrix unten.
//           </p>
//           <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
//             <div className="lg:col-span-3">
//               <VariableSelector />
//             </div>
//             <div className="lg:col-span-2">
//               <VariableList />
//             </div>
//           </div>
//         </section>

//         <div className="border-t border-[var(--border-color)]"></div>

//         <section>
//           <div className="flex justify-between items-center mb-1">
//             <div className="flex items-center">
//               <FiGrid className="h-6 w-6 mr-3 text-[var(--color-accent)]" />
//               <h3 className="text-xl font-semibold leading-7 text-[var(--color-text-primary)]">
//                 Schritt 2: Daten aus Szenarien lesen
//               </h3>
//             </div>
//             <div className="flex items-center gap-4">
//               <button
//                 type="button"
//                 onClick={() => setIsCopyModalOpen(true)}
//                 disabled={selectedScenarios.length !== 1}
//                 className="btn-primary flex items-center"
//                 title={
//                   selectedScenarios.length !== 1
//                     ? "Bitte genau ein Szenario auswählen"
//                     : "Kopie des ausgewählten Szenarios erstellen"
//                 }
//               >
//                 <FiCopy className="-ml-0.5 h-5 w-5 mr-2" aria-hidden="true" />
//                 Speichern Unter...
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setIsCreateModalOpen(true)}
//                 className="btn-primary flex items-center"
//               >
//                 <FiPlusCircle
//                   className="-ml-0.5 h-5 w-5 mr-2"
//                   aria-hidden="true"
//                 />
//                 Neues Szenario
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setIsDeleteModalOpen(true)}
//                 disabled={selectedScenarios.length === 0 || isDeletingScenario}
//                 className="btn-danger flex items-center disabled:opacity-50"
//               >
//                 <FiTrash2 className="-ml-0.5 h-5 w-5 mr-2" aria-hidden="true" />
//                 {isDeletingScenario
//                   ? "Löschen..."
//                   : `Löschen (${selectedScenarios.length})`}
//               </button>
//             </div>
//           </div>
//           <p className="mt-1 max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
//             Wählen Sie ein oder mehrere Szenarien aus der Liste aus, um die
//             Optionen zu aktivieren.
//           </p>
//           <div className="mt-6">
//             <DataReaderMatrix onSelectionChange={handleSelectionChange} />
//           </div>
//         </section>
//       </div>
//     </>
//   );
// }




















"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, { useState, useCallback } from "react"; // React Hooks für Zustand und Memo (Callback).
import VariableSelector from "@/components/simone/VariableSelector"; // Komponente zur Auswahl von Variablen.
import VariableList from "@/components/simone/VariableList"; // Komponente zur Anzeige der ausgewählten Variablenliste.
import DataReaderMatrix from "@/components/simone/DataReaderMatrix"; // Komponente zur Anzeige der Datenmatrix und Szenarioverwaltung.
import CreateScenarioModal from "@/components/simone/CreateScenarioModal"; // Modal zum Erstellen eines neuen Szenarios.
import CopyScenarioModal from "@/components/simone/CopyScenarioModal"; // Modal zum Kopieren eines Szenarios.
import ConfirmActionModal from "@/components/common/ConfirmActionModal"; // Allgemeines Bestätigungs-Modal.
import { useSimoneContext } from "@/contexts/SimoneContext"; // Importiert den SimoneContext für den SIMONE-spezifischen Zustand und Aktionen.
import { ScenarioListItemDto } from "@/types"; // Typdefinition für Szenario-Listen-Einträge.
import { FiGrid, FiList, FiPlusCircle, FiTrash2, FiCopy } from "react-icons/fi"; // Importiert Icons von Feather Icons.

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: ScenariosTabContent
 * Die Hauptkomponente für den "Szenarien"-Tab.
 * Sie organisiert die UI für die Definition von Variablen zum Datenlesen
 * und die Verwaltung von Szenarien (Erstellen, Kopieren, Löschen)
 * innerhalb der SIMONE-Interaktionsstation.
 * -------------------------------------------------------------------
 */
export default function ScenariosTabContent() {
  // Holt notwendige Zustände und Funktionen aus dem SimoneContext.
  const { simoneState, handleDeleteScenario, fetchScenarios } =
    useSimoneContext();
  const { isDeletingScenario } = simoneState; // Zeigt an, ob ein Szenario gerade gelöscht wird.

  // Zustandsvariablen für die Sichtbarkeit der Modale.
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Steuert das "Szenario erstellen"-Modal.
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Steuert das "Szenario löschen"-Modal.
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false); // Steuert das "Szenario kopieren"-Modal.

  // Zustand für die in der DataReaderMatrix ausgewählten Szenarien.
  const [selectedScenarios, setSelectedScenarios] = useState<
    ScenarioListItemDto[]
  >([]);

  // Leitet den Namen des ausgewählten Szenarios ab, wenn genau eines ausgewählt ist.
  const selectedScenarioName =
    selectedScenarios.length === 1 ? selectedScenarios[0].name : null;

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleSelectionChange
   * Callback-Funktion, die von der DataReaderMatrix aufgerufen wird,
   * wenn sich die Auswahl der Szenarien ändert.
   * Verwendet `useCallback` zur Optimierung.
   * @param scenarios - Das Array der aktuell ausgewählten Szenarien.
   * -------------------------------------------------------------------
   */
  const handleSelectionChange = useCallback(
    (scenarios: ScenarioListItemDto[]) => {
      setSelectedScenarios(scenarios); // Aktualisiert den Zustand der ausgewählten Szenarien.
    },
    [] // Leeres Abhängigkeitsarray: Funktion wird nur einmal erstellt.
  );

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: confirmDeletion
   * Führt die Löschaktion für die ausgewählten Szenarien aus.
   * Ruft `handleDeleteScenario` für jedes ausgewählte Szenario auf.
   * -------------------------------------------------------------------
   */
  const confirmDeletion = async () => {
    if (selectedScenarios.length > 0) {
      // Löscht alle ausgewählten Szenarien parallel.
      await Promise.all(
        selectedScenarios.map(
          (scenario) => handleDeleteScenario({ scenarioName: scenario.name }) // Ruft den Lösch-Handler aus dem Kontext auf.
        )
      );
      await fetchScenarios(); // Aktualisiert die Liste der Szenarien nach dem Löschen.
      setIsDeleteModalOpen(false); // Schließt das Lösch-Modal.
      setSelectedScenarios([]); // Leert die Auswahl.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleCreateSuccess
   * Callback-Funktion für das `CreateScenarioModal` bei Erfolg.
   * Schließt das Modal und aktualisiert die Szenarienliste.
   * -------------------------------------------------------------------
   */
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false); // Schließt das Erstellungs-Modal.
    fetchScenarios(); // Aktualisiert die Szenarienliste.
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleCopySuccess
   * Callback-Funktion für das `CopyScenarioModal` bei Erfolg.
   * Schließt das Modal und aktualisiert die Szenarienliste.
   * -------------------------------------------------------------------
   */
  const handleCopySuccess = () => {
    setIsCopyModalOpen(false); // Schließt das Kopier-Modal.
    fetchScenarios(); // Aktualisiert die Szenarienliste.
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Hilfsfunktion: getModalTitle
   * Generiert den dynamischen Titel für das Bestätigungs-Modal zum Löschen.
   * -------------------------------------------------------------------
   */
  const getModalTitle = () => {
    if (selectedScenarios.length === 1) {
      return `Szenario "${selectedScenarios[0].name}" löschen?`; // Titel für einzelnes Szenario.
    }
    return `${selectedScenarios.length} Szenarien löschen?`; // Titel für mehrere Szenarien.
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Hilfsfunktion: getModalMessage
   * Generiert die dynamische Nachricht für das Bestätigungs-Modal zum Löschen.
   * Listet die Namen der zu löschenden Szenarien auf.
   * -------------------------------------------------------------------
   */
  const getModalMessage = () => {
    const scenarioNames = selectedScenarios.map((s) => s.name).join(", "); // Szenarionamen kommagetrennt.
    return `Möchten Sie die folgenden Szenarien wirklich löschen: ${scenarioNames}? Diese Aktion kann nicht rückgängig gemacht werden.`;
  };

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der ScenariosTabContent-Komponente
  // Die Komponente ist in Abschnitte unterteilt, die die Variablen-Definition
  // und die Datenmatrix mit Szenarien-Verwaltungsaktionen umfassen.
  // -------------------------------------------------------------------
  return (
    <>
      {/* Modale Komponenten (werden nur gerendert, wenn isOpen true ist) */}
      <CreateScenarioModal
        open={isCreateModalOpen} // Steuert die Sichtbarkeit.
        onClose={() => setIsCreateModalOpen(false)} // Schließen-Handler.
        onSuccess={handleCreateSuccess} // Erfolgs-Callback.
      />
      <CopyScenarioModal
        isOpen={isCopyModalOpen} // Steuert die Sichtbarkeit.
        onClose={() => setIsCopyModalOpen(false)} // Schließen-Handler.
        onSuccess={handleCopySuccess} // Erfolgs-Callback.
        sourceScenarioName={selectedScenarioName} // Name des Quellszenarios (wenn eines ausgewählt ist).
      />
      <ConfirmActionModal
        isOpen={isDeleteModalOpen} // Steuert die Sichtbarkeit.
        onClose={() => setIsDeleteModalOpen(false)} // Schließen-Handler.
        onConfirm={confirmDeletion} // Bestätigungs-Handler.
        title={getModalTitle()} // Dynamischer Titel.
        message={getModalMessage()} // Dynamische Nachricht.
        confirmButtonText="Löschen" // Text für den Bestätigungsbutton.
        isConfirming={isDeletingScenario} // Zeigt Ladezustand im Button an.
      />

      <div className="max-w-[1600px] w-full mx-auto px-4 space-y-12">
        {/* Abschnitt 1: Variablen für das Datenlesen definieren */}
        <section>
          <div className="flex items-center mb-1">
            <FiList className="h-6 w-6 mr-3 text-[var(--color-accent)]" />{" "}
            {/* Icon für Liste/Variablen. */}
            <h3 className="text-xl font-semibold leading-7 text-[var(--color-text-primary)]">
              Schritt 1: Variablen für das Datenlesen definieren
            </h3>
          </div>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Verwenden Sie die Auswahl auf der linken Seite, um Ihre
            Variablenliste zu erstellen. Die hinzugefügten Variablen erscheinen
            als Spalten in der Datenmatrix unten.
          </p>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <VariableSelector /> {/* Komponente zur Variablenauswahl. */}
            </div>
            <div className="lg:col-span-2">
              <VariableList />{" "}
              {/* Komponente zur Anzeige der ausgewählten Variablen. */}
            </div>
          </div>
        </section>

        {/* Trennlinie zwischen den Abschnitten */}
        <div className="border-t border-[var(--border-color)]"></div>

        {/* Abschnitt 2: Daten aus Szenarien lesen (DataReaderMatrix) */}
        <section>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <FiGrid className="h-6 w-6 mr-3 text-[var(--color-accent)]" />{" "}
              {/* Icon für Gitter/Matrix. */}
              <h3 className="text-xl font-semibold leading-7 text-[var(--color-text-primary)]">
                Schritt 2: Daten aus Szenarien lesen
              </h3>
            </div>
            {/* Aktionsbuttons für Szenarien (Kopieren, Neu, Löschen) */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(true)} // Öffnet das Kopier-Modal.
                disabled={selectedScenarios.length !== 1} // Deaktiviert, wenn nicht genau ein Szenario ausgewählt ist.
                className="btn-primary flex items-center disabled:opacity-50"
                title={
                  // Dynamischer Tooltip.
                  selectedScenarios.length !== 1
                    ? "Bitte genau ein Szenario auswählen"
                    : "Kopie des ausgewählten Szenarios erstellen"
                }
              >
                <FiCopy className="-ml-0.5 h-5 w-5 mr-2" aria-hidden="true" />{" "}
                {/* Kopier-Icon. */}
                Speichern Unter...
              </button>
             {/*
<button
  type="button"
  onClick={() => setIsCreateModalOpen(true)} // Öffnet das Erstellungs-Modal.
  className="btn-primary flex items-center"
><FiPlusCircle
    className="-ml-0.5 h-5 w-5 mr-2"
    aria-hidden="true"
  />
  Neues Szenario
</button>
*/}
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)} // Öffnet das Lösch-Modal.
                disabled={selectedScenarios.length === 0 || isDeletingScenario} // Deaktiviert, wenn keine Szenarien ausgewählt sind oder Löschvorgang läuft.
                className="btn-danger flex items-center disabled:opacity-50"
              >
                <FiTrash2 className="-ml-0.5 h-5 w-5 mr-2" aria-hidden="true" />{" "}
                {/* Mülltonnen-Icon. */}
                {isDeletingScenario
                  ? "Löschen..."
                  : `Löschen (${selectedScenarios.length})`}{" "}
                {/* Dynamischer Button-Text. */}
              </button>
            </div>
          </div>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Wählen Sie ein oder mehrere Szenarien aus der Liste aus, um die
            Optionen zu aktivieren.
          </p>
          <div className="mt-6">
            <DataReaderMatrix onSelectionChange={handleSelectionChange} />{" "}
            {/* Komponente zur Datenmatrix und Szenarioliste. */}
          </div>
        </section>
      </div>
    </>
  );
}
