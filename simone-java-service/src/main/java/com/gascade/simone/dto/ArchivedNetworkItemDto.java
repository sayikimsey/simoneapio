// // src/main/java/com/gascade/simone/dto/ArchivedNetworkItemDto.java
// package com.gascade.simone.dto;

// public record ArchivedNetworkItemDto(
//     String networkName,
//     String archivist,
//     String comment,
//     Integer archiveTime, // time_t as int from SimTimeT
//     Integer archiveFlags
// ) {}

package com.gascade.simone.dto;

/**
 * Repräsentiert einen einzelnen archivierten Netzwerkeintrag aus einer SIMONE-Archivdatei.
 * Diese Datenstruktur wird verwendet, um Informationen zu einem archivierten Netzwerk zu übermitteln,
 * z. B. im Rahmen einer Auflistung aller gespeicherten Netzwerke innerhalb eines Archivs.
 *
 * @param networkName     Der Name des archivierten Netzwerks.
 * @param archivist       Der Benutzername oder Prozess, der das Netzwerk archiviert hat (sofern gesetzt).
 * @param comment         Ein optionaler Kommentar, der beim Archivieren angegeben wurde.
 * @param archiveTime     Der Zeitstempel der Archivierung (Unix-Zeit als {@code int}, abgeleitet von {@code SimTimeT}).
 * @param archiveFlags    Archivierungs-Flags, die beim Speichern verwendet wurden (z. B. {@code SIMONE_FLAG_REPLACE}).
 */
public record ArchivedNetworkItemDto(
    String networkName,    // Name des archivierten Netzwerks
    String archivist,      // Benutzer/Prozess, der archiviert hat
    String comment,        // Kommentar zur Archivierung (optional)
    Integer archiveTime,   // Zeitstempel als UNIX-Zeit (Sekunden seit 1970)
    Integer archiveFlags   // Verwendete Archivierungs-Flags
) {}
