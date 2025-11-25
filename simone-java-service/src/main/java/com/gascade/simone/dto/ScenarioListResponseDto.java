// // src/main/java/com/gascade/simone/dto/ScenarioListResponseDto.java
// package com.gascade.simone.dto;

// import java.util.List;

// public record ScenarioListResponseDto(
//     String message,
//     List<ScenarioListItemDto> scenarios
// ) {}

package com.gascade.simone.dto;

import java.util.List;

/**
 * Antwort-DTO für eine Abfrage der Szenarienliste.
 * Dieses Objekt enthält eine Nachricht und eine Liste aller verfügbaren Szenarien.
 *
 * @param message    Eine Status- oder Informationsnachricht (z. B. "Liste erfolgreich geladen").
 * @param scenarios  Eine Liste der vorhandenen SIMONE-Szenarien mit zugehörigen Metadaten.
 */
public record ScenarioListResponseDto(
    String message,
    List<ScenarioListItemDto> scenarios
) {}
