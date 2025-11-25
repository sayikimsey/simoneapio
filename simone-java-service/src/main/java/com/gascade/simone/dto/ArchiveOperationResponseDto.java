// // src/main/java/com/gascade/simone/dto/ArchiveOperationResponseDto.java
// package com.gascade.simone.dto;

// public record ArchiveOperationResponseDto(
//     int simoneStatus,
//     String simoneDetailedMessage,
//     String serviceMessage
// ) {}

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt für die Rückgabe von Ergebnissen bei Archiv-Operationen.
 * Wird verwendet, um den Status und die Meldungen nach einer durchgeführten SIMONE-Archivfunktion
 * (z. B. {@code simone_archive_create}, {@code simone_archive_network}) an den Aufrufer zurückzugeben.
 *
 * @param simoneStatus Der Rückgabewert der SIMONE-API (z. B. {@code simone_status_ok}, {@code simone_status_nofile}).
 * @param simoneDetailedMessage Detaillierte Meldung von der SIMONE-Bibliothek (z. B. aus {@code simone_last_error} oder Ausgabestring).
 * @param serviceMessage Zusammenfassende Statusmeldung des Java-Services (benutzerfreundlich).
 */
public record ArchiveOperationResponseDto(
    int simoneStatus,
    String simoneDetailedMessage,
    String serviceMessage
) {}
