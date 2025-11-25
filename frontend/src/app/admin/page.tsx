// // frontend/src/app/admin/page.tsx
// "use client";

// import React, { useEffect, useState, Suspense } from "react";
// import ReactECharts from "echarts-for-react";
// import { graphic } from "echarts/core";
// import { useTheme } from "@/contexts/ThemeContext";
// import { apiClient } from "@/lib/apiClient";
// import { AdminDashboardStats, RoleCount, UserActivityDataPoint } from "@/types";
// import {
//   FiUsers,
//   FiTrendingUp,
//   FiUserCheck,
//   FiUserX,
//   FiPieChart,
//   FiAlertCircle,
//   FiActivity,
//   FiLoader,
// } from "react-icons/fi";

// /**
//  * A loading spinner component.
//  */
// const LoadingSpinner = ({ message }: { message: string }) => (
//   <div className="flex justify-center items-center min-h-[300px]">
//     <div className="flex flex-col items-center">
//       <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mb-4" />
//       <p className="text-[var(--color-text-secondary)]">{message}</p>
//     </div>
//   </div>
// );

// /**
//  * A card for displaying statistics.
//  */
// const StatCard = ({
//   title,
//   value,
//   icon,
//   unit,
//   trend,
//   trendColor,
//   isLoading,
// }: {
//   title: string;
//   value: string | number;
//   icon: React.ElementType;
//   unit?: string;
//   trend?: string;
//   trendColor?: string;
//   isLoading?: boolean;
// }) => {
//   const IconComponent = icon;
//   return (
//     <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[var(--border-color)]">
//       <div className="flex items-center justify-between mb-2">
//         <h3 className="text-sm font-medium text-[var(--color-text-secondary)] truncate">
//           {title}
//         </h3>
//         <IconComponent className="h-6 w-6 text-[var(--color-accent)] flex-shrink-0" />
//       </div>
//       {isLoading ? (
//         <div className="h-10 flex items-center">
//           <div className="animate-pulse bg-[var(--color-surface-2)] rounded-md h-8 w-24"></div>
//         </div>
//       ) : (
//         <p className="text-3xl font-bold text-[var(--color-text-primary)] truncate">
//           {value}
//           {unit && (
//             <span className="text-sm font-normal text-[var(--color-text-secondary)] ml-1">
//               {unit}
//             </span>
//           )}
//         </p>
//       )}
//       {trend && !isLoading && (
//         <p
//           className={`text-xs mt-1 ${
//             trendColor || "text-[var(--color-text-secondary)]"
//           }`}
//         >
//           {trend}
//         </p>
//       )}
//     </div>
//   );
// };

// /**
//  * A pie chart for displaying user distribution by role.
//  */
// const UserRolePieChart = ({
//   usersByRoleData,
//   isLoading,
//   theme,
// }: {
//   usersByRoleData?: RoleCount[];
//   isLoading?: boolean;
//   theme: string | null;
// }) => {
//   if (isLoading) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <LoadingSpinner message="Lade Rollenverteilungsdiagramm..." />
//       </div>
//     );
//   }
//   if (!usersByRoleData || usersByRoleData.length === 0) {
//     return (
//       <div className="bg-[var(--color-surface)] border border-[var(--border-color)] p-6 rounded-xl shadow-lg flex items-center justify-center h-96">
//         <FiPieChart className="h-10 w-10 text-[var(--color-text-secondary)] mr-3" />
//         <p className="text-[var(--color-text-secondary)]">
//           Keine Rollendaten zur Anzeige des Diagramms verfügbar.
//         </p>
//       </div>
//     );
//   }

//   const chartData = usersByRoleData.map((item) => ({
//     name: item.Role
//       ? item.Role.charAt(0).toUpperCase() + item.Role.slice(1)
//       : "Unbekannte Rolle",
//     value: item.count,
//   }));

//   const option = {
//     tooltip: { trigger: "item", formatter: "{a} <br/>{b}: {c} ({d}%)" },
//     legend: {
//       orient: "vertical",
//       left: "left",
//       top: "center",
//       data: chartData.map((item) => item.name),
//       textStyle: { color: theme === "dark" ? "#CBD5E1" : "#4B5563" },
//     },
//     series: [
//       {
//         name: "Benutzer nach Rolle",
//         type: "pie",
//         radius: ["45%", "70%"],
//         center: ["65%", "50%"],
//         avoidLabelOverlap: true,
//         label: { show: false, position: "center" },
//         emphasis: {
//           label: {
//             show: true,
//             fontSize: 18,
//             fontWeight: "bold",
//             formatter: "{b}\n{c}",
//             color: theme === "dark" ? "#F3F4F6" : "#1F2937",
//           },
//         },
//         labelLine: { show: false },
//         data: chartData,
//         itemStyle: {
//           borderRadius: 8,
//           borderColor: theme === "dark" ? "#1F2937" : "#FFFFFF",
//           borderWidth: 2,
//         },
//       },
//     ],
//     color: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"],
//   };

//   return (
//     <div className="bg-[var(--color-surface)] border border-[var(--border-color)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-96">
//       <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
//         <FiPieChart className="mr-2 h-5 w-5 text-[var(--color-accent)]" />
//         Benutzer nach Rolle
//       </h3>
//       <ReactECharts
//         option={option}
//         style={{ height: "calc(100% - 40px)", width: "100%" }}
//         notMerge={true}
//         lazyUpdate={true}
//       />
//     </div>
//   );
// };

// /**
//  * A line chart for displaying new user activity.
//  */
// const NewUsersActivityChart = ({
//   activityData,
//   isLoading,
//   theme,
// }: {
//   activityData?: UserActivityDataPoint[];
//   isLoading?: boolean;
//   theme: string | null;
// }) => {
//   if (isLoading) {
//     return (
//       <div className="h-96 flex items-center justify-center">
//         <LoadingSpinner message="Lade Diagramm für neue Benutzeraktivitäten..." />
//       </div>
//     );
//   }
//   if (!activityData || activityData.length === 0) {
//     return (
//       <div className="bg-[var(--color-surface)] border border-[var(--border-color)] p-6 rounded-xl shadow-lg flex items-center justify-center h-96">
//         <FiActivity className="h-10 w-10 text-[var(--color-text-secondary)] mr-3" />
//         <p className="text-[var(--color-text-secondary)]">
//           Keine neuen Benutzeraktivitätsdaten für den ausgewählten Zeitraum.
//         </p>
//       </div>
//     );
//   }

//   const dates = activityData.map((item) =>
//     new Date(item.date).toLocaleDateString("de-DE", {
//       month: "short",
//       day: "numeric",
//     })
//   );
//   const counts = activityData.map((item) => item.count);

//   const option = {
//     tooltip: {
//       trigger: "axis",
//       axisPointer: { type: "cross", label: { backgroundColor: "#6a7985" } },
//     },
//     legend: {
//       data: ["Neue Benutzer"],
//       textStyle: { color: theme === "dark" ? "#CBD5E1" : "#4B5563" },
//     },
//     grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
//     xAxis: [
//       {
//         type: "category",
//         boundaryGap: false,
//         data: dates,
//         axisLabel: { color: theme === "dark" ? "#9CA3AF" : "#6B7280" },
//       },
//     ],
//     yAxis: [
//       {
//         type: "value",
//         axisLabel: { color: theme === "dark" ? "#9CA3AF" : "#6B7280" },
//       },
//     ],
//     series: [
//       {
//         name: "Neue Benutzer",
//         type: "line",
//         stack: "Total",
//         smooth: true,
//         lineStyle: { width: 2, color: "#8B5CF6" },
//         showSymbol: false,
//         areaStyle: {
//           opacity: 0.8,
//           color: new graphic.LinearGradient(0, 0, 0, 1, [
//             { offset: 0, color: "rgba(139, 92, 246, 0.5)" },
//             { offset: 1, color: "rgba(139, 92, 246, 0)" },
//           ]),
//         },
//         emphasis: { focus: "series" },
//         data: counts,
//         itemStyle: { color: "#8B5CF6" },
//       },
//     ],
//   };
//   return (
//     <div className="bg-[var(--color-surface)] border border-[var(--border-color)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-96">
//       <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
//         <FiActivity className="mr-2 h-5 w-5 text-violet-500" />
//         Neue Benutzerregistrierungen
//       </h3>
//       <ReactECharts
//         option={option}
//         style={{ height: "calc(100% - 40px)", width: "100%" }}
//       />
//     </div>
//   );
// };

// /**
//  * The main content component for the Admin Dashboard.
//  */
// function AdminDashboardContent() {
//   const [stats, setStats] = useState<AdminDashboardStats | null>(null);
//   const [userActivity, setUserActivity] = useState<
//     UserActivityDataPoint[] | null
//   >(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { theme } = useTheme();

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const [statsResponse, activityResponse] = await Promise.all([
//           apiClient("/admin/stats/overview", { method: "GET" }),
//           apiClient("/admin/stats/new-user-activity?days=7", { method: "GET" }),
//         ]);

//         const statsData = await statsResponse.json();
//         if (statsData.stats) {
//           setStats(statsData.stats as AdminDashboardStats);
//         } else {
//           throw new Error("Statistikdaten nicht in der API-Antwort gefunden.");
//         }

//         const activityData = await activityResponse.json();
//         if (activityData.activity && Array.isArray(activityData.activity)) {
//           setUserActivity(activityData.activity as UserActivityDataPoint[]);
//         } else {
//           throw new Error(
//             "Benutzeraktivitätsdaten nicht gefunden oder kein Array in der API-Antwort."
//           );
//         }
//       } catch (err) {
//         console.error("🔥 Fehler beim Abrufen der Admin-Dashboard-Daten:", err);
//         setError(
//           err instanceof Error
//             ? err.message
//             : "Alle Dashboard-Daten konnten nicht geladen werden."
//         );
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchDashboardData();
//   }, []);

//   return (
//     <div className="space-y-8">
//       <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
//         Admin-Dashboard-Übersicht
//       </h1>

//       {error && (
//         <div className="alert alert-danger mb-6" role="alert">
//           <div className="flex">
//             <div className="py-1">
//               <FiAlertCircle className="h-6 w-6 mr-3" />
//             </div>
//             <div>
//               <p className="font-bold">Fehler beim Laden der Dashboard-Daten</p>
//               <p className="text-sm">{error}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard
//           title="Benutzer gesamt"
//           value={stats?.totalUsers ?? "0"}
//           icon={FiUsers}
//           isLoading={isLoading}
//         />
//         <StatCard
//           title="Neue Benutzer (letzte 7 Tage)"
//           value={stats?.newUsersLast7Days ?? "0"}
//           icon={FiTrendingUp}
//           isLoading={isLoading}
//         />
//         <StatCard
//           title="Aktive Benutzer"
//           value={stats?.activeUsers ?? "0"}
//           icon={FiUserCheck}
//           isLoading={isLoading}
//         />
//         <StatCard
//           title="Inaktive Benutzer"
//           value={stats?.inactiveUsers ?? "0"}
//           icon={FiUserX}
//           isLoading={isLoading}
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <UserRolePieChart
//           usersByRoleData={stats?.usersByRole}
//           isLoading={isLoading}
//           theme={theme}
//         />
//         <NewUsersActivityChart
//           activityData={userActivity || undefined}
//           isLoading={isLoading}
//           theme={theme}
//         />
//       </div>
//     </div>
//   );
// }

// /**
//  * Exports the Admin Dashboard page, wrapped in a Suspense fallback.
//  */
// export default function AdminDashboardPage() {
//   return (
//     <Suspense fallback={<LoadingSpinner message="Lade Admin-Dashboard..." />}>
//       <AdminDashboardContent />
//     </Suspense>
//   );
// }





// frontend/src/app/admin/page.tsx
"use client"; // Dies kennzeichnet die Datei als Client Component in Next.js

import React, { useEffect, useState, Suspense } from "react";
import ReactECharts from "echarts-for-react"; // Importiert die ECharts-Komponente für React
import { graphic } from "echarts/core"; // Importiert grafische Hilfsmittel von ECharts (z.B. für Farbverläufe)
import { useTheme } from "@/contexts/ThemeContext"; // Importiert den Hook für den aktuellen Theme-Modus (hell/dunkel)
import { apiClient } from "@/lib/apiClient"; // Importiert den API-Client für HTTP-Anfragen
import { AdminDashboardStats, RoleCount, UserActivityDataPoint } from "@/types"; // Importiert Typdefinitionen für Dashboard-Statistiken

import {
  FiUsers, // Icon für "Benutzer gesamt"
  FiTrendingUp, // Icon für "Neue Benutzer"
  FiUserCheck, // Icon für "Aktive Benutzer"
  FiUserX, // Icon für "Inaktive Benutzer"
  FiPieChart, // Icon für "Tortendiagramm"
  FiAlertCircle, // Icon für "Fehler / Warnung"
  FiActivity, // Icon für "Aktivität / Liniendiagramm"
  FiLoader, // Icon für "Laden / Spinner"
} from "react-icons/fi"; // Importiert Icons aus 'react-icons'

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: LoadingSpinner
 * Eine generische Lade-Spinner-Komponente, die angezeigt wird, während Daten
 * asynchron geladen werden.
 * -------------------------------------------------------------------
 */
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center min-h-[300px]">
    <div className="flex flex-col items-center">
      <FiLoader className="animate-spin h-10 w-10 text-[var(--color-accent)] mb-4" />{" "}
      {/* Spinner-Icon */}
      <p className="text-[var(--color-text-secondary)]">{message}</p>{" "}
      {/* Lade-Nachricht */}
    </div>
  </div>
);

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: StatCard
 * Eine wiederverwendbare Karte zur Anzeige einzelner Statistiken.
 * Zeigt einen Titel, Wert, Icon, optional eine Einheit und einen Trend an.
 * -------------------------------------------------------------------
 */
const StatCard = ({
  title, // Titel der Statistik (z.B. "Benutzer gesamt")
  value, // Der anzuzeigende Wert (Zahl oder String)
  icon, // Die Icon-Komponente (z.B. FiUsers)
  unit, // Optionale Einheit (z.B. "%")
  trend, // Optionaler Trend-Text (z.B. "+5% letzte Woche")
  trendColor, // Optionale Farbe für den Trend-Text
  isLoading, // Zeigt an, ob die Daten für diese Karte noch geladen werden
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  unit?: string;
  trend?: string;
  trendColor?: string;
  isLoading?: boolean;
}) => {
  const IconComponent = icon; // Die übergebene Icon-Komponente

  return (
    <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-[var(--border-color)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] truncate">
          {title}
        </h3>
        <IconComponent className="h-6 w-6 text-[var(--color-accent)] flex-shrink-0" />{" "}
        {/* Das Icon */}
      </div>
      {isLoading ? (
        // Lade-Platzhalter, wenn Daten noch nicht verfügbar sind
        <div className="h-10 flex items-center">
          <div className="animate-pulse bg-[var(--color-surface-2)] rounded-md h-8 w-24"></div>
        </div>
      ) : (
        // Der tatsächliche Wert der Statistik
        <p className="text-3xl font-bold text-[var(--color-text-primary)] truncate">
          {value}
          {unit && (
            <span className="text-sm font-normal text-[var(--color-text-secondary)] ml-1">
              {unit}
            </span>
          )}
        </p>
      )}
      {/* Trend-Anzeige, wenn vorhanden und nicht geladen wird */}
      {trend && !isLoading && (
        <p
          className={`text-xs mt-1 ${
            trendColor || "text-[var(--color-text-secondary)]" // Standardfarbe, wenn keine Trendfarbe angegeben
          }`}
        >
          {trend}
        </p>
      )}
    </div>
  );
};

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: UserRolePieChart
 * Ein Tortendiagramm zur Anzeige der Benutzerverteilung nach Rollen.
 * Verwendet ECharts zur Visualisierung.
 * -------------------------------------------------------------------
 */
const UserRolePieChart = ({
  usersByRoleData, // Daten für die Rollenverteilung
  isLoading, // Zeigt an, ob Daten geladen werden
  theme, // Aktuelles Theme (hell/dunkel) zur Anpassung der Diagrammfarben
}: {
  usersByRoleData?: RoleCount[];
  isLoading?: boolean;
  theme: string | null;
}) => {
  // Lade-Spinner, wenn Diagrammdaten geladen werden
  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner message="Lade Rollenverteilungsdiagramm..." />
      </div>
    );
  }
  // Fallback-Nachricht, wenn keine Rollendaten verfügbar sind
  if (!usersByRoleData || usersByRoleData.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--border-color)] p-6 rounded-xl shadow-lg flex items-center justify-center h-96">
        <FiPieChart className="h-10 w-10 text-[var(--color-text-secondary)] mr-3" />
        <p className="text-[var(--color-text-secondary)]">
          Keine Rollendaten zur Anzeige des Diagramms verfügbar.
        </p>
      </div>
    );
  }

  // Daten für ECharts vorbereiten
  const chartData = usersByRoleData.map((item) => ({
    name: item.Role // Rollenname (erste Buchstabe groß)
      ? item.Role.charAt(0).toUpperCase() + item.Role.slice(1)
      : "Unbekannte Rolle",
    value: item.count, // Anzahl der Benutzer in dieser Rolle
  }));

  // ECharts-Optionen für das Tortendiagramm
  const option = {
    tooltip: { trigger: "item", formatter: "{a} <br/>{b}: {c} ({d}%)" }, // Tooltip-Formatierung
    legend: {
      orient: "vertical", // Legende vertikal
      left: "left", // Legende links
      top: "center", // Legende mittig
      data: chartData.map((item) => item.name), // Namen für die Legende
      textStyle: { color: theme === "dark" ? "#CBD5E1" : "#4B5563" }, // Textfarbe der Legende basierend auf dem Theme
    },
    series: [
      {
        name: "Benutzer nach Rolle", // Name der Serie
        type: "pie", // Tortendiagramm-Typ
        radius: ["45%", "70%"], // Innerer und äußerer Radius des Rings
        center: ["65%", "50%"], // Position des Diagrammzentrums
        avoidLabelOverlap: true, // Vermeidet Überlappung von Labels
        label: { show: false, position: "center" }, // Labels standardmäßig ausgeblendet
        emphasis: {
          // Stil beim Hover/Fokus
          label: {
            show: true, // Label beim Hover anzeigen
            fontSize: 18,
            fontWeight: "bold",
            formatter: "{b}\n{c}", // Formatierung des Labels (Name und Wert)
            color: theme === "dark" ? "#F3F4F6" : "#1F2937", // Textfarbe des Labels basierend auf dem Theme
          },
        },
        labelLine: { show: false }, // Label-Linien ausgeblendet
        data: chartData, // Die Daten für das Diagramm
        itemStyle: {
          // Stil für die Sektoren
          borderRadius: 8, // Abgerundete Ecken
          borderColor: theme === "dark" ? "#1F2937" : "#FFFFFF", // Randfarbe basierend auf dem Theme
          borderWidth: 2, // Randbreite
        },
      },
    ],
    color: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"], // Benutzerdefinierte Farben für die Sektoren
  };

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--border-color)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-96">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
        <FiPieChart className="mr-2 h-5 w-5 text-[var(--color-accent)]" />
        Benutzer nach Rolle
      </h3>
      <ReactECharts
        option={option}
        style={{ height: "calc(100% - 40px)", width: "100%" }} // Diagrammhöhe anpassen
        notMerge={true} // Diagramm nicht mit vorherigen Optionen zusammenführen
        lazyUpdate={true} // Verzögerte Aktualisierung für bessere Performance
      />
    </div>
  );
};

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: NewUsersActivityChart
 * Ein Liniendiagramm zur Anzeige der Aktivität neuer Benutzer
 * über einen bestimmten Zeitraum.
 * -------------------------------------------------------------------
 */
const NewUsersActivityChart = ({
  activityData, // Datenpunkte für die Benutzeraktivität
  isLoading, // Zeigt an, ob Daten geladen werden
  theme, // Aktuelles Theme (hell/dunkel)
}: {
  activityData?: UserActivityDataPoint[];
  isLoading?: boolean;
  theme: string | null;
}) => {
  // Lade-Spinner, wenn Diagrammdaten geladen werden
  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner message="Lade Diagramm für neue Benutzeraktivitäten..." />
      </div>
    );
  }
  // Fallback-Nachricht, wenn keine Aktivitätsdaten verfügbar sind
  if (!activityData || activityData.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--border-color)] p-6 rounded-xl shadow-lg flex items-center justify-center h-96">
        <FiActivity className="h-10 w-10 text-[var(--color-text-secondary)] mr-3" />
        <p className="text-[var(--color-text-secondary)]">
          Keine neuen Benutzeraktivitätsdaten für den ausgewählten Zeitraum.
        </p>
      </div>
    );
  }

  // Daten für ECharts vorbereiten
  const dates = activityData.map((item) =>
    new Date(item.date).toLocaleDateString("de-DE", {
      month: "short", // Kurzer Monatsname
      day: "numeric", // Tag des Monats
    })
  );
  const counts = activityData.map((item) => item.count); // Anzahl der neuen Benutzer pro Datum

  // ECharts-Optionen für das Liniendiagramm
  const option = {
    tooltip: {
      trigger: "axis", // Tooltip wird beim Hover über die Achse ausgelöst
      axisPointer: { type: "cross", label: { backgroundColor: "#6a7985" } }, // Achsenzeiger
    },
    legend: {
      data: ["Neue Benutzer"], // Legenden-Eintrag
      textStyle: { color: theme === "dark" ? "#CBD5E1" : "#4B5563" }, // Textfarbe der Legende
    },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true }, // Diagramm-Raster-Einstellungen
    xAxis: [
      {
        type: "category", // Kategoriale X-Achse (für Daten)
        boundaryGap: false, // Linien starten/enden an den Achsenenden
        data: dates, // Die Datumsangaben
        axisLabel: { color: theme === "dark" ? "#9CA3AF" : "#6B7280" }, // Farbe der Achsenbeschriftungen
      },
    ],
    yAxis: [
      {
        type: "value", // Numerische Y-Achse
        axisLabel: { color: theme === "dark" ? "#9CA3AF" : "#6B7280" }, // Farbe der Achsenbeschriftungen
      },
    ],
    series: [
      {
        name: "Neue Benutzer", // Name der Serie
        type: "line", // Liniendiagramm-Typ
        stack: "Total", // Stapelt die Daten (hier nur eine Serie, aber nützlich für mehrere)
        smooth: true, // Glatte Linie
        lineStyle: { width: 2, color: "#8B5CF6" }, // Linien-Stil (Farbe, Breite)
        showSymbol: false, // Symbole auf Datenpunkten ausblenden
        areaStyle: {
          // Bereichs-Stil unter der Linie (Farbverlauf)
          opacity: 0.8,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(139, 92, 246, 0.5)" }, // Startfarbe des Farbverlaufs
            { offset: 1, color: "rgba(139, 92, 246, 0)" }, // Endfarbe des Farbverlaufs
          ]),
        },
        emphasis: { focus: "series" }, // Fokus-Effekt beim Hover
        data: counts, // Die Zähldaten
        itemStyle: { color: "#8B5CF6" }, // Farbe der Datenpunkte
      },
    ],
  };
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--border-color)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-96">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center">
        <FiActivity className="mr-2 h-5 w-5 text-violet-500" />
        Neue Benutzerregistrierungen
      </h3>
      <ReactECharts
        option={option}
        style={{ height: "calc(100% - 40px)", width: "100%" }} // Diagrammhöhe anpassen
      />
    </div>
  );
};

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: AdminDashboardContent
 * Die Hauptinhaltskomponente für das Admin-Dashboard.
 * Ruft alle Dashboard-Statistiken und Aktivitätsdaten ab und rendert sie.
 * -------------------------------------------------------------------
 */
function AdminDashboardContent() {
  // Zustandsvariablen für Dashboard-Daten und Lade-/Fehlerstatus
  const [stats, setStats] = useState<AdminDashboardStats | null>(null); // Speichert allgemeine Statistiken
  const [userActivity, setUserActivity] = useState<
    UserActivityDataPoint[] | null // Speichert Datenpunkte für die Benutzeraktivität
  >(null);
  const [isLoading, setIsLoading] = useState(true); // Zeigt an, ob Daten geladen werden
  const [error, setError] = useState<string | null>(null); // Speichert Fehlermeldungen
  const { theme } = useTheme(); // Holt das aktuelle Theme für Diagrammanpassungen

  /**
   * -------------------------------------------------------------------
   * ✅ useEffect Hook: Dashboard-Daten abrufen
   * Dieser Hook wird einmalig beim Mounten der Komponente ausgeführt, um
   * alle erforderlichen Daten für das Dashboard abzurufen.
   * -------------------------------------------------------------------
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true); // Setzt Ladezustand auf true
      setError(null); // Löscht vorherige Fehler
      try {
        // Führt parallele API-Anfragen aus, um Statistiken und Aktivitätsdaten abzurufen
        const [statsResponse, activityResponse] = await Promise.all([
          apiClient("/admin/stats/overview", { method: "GET" }), // Anfrage für Übersichtsstatistiken
          apiClient("/admin/stats/new-user-activity?days=7", { method: "GET" }), // Anfrage für Benutzeraktivität der letzten 7 Tage
        ]);

        // Verarbeitet die Antwort für die Übersichtsstatistiken
        const statsData = await statsResponse.json();
        if (statsData.stats) {
          setStats(statsData.stats as AdminDashboardStats); // Aktualisiert den Zustand mit den Statistiken
        } else {
          throw new Error("Statistikdaten nicht in der API-Antwort gefunden.");
        }

        // Verarbeitet die Antwort für die Benutzeraktivitätsdaten
        const activityData = await activityResponse.json();
        if (activityData.activity && Array.isArray(activityData.activity)) {
          setUserActivity(activityData.activity as UserActivityDataPoint[]); // Aktualisiert den Zustand mit den Aktivitätsdaten
        } else {
          throw new Error(
            "Benutzeraktivitätsdaten nicht gefunden oder kein Array in der API-Antwort."
          );
        }
      } catch (err) {
        console.error("🔥 Fehler beim Abrufen der Admin-Dashboard-Daten:", err); // Loggt den Fehler
        setError(
          // Setzt die Fehlermeldung
          err instanceof Error
            ? err.message
            : "Alle Dashboard-Daten konnten nicht geladen werden."
        );
      } finally {
        setIsLoading(false); // Setzt Ladezustand auf false, unabhängig vom Ergebnis
      }
    };
    fetchDashboardData(); // Ruft die Funktion zum Laden der Dashboard-Daten auf
  }, []); // Leeres Abhängigkeitsarray: Effekt wird nur einmal beim Mounten ausgeführt

  // -------------------------------------------------------------------
  // ✅ JSX-Struktur des Admin-Dashboards
  // Zeigt Überschrift, Fehlermeldungen, Statistik-Karten und Diagramme an.
  // -------------------------------------------------------------------
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
        Admin-Dashboard-Übersicht
      </h1>

      {/* Fehlermeldungsbereich */}
      {error && (
        <div className="alert alert-danger mb-6" role="alert">
          <div className="flex">
            <div className="py-1">
              <FiAlertCircle className="h-6 w-6 mr-3" /> {/* Warn-Icon */}
            </div>
            <div>
              <p className="font-bold">Fehler beim Laden der Dashboard-Daten</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Raster für Statistik-Karten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Benutzer gesamt"
          value={stats?.totalUsers ?? "0"} // Zeigt den Wert an, Fallback auf "0"
          icon={FiUsers} // Icon für Gesamtbenutzer
          isLoading={isLoading} // Ladezustand an die Karte weitergeben
        />
        <StatCard
          title="Neue Benutzer (letzte 7 Tage)"
          value={stats?.newUsersLast7Days ?? "0"}
          icon={FiTrendingUp} // Icon für Trend
          isLoading={isLoading}
        />
        <StatCard
          title="Aktive Benutzer"
          value={stats?.activeUsers ?? "0"}
          icon={FiUserCheck} // Icon für aktive Benutzer
          isLoading={isLoading}
        />
        <StatCard
          title="Inaktive Benutzer"
          value={stats?.inactiveUsers ?? "0"}
          icon={FiUserX} // Icon für inaktive Benutzer
          isLoading={isLoading}
        />
      </div>

      {/* Raster für Diagramme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserRolePieChart
          usersByRoleData={stats?.usersByRole} // Daten für das Rollendiagramm
          isLoading={isLoading}
          theme={theme} // Aktuelles Theme für Diagramm-Styling
        />
        <NewUsersActivityChart
          activityData={userActivity || undefined} // Daten für das Aktivitätsdiagramm
          isLoading={isLoading}
          theme={theme} // Aktuelles Theme für Diagramm-Styling
        />
      </div>
    </div>
  );
}

/**
 * -------------------------------------------------------------------
 * ✅ Komponente: AdminDashboardPage (Export)
 * Exportiert die Admin-Dashboard-Seite, eingehüllt in ein Suspense-Fallback.
 * Dies ermöglicht das Anzeigen eines Ladezustands auf Seitenebene, während die
 * 'AdminDashboardContent'-Komponente (oder ihre Daten) asynchron geladen wird.
 * -------------------------------------------------------------------
 */
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Lade Admin-Dashboard..." />}>
      {" "}
      {/* Zeigt Spinner an, während Inhalte geladen werden */}
      <AdminDashboardContent /> {/* Die eigentliche Dashboard-Logik */}
    </Suspense>
  );
}
