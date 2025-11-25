// // src/main/java/com/gascade/simone/dto/NetworkObjectListResponseDto.java
// package com.gascade.simone.dto;

// import java.util.List;

// public record NetworkObjectListResponseDto(
//     String message,
//     List<NetworkObjectDto> objects
// ) {}

package com.gascade.simone.dto;

import java.util.List;

/**
 * Antwort-DTO für eine Liste von Netzwerkobjekten in einem SIMONE-Netzwerk.
 *
 * @param message Eine Mitteilung über das Ergebnis der Anfrage (z. B. „Objekte erfolgreich geladen“).
 * @param objects Die Liste der gefundenen Netzwerkobjekte.
 */
public record NetworkObjectListResponseDto(
    String message,
    List<NetworkObjectDto> objects
) {}
