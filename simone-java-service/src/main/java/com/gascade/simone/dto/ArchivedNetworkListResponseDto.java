// // src/main/java/com/gascade/simone/dto/ArchivedNetworkListResponseDto.java
// package com.gascade.simone.dto;

// import java.util.List;

// public record ArchivedNetworkListResponseDto(
//     String message,
//     List<ArchivedNetworkItemDto> archivedNetworks
// ) {}

package com.gascade.simone.dto;

import java.util.List;

/**
 * Antwort-DTO für eine Abfrage nach archivierten Netzwerken in einer SIMONE-Archivdatei.
 * Wird z. B. vom Service {@code listArchivedNetworks()} oder zugehörigen REST-Endpunkten zurückgegeben.
 *
 * @param message            Eine allgemeine Nachricht zur Operation, z. B. Erfolg oder Fehlerhinweis.
 * @param archivedNetworks   Eine Liste der gefundenen archivierten Netzwerke (kann leer sein, aber nie {@code null}).
 */
public record ArchivedNetworkListResponseDto(
    String message,                               // Allgemeine Antwortnachricht vom Service
    List<ArchivedNetworkItemDto> archivedNetworks // Liste archivierter Netzwerke (optional leer)
) {}
