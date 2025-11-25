// // export default CreateScenarioModal;

// "use client";

// import React, { useEffect, useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useSimoneContext } from "@/contexts/SimoneContext";
// import { CreateScenarioPayload, ScenarioListItemDto } from "@/types";
// import Modal from "@/components/common/Modal";

// // Definiert das Validierungsschema mit Zod
// const createScenarioSchema = z
//   .object({
//     scenarioName: z
//       .string()
//       .min(1, "Szenarioname ist erforderlich")
//       .max(50, "Name darf 50 Zeichen nicht überschreiten"),
//     runtype: z.coerce.number({ required_error: "Lauftyp ist erforderlich" }),
//     initialConditions: z
//       .string()
//       .min(1, "Anfangsbedingungen sind erforderlich"),
//     comment: z.string().optional(),
//     initTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
//       message: "Ungültige Startzeit",
//     }),
//     termTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
//       message: "Ungültige Endzeit",
//     }),
//   })
//   .refine((data) => new Date(data.initTime) < new Date(data.termTime), {
//     message: "Die Endzeit muss nach der Startzeit liegen",
//     path: ["termTime"],
//   });

// type FormValues = z.infer<typeof createScenarioSchema>;

// interface CreateScenarioModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// // Platzhalter für das Abrufen von Lauftypen vom Backend
// const fetchRunTypes = async (): Promise<Record<string, string>> => {
//   // Dies würde vom Backend-API abgerufen, wie in Teil 9 beschrieben.
//   return { "1": "Dynamische Simulation (DYN)", "2": "Stationär (SS)" };
// };

// const CreateScenarioModal: React.FC<CreateScenarioModalProps> = ({
//   open,
//   onClose,
//   onSuccess,
// }) => {
//   const { simoneState, handleCreateScenario } = useSimoneContext();
//   const { scenarios, isCreatingScenario } = simoneState;

//   const [runTypes, setRunTypes] = useState<Record<string, string>>({});

//   const {
//     handleSubmit,
//     control,
//     formState: { errors },
//     reset,
//   } = useForm<FormValues>({
//     resolver: zodResolver(createScenarioSchema),
//     defaultValues: {
//       scenarioName: "",
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       runtype: "" as any,
//       initialConditions: "",
//       comment: "",
//       initTime: "",
//       termTime: "",
//     },
//   });

//   useEffect(() => {
//     if (open) {
//       reset({
//         scenarioName: "",
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         runtype: "" as any,
//         initialConditions: "INIT",
//         comment: "",
//         initTime: new Date().toISOString().slice(0, 16),
//         termTime: new Date(new Date().getTime() + 60 * 60 * 1000) // 1 Stunde später
//           .toISOString()
//           .slice(0, 16),
//       });
//       fetchRunTypes().then(setRunTypes);
//     }
//   }, [open, reset]);

//   const onSubmit = async (data: FormValues) => {
//     const payload: CreateScenarioPayload = {
//       ...data,
//       runtype: Number(data.runtype),
//       initTime: new Date(data.initTime).getTime(),
//       termTime: new Date(data.termTime).getTime(),
//     };

//     try {
//       await handleCreateScenario(payload);
//       onSuccess();
//     } catch (error) {
//       console.error("Szenario konnte nicht erstellt werden:", error);
//     }
//   };

//   const scenariosForDropdown = scenarios as ScenarioListItemDto[];

//   return (
//     <Modal isOpen={open} onClose={onClose} title="Neues Szenario erstellen">
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         <div>
//           <label
//             htmlFor="scenarioName"
//             className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//           >
//             Szenarioname
//           </label>
//           <Controller
//             name="scenarioName"
//             control={control}
//             render={({ field }) => (
//               <input
//                 {...field}
//                 id="scenarioName"
//                 type="text"
//                 className="mt-1"
//               />
//             )}
//           />
//           {errors.scenarioName && (
//             <p className="mt-2 text-sm text-[var(--color-danger)]">
//               {errors.scenarioName.message}
//             </p>
//           )}
//         </div>

//         <div>
//           <label
//             htmlFor="runtype"
//             className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//           >
//             Lauftyp
//           </label>
//           <Controller
//             name="runtype"
//             control={control}
//             render={({ field }) => (
//               <select {...field} id="runtype" className="mt-1">
//                 <option value="" disabled>
//                   Bitte wählen Sie...
//                 </option>
//                 {Object.entries(runTypes).map(([value, name]) => (
//                   <option key={value} value={value}>
//                     {name}
//                   </option>
//                 ))}
//               </select>
//             )}
//           />
//           {errors.runtype && (
//             <p className="mt-2 text-sm text-[var(--color-danger)]">
//               {errors.runtype.message}
//             </p>
//           )}
//         </div>

//         <div>
//           <label
//             htmlFor="initialConditions"
//             className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//           >
//             Anfangsbedingungen
//           </label>
//           <Controller
//             name="initialConditions"
//             control={control}
//             render={({ field }) => (
//               <select {...field} id="initialConditions" className="mt-1">
//                 <option value="" disabled>
//                   Bitte wählen Sie...
//                 </option>
//                 <option value="INIT">INIT</option>
//                 {scenariosForDropdown.map((scenario) => (
//                   <option key={scenario.name} value={scenario.name}>
//                     {scenario.name}
//                   </option>
//                 ))}
//               </select>
//             )}
//           />
//           {errors.initialConditions && (
//             <p className="mt-2 text-sm text-[var(--color-danger)]">
//               {errors.initialConditions.message}
//             </p>
//           )}
//         </div>

//         <div>
//           <label
//             htmlFor="comment"
//             className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
//           >
//             Kommentar (Optional)
//           </label>
//           <Controller
//             name="comment"
//             control={control}
//             render={({ field }) => (
//               <textarea {...field} id="comment" rows={3} className="mt-1" />
//             )}
//           />
//         </div>

//         <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
//           <div>
//             <label
//               htmlFor="initTime"
//               className="block text-sm font-medium text-[var(--color-text-secondary)]"
//             >
//               Startzeit
//             </label>
//             <Controller
//               name="initTime"
//               control={control}
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   type="datetime-local"
//                   id="initTime"
//                   className="mt-1"
//                 />
//               )}
//             />
//             {errors.initTime && (
//               <p className="mt-2 text-sm text-[var(--color-danger)]">
//                 {errors.initTime.message}
//               </p>
//             )}
//           </div>

//           <div>
//             <label
//               htmlFor="termTime"
//               className="block text-sm font-medium text-[var(--color-text-secondary)]"
//             >
//               Endzeit
//             </label>
//             <Controller
//               name="termTime"
//               control={control}
//               render={({ field }) => (
//                 <input
//                   {...field}
//                   type="datetime-local"
//                   id="termTime"
//                   className="mt-1"
//                 />
//               )}
//             />
//             {errors.termTime && (
//               <p className="mt-2 text-sm text-[var(--color-danger)]">
//                 {errors.termTime.message}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="flex justify-end gap-4 pt-4">
//           <button
//             type="button"
//             onClick={onClose}
//             disabled={isCreatingScenario}
//             className="disabled:opacity-50"
//           >
//             Abbrechen
//           </button>
//           <button
//             type="submit"
//             disabled={isCreatingScenario}
//             className="btn-primary disabled:opacity-50"
//           >
//             {isCreatingScenario ? "Erstellen..." : "Szenario erstellen"}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default CreateScenarioModal;

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React, { useEffect, useState } from "react"; // React Hooks für Zustand und Lebenszyklus.
import { useForm, Controller } from "react-hook-form"; // Hooks für Formularverwaltung von 'react-hook-form'.
import { zodResolver } from "@hookform/resolvers/zod"; // Zod-Resolver zur Integration von Zod-Validierung mit react-hook-form.
import { z } from "zod"; // Zod-Bibliothek für Schema-Definition und Validierung.
import { useSimoneContext } from "@/contexts/SimoneContext"; // Importiert den SimoneContext für SIMONE-spezifische Aktionen.
import { CreateScenarioPayload, ScenarioListItemDto } from "@/types"; // Typdefinitionen für Szenario-Payloads und Listen-Elemente.
import Modal from "@/components/common/Modal"; // Importiert die allgemeine Modal-Komponente.

// -------------------------------------------------------------------
// ✅ Zod-Schema: createScenarioSchema
// Definiert das Validierungsschema für die Formulardaten zur Szenarioerstellung.
// Stellt sicher, dass die Eingaben den Anforderungen entsprechen, z.B. Mindestlängen,
// gültige Zahlen und Datumsformate sowie logische Beziehungen (Endzeit nach Startzeit).
// -------------------------------------------------------------------
const createScenarioSchema = z
  .object({
    scenarioName: z // Szenarioname: String, mindestens 1 Zeichen, maximal 50.
      .string()
      .min(1, "Szenarioname ist erforderlich")
      .max(50, "Name darf 50 Zeichen nicht überschreiten"),
    runtype: z.coerce // Lauftyp: Wird in eine Zahl umgewandelt ('coerce'), ist erforderlich.
      .number({ required_error: "Lauftyp ist erforderlich" })
      .min(1, "Lauftyp ist erforderlich"), // Mindestwert, um leere Auswahl zu verhindern (z.B. bei disabled option)
    initialConditions: z // Anfangsbedingungen: String, mindestens 1 Zeichen.
      .string()
      .min(1, "Anfangsbedingungen sind erforderlich"),
    comment: z.string().optional(), // Kommentar: Optionaler String.
    initTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      // Startzeit: String, muss ein gültiges Datum sein.
      message: "Ungültige Startzeit",
    }),
    termTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      // Endzeit: String, muss ein gültiges Datum sein.
      message: "Ungültige Endzeit",
    }),
  })
  // Zusätzliche Validierung (Refinement): Endzeit muss nach Startzeit liegen.
  .refine((data) => new Date(data.initTime) < new Date(data.termTime), {
    message: "Die Endzeit muss nach der Startzeit liegen",
    path: ["termTime"], // Ordnet den Fehler dem 'termTime'-Feld zu.
  });

// Leitet den TypeScript-Typ für die Formulardaten vom Zod-Schema ab.
type FormValues = z.infer<typeof createScenarioSchema>;

/**
 * -------------------------------------------------------------------
 * ✅ Interface: CreateScenarioModalProps
 * Definiert die Props (Eigenschaften), die an die CreateScenarioModal-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface CreateScenarioModalProps {
  open: boolean; // Steuert, ob das Modal sichtbar ist.
  onClose: () => void; // Callback-Funktion, die aufgerufen wird, wenn das Modal geschlossen werden soll.
  onSuccess: () => void; // Callback-Funktion, die bei erfolgreicher Szenarioerstellung aufgerufen wird.
}

// -------------------------------------------------------------------
// ✅ Platzhalterfunktion: fetchRunTypes
// Dies ist eine Dummy-Funktion, die Lauftypen vom Backend abrufen würde.
// In einer echten Implementierung würde hier ein API-Aufruf zu einem
// entsprechenden Backend-Endpunkt erfolgen.
// -------------------------------------------------------------------
const fetchRunTypes = async (): Promise<Record<string, string>> => {
  // Beispielhafte harte Codierung von Lauftypen.
  // In einer realen Anwendung würde dies ein `apiClient.get('/simone/runtypes')` sein.
  return { "1": "Dynamische Simulation (DYN)", "2": "Stationär (SS)" };
};

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: CreateScenarioModal
 * Eine Komponente für ein modales Fenster zum Erstellen eines neuen Szenarios.
 * Das Formular ermöglicht die Eingabe von Szenarioname, Lauftyp,
 * Anfangsbedingungen, Kommentar, Start- und Endzeit.
 * -------------------------------------------------------------------
 */
const CreateScenarioModal: React.FC<CreateScenarioModalProps> = ({
  open, // Steuert die Sichtbarkeit des Modals.
  onClose, // Funktion zum Schließen des Modals.
  onSuccess, // Funktion, die bei Erfolg aufgerufen wird.
}) => {
  // Holt SIMONE-spezifische Zustände und Funktionen aus dem Kontext.
  const { simoneState, handleCreateScenario } = useSimoneContext();
  const { scenarios, isCreatingScenario } = simoneState; // `scenarios` für Dropdown, `isCreatingScenario` für Ladezustand.

  // Zustandsvariable für die verfügbaren Lauftypen.
  const [runTypes, setRunTypes] = useState<Record<string, string>>({});

  // `react-hook-form` Initialisierung.
  const {
    handleSubmit, // Funktion zum Registrieren des Submit-Handlers.
    control, // Control-Objekt zur Registrierung von Inputs mit Controllern.
    formState: { errors }, // Objekt, das Validierungsfehler enthält.
    reset, // Funktion zum Zurücksetzen der Formulardaten.
  } = useForm<FormValues>({
    resolver: zodResolver(createScenarioSchema), // Verwendet Zod für die Validierung.
    defaultValues: {
      // Standardwerte für die Formularfelder.
      scenarioName: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      runtype: "" as any, // Initialwert für Select, kann eine leere Zeichenkette sein.
      initialConditions: "",
      comment: "",
      initTime: "",
      termTime: "",
    },
  });

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Formular zurücksetzen und Lauftypen laden
   * Dieser Hook wird ausgelöst, wenn das Modal geöffnet wird.
   * Er setzt das Formular auf Standardwerte zurück und lädt die Lauftypen.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    if (open) {
      // Wenn das Modal geöffnet ist.
      reset({
        // Setzt das Formular auf initialen Zustand zurück.
        scenarioName: "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        runtype: "" as any,
        initialConditions: "INIT", // Standardwert für Anfangsbedingungen.
        initTime: new Date().toISOString().slice(0, 16), // Aktuelle Zeit für Startzeit (YYYY-MM-DDTHH:MM Format).
        termTime: new Date(new Date().getTime() + 60 * 60 * 1000) // 1 Stunde später für Endzeit.
          .toISOString()
          .slice(0, 16),
        comment: "", // Leerer Kommentar.
      });
      fetchRunTypes().then(setRunTypes); // Lädt Lauftypen und speichert sie im Zustand.
    }
  }, [open, reset]); // Abhängigkeiten: wird bei Änderungen von 'open' oder 'reset' ausgeführt.

  /**
   * -------------------------------------------------------------------
   * ✅ Funktion: onSubmit
   * Der Haupt-Submit-Handler für das Formular.
   * Wird aufgerufen, wenn das Formular gültig ist.
   * Konvertiert die Formulardaten in das benötigte API-Payload-Format
   * und ruft die `handleCreateScenario`-Funktion aus dem Kontext auf.
   * -------------------------------------------------------------------
   */
  const onSubmit = async (data: FormValues) => {
    // Erstellt den Payload im Format, das die API erwartet.
    const payload: CreateScenarioPayload = {
      ...data, // Kopiert alle direkt passenden Felder.
      runtype: Number(data.runtype), // Stellt sicher, dass 'runtype' eine Zahl ist.
      initTime: new Date(data.initTime).getTime(), // Konvertiert Datum-String in Unix-Timestamp (Millisekunden).
      termTime: new Date(data.termTime).getTime(), // Konvertiert Datum-String in Unix-Timestamp (Millisekunden).
    };

    try {
      await handleCreateScenario(payload); // Ruft die Szenario-Erstellungsfunktion aus dem Kontext auf.
      onSuccess(); // Ruft den Erfolgs-Callback auf (z.B. um das Modal zu schließen und die Liste zu aktualisieren).
    } catch (error) {
      console.error("Szenario konnte nicht erstellt werden:", error); // Protokolliert Fehler.
      // Hier könnte man auch einen Toast oder eine andere UI-Fehlermeldung anzeigen.
    }
  };

  // Stellt die Szenarien aus dem Kontext für das "Anfangsbedingungen"-Dropdown bereit.
  const scenariosForDropdown = scenarios as ScenarioListItemDto[];

  return (
    <Modal isOpen={open} onClose={onClose} title="Neues Szenario erstellen">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Szenarioname-Feld */}
        <div>
          <label
            htmlFor="scenarioName"
            className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
          >
            Szenarioname
          </label>
          <Controller
            name="scenarioName"
            control={control}
            render={({ field }) => (
              <input
                {...field} // Bindet Input-Props (value, onChange, onBlur) von react-hook-form.
                id="scenarioName"
                type="text"
                className="mt-1"
              />
            )}
          />
          {errors.scenarioName && ( // Zeigt Validierungsfehler an.
            <p className="mt-2 text-sm text-[var(--color-danger)]">
              {errors.scenarioName.message}
            </p>
          )}
        </div>

        {/* Lauftyp-Dropdown */}
        <div>
          <label
            htmlFor="runtype"
            className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
          >
            Lauftyp
          </label>
          <Controller
            name="runtype"
            control={control}
            render={({ field }) => (
              <select {...field} id="runtype" className="mt-1">
                <option value="" disabled>
                  Bitte wählen Sie...{" "}
                  {/* Standardoption, die deaktiviert ist. */}
                </option>
                {Object.entries(runTypes).map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.runtype && (
            <p className="mt-2 text-sm text-[var(--color-danger)]">
              {errors.runtype.message}
            </p>
          )}
        </div>

        {/* Anfangsbedingungen-Dropdown */}
        <div>
          <label
            htmlFor="initialConditions"
            className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
          >
            Anfangsbedingungen
          </label>
          <Controller
            name="initialConditions"
            control={control}
            render={({ field }) => (
              <select {...field} id="initialConditions" className="mt-1">
                <option value="" disabled>
                  Bitte wählen Sie...
                </option>
                <option value="INIT">INIT</option>{" "}
                {/* Feste Option für "INIT". */}
                {scenariosForDropdown.map((scenario) => (
                  <option key={scenario.name} value={scenario.name}>
                    {scenario.name}{" "}
                    {/* Andere Szenarien als Anfangsbedingungen. */}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.initialConditions && (
            <p className="mt-2 text-sm text-[var(--color-danger)]">
              {errors.initialConditions.message}
            </p>
          )}
        </div>

        {/* Kommentar-Textbereich */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium leading-6 text-[var(--color-text-primary)]"
          >
            Kommentar (Optional)
          </label>
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <textarea {...field} id="comment" rows={3} className="mt-1" />
            )}
          />
        </div>

        {/* Start- und Endzeit (Nebeneinander im Raster) */}
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          {/* Startzeit */}
          <div>
            <label
              htmlFor="initTime"
              className="block text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Startzeit
            </label>
            <Controller
              name="initTime"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="datetime-local" // HTML5-Input für Datum und Uhrzeit.
                  id="initTime"
                  className="mt-1"
                />
              )}
            />
            {errors.initTime && (
              <p className="mt-2 text-sm text-[var(--color-danger)]">
                {errors.initTime.message}
              </p>
            )}
          </div>

          {/* Endzeit */}
          <div>
            <label
              htmlFor="termTime"
              className="block text-sm font-medium text-[var(--color-text-secondary)]"
            >
              Endzeit
            </label>
            <Controller
              name="termTime"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="datetime-local" // HTML5-Input für Datum und Uhrzeit.
                  id="termTime"
                  className="mt-1"
                />
              )}
            />
            {errors.termTime && (
              <p className="mt-2 text-sm text-[var(--color-danger)]">
                {errors.termTime.message}
              </p>
            )}
          </div>
        </div>

        {/* Aktionsbuttons (Abbrechen und Szenario erstellen) */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onClose} // Schließt das Modal.
            disabled={isCreatingScenario} // Deaktiviert, wenn Szenario erstellt wird.
            className="disabled:opacity-50 btn-secondary" // Standard-Button-Stil.
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isCreatingScenario} // Deaktiviert, wenn Szenario erstellt wird.
            className="btn-primary disabled:opacity-50" // Primärer Button-Stil.
          >
            {isCreatingScenario ? "Erstellen..." : "Szenario erstellen"}{" "}
            {/* Text ändert sich während des Ladens. */}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateScenarioModal;
