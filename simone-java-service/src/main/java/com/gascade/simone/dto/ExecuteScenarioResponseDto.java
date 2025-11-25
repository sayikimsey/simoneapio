// // src/main/java/com/gascade/simone/dto/ExecuteScenarioResponseDto.java
// package com.gascade.simone.dto;

// public record ExecuteScenarioResponseDto(
//     int simoneStatus,          // The integer status code returned by simone_execute_ex
//     String executionStatusText, // Textual status from SIMONE (e.g., "RUNOK", from the SimString output)
//     String serviceMessage       // Additional message from our service
// ) {}

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt (DTO) für die Antwort der Szenario-Ausführung.
 * Enthält den Statuscode und Meldungen, die durch den SIMONE-API-Aufruf {@code simone_execute_ex} erzeugt wurden.
 *
 * @param simoneStatus        Ganzzahliger Statuscode von der SIMONE-API.
 * @param executionStatusText Textuelle Rückmeldung von SIMONE (z. B. „RUNOK“), aus dem SimString-Ausgabeparameter.
 * @param serviceMessage      Zusätzliche Mitteilung des Java-Services zur besseren Kontextualisierung.
 */
public record ExecuteScenarioResponseDto(
    int simoneStatus,
    String executionStatusText,
    String serviceMessage
) {}
