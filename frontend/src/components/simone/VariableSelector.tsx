// // frontend/src/components/simone/VariableSelector.tsx
// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import Select, { StylesConfig, SingleValue } from "react-select";
// import { useSimoneContext, VariableToRead } from "@/contexts/SimoneContext";
// import { apiClient } from "@/lib/apiClient";
// import {
//   NetworkObjectDto,
//   VarIdResponseDto,
//   ValidExtensionsDto,
//   VarIdRequestDto,
//   VarIdBatchRequestDto,
// } from "@/types";
// import toast from "react-hot-toast";
// import {
//   FiPlusCircle,
//   FiSearch,
//   FiLoader,
//   FiAlertTriangle,
//   FiInbox,
// } from "react-icons/fi";

// interface SelectionState {
//   object: NetworkObjectDto;
//   parameter: string;
//   isSelected: boolean;
//   validExtensions?: string[];
//   isLoadingExtensions?: boolean;
// }

// type TranslationSuccess = {
//   status: "success";
//   data: VarIdResponseDto;
// };
// type TranslationError = {
//   status: "error";
//   name: string;
//   message: string;
// };
// type TranslationResult = TranslationSuccess | TranslationError;

// export default function VariableSelector() {
//   const { simoneState, setVariablesToRead } = useSimoneContext();
//   const { variablesToRead, activeNetwork } = simoneState;

//   const [allObjects, setAllObjects] = useState<NetworkObjectDto[]>([]);
//   const [objectTypes, setObjectTypes] = useState<string[]>([]);
//   const [selectedObjectType, setSelectedObjectType] = useState<string>("ALLE");
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [selections, setSelections] = useState<Record<number, SelectionState>>(
//     {}
//   );
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [isTranslating, setIsTranslating] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchAllObjects = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const response = await apiClient("/simone/networks/objects", {
//           method: "GET",
//         });
//         const data = await response.json();
//         if (!response.ok)
//           throw new Error(
//             data.message || "Netzwerkobjekte konnten nicht abgerufen werden."
//           );

//         const fetchedObjects: NetworkObjectDto[] = data.objects || [];
//         setAllObjects(fetchedObjects);

//         const initialSelections: Record<number, SelectionState> = {};
//         fetchedObjects.forEach((obj) => {
//           initialSelections[obj.objId] = {
//             object: obj,
//             parameter: "",
//             isSelected: false,
//             validExtensions: [],
//             isLoadingExtensions: false,
//           };
//         });
//         setSelections(initialSelections);

//         const types = [
//           "ALLE",
//           ...Array.from(
//             new Set(fetchedObjects.map((o) => o.objectTypeName))
//           ).sort(),
//         ];
//         setObjectTypes(types);
//       } catch (err) {
//         setError(
//           err instanceof Error
//             ? err.message
//             : "Ein unbekannter Fehler ist aufgetreten."
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (simoneState.isSimoneInitialized && activeNetwork) {
//       fetchAllObjects();
//     } else {
//       setAllObjects([]);
//       setObjectTypes([]);
//       setSelections({});
//       setIsLoading(false);
//     }
//   }, [simoneState.isSimoneInitialized, activeNetwork]);

//   const filteredObjects = useMemo(() => {
//     return allObjects
//       .filter(
//         (obj) =>
//           selectedObjectType === "ALLE" ||
//           obj.objectTypeName === selectedObjectType
//       )
//       .filter((obj) =>
//         obj.objName.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//   }, [allObjects, selectedObjectType, searchTerm]);

//   const fetchValidExtensions = async (objId: number) => {
//     if (!activeNetwork) return;

//     setSelections((prev) => ({
//       ...prev,
//       [objId]: { ...prev[objId], isLoadingExtensions: true },
//     }));

//     try {
//       const response = await apiClient(
//         `/simone/translate/networks/${activeNetwork}/extensions/${selections[objId].object.objName}`
//       );
//       if (!response.ok)
//         throw new Error("Erweiterungen konnten nicht geladen werden.");
//       const data: ValidExtensionsDto = await response.json();
//       setSelections((prev) => ({
//         ...prev,
//         [objId]: {
//           ...prev[objId],
//           validExtensions: data.extensions.sort(),
//           isLoadingExtensions: false,
//         },
//       }));
//     } catch (error) {
//       console.error("Fehler beim Abrufen der Erweiterungen:", error);
//       toast.error(
//         `Fehler beim Laden der Erweiterungen für ${selections[objId].object.objName}.`
//       );
//       setSelections((prev) => ({
//         ...prev,
//         [objId]: { ...prev[objId], isLoadingExtensions: false },
//       }));
//     }
//   };

//   const handleRowSelect = (objId: number) => {
//     const isCurrentlySelected = selections[objId]?.isSelected;
//     const hasFetchedExtensions =
//       (selections[objId]?.validExtensions?.length ?? 0) > 0;

//     setSelections((prev) => ({
//       ...prev,
//       [objId]: {
//         ...prev[objId],
//         isSelected: !isCurrentlySelected,
//         parameter: "",
//       },
//     }));

//     if (!isCurrentlySelected && !hasFetchedExtensions) {
//       fetchValidExtensions(objId);
//     }
//   };

//   const handleParameterChange = (objId: number, value: string) => {
//     setSelections((prev) => ({
//       ...prev,
//       [objId]: { ...prev[objId], parameter: value },
//     }));
//   };

//   const handleAddSelections = async () => {
//     if (!activeNetwork) {
//       toast.error("Kein aktives Netzwerk ausgewählt.");
//       return;
//     }

//     const itemsToAdd = Object.values(selections).filter(
//       (s) => s.isSelected && s.parameter.trim() !== ""
//     );

//     if (itemsToAdd.length === 0) {
//       toast.error("Keine Elemente ausgewählt oder keine Parameter angegeben.");
//       return;
//     }

//     setIsTranslating(true);
//     const toastId = toast.loading(
//       `Füge ${itemsToAdd.length} Variable(n) hinzu...`
//     );

//     // Deduplicate client-side
//     const newVariables = itemsToAdd.filter(
//       (item) =>
//         !variablesToRead.some(
//           (v) =>
//             v.variableName === `${item.object.objName}.${item.parameter.trim()}`
//         )
//     );

//     let results: TranslationResult[] = [];

//     try {
//       if (newVariables.length === 1) {
//         const variableName = `${newVariables[0].object.objName}.${newVariables[0].parameter}`;
//         const body: VarIdRequestDto = {
//           networkName: activeNetwork,
//           variableName,
//         };

//         const res = await apiClient("/simone/translate/varid", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(body),
//         });

//         const data: VarIdResponseDto = await res.json();
//         results.push(
//           res.ok && data.simoneStatus === 0
//             ? { status: "success", data }
//             : {
//                 status: "error",
//                 name: variableName,
//                 message: data.statusMessage || `API Fehler (${res.status})`,
//               }
//         );
//       } else {
//         const body: VarIdBatchRequestDto = {
//           networkName: activeNetwork,
//           variableNames: newVariables.map(
//             (item) => `${item.object.objName}.${item.parameter.trim()}`
//           ),
//         };

//         const res = await apiClient("/simone/translate/varids", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(body),
//         });

//         const json = await res.json();
//         results = (json.results || []).map((data: VarIdResponseDto) =>
//           data.simoneStatus === 0
//             ? { status: "success", data }
//             : {
//                 status: "error",
//                 name: data.originalName,
//                 message: data.statusMessage || "Fehler beim Übersetzen",
//               }
//         );
//       }

//       const successful: VariableToRead[] = [];
//       let errorCount = 0;

//       results.forEach((res) => {
//         if (res.status === "success") {
//           successful.push({
//             variableName: res.data.originalName,
//             objId: res.data.objId,
//             extId: res.data.extId,
//           });
//         } else {
//           errorCount++;
//           console.warn(`Fehler bei ${res.name}: ${res.message}`);
//         }
//       });

//       if (successful.length > 0) {
//         setVariablesToRead((prev) => [...prev, ...successful]);
//       }

//       toast.dismiss(toastId);
//       toast.success(`Erfolg: ${successful.length}, Fehler: ${errorCount}`, {
//         duration: 4000,
//       });
//     } catch (err) {
//       console.error("Übersetzungsfehler:", err);
//       toast.dismiss(toastId);
//       toast.error("Fehler bei der Kommunikation mit dem Server.");
//     }

//     // Reset selections
//     setSelections((prev) => {
//       const newSel: typeof prev = {};
//       Object.entries(prev).forEach(([key, sel]) => {
//         newSel[+key] = { ...sel, parameter: "", isSelected: false };
//       });
//       return newSel;
//     });

//     setIsTranslating(false);
//   };
//   // Theming for react-select to support dark/light mode
//   const selectStyles: StylesConfig<{ value: string; label: string }, false> = {
//     control: (provided) => ({
//       ...provided,
//       backgroundColor: "var(--color-surface)",
//       borderColor: "var(--border-color)",
//       color: "var(--color-text-primary)",
//       minHeight: "28px",
//       height: "28px",
//       boxShadow: "none",
//       "&:hover": {
//         borderColor: "var(--color-accent)",
//       },
//     }),
//     valueContainer: (provided) => ({
//       ...provided,
//       padding: "0 6px",
//     }),
//     singleValue: (provided) => ({
//       ...provided,
//       color: "var(--color-text-primary)",
//     }),
//     input: (provided) => ({
//       ...provided,
//       color: "var(--color-text-primary)",
//       margin: "0px",
//       padding: "0px",
//     }),
//     menu: (provided) => ({
//       ...provided,
//       backgroundColor: "var(--color-surface-2)",
//       border: "1px solid var(--border-color)",
//       zIndex: 20,
//     }),
//     option: (provided, state) => ({
//       ...provided,
//       backgroundColor: state.isSelected
//         ? "var(--color-accent)"
//         : state.isFocused
//         ? "var(--color-surface-3)"
//         : "transparent",
//       color: state.isSelected ? "white" : "var(--color-text-primary)",
//       ":active": {
//         ...provided[":active"],
//         backgroundColor: "var(--color-accent-dark)",
//       },
//     }),
//     placeholder: (provided) => ({
//       ...provided,
//       color: "var(--color-placeholder-color)",
//       fontSize: "0.875rem",
//       lineHeight: "1.25rem",
//     }),
//     indicatorsContainer: (provided) => ({
//       ...provided,
//       height: "28px",
//     }),
//   };

//   if (!simoneState.isSimoneInitialized || !activeNetwork) {
//     return (
//       <div className="p-8 text-center border-2 border-dashed border-[var(--border-color)] rounded-lg bg-[var(--color-surface)]">
//         <FiAlertTriangle className="mx-auto h-10 w-10 text-[var(--color-warning)]" />
//         <h4 className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
//           Voraussetzungen nicht erfüllt
//         </h4>
//         <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
//           Bitte initialisieren Sie zuerst die SIMONE-API und wählen Sie ein
//           Netzwerk im Reiter Einstellungen.
//         </p>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center p-8">
//         <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)]" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-danger p-4 text-center">
//         <FiAlertTriangle className="inline mr-2" />
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-col sm:flex-row gap-4 items-center">
//         <select
//           value={selectedObjectType}
//           onChange={(e) => setSelectedObjectType(e.target.value)}
//           className="w-full sm:w-auto h-10 pl-3 pr-10 text-sm"
//         >
//           {objectTypes.map((type) => (
//             <option key={type} value={type}>
//               {type === "ALLE" ? "Alle Typen" : type}
//             </option>
//           ))}
//         </select>
//         <div className="relative w-full sm:flex-grow">
//           <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-placeholder-color)]" />
//           <input
//             type="search"
//             placeholder="Angezeigte Objekte filtern..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full h-10 pl-9 pr-3 text-sm"
//           />
//         </div>
//         <button
//           onClick={handleAddSelections}
//           disabled={isTranslating}
//           className="btn-primary w-full sm:w-auto flex items-center justify-center h-10 disabled:opacity-50"
//         >
//           <FiPlusCircle className="mr-2" />
//           {isTranslating ? "Hinzufügen..." : "Hinzufügen"}
//         </button>
//       </div>

//       <div className="overflow-y-auto h-[50vh] border border-[var(--border-color)] rounded-lg">
//         <table className="min-w-full divide-y divide-[var(--border-color)]">
//           <thead className="bg-[var(--color-surface-2)] sticky top-0 z-10">
//             <tr className="h-10">
//               <th
//                 scope="col"
//                 className="px-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider"
//               >
//                 Objektname
//               </th>
//               <th
//                 scope="col"
//                 className="px-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider"
//               >
//                 Objekttyp
//               </th>
//               <th
//                 scope="col"
//                 className="px-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider w-1/3"
//               >
//                 Parameter
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--border-color)]">
//             {filteredObjects.length > 0 ? (
//               filteredObjects.map((obj) => (
//                 <tr
//                   key={obj.objId}
//                   onClick={() => handleRowSelect(obj.objId)}
//                   className={`cursor-pointer transition-colors h-10 ${
//                     selections[obj.objId]?.isSelected
//                       ? "bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)]"
//                       : "hover:bg-[var(--color-surface-2)]"
//                   }`}
//                 >
//                   <td className="px-2 text-sm font-medium text-[var(--color-text-primary)] whitespace-nowrap">
//                     {obj.objName}
//                   </td>
//                   <td className="px-2 text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
//                     {obj.objectTypeName}
//                   </td>
//                   <td className="px-2 py-1">
//                     <div onClick={(e) => e.stopPropagation()}>
//                       <Select
//                         options={
//                           selections[obj.objId]?.validExtensions?.map(
//                             (ext) => ({ value: ext, label: ext })
//                           ) || []
//                         }
//                         value={
//                           selections[obj.objId]?.parameter
//                             ? {
//                                 value: selections[obj.objId].parameter,
//                                 label: selections[obj.objId].parameter,
//                               }
//                             : null
//                         }
//                         onChange={(
//                           selectedOption: SingleValue<{
//                             value: string;
//                             label: string;
//                           }>
//                         ) =>
//                           handleParameterChange(
//                             obj.objId,
//                             selectedOption?.value || ""
//                           )
//                         }
//                         placeholder={
//                           selections[obj.objId]?.isLoadingExtensions
//                             ? "Laden..."
//                             : "-"
//                         }
//                         isDisabled={
//                           !selections[obj.objId]?.isSelected || isTranslating
//                         }
//                         isLoading={selections[obj.objId]?.isLoadingExtensions}
//                         isClearable
//                         isSearchable
//                         styles={selectStyles}
//                         className="w-full text-sm"
//                         classNamePrefix="react-select"
//                       />
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr className="h-10">
//                 <td
//                   colSpan={3}
//                   className="text-center text-sm text-[var(--color-text-secondary)] py-2"
//                 >
//                   <FiInbox className="inline mr-1" /> Keine Objekte gefunden.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, { useState, useEffect, useMemo } from "react"; // React Hooks für Zustand, Lebenszyklus und Memo.
import Select, { StylesConfig, SingleValue } from "react-select"; // Importiert die Select-Komponente und Typen von react-select.
import { useSimoneContext, VariableToRead } from "@/contexts/SimoneContext"; // Importiert den SimoneContext und den Typ 'VariableToRead'.
import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client.
import {
  NetworkObjectDto, // Typ für Netzwerkobjekte.
  VarIdResponseDto, // Typ für die Antwort bei der VARID-Übersetzung.
  ValidExtensionsDto, // Typ für die Antwort beim Abrufen gültiger Erweiterungen.
  VarIdRequestDto, // Typ für die Anfrage einer einzelnen VARID-Übersetzung.
  VarIdBatchRequestDto, // Typ für die Anfrage einer Batch-VARID-Übersetzung.
} from "@/types"; // Allgemeine Typdefinitionen.
import toast from "react-hot-toast"; // Bibliothek für Pop-up-Benachrichtigungen.
import {
  FiPlusCircle, // Icon für "Hinzufügen".
  FiSearch, // Icon für "Suchen".
  FiLoader, // Icon für "Laden/Spinner".
  FiAlertTriangle, // Icon für "Warnung/Fehler".
  FiInbox, // Icon für "Keine Daten".
} from "react-icons/fi"; // Importiert Icons von Feather Icons.

/**
 * -------------------------------------------------------------------
 * ✅ Interface: SelectionState
 * Definiert den Zustand für jedes Objekt in der Auswahlübersicht.
 * -------------------------------------------------------------------
 */
interface SelectionState {
  object: NetworkObjectDto; // Das zugrunde liegende Netzwerkobjekt.
  parameter: string; // Der ausgewählte Parameter (Erweiterung) für dieses Objekt.
  isSelected: boolean; // Zeigt an, ob diese Zeile vom Benutzer ausgewählt wurde.
  validExtensions?: string[]; // Optional: Die Liste der gültigen Erweiterungen für dieses Objekt.
  isLoadingExtensions?: boolean; // Optional: Zeigt an, ob Erweiterungen für dieses Objekt geladen werden.
}

/**
 * -------------------------------------------------------------------
 * ✅ Typen für Übersetzungs-Ergebnisse
 * Definieren die möglichen Ergebnisse eines VARID-Übersetzungsvorgangs.
 * -------------------------------------------------------------------
 */
type TranslationSuccess = {
  status: "success"; // Status "Erfolg".
  data: VarIdResponseDto; // Die erfolgreichen Übersetzungsdaten.
};
type TranslationError = {
  status: "error"; // Status "Fehler".
  name: string; // Der Name der Variablen, die den Fehler verursacht hat.
  message: string; // Die Fehlermeldung.
};
type TranslationResult = TranslationSuccess | TranslationError; // Union-Typ für Ergebnis.

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: VariableSelector
 * Ermöglicht Benutzern die Auswahl von Variablen (Objekt.Parameter)
 * aus dem aktiven SIMONE-Netzwerk, um sie der Liste der zu lesenden Variablen
 * hinzuzufügen. Bietet Filter-, Such- und Übersetzungsfunktionen.
 * -------------------------------------------------------------------
 */
export default function VariableSelector() {
  // Holt SIMONE-spezifische Zustände und Setter-Funktionen aus dem SimoneContext.
  const { simoneState, setVariablesToRead } = useSimoneContext();
  const { variablesToRead, activeNetwork } = simoneState; // Aktuelle Liste der Variablen und aktives Netzwerk.

  // Zustandsvariablen für die Objektliste und Auswahl.
  const [allObjects, setAllObjects] = useState<NetworkObjectDto[]>([]); // Alle Netzwerkobjekte des aktiven Netzes.
  const [objectTypes, setObjectTypes] = useState<string[]>([]); // Verfügbare Objekttypen zum Filtern.
  const [selectedObjectType, setSelectedObjectType] = useState<string>("ALLE"); // Der aktuell ausgewählte Objekttyp-Filter.
  const [searchTerm, setSearchTerm] = useState<string>(""); // Der aktuelle Suchbegriff für Objektnamen.
  const [selections, setSelections] = useState<Record<number, SelectionState>>(
    {}
  ); // Speichert den Auswahlstatus und die Parameter für jedes Objekt.

  // Zustandsvariablen für Lade- und Fehlerstatus.
  const [isLoading, setIsLoading] = useState<boolean>(true); // Zeigt an, ob Netzwerkobjekte geladen werden.
  const [isTranslating, setIsTranslating] = useState<boolean>(false); // Zeigt an, ob Variablen übersetzt werden.
  const [error, setError] = useState<string | null>(null); // Fehlermeldung bei Problemen mit dem Laden von Objekten.

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Netzwerkobjekte abrufen
   * Dieser Hook wird ausgelöst, wenn sich der Initialisierungsstatus
   * von SIMONE oder das aktive Netzwerk ändert. Er ruft alle Netzwerkobjekte
   * vom Server ab und initialisiert den Auswahlzustand.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    const fetchAllObjects = async () => {
      setIsLoading(true); // Setzt Ladezustand.
      setError(null); // Löscht Fehler.
      try {
        const response = await apiClient("/simone/networks/objects", {
          method: "GET",
        }); // API-Aufruf zum Abrufen der Netzwerkobjekte.
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            data.message || "Netzwerkobjekte konnten nicht abgerufen werden."
          );

        const fetchedObjects: NetworkObjectDto[] = data.objects || []; // Die abgerufenen Objekte.
        setAllObjects(fetchedObjects); // Speichert alle Objekte.

        // Initialisiert den 'selections'-Zustand für jedes Objekt.
        const initialSelections: Record<number, SelectionState> = {};
        fetchedObjects.forEach((obj) => {
          initialSelections[obj.objId] = {
            object: obj,
            parameter: "",
            isSelected: false,
            validExtensions: [],
            isLoadingExtensions: false,
          };
        });
        setSelections(initialSelections);

        // Erstellt die Liste der eindeutigen Objekttypen für das Filter-Dropdown.
        const types = [
          "ALLE", // Option für alle Typen.
          ...Array.from(
            new Set(fetchedObjects.map((o) => o.objectTypeName))
          ).sort(), // Eindeutige und sortierte Typen.
        ];
        setObjectTypes(types); // Speichert die Objekttypen.
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ein unbekannter Fehler ist aufgetreten."
        ); // Setzt Fehlermeldung.
      } finally {
        setIsLoading(false); // Beendet Ladezustand.
      }
    };

    // Führt den Abruf nur aus, wenn SIMONE initialisiert und ein Netzwerk aktiv ist.
    if (simoneState.isSimoneInitialized && activeNetwork) {
      fetchAllObjects();
    } else {
      // Setzt die Zustände zurück, wenn Voraussetzungen nicht erfüllt sind.
      setAllObjects([]);
      setObjectTypes([]);
      setSelections({});
      setIsLoading(false);
    }
  }, [simoneState.isSimoneInitialized, activeNetwork]); // Abhängigkeiten des Hooks.

  /**
   * -------------------------------------------------------------------
   * ✅ useMemo Hook: Gefilterte Objekte
   * Dieser Hook optimiert die Filterung der Objekte. Die Liste wird
   * nur neu berechnet, wenn sich 'allObjects', 'selectedObjectType'
   * oder 'searchTerm' ändern.
   * -------------------------------------------------------------------
   */
  const filteredObjects = useMemo(() => {
    return allObjects
      .filter(
        (obj) =>
          selectedObjectType === "ALLE" ||
          obj.objectTypeName === selectedObjectType // Filter nach Objekttyp.
      )
      .filter(
        (obj) => obj.objName.toLowerCase().includes(searchTerm.toLowerCase()) // Filter nach Suchbegriff im Objektnamen.
      );
  }, [allObjects, selectedObjectType, searchTerm]); // Abhängigkeiten für useMemo.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: fetchValidExtensions
   * Ruft die gültigen Parameter (Erweiterungen) für ein bestimmtes Objekt
   * vom Server ab. Diese werden benötigt, um die `react-select`-Dropdowns
   * zu füllen.
   * -------------------------------------------------------------------
   */
  const fetchValidExtensions = async (objId: number) => {
    if (!activeNetwork) return; // Nichts tun, wenn kein aktives Netzwerk.

    // Setzt den Ladezustand für die Erweiterungen dieses spezifischen Objekts.
    setSelections((prev) => ({
      ...prev,
      [objId]: { ...prev[objId], isLoadingExtensions: true },
    }));

    try {
      // API-Aufruf zum Abrufen der Erweiterungen.
      const response = await apiClient(
        `/simone/translate/networks/${activeNetwork}/extensions/${selections[objId].object.objName}`
      );
      if (!response.ok)
        throw new Error("Erweiterungen konnten nicht geladen werden.");
      const data: ValidExtensionsDto = await response.json();
      // Aktualisiert den Zustand mit den abgerufenen und sortierten Erweiterungen.
      setSelections((prev) => ({
        ...prev,
        [objId]: {
          ...prev[objId],
          validExtensions: data.extensions.sort(),
          isLoadingExtensions: false,
        },
      }));
    } catch (error) {
      console.error("Fehler beim Abrufen der Erweiterungen:", error);
      toast.error(
        `Fehler beim Laden der Erweiterungen für ${selections[objId].object.objName}.`
      );
      // Beendet den Ladezustand im Fehlerfall.
      setSelections((prev) => ({
        ...prev,
        [objId]: { ...prev[objId], isLoadingExtensions: false },
      }));
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleRowSelect
   * Behandelt das Klicken auf eine Objektzeile.
   * Schaltet den 'isSelected'-Status der Zeile um und ruft bei Bedarf
   * die Erweiterungen ab.
   * -------------------------------------------------------------------
   */
  const handleRowSelect = (objId: number) => {
    const isCurrentlySelected = selections[objId]?.isSelected; // Aktueller Auswahlstatus.
    const hasFetchedExtensions =
      (selections[objId]?.validExtensions?.length ?? 0) > 0; // Prüft, ob Erweiterungen bereits geladen wurden.

    // Schaltet den Auswahlstatus um und setzt den Parameter zurück, wenn abgewählt.
    setSelections((prev) => ({
      ...prev,
      [objId]: {
        ...prev[objId],
        isSelected: !isCurrentlySelected,
        parameter: "", // Parameter zurücksetzen, wenn Auswahl aufgehoben wird.
      },
    }));

    // Wenn die Zeile ausgewählt wird und die Erweiterungen noch nicht geladen wurden, rufe sie ab.
    if (!isCurrentlySelected && !hasFetchedExtensions) {
      fetchValidExtensions(objId);
    }
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleParameterChange
   * Behandelt Änderungen im Parameter-Dropdown für ein Objekt.
   * Aktualisiert den 'parameter'-Wert für das entsprechende Objekt.
   * -------------------------------------------------------------------
   */
  const handleParameterChange = (objId: number, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [objId]: { ...prev[objId], parameter: value }, // Aktualisiert den Parameter des Objekts.
    }));
  };

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: handleAddSelections
   * Fügt die aktuell ausgewählten Variablen (Objekt.Parameter-Kombinationen)
   * zur globalen Liste der zu lesenden Variablen hinzu.
   * Führt eine Übersetzung der Variablen in objId/extId durch das Backend durch.
   * -------------------------------------------------------------------
   */
  const handleAddSelections = async () => {
    if (!activeNetwork) {
      toast.error("Kein aktives Netzwerk ausgewählt.");
      return;
    }

    // Filtert die Elemente, die hinzugefügt werden sollen (ausgewählt und Parameter angegeben).
    const itemsToAdd = Object.values(selections).filter(
      (s) => s.isSelected && s.parameter.trim() !== ""
    );

    if (itemsToAdd.length === 0) {
      toast.error("Keine Elemente ausgewählt oder keine Parameter angegeben.");
      return;
    }

    setIsTranslating(true); // Setzt den Ladezustand für die Übersetzung.
    const toastId = toast.loading(
      `Füge ${itemsToAdd.length} Variable(n) hinzu...`
    ); // Zeigt einen Lade-Toast an.

    // Duplikatprüfung auf Client-Seite, um bereits hinzugefügte Variablen zu vermeiden.
    const newVariables = itemsToAdd.filter(
      (item) =>
        !variablesToRead.some(
          (v) =>
            v.variableName === `${item.object.objName}.${item.parameter.trim()}`
        )
    );

    let results: TranslationResult[] = []; // Array zum Speichern der Übersetzungsergebnisse.

    try {
      // API-Aufrufe zur Übersetzung von Variablennamen in objId/extId.
      // Unterscheidung zwischen Einzelübersetzung und Batch-Übersetzung.
      if (newVariables.length === 1) {
        // Einzelübersetzung
        const variableName = `${newVariables[0].object.objName}.${newVariables[0].parameter}`;
        const body: VarIdRequestDto = {
          networkName: activeNetwork,
          variableName,
        };

        const res = await apiClient("/simone/translate/varid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data: VarIdResponseDto = await res.json();
        results.push(
          res.ok && data.simoneStatus === 0 // Prüft auf erfolgreichen API-Status und SIMONE-Status.
            ? { status: "success", data }
            : {
                status: "error",
                name: variableName,
                message: data.statusMessage || `API Fehler (${res.status})`,
              }
        );
      } else {
        // Batch-Übersetzung für mehrere Variablen.
        const body: VarIdBatchRequestDto = {
          networkName: activeNetwork,
          variableNames: newVariables.map(
            (item) => `${item.object.objName}.${item.parameter.trim()}`
          ),
        };

        const res = await apiClient("/simone/translate/varids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await res.json();
        results = (json.results || []).map((data: VarIdResponseDto) =>
          data.simoneStatus === 0
            ? { status: "success", data }
            : {
                status: "error",
                name: data.originalName,
                message: data.statusMessage || "Fehler beim Übersetzen",
              }
        );
      }

      // Verarbeitet die Übersetzungsergebnisse.
      const successful: VariableToRead[] = [];
      let errorCount = 0;

      results.forEach((res) => {
        if (res.status === "success") {
          successful.push({
            variableName: res.data.originalName, // Original-Variablenname.
            objId: res.data.objId, // Objekt-ID.
            extId: res.data.extId, // Erweiterungs-ID.
          });
        } else {
          errorCount++;
          console.warn(`Fehler bei ${res.name}: ${res.message}`); // Protokolliert Fehler.
        }
      });

      // Fügt erfolgreich übersetzte Variablen zur globalen Liste hinzu.
      if (successful.length > 0) {
        setVariablesToRead((prev) => [...prev, ...successful]);
      }

      toast.dismiss(toastId); // Schließt den Lade-Toast.
      toast.success(`Erfolg: ${successful.length}, Fehler: ${errorCount}`, {
        duration: 4000, // Toast-Dauer.
      });
    } catch (err) {
      console.error("Übersetzungsfehler:", err);
      toast.dismiss(toastId);
      toast.error("Fehler bei der Kommunikation mit dem Server.");
    }

    // Auswahl zurücksetzen: Entfernt die Auswahl und Parameter von allen Objekten.
    setSelections((prev) => {
      const newSel: typeof prev = {};
      Object.entries(prev).forEach(([key, sel]) => {
        newSel[+key] = { ...sel, parameter: "", isSelected: false };
      });
      return newSel;
    });

    setIsTranslating(false); // Beendet den Ladezustand für die Übersetzung.
  };

  // -------------------------------------------------------------------
  // ✅ react-select Styling
  // Definiert angepasste Stile für die `react-select`-Komponente,
  // um sie an das globale Theme (hell/dunkel) anzupassen.
  // -------------------------------------------------------------------
  const selectStyles: StylesConfig<{ value: string; label: string }, false> = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "var(--color-surface)", // Hintergrundfarbe des Kontrollfelds.
      borderColor: "var(--border-color)", // Rahmenfarbe.
      color: "var(--color-text-primary)", // Textfarbe.
      minHeight: "28px", // Minimale Höhe.
      height: "28px", // Feste Höhe.
      boxShadow: "none", // Kein Schatten.
      "&:hover": {
        borderColor: "var(--color-accent)", // Rahmenfarbe beim Hover.
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 6px", // Innenabstand des Wert-Containers.
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--color-text-primary)", // Farbe des einzelnen ausgewählten Wertes.
    }),
    input: (provided) => ({
      ...provided,
      color: "var(--color-text-primary)", // Farbe des Eingabetextes im Select.
      margin: "0px",
      padding: "0px",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "var(--color-surface-2)", // Hintergrundfarbe des Dropdown-Menüs.
      border: "1px solid var(--border-color)", // Rahmen des Dropdown-Menüs.
      zIndex: 20, // Hoher z-Index, damit es über anderen Elementen liegt.
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected // Hintergrundfarbe der Optionen.
        ? "var(--color-accent)" // Akzentfarbe, wenn ausgewählt.
        : state.isFocused
        ? "var(--color-surface-3)" // Leichterer Hintergrund, wenn fokussiert.
        : "transparent", // Ansonsten transparent.
      color: state.isSelected ? "white" : "var(--color-text-primary)", // Textfarbe.
      ":active": {
        ...provided[":active"],
        backgroundColor: "var(--color-accent-dark)", // Dunklere Akzentfarbe beim Klicken.
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "var(--color-placeholder-color)", // Farbe des Platzhaltertextes.
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "28px", // Höhe des Indikator-Containers (Pfeil, etc.).
    }),
  };

  // -------------------------------------------------------------------
  // ✅ Bedingtes Rendering: Voraussetzungen nicht erfüllt
  // Zeigt eine Fehlermeldung an, wenn SIMONE nicht initialisiert
  // oder kein aktives Netzwerk ausgewählt ist.
  // -------------------------------------------------------------------
  if (!simoneState.isSimoneInitialized || !activeNetwork) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-[var(--border-color)] rounded-lg bg-[var(--color-surface)]">
        <FiAlertTriangle className="mx-auto h-10 w-10 text-[var(--color-warning)]" />{" "}
        {/* Warn-Icon. */}
        <h4 className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
          Voraussetzungen nicht erfüllt
        </h4>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Bitte initialisieren Sie zuerst die SIMONE-API und wählen Sie ein
          Netzwerk im Reiter Einstellungen.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // ✅ Bedingtes Rendering: Ladezustand der Objekte
  // Zeigt einen Spinner an, während die Netzwerkobjekte geladen werden.
  // -------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <FiLoader className="animate-spin h-8 w-8 text-[var(--color-accent)]" />{" "}
        {/* Spinner. */}
      </div>
    );
  }

  // -------------------------------------------------------------------
  // ✅ Bedingtes Rendering: Fehler beim Laden der Objekte
  // Zeigt eine Fehlermeldung an, wenn ein Fehler beim Laden der Objekte auftrat.
  // -------------------------------------------------------------------
  if (error) {
    return (
      <div className="alert alert-danger p-4 text-center">
        <FiAlertTriangle className="inline mr-2" /> {/* Warn-Icon. */}
        {error}
      </div>
    );
  }

  // -------------------------------------------------------------------
  // ✅ Haupt-JSX-Struktur für die Variablenauswahl
  // Zeigt Filter, Suchfeld, Hinzufügen-Button und die Objekttabelle.
  // -------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Filter- und Suchleiste */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Objekttyp-Filter-Dropdown */}
        <select
          value={selectedObjectType}
          onChange={(e) => setSelectedObjectType(e.target.value)} // Aktualisiert den Objekttyp-Filter.
          className="w-full sm:w-auto h-10 pl-3 pr-10 text-sm" // Styling für Select.
        >
          {objectTypes.map((type) => (
            <option key={type} value={type}>
              {type === "ALLE" ? "Alle Typen" : type}{" "}
              {/* Zeigt "Alle Typen" oder den Typ selbst an. */}
            </option>
          ))}
        </select>
        {/* Suchfeld für Objektnamen */}
        <div className="relative w-full sm:flex-grow">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-placeholder-color)]" />{" "}
          {/* Such-Icon. */}
          <input
            type="search" // Suchtyp für Eingabefeld.
            placeholder="Angezeigte Objekte filtern..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Aktualisiert den Suchbegriff.
            className="w-full h-10 pl-9 pr-3 text-sm" // Styling für Input.
          />
        </div>
        {/* "Hinzufügen"-Button */}
        <button
          onClick={handleAddSelections} // Klick-Handler zum Hinzufügen ausgewählter Variablen.
          disabled={isTranslating} // Deaktiviert, wenn Übersetzung läuft.
          className="btn-primary w-full sm:w-auto flex items-center justify-center h-10 disabled:opacity-50"
        >
          <FiPlusCircle className="mr-2" /> {/* Plus-Icon. */}
          {isTranslating ? "Hinzufügen..." : "Hinzufügen"}{" "}
          {/* Dynamischer Button-Text. */}
        </button>
      </div>

      {/* Objektliste-Tabelle */}
      <div className="overflow-y-auto h-[50vh] border border-[var(--border-color)] rounded-lg">
        <table className="min-w-full divide-y divide-[var(--border-color)]">
          <thead className="bg-[var(--color-surface-2)] sticky top-0 z-10">
            <tr className="h-10">
              <th
                scope="col"
                className="px-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider"
              >
                Objektname
              </th>
              <th
                scope="col"
                className="px-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider"
              >
                Objekttyp
              </th>
              <th
                scope="col"
                className="px-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider w-1/3"
              >
                Parameter
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-surface)] divide-y divide-[var(--border-color)]">
            {filteredObjects.length > 0 ? (
              // Rendert jede gefilterte Objektzeile.
              filteredObjects.map((obj) => (
                <tr
                  key={obj.objId}
                  onClick={() => handleRowSelect(obj.objId)} // Klick-Handler für Zeilenauswahl.
                  className={`cursor-pointer transition-colors h-10 ${
                    selections[obj.objId]?.isSelected // Styling für ausgewählte Zeilen.
                      ? "bg-[color-mix(in_srgb,var(--color-accent)_15%,transparent)]"
                      : "hover:bg-[var(--color-surface-2)]"
                  }`}
                >
                  <td className="px-2 text-sm font-medium text-[var(--color-text-primary)] whitespace-nowrap">
                    {obj.objName}
                  </td>
                  <td className="px-2 text-sm text-[var(--color-text-secondary)] whitespace-nowrap">
                    {obj.objectTypeName}
                  </td>
                  <td className="px-2 py-1">
                    {/* `onClick={(e) => e.stopPropagation()}` verhindert, dass der Klick auf das Select-Element die Zeilenauswahl umschaltet. */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {/* react-select für Parameter (Erweiterungen) */}
                      <Select
                        options={
                          selections[obj.objId]?.validExtensions?.map(
                            (ext) => ({ value: ext, label: ext }) // Optionen aus validExtensions mappen.
                          ) || []
                        }
                        value={
                          selections[obj.objId]?.parameter // Aktuell ausgewählter Parameter.
                            ? {
                                value: selections[obj.objId].parameter,
                                label: selections[obj.objId].parameter,
                              }
                            : null
                        }
                        onChange={(
                          selectedOption: SingleValue<{
                            value: string;
                            label: string;
                          }>
                        ) =>
                          handleParameterChange(
                            obj.objId,
                            selectedOption?.value || "" // Aktualisiert den Parameter bei Auswahländerung.
                          )
                        }
                        placeholder={
                          selections[obj.objId]?.isLoadingExtensions // Platzhaltertext, wenn Erweiterungen geladen werden.
                            ? "Laden..."
                            : "-"
                        }
                        isDisabled={
                          !selections[obj.objId]?.isSelected || isTranslating // Deaktiviert, wenn Zeile nicht ausgewählt oder Übersetzung läuft.
                        }
                        isLoading={selections[obj.objId]?.isLoadingExtensions} // Zeigt Lade-Spinner im Select.
                        isClearable // Ermöglicht das Löschen der Auswahl.
                        isSearchable // Ermöglicht das Suchen in Optionen.
                        styles={selectStyles} // Angepasste Stile.
                        className="w-full text-sm"
                        classNamePrefix="react-select"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Nachricht, wenn keine Objekte gefunden wurden.
              <tr className="h-10">
                <td
                  colSpan={3}
                  className="text-center text-sm text-[var(--color-text-secondary)] py-2"
                >
                  <FiInbox className="inline mr-1" /> Keine Objekte gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
