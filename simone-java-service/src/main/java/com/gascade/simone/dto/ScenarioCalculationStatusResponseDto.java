// // src/main/java/com/gascade/simone/dto/ScenarioCalculationStatusResponseDto.java
// package com.gascade.simone.dto;

// public record ScenarioCalculationStatusResponseDto(
//     String scenarioName,
//     int simoneStatus,           // The integer status code returned by the API call itself
//     String calculationStatusText, // Textual status from SIMONE (e.g., "RUNOK", "CALCULATING", from SimString)
//     String serviceMessage        // Additional message from our service
// ) {}

package com.gascade.simone.dto;

/**
 * Antwort-DTO für den Berechnungsstatus eines bestimmten SIMONE-Szenarios.
 *
 * @param scenarioName           Der Name des Szenarios, dessen Status geprüft wurde.
 * @param simoneStatus           Der von der SIMONE-API zurückgegebene numerische Statuscode.
 * @param calculationStatusText  Der textuelle Berechnungsstatus aus SIMONE (z. B. "RUNOK", "CALCULATING").
 * @param serviceMessage         Eine zusätzliche Nachricht aus dem Java-Service zur Beschreibung des Ergebnisses.
 */
public record ScenarioCalculationStatusResponseDto(
    String scenarioName,
    int simoneStatus,
    String calculationStatusText,
    String serviceMessage
) {}
