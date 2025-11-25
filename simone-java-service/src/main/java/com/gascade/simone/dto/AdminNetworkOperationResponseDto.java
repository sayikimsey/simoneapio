// // src/main/java/com/gascade/simone/dto/AdminNetworkOperationResponseDto.java
// package com.gascade.simone.dto;

// public record AdminNetworkOperationResponseDto(
//     int simoneStatus,             // Status from the SIMONE API call
//     String simoneDetailedMessage, // Detailed message from simone_last_error or output param
//     String serviceMessage         // Overall message from our Java service
// ) {}
package com.gascade.simone.dto;

/**
 * Repräsentiert die Antwort eines administrativen Netzbetriebs innerhalb des SIMONE-Systems.
 * Diese DTO-Klasse kapselt sowohl den Rückgabestatus der SIMONE-API als auch zusätzliche
 * Fehler- oder Erfolgsmeldungen, die aus der Java-Service-Logik stammen.
 *
 * Wird beispielsweise bei Operationen wie „Netzwerk erstellen“, „Netzwerk löschen“,
 * „Netzwerk aktivieren“ usw. verwendet.
 *
 * @param simoneStatus Der Rückgabestatuscode der nativen SIMONE-API (z. B. {@code 0} für OK).
 * @param simoneDetailedMessage Detaillierte Rückmeldung der SIMONE-API (z. B. aus {@code simone_last_error()} oder als Ausgabewert).
 * @param serviceMessage Eine zusammenfassende Nachricht vom Java-Service – zur Protokollierung oder Weiterleitung an den Client.
 */
public record AdminNetworkOperationResponseDto(
    int simoneStatus,             // Rückgabestatus der SIMONE-API
    String simoneDetailedMessage, // Detaillierte Rückmeldung von simone_last_error oder Ausgabewert
    String serviceMessage         // Zusammenfassende Nachricht vom Java-Service
) {}
