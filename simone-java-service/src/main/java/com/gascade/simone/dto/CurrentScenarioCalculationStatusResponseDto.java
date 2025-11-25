// // src/main/java/com/gascade/simone/dto/CurrentScenarioCalculationStatusResponseDto.java
// package com.gascade.simone.dto;

// public record CurrentScenarioCalculationStatusResponseDto(
//     String openScenarioName,      // Name of the scenario whose status is being reported
//     int simoneStatus,             // The integer status code returned by the simone_calculation_status API call
//     String calculationStatusText, // Textual status from SIMONE (e.g., "RUNOK")
//     String serviceMessage         // Additional message from our service
// ) {}

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt (DTO) zur Rückgabe des Berechnungsstatus des aktuell geöffneten SIMONE-Szenarios.
 *
 * @param openScenarioName       Der Name des aktuell geöffneten Szenarios.
 * @param simoneStatus           Der von der SIMONE-API zurückgegebene Statuscode (z. B. {@code simone_status_ok}).
 * @param calculationStatusText  Der textuelle Status der Berechnung (z. B. "RUNOK", "ERROR", etc.).
 * @param serviceMessage         Zusätzliche Nachricht des Java-Dienstes zur Erläuterung oder Fehlerbeschreibung.
 */
public record CurrentScenarioCalculationStatusResponseDto(
    String openScenarioName,
    int simoneStatus,
    String calculationStatusText,
    String serviceMessage
) {}
