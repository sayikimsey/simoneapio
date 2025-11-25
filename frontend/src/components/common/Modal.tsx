// "use client";
// import { Dialog, Transition } from "@headlessui/react";
// import { Fragment, ReactNode } from "react";
// import { FiX } from "react-icons/fi";

// /**
//  * Defines the props for the Modal component.
//  */
// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   children: ReactNode;
//   size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
// }

// /**
//  * A reusable modal dialog component that is displayed over the main content.
//  * It includes a title, a close button, and a customizable content area.
//  * The size of the modal can be controlled via the `size` prop.
//  */
// export default function Modal({
//   isOpen,
//   onClose,
//   title,
//   children,
//   size = "md",
// }: ModalProps) {
//   // Maps the `size` prop to a corresponding Tailwind CSS class for the max-width.
//   const sizeClass = {
//     sm: "sm:max-w-sm",
//     md: "sm:max-w-md",
//     lg: "sm:max-w-lg",
//     xl: "sm:max-w-xl",
//     "2xl": "sm:max-w-2xl",
//     "3xl": "sm:max-w-3xl",
//     "4xl": "sm:max-w-4xl",
//     "5xl": "sm:max-w-5xl",
//   }[size];

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-40" onClose={onClose}>
//         <Transition.Child
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
//         </Transition.Child>

//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4 text-center">
//             <Transition.Child
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Dialog.Panel
//                 className={`w-full ${sizeClass} transform overflow-hidden rounded-2xl bg-[var(--color-surface)] p-6 text-left align-middle shadow-xl transition-all border border-[var(--border-color)]`}
//               >
//                 <Dialog.Title
//                   as="h3"
//                   className="text-lg font-medium leading-6 text-[var(--color-text-primary)]"
//                 >
//                   {title}
//                 </Dialog.Title>
//                 <button
//                   onClick={onClose}
//                   className="btn-icon-ghost absolute top-3 right-3"
//                   aria-label="Modal schließen"
//                 >
//                   <FiX className="h-6 w-6" />
//                 </button>
//                 <div className="mt-4">{children}</div>
//               </Dialog.Panel>
//             </Transition.Child>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }

"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js, notwendig für Hooks und Interaktivität.

import { Dialog, Transition } from "@headlessui/react"; // Importiert Komponenten für Dialoge und Übergangseffekte von Headless UI.
import { Fragment, ReactNode } from "react"; // Importiert Fragment von React, um unnötige DOM-Elemente zu vermeiden.
import { FiX } from "react-icons/fi"; // Importiert das "X"-Icon von Feather Icons für den Schließen-Button.

/**
 * -------------------------------------------------------------------
 * ✅ Interface: ModalProps
 * Definiert die Props (Eigenschaften), die an die Modal-Komponente
 * übergeben werden können.
 * -------------------------------------------------------------------
 */
interface ModalProps {
  isOpen: boolean; // Steuert die Sichtbarkeit des Modals (true = geöffnet, false = geschlossen).
  onClose: () => void; // Callback-Funktion, die aufgerufen wird, wenn das Modal geschlossen werden soll (z.B. durch Klick auf Overlay oder Schließen-Button).
  title: string; // Der Titel, der oben im Modal angezeigt wird.
  children: ReactNode; // Der Inhalt, der innerhalb des Modals gerendert werden soll (kann jede React-Node sein).
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"; // Optionale Prop zur Steuerung der maximalen Breite des Modals.
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: Modal
 * Eine wiederverwendbare, barrierefreie modale Dialogkomponente, die über
 * dem Hauptinhalt angezeigt wird.
 * Sie enthält einen Titel, einen Schließen-Button und einen anpassbaren Inhaltsbereich.
 * Die Größe des Modals kann über die `size`-Prop gesteuert werden.
 *
 * Verwendet Headless UI für Barrierefreiheit und einfache Transitionen.
 * -------------------------------------------------------------------
 */
export default function Modal({
  isOpen, // Status, ob das Modal geöffnet ist.
  onClose, // Funktion zum Schließen des Modals.
  title, // Der im Modal angezeigte Titel.
  children, // Der Inhalt des Modals.
  size = "md", // Standardgröße, wenn keine 'size'-Prop übergeben wird.
}: ModalProps) {
  // -------------------------------------------------------------------
  // ✅ Größen-Mapping
  // Eine Map, die die `size`-Prop auf entsprechende Tailwind CSS-Klassen
  // für die maximale Breite des Modals abbildet.
  // Diese Klassen steuern die responsive Breite des Modals auf verschiedenen Bildschirmgrößen.
  // -------------------------------------------------------------------
  const sizeClass = {
    sm: "sm:max-w-sm", // Max. Breite auf small-Screens: 24rem (384px)
    md: "sm:max-w-md", // Max. Breite auf small-Screens: 28rem (448px)
    lg: "sm:max-w-lg", // Max. Breite auf small-Screens: 32rem (512px)
    xl: "sm:max-w-xl", // Max. Breite auf small-Screens: 36rem (576px)
    "2xl": "sm:max-w-2xl", // Max. Breite auf small-Screens: 42rem (672px)
    "3xl": "sm:max-w-3xl", // Max. Breite auf small-Screens: 48rem (768px)
    "4xl": "sm:max-w-4xl", // Max. Breite auf small-Screens: 56rem (896px)
    "5xl": "sm:max-w-5xl", // Max. Breite auf small-Screens: 64rem (1024px)
  }[size];

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur der Modal-Komponente
  // Verwendet Headless UI's `Transition` und `Dialog` Komponenten für
  // Animationen und Barrierefreiheit.
  // -------------------------------------------------------------------
  return (
    // 'Transition' Komponente steuert die Ein- und Ausblendanimationen des Modals.
    <Transition appear show={isOpen} as={Fragment}>
      {/* 'Dialog' Komponente ist der Haupt-Wrapper für das modale Dialogfeld.
          'as="div"' rendert es als div.
          'className="relative z-40"' setzt einen hohen z-Index, um über dem Inhalt zu liegen.
          'onClose={onClose}' sorgt dafür, dass das Modal geschlossen wird, wenn Escape gedrückt wird oder außerhalb geklickt wird. */}
      <Dialog as="div" className="relative z-40" onClose={onClose}>
        {/* Transition für den Hintergrund-Overlay (Dimmer) */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" // Animation beim Eintreten (Dauer 300ms, einfach aus)
          enterFrom="opacity-0" // Startzustand: komplett transparent
          enterTo="opacity-100" // Endzustand: komplett opak
          leave="ease-in duration-200" // Animation beim Verlassen (Dauer 200ms, einfach ein)
          leaveFrom="opacity-100" // Startzustand: komplett opak
          leaveTo="opacity-0" // Endzustand: komplett transparent
        >
          {/* Der feste Hintergrund, der den Hauptinhalt abdunkelt */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Container für den tatsächlichen Modalinhalt, ermöglicht Scrollen */}
        <div className="fixed inset-0 overflow-y-auto">
          {/* Flex-Container, um den Modalinhalt vertikal und horizontal zu zentrieren */}
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Transition für das Modalpanel selbst */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" // Animation beim Eintreten
              enterFrom="opacity-0 scale-95" // Startzustand: transparent und leicht verkleinert
              enterTo="opacity-100 scale-100" // Endzustand: opak und normale Größe
              leave="ease-in duration-200" // Animation beim Verlassen
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Das eigentliche Modalpanel */}
              <Dialog.Panel
                className={`w-full ${sizeClass} transform overflow-hidden rounded-2xl bg-[var(--color-surface)] p-6 text-left align-middle shadow-xl transition-all border border-[var(--border-color)]`}
              >
                {/* Titel des Modals */}
                <Dialog.Title
                  as="h3" // Rendert als h3-Überschrift für semantische Korrektheit
                  className="text-lg font-medium leading-6 text-[var(--color-text-primary)]"
                >
                  {title}
                </Dialog.Title>
                {/* Schließen-Button des Modals */}
                <button
                  onClick={onClose} // Ruft die onClose-Funktion auf, wenn geklickt wird
                  className="btn-icon-ghost absolute top-3 right-3" // Positioniert oben rechts, verwendet einen Ghost-Icon-Button-Stil
                  aria-label="Modal schließen" // Zugängliches Label für Screenreader
                >
                  <FiX className="h-6 w-6" /> {/* Das "X"-Icon */}
                </button>
                {/* Inhalt des Modals (die Kind-Komponenten) */}
                <div className="mt-4">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
