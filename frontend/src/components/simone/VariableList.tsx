// // frontend/src/components/simone/VariableList.tsx
// "use client";

// import React, { useCallback, useMemo, useState, useEffect } from "react";
// import { useSimoneContext } from "@/contexts/SimoneContext";
// import { useTheme } from "@/contexts/ThemeContext";
// import { FiList, FiTrash2 } from "react-icons/fi";
// import { Tooltip } from "react-tooltip";
// import { DataGrid, type Column } from "react-data-grid";
// import "react-data-grid/lib/styles.css";

// /**
//  * Definiert die Datenstruktur für eine Zeile in der Variablenliste.
//  */
// interface VariableRowData {
//   variableName: string;
// }

// /**
//  * Eine Komponente, die eine Liste der für das Lesen ausgewählten Variablen anzeigt.
//  * Bietet die Möglichkeit, Variablen aus der Liste zu entfernen.
//  */
// export default function VariableList() {
//   const { simoneState, setVariablesToRead } = useSimoneContext();
//   const { theme } = useTheme();
//   const { variablesToRead } = simoneState;

//   const [rows, setRows] = useState<VariableRowData[]>([]);

//   useEffect(() => {
//     setRows(variablesToRead.map((v) => ({ variableName: v.variableName })));
//   }, [variablesToRead]);

//   /**
//    * Entfernt eine Variable aus der Liste der zu lesenden Variablen.
//    * @param variableName - Der Name der zu entfernenden Variable.
//    */
//   const handleRemove = useCallback(
//     (variableName: string) => {
//       setVariablesToRead((prev) =>
//         prev.filter((v) => v.variableName !== variableName)
//       );
//     },
//     [setVariablesToRead]
//   );

//   /**
//    * Definiert die Spalten für das Datenraster (DataGrid).
//    */
//   const columns: Column<VariableRowData>[] = useMemo(
//     () => [
//       {
//         key: "variableName",
//         name: "Variablenname",
//         resizable: true,
//         sortable: true,
//       },
//       {
//         key: "actions",
//         name: "",
//         width: 60,
//         resizable: false,
//         sortable: false,
//         renderCell: ({ row }) => (
//           <div className="flex items-center justify-center h-full">
//             <button
//               onClick={() => handleRemove(row.variableName)}
//               className="btn-icon-ghost text-[var(--color-danger)]"
//               data-tooltip-id="remove-variable-tooltip"
//               data-tooltip-content="Variable entfernen"
//             >
//               <FiTrash2 className="h-5 w-5" />
//             </button>
//           </div>
//         ),
//       },
//     ],
//     [handleRemove]
//   );

//   return (
//     <div className="p-4 border border-[var(--border-color)] rounded-lg shadow-sm bg-[var(--color-surface)] h-full flex flex-col">
//       <div className="flex-shrink-0 flex justify-between items-center mb-4">
//         <h4 className="text-md font-semibold text-[var(--color-text-primary)] flex items-center">
//           <FiList className="mr-2" />
//           Ausgewählte Variablen ({rows.length})
//         </h4>
//       </div>

//       <div className="flex-grow">
//         <DataGrid
//           columns={columns}
//           rows={rows}
//           rowKeyGetter={(row) => row.variableName}
//           className={theme === "dark" ? "rdg-dark" : "rdg-light"}
//           style={{ height: "100%" }}
//         />
//       </div>

//       <Tooltip id="remove-variable-tooltip" place="top" />
//     </div>
//   );
// }

// frontend/src/components/simone/VariableList.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, { useCallback, useMemo, useState, useEffect } from "react"; // React Hooks für Zustand, Memo und Callback.
import { useSimoneContext } from "@/contexts/SimoneContext"; // Importiert den SimoneContext für SIMONE-spezifischen Zustand.
import { useTheme } from "@/contexts/ThemeContext"; // Importiert den Theme-Kontext für Theme-Anpassungen der UI.
import { FiList, FiTrash2 } from "react-icons/fi"; // Importiert Icons (Liste, Mülleimer).
import { Tooltip } from "react-tooltip"; // Importiert die Tooltip-Komponente.
import { DataGrid, type Column } from "react-data-grid"; // Komponenten für ein leistungsstarkes Datengitter.
import "react-data-grid/lib/styles.css"; // Standard-CSS für react-data-grid.

/**
 * -------------------------------------------------------------------
 * ✅ Interface: VariableRowData
 * Definiert die Datenstruktur für eine Zeile in der Variablenliste (DataGrid).
 * -------------------------------------------------------------------
 */
interface VariableRowData {
  variableName: string; // Der Name der Variable.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: VariableList
 * Eine Komponente, die eine Liste der für das Datenlesen ausgewählten Variablen anzeigt.
 * Sie nutzt `react-data-grid` für die Anzeige und ermöglicht das Entfernen von
 * Variablen aus der Liste. Die Liste ist mit dem `SimoneContext` verbunden,
 * um die zu lesenden Variablen zentral zu verwalten.
 * -------------------------------------------------------------------
 */
export default function VariableList() {
  // Holt notwendige Zustände und Setter-Funktionen aus dem SimoneContext.
  const { simoneState, setVariablesToRead } = useSimoneContext();
  const { theme } = useTheme(); // Holt das aktuelle Theme für Styling-Anpassungen.
  const { variablesToRead } = simoneState; // Die Liste der zu lesenden Variablen aus dem Kontext.

  // Lokaler Zustand für die Zeilen des Datengitters.
  const [rows, setRows] = useState<VariableRowData[]>([]);

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Zeilen synchronisieren
   * Dieser Hook wird ausgelöst, wenn sich die 'variablesToRead'-Liste
   * im SimoneContext ändert. Er aktualisiert die Zeilen des Datengitters
   * entsprechend.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    // Wandelt die Liste der zu lesenden Variablen in das Format für die DataGrid-Zeilen um.
    setRows(variablesToRead.map((v) => ({ variableName: v.variableName })));
  }, [variablesToRead]); // Abhängigkeit: Effekt wird bei Änderungen von `variablesToRead` ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleRemove
   * Entfernt eine Variable aus der Liste der zu lesenden Variablen.
   * Aktualisiert den 'variablesToRead'-Zustand im SimoneContext.
   * Verwendet `useCallback` zur Optimierung.
   * @param variableName - Der Name der zu entfernenden Variable.
   * -------------------------------------------------------------------
   */
  const handleRemove = useCallback(
    (variableName: string) => {
      // Aktualisiert den Zustand der zu lesenden Variablen, indem die entsprechende Variable herausgefiltert wird.
      setVariablesToRead((prev) =>
        prev.filter((v) => v.variableName !== variableName)
      );
    },
    [setVariablesToRead] // Abhängigkeit: Funktion wird neu erstellt, wenn `setVariablesToRead` sich ändert.
  );

  /**
   * -------------------------------------------------------------------
   * ✅ Spaltendefinition für das Datenraster (DataGrid)
   * `useMemo` wird verwendet, um die Spaltendefinition nur dann neu zu erstellen,
   * wenn sich 'handleRemove' ändert.
   * -------------------------------------------------------------------
   */
  const columns: Column<VariableRowData>[] = useMemo(
    () => [
      {
        key: "variableName", // Eindeutiger Schlüssel für die Spalte.
        name: "Variablenname", // Anzeigename der Spalte.
        resizable: true, // Ermöglicht Größenänderung.
        sortable: true, // Ermöglicht Sortieren.
      },
      {
        key: "actions", // Schlüssel für die Aktionen-Spalte.
        name: "", // Keine Überschrift für diese Spalte.
        width: 60, // Feste Breite.
        resizable: false, // Nicht größenänderbar.
        sortable: false, // Nicht sortierbar.
        renderCell: ({ row }) => (
          // Rendert eine Zelle mit einem "Entfernen"-Button.
          <div className="flex items-center justify-center h-full">
            <button
              onClick={() => handleRemove(row.variableName)} // Klick-Handler zum Entfernen der Variable.
              className="btn-icon-ghost text-[var(--color-danger)]" // Stil für Ghost-Icon-Button mit roter Farbe.
              data-tooltip-id="remove-variable-tooltip" // ID für den Tooltip.
              data-tooltip-content="Variable entfernen" // Inhalt des Tooltips.
            >
              <FiTrash2 className="h-5 w-5" /> {/* Mülleimer-Icon. */}
            </button>
          </div>
        ),
      },
    ],
    [handleRemove] // Abhängigkeit: Spalten werden neu erstellt, wenn sich 'handleRemove' ändert.
  );

  return (
    <div className="p-4 border border-[var(--border-color)] rounded-lg shadow-sm bg-[var(--color-surface)] h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        <h4 className="text-md font-semibold text-[var(--color-text-primary)] flex items-center">
          <FiList className="mr-2" /> {/* Listen-Icon. */}
          Ausgewählte Variablen ({rows.length}){" "}
          {/* Zähler der ausgewählten Variablen. */}
        </h4>
      </div>
      <div className="flex-grow">
        {/* Datengitter-Komponente */}
        <DataGrid
          columns={columns} // Die definierten Spalten.
          rows={rows} // Die Zeilendaten.
          rowKeyGetter={(row) => row.variableName} // Funktion zum Abrufen des eindeutigen Zeilenschlüssels.
          className={theme === "dark" ? "rdg-dark" : "rdg-light"} // Theme-Klasse für das Gitter.
          style={{ height: "100%" }} // Gitter füllt den Container aus.
        />
      </div>
      <Tooltip id="remove-variable-tooltip" place="top" />{" "}
      {/* Tooltip für den "Entfernen"-Button. */}
    </div>
  );
}
