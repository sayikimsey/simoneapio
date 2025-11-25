// "use client";

// import React from "react";
// import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
// import {
//   FiSettings,
//   FiDatabase,
//   FiPlayCircle,
//   FiSliders,
// } from "react-icons/fi"; // Import FiSliders
// import clsx from "clsx";

// import SettingsTabContent from "./tabs/SettingsTabContent";
// import ScenariosTabContent from "./tabs/ScenariosTabContent";
// import CalculateTabContent from "./tabs/CalculateTabContent";
// import SystemparameterTabContent from "./tabs/SystemparameterTabContent"; // Import the new component

// // Defines the configuration for each tab in the station view.
// const tabs = [
//   {
//     id: "settings",
//     name: "Initialisierung & Netze",
//     icon: FiSettings,
//     content: <SettingsTabContent />,
//   },
//   {
//     id: "scenarios",
//     name: "Szenarien & Daten",
//     icon: FiDatabase,
//     content: <ScenariosTabContent />,
//   },
//   {
//     id: "calculate",
//     name: "Berechnen",
//     icon: FiPlayCircle,
//     content: <CalculateTabContent />,
//   },

//   {
//     id: "system-parameters",
//     name: "Systemparameter",
//     icon: FiSliders,
//     content: <SystemparameterTabContent />,
//   },
// ];

// /**
//  * A component that renders the tab navigation system
//  * for the main areas of the SIMONE station.
//  */
// export default function StationTabs() {
//   return (
//     <div className="w-full">
//       <TabGroup>
//         <TabList className="flex space-x-3">
//           {tabs.map((tab) => (
//             <Tab
//               key={tab.id}
//               className={({ selected }) =>
//                 clsx(
//                   "w-full flex items-center justify-center rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all duration-200 ease-in-out",
//                   "focus:outline-none focus:ring-2 ring-offset-2 ring-[var(--color-accent)] ring-offset-[var(--color-background)]",
//                   selected
//                     ? "bg-[var(--color-surface)] text-[var(--color-accent)] shadow-lg"
//                     : "text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)]/70 hover:text-[var(--color-text-primary)]"
//                 )
//               }
//             >
//               <tab.icon className="w-5 h-5 mr-2" aria-hidden="true" />
//               {tab.name}
//             </Tab>
//           ))}
//         </TabList>
//         <TabPanels className="mt-4">
//           {tabs.map((tab) => (
//             <TabPanel
//               key={tab.id}
//               className={clsx(
//                 "rounded-xl p-6 bg-[var(--color-surface)] border border-[var(--border-color)] shadow-md",
//                 "focus:outline-none focus:ring-2 ring-offset-2 ring-[var(--color-accent)] ring-offset-[var(--color-background)]"
//               )}
//             >
//               {tab.content}
//             </TabPanel>
//           ))}
//         </TabPanels>
//       </TabGroup>
//     </div>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js.

import React from "react"; // Importiert die React-Bibliothek.
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react"; // Importiert Komponenten für Tab-Navigation von Headless UI.
import {
  FiSettings, // Icon für Einstellungen.
  FiDatabase, // Icon für Datenbank/Daten.
  FiPlayCircle, // Icon für Abspielen/Berechnen.
  FiSliders, // Icon für Regler/Systemparameter.
} from "react-icons/fi"; // Importiert Icons von Feather Icons.
import clsx from "clsx"; // Eine Utility-Bibliothek zum einfachen Bedingten Zusammenführen von CSS-Klassen.

import SettingsTabContent from "./tabs/SettingsTabContent"; // Importiert den Inhalt für den Tab "Initialisierung & Netze".
import ScenariosTabContent from "./tabs/ScenariosTabContent"; // Importiert den Inhalt für den Tab "Szenarien & Daten".
import CalculateTabContent from "./tabs/CalculateTabContent"; // Importiert den Inhalt für den Tab "Berechnen".
import SystemparameterTabContent from "./tabs/SystemparameterTabContent"; // Importiert den Inhalt für den neuen Tab "Systemparameter".

// -------------------------------------------------------------------
// ✅ Tab-Konfiguration
// Definiert die Konfiguration für jeden Tab in der Stationsansicht.
// Jeder Tab hat eine ID, einen Namen, ein Icon und die entsprechende Inhalt-Komponente.
// -------------------------------------------------------------------
const tabs = [
  {
    id: "settings", // Eindeutige ID des Tabs.
    name: "Initialisierung & Netze", // Anzeigetext des Tabs.
    icon: FiSettings, // Icon-Komponente für den Tab.
    content: <SettingsTabContent />, // Die React-Komponente, die den Inhalt dieses Tabs darstellt.
  },
  {
    id: "scenarios",
    name: "Szenarien & Daten",
    icon: FiDatabase,
    content: <ScenariosTabContent />,
  },
  {
    id: "calculate",
    name: "Berechnen",
    icon: FiPlayCircle,
    content: <CalculateTabContent />,
  },
  {
    id: "system-parameters", // Neuer Tab für Systemparameter.
    name: "Systemparameter",
    icon: FiSliders, // Icon für Systemparameter.
    content: <SystemparameterTabContent />, // Inhalt-Komponente für den Systemparameter-Tab.
  },
];

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: StationTabs
 * Eine Komponente, die das Tab-Navigationssystem für die Hauptbereiche
 * der SIMONE-Station rendert. Sie verwendet die Headless UI Tab-Komponenten,
 * um eine barrierefreie und themenbasierte Tab-Ansicht zu erstellen.
 * -------------------------------------------------------------------
 */
export default function StationTabs() {
  return (
    <div className="w-full">
      {" "}
      {/* Container für die gesamte Tab-Gruppe, nimmt die volle Breite ein. */}
      <TabGroup>
        {" "}
        {/* Headless UI TabGroup: Umfasst alle Tab-bezogenen Komponenten. */}
        <TabList className="flex space-x-3">
          {" "}
          {/* Headless UI TabList: Container für die einzelnen Tabs, mit horizontalem Abstand. */}
          {tabs.map(
            (
              tab // Rendert jeden Tab basierend auf der Konfiguration.
            ) => (
              <Tab
                key={tab.id} // Eindeutiger Schlüssel für jeden Tab.
                // Die 'className'-Prop verwendet eine Funktion, die ein Objekt mit dem 'selected'-Status erhält.
                // 'clsx' hilft dabei, Klassen bedingt zusammenzuführen.
                className={({ selected }) =>
                  clsx(
                    "w-full flex items-center justify-center rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all duration-200 ease-in-out", // Grundlegende Styling-Klassen für alle Tabs.
                    "focus:outline-none focus:ring-2 ring-offset-2 ring-[var(--color-accent)] ring-offset-[var(--color-background)]", // Fokus-Stile für Barrierefreiheit (Outline, Ring).
                    selected // Bedingte Klassen basierend darauf, ob der Tab ausgewählt ist.
                      ? "bg-[var(--color-surface)] text-[var(--color-accent)] shadow-lg" // Stil für den ausgewählten Tab.
                      : "text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)]/70 hover:text-[var(--color-text-primary)]" // Stil für nicht ausgewählte Tabs und deren Hover-Zustand.
                  )
                }
              >
                <tab.icon className="w-5 h-5 mr-2" aria-hidden="true" />{" "}
                {/* Das Icon des Tabs. */}
                {tab.name} {/* Der Anzeigetext des Tabs. */}
              </Tab>
            )
          )}
        </TabList>
        <TabPanels className="mt-4">
          {" "}
          {/* Headless UI TabPanels: Container für die Inhalte der Tabs, mit oberem Abstand. */}
          {tabs.map(
            (
              tab // Rendert den Inhalt für jeden Tab.
            ) => (
              <TabPanel
                key={tab.id} // Eindeutiger Schlüssel für jedes Tab-Panel.
                // Styling-Klassen für die Tab-Panel. Sie werden aktiv, wenn der entsprechende Tab ausgewählt ist.
                className={clsx(
                  "rounded-xl p-6 bg-[var(--color-surface)] border border-[var(--border-color)] shadow-md", // Grundlegende Styling für den Panel-Inhalt.
                  "focus:outline-none focus:ring-2 ring-offset-2 ring-[var(--color-accent)] ring-offset-[var(--color-background)]" // Fokus-Stile für Barrierefreiheit.
                )}
              >
                {tab.content}{" "}
                {/* Der Inhalt des Tabs, der als React-Komponente übergeben wird. */}
              </TabPanel>
            )
          )}
        </TabPanels>
      </TabGroup>
    </div>
  );
}
