// "use client";

// import React, { useState, useEffect, useCallback /*useMemo*/ } from "react";
// import { useSimoneContext } from "@/contexts/SimoneContext";
// import { useTheme } from "@/contexts/ThemeContext";
// import { apiClient } from "@/lib/apiClient";
// import { ScenarioListItemDto, ReadDataResponseDto } from "@/types";
// import toast from "react-hot-toast";
// import * as XLSX from "xlsx";

// import {
//   DataGrid,
//   SelectColumn,
//   textEditor as TextEditor,
//   type Column,
// } from "react-data-grid";
// import "react-data-grid/lib/styles.css";

// import {
//   FiAlertTriangle,
//   FiPlay,
//   FiRefreshCw,
//   FiDownload,
//   FiEdit3,
//   FiSave,
// } from "react-icons/fi";

// /**
//  * Defines the structure of the data for a row in the data grid.
//  */
// interface GridRowData {
//   scenarioName: string;
//   [key: string]: string | number | null | undefined;
// }

// interface DataReaderMatrixProps {
//   onSelectionChange: (scenarios: ScenarioListItemDto[]) => void;
// }

// // Type inference for event and prop types from the DataGrid component.
// type GridProps = React.ComponentProps<typeof DataGrid<GridRowData>>;
// type CellClickArgs = Parameters<NonNullable<GridProps["onCellClick"]>>[0];
// type RowsChangeData = Parameters<NonNullable<GridProps["onRowsChange"]>>[1];
// type FillEvent = Parameters<NonNullable<GridProps["onFill"]>>[0];
// type RenderCellProps = Parameters<
//   NonNullable<Column<GridRowData>["renderCell"]>
// >[0];

// /**
//  * Helper function to apply a theme-based CSS class for editable cells.
//  */
// const getEditableCellClass = (theme: string | null) => {
//   return theme === "dark" ? "editable-cell-dark" : "editable-cell-light";
// };

// /**
//  * A component that displays a data matrix for reading and writing scenario data.
//  */
// export default function DataReaderMatrix({
//   onSelectionChange,
// }: DataReaderMatrixProps) {
//   const { simoneState, fetchScenarios } = useSimoneContext();
//   const { theme } = useTheme();
//   const { activeNetwork, variablesToRead, scenarios } = simoneState;

//   const [isLoading, setIsLoading] = useState({
//     scenarios: true,
//     reading: false,
//     writing: false,
//   });

//   const [rows, setRows] = useState<GridRowData[]>([]);
//   const [columns, setColumns] = useState<Column<GridRowData>[]>([]);
//   const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(
//     () => new Set()
//   );
//   const [isWriteMode, setIsWriteMode] = useState(false);
//   const [editedCells, setEditedCells] = useState<Record<string, number>>({});

//   useEffect(() => {
//     if (activeNetwork) {
//       setIsLoading((prev) => ({ ...prev, scenarios: true }));
//       fetchScenarios().finally(() => {
//         setIsLoading((prev) => ({ ...prev, scenarios: false }));
//       });
//     }
//   }, [activeNetwork, fetchScenarios]);

//   useEffect(() => {
//     const initialRowData = scenarios.map((scenario) => ({
//       scenarioName: scenario.name,
//     }));
//     setRows(initialRowData);

//     const scenarioNamesFromContext = new Set(scenarios.map((s) => s.name));
//     setSelectedRows((currentSelected) => {
//       const newSelected = new Set<string>();
//       for (const selectedName of currentSelected) {
//         if (scenarioNamesFromContext.has(selectedName)) {
//           newSelected.add(selectedName);
//         }
//       }
//       return newSelected;
//     });
//   }, [scenarios]);

//   useEffect(() => {
//     const staticCols: Column<GridRowData>[] = [
//       SelectColumn,
//       {
//         key: "scenarioName",
//         name: "Szenario",
//         width: 250,
//         frozen: true,
//         resizable: true,
//       },
//     ];

//     const dynamicCols: Column<GridRowData>[] = variablesToRead.map(
//       (variable) => ({
//         key: variable.variableName,
//         name: variable.variableName,
//         width: 150,
//         resizable: true,
//         editable: isWriteMode,
//         cellClass: isWriteMode ? getEditableCellClass(theme) : undefined,
//         renderEditCell: TextEditor,
//         renderCell: (props: RenderCellProps) => {
//           const value = props.row[variable.variableName];
//           return typeof value === "number"
//             ? value.toFixed(4)
//             : String(value ?? "");
//         },
//       })
//     );

//     setColumns([...staticCols, ...dynamicCols]);
//   }, [variablesToRead, isWriteMode, theme]);

//   const rowKeyGetter = useCallback((row: GridRowData) => {
//     return row.scenarioName;
//   }, []);

//   const handleCellClick = (args: CellClickArgs) => {
//     if (args.column.editable) {
//       args.selectCell(true);
//     }
//   };

//   const handleRowsChange = (newRows: GridRowData[], data: RowsChangeData) => {
//     setRows(newRows);
//     if (!isWriteMode || !data.column.key) return;

//     for (const index of data.indexes) {
//       const updatedRow = newRows[index];
//       const variableName = data.column.key;
//       const value = updatedRow[variableName];
//       const newValue =
//         typeof value === "string" ? parseFloat(value) : (value as number);

//       if (variableName && !isNaN(newValue)) {
//         const key = `${updatedRow.scenarioName}.${variableName}`;
//         setEditedCells((prev) => ({ ...prev, [key]: newValue }));
//       }
//     }
//   };

//   const handleFill = (event: FillEvent): GridRowData => {
//     const { columnKey, sourceRow, targetRow } = event;
//     const updatedRow = { ...targetRow, [columnKey]: sourceRow[columnKey] };
//     const value = updatedRow[columnKey];

//     const numericValue =
//       typeof value === "string" ? parseFloat(value) : (value as number);
//     if (!isNaN(numericValue)) {
//       const key = `${updatedRow.scenarioName}.${columnKey}`;
//       setEditedCells((prev) => ({ ...prev, [key]: numericValue }));
//     }

//     return updatedRow;
//   };

//   const handleReadData = async () => {
//     if (selectedRows.size === 0)
//       return toast.error("Bitte wählen Sie mindestens ein Szenario aus.");
//     if (variablesToRead.length === 0)
//       return toast.error("Keine Variablen ausgewählt.");
//     if (!activeNetwork) return toast.error("Kein aktives Netzwerk ausgewählt.");

//     setIsLoading((prev) => ({ ...prev, reading: true }));
//     const toastId = toast.loading("Lese Daten...");

//     for (const scenarioName of selectedRows) {
//       try {
//         await apiClient("/simone/scenarios/open", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             networkName: activeNetwork,
//             scenarioName,
//             mode: "READ",
//           }),
//         });
//         const readResponse = await apiClient("/simone/scenarios/read-array", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ variables: variablesToRead }),
//         });
//         const readData: ReadDataResponseDto = await readResponse.json();
//         if (!readResponse.ok) throw new Error(readData.message);

//         const updates = readData.results.reduce(
//           (acc: Record<string, number | null>, result) => {
//             const variable = variablesToRead.find(
//               (v) => v.objId === result.objId && v.extId === result.extId
//             );
//             if (variable) acc[variable.variableName] = result.value;
//             return acc;
//           },
//           {}
//         );

//         setRows((currentRows) =>
//           currentRows.map((row) =>
//             row.scenarioName === scenarioName ? { ...row, ...updates } : row
//           )
//         );
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       } catch (err: any) {
//         console.error(err);
//         toast.error(err.message || `Fehler beim Lesen von: ${scenarioName}`);
//       } finally {
//         await apiClient("/simone/scenarios/close", { method: "POST" }).catch(
//           (e) =>
//             console.error(
//               "Aufräumen fehlgeschlagen: Schließen des Szenarios ignoriert.",
//               e
//             )
//         );
//       }
//     }
//     toast.success("Datenlesevorgang abgeschlossen.", { id: toastId });
//     setIsLoading((prev) => ({ ...prev, reading: false }));
//   };

//   const handleWriteData = async () => {
//     if (selectedRows.size === 0) {
//       return toast.error("Bitte wählen Sie mindestens ein Szenario aus.");
//     }
//     if (Object.keys(editedCells).length === 0) {
//       return toast.error("Keine bearbeiteten Werte zum Schreiben vorhanden.");
//     }
//     if (!activeNetwork) {
//       return toast.error("Kein aktives Netzwerk ausgewählt.");
//     }

//     setIsLoading((prev) => ({ ...prev, writing: true }));
//     const toastId = toast.loading("Schreibe Daten...");

//     const editsByScenario: Record<
//       string,
//       { objId: number; extId: number; value: number }[]
//     > = {};

//     Object.entries(editedCells).forEach(([key, value]) => {
//       const [scenarioName, ...varParts] = key.split(".");
//       if (!selectedRows.has(scenarioName)) return;
//       const variableName = varParts.join(".");
//       const variable = variablesToRead.find(
//         (v) => v.variableName === variableName
//       );
//       if (!variable) return;
//       editsByScenario[scenarioName] = editsByScenario[scenarioName] || [];
//       editsByScenario[scenarioName].push({
//         objId: variable.objId,
//         extId: variable.extId,
//         value,
//       });
//     });

//     try {
//       for (const scenarioName of Object.keys(editsByScenario)) {
//         const variables = editsByScenario[scenarioName];
//         if (variables.length === 0) continue;

//         // --- KORREKTUR: networkName zum Request Body hinzufügen ---
//         await apiClient("/simone/scenarios/open", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             networkName: activeNetwork,
//             scenarioName,
//             mode: "WRITE",
//           }),
//         });

//         const writeRes = await apiClient("/simone/scenarios/write-array", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ variables }),
//         });
//         const writeJson = await writeRes.json();
//         if (!writeRes.ok) {
//           throw new Error(
//             writeJson.message || `Fehler beim Schreiben in ${scenarioName}`
//           );
//         }

//         await apiClient("/simone/scenarios/close", { method: "POST" });
//       }

//       toast.success("Daten erfolgreich geschrieben.", { id: toastId });
//       setEditedCells({});
//       await handleReadData();
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.message || "Fehler beim Schreiben der Daten.", {
//         id: toastId,
//       });
//     } finally {
//       setIsLoading((prev) => ({ ...prev, writing: false }));
//     }
//   };

//   const handleExportToExcel = () => {
//     if (rows.length === 0) return toast.error("Nichts zu exportieren.");
//     const worksheet = XLSX.utils.json_to_sheet(rows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "DataMatrix");
//     XLSX.writeFile(workbook, "DataMatrix.xlsx");
//     toast.success("Nach Excel exportiert.");
//   };

//    if (!activeNetwork) {
//     return (
//       <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-color)] rounded-lg text-center h-64">
//         <FiAlertTriangle className="mx-auto h-10 w-10 text-[var(--color-warning)]" />
//         <h4 className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
//           Kein Netzwerk ausgewählt
//         </h4>
//         <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//           Bitte wählen Sie ein aktives Netzwerk im Reiter Einstellungen.
//         </p>
//       </div>
//     );
//   }

//   const handleRowSelectionChange = (newSelectedKeys: ReadonlySet<string>) => {
//     setSelectedRows(newSelectedKeys);
//     const selectedScenarios = scenarios.filter((s) =>
//       newSelectedKeys.has(s.name)
//     );
//     onSelectionChange(selectedScenarios);
//   };

//   // --- DYNAMIC HEIGHT CALCULATION ---
//   const headerRowHeight = 45;
//   const rowHeight = 40;
//   //const maxRows = 30;
//   const calculatedHeight = headerRowHeight + rows.length * rowHeight + 2;
//   const maxHeight = 800; //headerRowHeight + maxRows * rowHeight + 2;
//   const gridHeight = Math.min(calculatedHeight, maxHeight);

//   return (
//     <div className="space-y-4">
//       <style>{`
//   :root {
//     --rdg-grid-border-color: color-mix(in srgb, var(--border-color) 70%, transparent);
//   }

//   .rdg {
//     contain: strict;
//     --rdg-selected-row-background-color: transparent;
//     color: var(--color-text-primary); /* default text color */
//   }

//   /* Cells */
//   .rdg-cell {
//     background-color: var(--color-surface);
//     border-right: 1px solid var(--rdg-grid-border-color);
//     border-bottom: 1px solid var(--rdg-grid-border-color);
//     contain: paint;
//     color: inherit; /* follows grid text color */
//   }

//   /* Selected row text coloring - dark mode only */
//   .rdg-dark .rdg-row[aria-selected='true'] .rdg-cell {
//     background-color: rgba(130, 180, 255, 0.92);
//     color: var(--color-text-inverted); /* inverted text only in dark */
//   }

//   .rdg-dark .rdg-row[aria-selected='true']:hover .rdg-cell {
//     background-color: rgba(122, 181, 199, 0.84);
//   }

//   .rdg-light .rdg-row[aria-selected='true'] .rdg-cell {
//     background-color: rgba(130, 180, 255, 0.92);
//     color: var(--color-text-primary); /* preserve dark text in light mode */
//   }

//   .rdg-light .rdg-row[aria-selected='true']:hover .rdg-cell {
//     background-color: rgba(122, 181, 199, 0.84);
//   }

//   /* Column header styling */
//   .rdg-header-row .rdg-cell {
//     font-weight: 600;
//     color: var(--color-text-primary);
//     background-color: var(--color-surface); /* ensures contrast in both modes */
//   }

//   .rdg-dark .rdg-header-row .rdg-cell {
//     color: white;
//   }

//   /* Editable cell */
//   .editable-cell {
//     background-color: color-mix(in srgb, var(--color-accent) 15%, var(--color-surface));
//   }

//   /* Scrollbar visibility (WebKit-based) */
//   .rdg::-webkit-scrollbar {
//     height: 10px;
//     width: 10px;
//   }

//   .rdg::-webkit-scrollbar-thumb {
//     background-color: rgba(150, 150, 150, 0.6);
//     border-radius: 6px;
//   }

//   .rdg::-webkit-scrollbar-track {
//     background: transparent;
//   }

//   /* Scrollbar for Firefox */
//   .rdg {
//     scrollbar-color: rgba(150, 150, 150, 0.6) transparent;
//     scrollbar-width: thin;
//   }
// `}</style>

//       <div className="flex justify-between items-center">
//         <h4 className="text-lg font-semibold text-[var(--color-text-primary)]">
//           Szenarien & Datenmatrix
//         </h4>
//         <div className="flex gap-4 items-center">
//           <button
//             onClick={() => fetchScenarios()}
//             disabled={isLoading.scenarios}
//             className="btn-secondary flex items-center disabled:opacity-50"
//           >
//             <FiRefreshCw className="mr-2" />
//             Szenarien aktualisieren
//           </button>
//           <button
//             onClick={handleReadData}
//             disabled={isLoading.reading || isWriteMode}
//             className="btn-primary flex items-center disabled:opacity-50"
//           >
//             <FiPlay className="mr-2" />
//             Daten lesen
//           </button>
//           <button
//             onClick={() => setIsWriteMode((prev) => !prev)}
//             className={`btn-secondary flex items-center ${
//               isWriteMode ? "bg-orange-600 hover:bg-orange-700 text-white" : ""
//             }`}
//           >
//             <FiEdit3 className="mr-2" />
//             {isWriteMode ? "Schreibmodus beenden" : "Schreibmodus aktivieren"}
//           </button>
//           <button
//             onClick={handleWriteData}
//             disabled={!isWriteMode || isLoading.writing}
//             className="btn-primary bg-green-600 hover:bg-green-700 flex items-center disabled:opacity-50"
//           >
//             <FiSave className="mr-2" />
//             In SIMONE schreiben
//           </button>
//           <button
//             onClick={handleExportToExcel}
//             className="btn-primary bg-blue-600 hover:bg-blue-700 flex items-center"
//           >
//             <FiDownload className="mr-2" />
//             Nach Excel exportieren
//           </button>
//         </div>
//       </div>

//       {/* Scrollable container directly for DataGrid */}
//       <div className="overflow-x-auto">
//         <div className="min-w-[1200px]" style={{ height: `${gridHeight}px` }}>
//           <DataGrid
//             columns={columns}
//             rows={rows}
//             rowKeyGetter={rowKeyGetter}
//             selectedRows={selectedRows}
//             onSelectedRowsChange={handleRowSelectionChange}
//             onRowsChange={handleRowsChange}
//             onCellClick={handleCellClick}
//             onFill={handleFill}
//             className={theme === "dark" ? "rdg-dark" : "rdg-light"}
//             style={{ height: "100%" }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, { useState, useEffect, useCallback /*useMemo*/ } from "react"; // React Hooks für Zustand, Lebenszyklus und Memo.
import { useSimoneContext } from "@/contexts/SimoneContext"; // Importiert den SimoneContext für SIMONE-spezifischen Zustand.
import { useTheme } from "@/contexts/ThemeContext"; // Importiert den Theme-Kontext für Theme-Anpassungen der UI.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { apiClient, ApiError } from "@/lib/apiClient"; // Importiert den API-Client und den benutzerdefinierten Fehler-Typ.
import { ScenarioListItemDto, ReadDataResponseDto } from "@/types"; // Typdefinitionen für Szenarien und Datenantworten.
import toast from "react-hot-toast"; // Bibliothek für Pop-up-Benachrichtigungen.
import * as XLSX from "xlsx"; // Importiert die xlsx-Bibliothek für Excel-Operationen.

import {
  DataGrid, // Hauptkomponente des Datengitters.
  SelectColumn, // Spalte für Zeilenauswahl.
  textEditor as TextEditor, // Texteditor für editierbare Zellen.
  type Column, // Typdefinition für Spalten.
} from "react-data-grid"; // Komponenten für ein leistungsstarkes Datengitter.
import "react-data-grid/lib/styles.css"; // Standard-CSS für react-data-grid.

import {
  FiAlertTriangle, // Icon für Warnungen.
  FiPlay, // Icon für "Abspielen/Lesen".
  FiRefreshCw, // Icon für Aktualisieren.
  FiDownload, // Icon für Herunterladen/Exportieren.
  FiEdit3, // Icon für Bearbeiten/Schreibmodus.
  FiSave, // Icon für Speichern.
} from "react-icons/fi"; // Importiert Icons von Feather Icons.

/**
 * -------------------------------------------------------------------
 * ✅ Interface: GridRowData
 * Definiert die Struktur der Daten für eine Zeile im Datengitter.
 * Jede Zeile hat einen `scenarioName` und kann beliebige weitere Schlüssel
 * für die Variablendaten enthalten.
 * -------------------------------------------------------------------
 */
interface GridRowData {
  scenarioName: string; // Der Name des Szenarios.
  [key: string]: string | number | null | undefined; // Dynamische Schlüssel für Variablendaten.
}

/**
 * -------------------------------------------------------------------
 * ✅ Interface: DataReaderMatrixProps
 * Definiert die Props (Eigenschaften) für die DataReaderMatrix-Komponente.
 * -------------------------------------------------------------------
 */
interface DataReaderMatrixProps {
  onSelectionChange: (scenarios: ScenarioListItemDto[]) => void; // Callback, der aufgerufen wird, wenn sich die Auswahl der Szenarien ändert.
}

// Typ-Inferenzen für Event- und Prop-Typen aus der DataGrid-Komponente.
type GridProps = React.ComponentProps<typeof DataGrid<GridRowData>>;
type CellClickArgs = Parameters<NonNullable<GridProps["onCellClick"]>>[0]; // Argumente bei Zellklick.
type RowsChangeData = Parameters<NonNullable<GridProps["onRowsChange"]>>[1]; // Daten bei Zeilenänderung.
type FillEvent = Parameters<NonNullable<GridProps["onFill"]>>[0]; // Ereignis beim Ausfüllen (Drag-Fill).
type RenderCellProps = Parameters<
  NonNullable<Column<GridRowData>["renderCell"]>
>[0]; // Props für das Rendern einer Zelle.

/**
 * -------------------------------------------------------------------
 * ✅ Hilfsfunktion: getEditableCellClass
 * Gibt eine Theme-basierte CSS-Klasse für editierbare Zellen zurück.
 * Dies ermöglicht eine visuelle Unterscheidung von editierbaren Zellen
 * je nach aktuellem Theme (hell/dunkel).
 * -------------------------------------------------------------------
 */
const getEditableCellClass = (theme: string | null) => {
  // Gibt unterschiedliche Klassen basierend auf dem aktuellen Theme zurück.
  return theme === "dark" ? "editable-cell-dark" : "editable-cell-light";
};

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: DataReaderMatrix
 * Eine Komponente, die eine Datenmatrix für das Lesen und Schreiben
 * von Szenariodaten anzeigt. Sie ermöglicht es Benutzern, Daten aus
 * ausgewählten Szenarien zu lesen, Werte zu bearbeiten und diese
 * zurück in die SIMONE-Simulation zu schreiben.
 * -------------------------------------------------------------------
 */
export default function DataReaderMatrix({
  onSelectionChange, // Callback, der bei Auswahländerungen aufgerufen wird.
}: DataReaderMatrixProps) {
  // Holt SIMONE-spezifische Zustände und Funktionen aus dem SimoneContext.
  const { simoneState, fetchScenarios } = useSimoneContext();
  const { theme } = useTheme(); // Holt das aktuelle Theme.
  const { activeNetwork, variablesToRead, scenarios } = simoneState; // Aktives Netzwerk, Variablen und Szenarien aus dem Kontext.

  // Ladezustände für verschiedene Operationen.
  const [isLoading, setIsLoading] = useState({
    scenarios: true, // Szenarien-Liste wird geladen.
    reading: false, // Daten werden gelesen.
    writing: false, // Daten werden geschrieben.
  });

  // Zustandsvariablen für das Datengitter.
  const [rows, setRows] = useState<GridRowData[]>([]); // Die Datenzeilen des Gitters.
  const [columns, setColumns] = useState<Column<GridRowData>[]>([]); // Die Spaltendefinitionen des Gitters.
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(
    () => new Set()
  ); // Die IDs der aktuell ausgewählten Zeilen.

  // Zustandsvariablen für den Schreibmodus und bearbeitete Zellen.
  const [isWriteMode, setIsWriteMode] = useState(false); // Zeigt an, ob sich das Gitter im Schreibmodus befindet.
  const [editedCells, setEditedCells] = useState<Record<string, number>>({}); // Speichert die bearbeiteten Zellwerte (Schlüssel: "Szenarioname.Variablenname").

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Szenarien laden beim Wechsel des aktiven Netzwerks
   * Dieser Hook wird ausgelöst, wenn sich das `activeNetwork` ändert.
   * Er ruft die Liste der Szenarien ab, um das Gitter zu füllen.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    if (activeNetwork) {
      setIsLoading((prev) => ({ ...prev, scenarios: true })); // Setzt Ladezustand für Szenarien.
      fetchScenarios().finally(() => {
        // Ruft die Szenarien ab und beendet den Ladezustand, sobald der Abruf abgeschlossen ist.
        setIsLoading((prev) => ({ ...prev, scenarios: false }));
      });
    }
  }, [activeNetwork, fetchScenarios]); // Abhängigkeiten: wird bei Änderungen von `activeNetwork` oder `fetchScenarios` ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Zeilen initialisieren und Auswahl synchronisieren
   * Dieser Hook wird ausgelöst, wenn sich die `scenarios`-Liste ändert.
   * Er initialisiert die Zeilen des Datengitters und synchronisiert die
   * Auswahl, um sicherzustellen, dass nur noch existierende Szenarien
   * ausgewählt sind.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    // Initialisiert die Zeilendaten mit den Szenarionamen.
    const initialRowData = scenarios.map((scenario) => ({
      scenarioName: scenario.name,
    }));
    setRows(initialRowData);

    // Erstellt ein Set der aktuellen Szenarionamen aus dem Kontext.
    const scenarioNamesFromContext = new Set(scenarios.map((s) => s.name));
    setSelectedRows((currentSelected) => {
      // Filtert die aktuell ausgewählten Zeilen, um nur die noch existierenden zu behalten.
      const newSelected = new Set<string>();
      for (const selectedName of currentSelected) {
        if (scenarioNamesFromContext.has(selectedName)) {
          newSelected.add(selectedName);
        }
      }
      return newSelected; // Gibt die aktualisierte Auswahl zurück.
    });
  }, [scenarios]); // Abhängigkeit: wird bei Änderungen der `scenarios`-Liste ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Spalten definieren
   * Dieser Hook wird ausgelöst, wenn sich `variablesToRead`, `isWriteMode`
   * oder das `theme` ändern. Er definiert die Spalten des Datengitters
   * dynamisch basierend auf den ausgewählten Variablen und dem Schreibmodus.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    // Statische Spalten (Auswahl-Checkbox und Szenarioname).
    const staticCols: Column<GridRowData>[] = [
      SelectColumn, // Standard-Spalte für Zeilenauswahl.
      {
        key: "scenarioName",
        name: "Szenario",
        width: 250,
        frozen: true, // Spalte ist fixiert (friert ein beim horizontalen Scrollen).
        resizable: true, // Ermöglicht Größenänderung.
      },
    ];

    // Dynamische Spalten basierend auf den auszuwählenden Variablen.
    const dynamicCols: Column<GridRowData>[] = variablesToRead.map(
      (variable) => ({
        key: variable.variableName, // Eindeutiger Schlüssel für die Spalte.
        name: variable.variableName, // Anzeigename der Spalte.
        width: 150,
        resizable: true,
        editable: isWriteMode, // Spalte ist nur im Schreibmodus editierbar.
        cellClass: isWriteMode ? getEditableCellClass(theme) : undefined, // Fügt Theme-basierte Klasse für editierbare Zellen hinzu.
        renderEditCell: TextEditor, // Verwendet den Standard-Texteditor für editierbare Zellen.
        renderCell: (props: RenderCellProps) => {
          // Rendert den Zellinhalt.
          const value = props.row[variable.variableName];
          return typeof value === "number" // Formatiert Zahlen auf 4 Dezimalstellen.
            ? value.toFixed(4)
            : String(value ?? ""); // Konvertiert andere Werte zu String (leerer String für null/undefined).
        },
      })
    );

    setColumns([...staticCols, ...dynamicCols]); // Setzt die kombinierten Spalten.
  }, [variablesToRead, isWriteMode, theme]); // Abhängigkeiten für den Hook.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: rowKeyGetter
   * Eine Callback-Funktion, die `react-data-grid` verwendet, um einen
   * eindeutigen Schlüssel für jede Zeile zu erhalten. Hier ist es der Szenarioname.
   * Verwendet `useCallback` zur Optimierung.
   * -------------------------------------------------------------------
   */
  const rowKeyGetter = useCallback((row: GridRowData) => {
    return row.scenarioName; // Szenarioname als eindeutiger Schlüssel.
  }, []);

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleCellClick
   * Behandelt Klicks auf Zellen im Datengitter.
   * Wenn eine Zelle editierbar ist, wird sie in den Bearbeitungsmodus versetzt.
   * -------------------------------------------------------------------
   */
  const handleCellClick = (args: CellClickArgs) => {
    if (args.column.editable) {
      args.selectCell(true); // Wählt die Zelle aus und setzt sie in den Bearbeitungsmodus.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleRowsChange
   * Wird aufgerufen, wenn sich Zeilendaten im Gitter ändern (z.B. durch Bearbeiten).
   * Aktualisiert den 'rows'-Zustand und verfolgt bearbeitete Zellen.
   * -------------------------------------------------------------------
   */
  const handleRowsChange = (newRows: GridRowData[], data: RowsChangeData) => {
    setRows(newRows); // Aktualisiert die Zeilendaten.
    if (!isWriteMode || !data.column.key) return; // Nur im Schreibmodus relevant.

    // Durchläuft die geänderten Zeilen, um die bearbeiteten Zellen zu verfolgen.
    for (const index of data.indexes) {
      const updatedRow = newRows[index];
      const variableName = data.column.key; // Name der geänderten Variable (Spaltenschlüssel).
      const value = updatedRow[variableName]; // Der neue Wert.
      const newValue =
        typeof value === "string" ? parseFloat(value) : (value as number); // Konvertiert zu Zahl.

      if (variableName && !isNaN(newValue)) {
        const key = `${updatedRow.scenarioName}.${variableName}`; // Eindeutiger Schlüssel für die bearbeitete Zelle.
        setEditedCells((prev) => ({ ...prev, [key]: newValue })); // Speichert den bearbeiteten Wert.
      }
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleFill
   * Wird aufgerufen, wenn die "Auto-Ausfüllen"-Funktion (Drag-Fill)
   * des Datengitters verwendet wird.
   * Aktualisiert die Zeilendaten und verfolgt die bearbeiteten Zellen.
   * -------------------------------------------------------------------
   */
  const handleFill = (event: FillEvent): GridRowData => {
    const { columnKey, sourceRow, targetRow } = event; // Informationen zum Ausfüllen.
    const updatedRow = { ...targetRow, [columnKey]: sourceRow[columnKey] }; // Die aktualisierte Zielzeile.
    const value = updatedRow[columnKey];

    const numericValue =
      typeof value === "string" ? parseFloat(value) : (value as number);
    if (!isNaN(numericValue)) {
      const key = `${updatedRow.scenarioName}.${columnKey}`;
      setEditedCells((prev) => ({ ...prev, [key]: numericValue })); // Speichert den bearbeiteten Wert.
    }

    return updatedRow; // Gibt die aktualisierte Zeile zurück.
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleReadData
   * Liest Daten für die aktuell ausgewählten Szenarien und Variablen
   * aus der SIMONE-Simulation.
   * -------------------------------------------------------------------
   */
  const handleReadData = async () => {
    // Überprüfungen vor dem Lesen der Daten.
    if (selectedRows.size === 0)
      return toast.error("Bitte wählen Sie mindestens ein Szenario aus.");
    if (variablesToRead.length === 0)
      return toast.error("Keine Variablen ausgewählt.");
    if (!activeNetwork) return toast.error("Kein aktives Netzwerk ausgewählt.");

    setIsLoading((prev) => ({ ...prev, reading: true })); // Setzt Ladezustand für Lesen.
    const toastId = toast.loading("Lese Daten..."); // Zeigt Lade-Toast an.

    for (const scenarioName of selectedRows) {
      // Für jedes ausgewählte Szenario:
      try {
        // Schritt 1: Szenario im Lesemodus öffnen.
        await apiClient("/simone/scenarios/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            networkName: activeNetwork,
            scenarioName,
            mode: "READ",
          }),
        });
        // Schritt 2: Variablenwerte lesen.
        const readResponse = await apiClient("/simone/scenarios/read-array", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variables: variablesToRead }), // Sendet die zu lesenden Variablen.
        });
        const readData: ReadDataResponseDto = await readResponse.json();
        if (!readResponse.ok) throw new Error(readData.message); // Fehler, wenn API-Antwort nicht ok ist.

        // Aktualisiert die Zeilendaten mit den gelesenen Werten.
        const updates = readData.results.reduce(
          (acc: Record<string, number | null>, result) => {
            const variable = variablesToRead.find(
              (v) => v.objId === result.objId && v.extId === result.extId
            );
            if (variable) acc[variable.variableName] = result.value; // Fügt den Wert zur Variablen hinzu.
            return acc;
          },
          {}
        );

        setRows((currentRows) =>
          currentRows.map(
            (row) =>
              row.scenarioName === scenarioName ? { ...row, ...updates } : row // Aktualisiert die Zeile mit den neuen Werten.
          )
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        // Fehlerbehandlung beim Lesen von Daten für ein Szenario.
        console.error(err);
        toast.error(err.message || `Fehler beim Lesen von: ${scenarioName}`);
      } finally {
        // Schritt 3: Szenario schließen, unabhängig von Erfolg oder Fehler.
        await apiClient("/simone/scenarios/close", { method: "POST" }).catch(
          (e) =>
            console.error(
              "Aufräumen fehlgeschlagen: Schließen des Szenarios ignoriert.",
              e
            )
        );
      }
    }
    toast.success("Datenlesevorgang abgeschlossen.", { id: toastId }); // Erfolgs-Toast.
    setIsLoading((prev) => ({ ...prev, reading: false })); // Beendet Ladezustand.
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleWriteData
   * Schreibt die bearbeiteten Daten aus dem Gitter zurück in die
   * SIMONE-Simulation.
   * -------------------------------------------------------------------
   */
  const handleWriteData = async () => {
    // Überprüfungen vor dem Schreiben der Daten.
    if (selectedRows.size === 0) {
      return toast.error("Bitte wählen Sie mindestens ein Szenario aus.");
    }
    if (Object.keys(editedCells).length === 0) {
      return toast.error("Keine bearbeiteten Werte zum Schreiben vorhanden.");
    }
    if (!activeNetwork) {
      return toast.error("Kein aktives Netzwerk ausgewählt.");
    }

    setIsLoading((prev) => ({ ...prev, writing: true })); // Setzt Ladezustand für Schreiben.
    const toastId = toast.loading("Schreibe Daten..."); // Zeigt Lade-Toast an.

    // Gruppiert die bearbeiteten Zellen nach Szenario.
    const editsByScenario: Record<
      string,
      { objId: number; extId: number; value: number }[]
    > = {};

    Object.entries(editedCells).forEach(([key, value]) => {
      const [scenarioName, ...varParts] = key.split("."); // Extrahiert Szenarioname und Variablenname.
      if (!selectedRows.has(scenarioName)) return; // Nur Änderungen für ausgewählte Szenarien berücksichtigen.
      const variableName = varParts.join("."); // Rekonstruiert den Variablennamen.
      const variable = variablesToRead.find(
        (v) => v.variableName === variableName
      ); // Findet die entsprechende Variablendefinition.
      if (!variable) return;
      editsByScenario[scenarioName] = editsByScenario[scenarioName] || [];
      editsByScenario[scenarioName].push({
        objId: variable.objId,
        extId: variable.extId,
        value,
      });
    });

    try {
      for (const scenarioName of Object.keys(editsByScenario)) {
        // Für jedes Szenario mit bearbeiteten Daten:
        const variables = editsByScenario[scenarioName];
        if (variables.length === 0) continue;

        // Schritt 1: Szenario im Schreibmodus öffnen.
        await apiClient("/simone/scenarios/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            networkName: activeNetwork, // Netzwerkname muss hier hinzugefügt werden.
            scenarioName,
            mode: "WRITE",
          }),
        });

        // Schritt 2: Daten schreiben.
        const writeRes = await apiClient("/simone/scenarios/write-array", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variables }), // Sendet die zu schreibenden Variablen.
        });
        const writeJson = await writeRes.json();
        if (!writeRes.ok) {
          throw new Error(
            writeJson.message || `Fehler beim Schreiben in ${scenarioName}`
          );
        }

        // Schritt 3: Szenario schließen.
        await apiClient("/simone/scenarios/close", { method: "POST" });
      }

      toast.success("Daten erfolgreich geschrieben.", { id: toastId }); // Erfolgs-Toast.
      setEditedCells({}); // Leert die Liste der bearbeiteten Zellen.
      await handleReadData(); // Liest die Daten nach dem Schreiben erneut, um den aktualisierten Zustand anzuzeigen.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Fehlerbehandlung beim Schreiben von Daten.
      console.error(err);
      toast.error(err.message || "Fehler beim Schreiben der Daten.", {
        id: toastId,
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, writing: false })); // Beendet Ladezustand.
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleExportToExcel
   * Exportiert die aktuellen Daten im Datengitter nach einer Excel-Datei.
   * -------------------------------------------------------------------
   */
  const handleExportToExcel = () => {
    if (rows.length === 0) return toast.error("Nichts zu exportieren."); // Fehlermeldung, wenn keine Daten vorhanden sind.
    const worksheet = XLSX.utils.json_to_sheet(rows); // Erstellt ein Worksheet aus den JSON-Daten.
    const workbook = XLSX.utils.book_new(); // Erstellt eine neue Workbook.
    XLSX.utils.book_append_sheet(workbook, worksheet, "DataMatrix"); // Fügt das Worksheet zur Workbook hinzu.
    XLSX.writeFile(workbook, "DataMatrix.xlsx"); // Speichert die Workbook als Excel-Datei.
    toast.success("Nach Excel exportiert."); // Erfolgs-Toast.
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Bedingtes Rendering: Kein aktives Netzwerk
   * Zeigt eine Warnmeldung an, wenn kein aktives Netzwerk ausgewählt ist.
   * -------------------------------------------------------------------
   */
  if (!activeNetwork) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-color)] rounded-lg text-center h-64">
        <FiAlertTriangle className="mx-auto h-10 w-10 text-[var(--color-warning)]" />{" "}
        {/* Warn-Icon. */}
        <h4 className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Kein Netzwerk ausgewählt
        </h4>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Bitte wählen Sie ein aktives Netzwerk im Reiter Einstellungen.
        </p>
      </div>
    );
  }

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleRowSelectionChange
   * Wird aufgerufen, wenn sich die Auswahl der Zeilen im Datengitter ändert.
   * Aktualisiert den 'selectedRows'-Zustand und ruft den übergeordneten
   * 'onSelectionChange'-Callback auf.
   * -------------------------------------------------------------------
   */
  const handleRowSelectionChange = (newSelectedKeys: ReadonlySet<string>) => {
    setSelectedRows(newSelectedKeys); // Aktualisiert die ausgewählten Zeilen.
    const selectedScenarios = scenarios.filter((s) =>
      newSelectedKeys.has(s.name)
    ); // Filtert die Szenarien basierend auf der Auswahl.
    onSelectionChange(selectedScenarios); // Ruft den Callback auf, um die Auswahl weiterzugeben.
  };

  // -------------------------------------------------------------------
  // ✅ Dynamische Höhenberechnung für das Datengitter
  // Berechnet die Höhe des Gitters basierend auf der Anzahl der Zeilen,
  // begrenzt jedoch auf eine maximale Höhe.
  // -------------------------------------------------------------------
  const headerRowHeight = 45; // Höhe der Kopfzeile.
  const rowHeight = 40; // Höhe jeder Datenzeile.
  //const maxRows = 30; // (Auskommentiert) Maximale Anzahl sichtbarer Zeilen.
  const calculatedHeight = headerRowHeight + rows.length * rowHeight + 2; // Berechnete Höhe.
  const maxHeight = 800; // Maximale Höhe des Gitters (in Pixeln).
  const gridHeight = Math.min(calculatedHeight, maxHeight); // Die tatsächliche Höhe, die verwendet wird.

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der DataReaderMatrix-Komponente
  // Enthält die Styling-Anpassungen für `react-data-grid`, die Aktionsleiste
  // mit Buttons und das Datengitter selbst.
  // -------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* -------------------------------------------------------------------
        ✅ Inline-CSS für react-data-grid Anpassungen
        Dieser Style-Block überschreibt und ergänzt die Standardstile von
        `react-data-grid`, um sie an das semantische Theme und das gewünschte
        Aussehen anzupassen.
        ------------------------------------------------------------------- */}
      <style>{`
 /* Definition einer spezifischen Randfarbe für das Gitter, die auf der globalen Randfarbe basiert. */
 :root {
   --rdg-grid-border-color: color-mix(in srgb, var(--border-color) 70%, transparent);
 }

 .rdg {
   contain: strict; /* Verbessert die Render-Performance */
   --rdg-selected-row-background-color: transparent; /* Macht den Hintergrund ausgewählter Zeilen transparent, da wir individuelle Zellfärbung verwenden. */
   color: var(--color-text-primary); /* Standard-Textfarbe des Gitters */
 }

 /* Zellen-Styling */
 .rdg-cell {
   background-color: var(--color-surface); /* Hintergrundfarbe der Zellen */
   border-right: 1px solid var(--rdg-grid-border-color); /* Rechter Rahmen der Zellen */
   border-bottom: 1px solid var(--rdg-grid-border-color); /* Unterer Rahmen der Zellen */
   contain: paint; /* Performance-Optimierung */
   color: inherit; /* Erbt die Textfarbe vom Gitter */
 }

 /* Textfarbe und Hintergrundfarbe für ausgewählte Zeilen im Dark Mode */
 .rdg-dark .rdg-row[aria-selected='true'] > .rdg-cell {
   background-color: rgba(130, 180, 255, 0.92); /* Hintergrundfarbe für ausgewählte Zellen im Dark Mode */
   color: var(--color-text-inverted); /* Invertierte Textfarbe für ausgewählte Zellen im Dark Mode */
 }

 .rdg-dark .rdg-row[aria-selected='true']:hover > .rdg-cell {
   background-color: rgba(122, 181, 199, 0.84); /* Hintergrundfarbe für ausgewählte Zellen beim Hover im Dark Mode */
 }

 /* Textfarbe und Hintergrundfarbe für ausgewählte Zeilen im Light Mode */
 .rdg-light .rdg-row[aria-selected='true'] > .rdg-cell {
   background-color: rgba(130, 180, 255, 0.92); /* Hintergrundfarbe für ausgewählte Zellen im Light Mode */
   color: var(--color-text-primary); /* Primäre Textfarbe beibehalten im Light Mode */
 }

 .rdg-light .rdg-row[aria-selected='true']:hover > .rdg-cell {
   background-color: rgba(122, 181, 199, 0.84); /* Hintergrundfarbe für ausgewählte Zellen beim Hover im Light Mode */
 }

 /* Styling für Spaltenüberschriften */
 .rdg-header-row .rdg-cell {
   font-weight: 600; /* Schriftstärke */
   color: var(--color-text-primary); /* Textfarbe */
   background-color: var(--color-surface); /* Hintergrundfarbe (sorgt für Kontrast in beiden Themes) */
 }

 .rdg-dark .rdg-header-row .rdg-cell {
   color: white; /* Spezifische Textfarbe für Header im Dark Mode */
 }

 /* Styling für editierbare Zellen */
 .editable-cell {
   background-color: color-mix(in srgb, var(--color-accent) 15%, var(--color-surface)); /* Hintergrundfarbe mit Akzentfarbe gemischt */
 }

 /* Scrollbalken-Styling (für WebKit-Browser wie Chrome, Safari) */
 .rdg::-webkit-scrollbar {
   height: 10px; /* Höhe des horizontalen Scrollbalkens */
   width: 10px; /* Breite des vertikalen Scrollbalkens */
 }

 .rdg::-webkit-scrollbar-thumb {
   background-color: rgba(150, 150, 150, 0.6); /* Farbe des Scrollbalken-Daumens */
   border-radius: 6px; /* Abrundung des Daumens */
 }

 .rdg::-webkit-scrollbar-track {
   background: transparent; /* Transparenter Hintergrund des Scrollbalkens */
 }

 /* Scrollbalken-Styling für Firefox */
 .rdg {
   scrollbar-color: rgba(150, 150, 150, 0.6) transparent; /* Farbe des Daumens und des Tracks */
   scrollbar-width: thin; /* Schmaler Scrollbalken */
 }
 `}</style>

      {/* Aktionsleiste oberhalb des Gitters */}
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Szenarien & Datenmatrix
        </h4>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => fetchScenarios()} // Button zum Aktualisieren der Szenarien (ohne Daten zu lesen)
            disabled={isLoading.scenarios} // Deaktiviert, wenn Szenarien bereits geladen werden
            className="btn-secondary flex items-center disabled:opacity-50"
          >
            <FiRefreshCw className="mr-2" />
            Szenarien aktualisieren
          </button>
          <button
            onClick={handleReadData} // Button zum Lesen von Daten
            disabled={isLoading.reading || isWriteMode} // Deaktiviert im Schreibmodus oder wenn Lesevorgang läuft
            className="btn-primary flex items-center disabled:opacity-50"
          >
            <FiPlay className="mr-2" />
            Daten lesen
          </button>
          <button
            onClick={() => setIsWriteMode((prev) => !prev)} // Button zum Umschalten des Schreibmodus
            className={`btn-secondary flex items-center ${
              isWriteMode ? "bg-orange-600 hover:bg-orange-700 text-white" : "" // Zusätzliches Styling für den aktiven Schreibmodus
            }`}
          >
            <FiEdit3 className="mr-2" />
            {isWriteMode ? "Schreibmodus beenden" : "Schreibmodus aktivieren"}
          </button>
          <button
            onClick={handleWriteData} // Button zum Schreiben von Daten
            disabled={!isWriteMode || isLoading.writing} // Deaktiviert, wenn nicht im Schreibmodus oder Schreibvorgang läuft
            className="btn-primary bg-green-600 hover:bg-green-700 flex items-center disabled:opacity-50"
          >
            <FiSave className="mr-2" />
            In SIMONE schreiben
          </button>
          <button
            onClick={handleExportToExcel} // Button zum Exportieren nach Excel
            className="btn-primary bg-blue-600 hover:bg-blue-700 flex items-center"
          >
            <FiDownload className="mr-2" />
            Nach Excel exportieren
          </button>
        </div>
      </div>

      {/* Scrollbarer Container für das DataGrid */}
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]" style={{ height: `${gridHeight}px` }}>
          {/* DataGrid-Komponente */}
          <DataGrid
            columns={columns}
            rows={rows}
            rowKeyGetter={rowKeyGetter}
            selectedRows={selectedRows}
            onSelectedRowsChange={handleRowSelectionChange}
            onRowsChange={handleRowsChange}
            onCellClick={handleCellClick}
            onFill={handleFill}
            className={theme === "dark" ? "rdg-dark" : "rdg-light"}
            style={{ height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
