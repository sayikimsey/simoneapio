// // src/main/java/com/gascade/simone/dto/ScenarioListItemDto.java
// package com.gascade.simone.dto;

// // Using records for immutable DTOs (Java 14+)
// public record ScenarioListItemDto(
//     String name,
//     Integer runType,         // Type of scenario (e.g., dynamic, static)
//     String initialCondition, // Name of the initial condition file/scenario
//     Integer initialTime,        // Start time of scenario (epoch seconds or similar from time_t)
//     Integer terminalTime,       // End time of scenario (epoch seconds or similar from time_t)
//     String owner,
//     String comment
// ) {
//     // Constructor with all fields
//     public ScenarioListItemDto {
//         // Compact constructor for records, or use default.
//         // Validation or transformation can be done here if needed.
//     }

//     // If not using records, create a class with private final fields, constructor, and getters.
// }

package com.gascade.simone.dto;

/**
 * Repräsentiert einen Eintrag in der Liste von SIMONE-Szenarien.
 * Dieses DTO enthält alle Metadaten zu einem Szenario.
 *
 * @param name              Der Name des Szenarios.
 * @param runType           Der Typ des Szenarios (z. B. dynamisch, statisch). Entspricht einem Konstantwert aus SimoneConst.
 * @param initialCondition  Der Name der Initialisierungsdatei oder des Start-Szenarios.
 * @param initialTime       Startzeitpunkt des Szenarios (in Sekunden seit Unix-Epoch).
 * @param terminalTime      Endzeitpunkt des Szenarios (in Sekunden seit Unix-Epoch).
 * @param owner             Der Benutzer oder Prozess, der das Szenario erstellt oder zuletzt bearbeitet hat.
 * @param comment           Ein optionaler Kommentar zum Szenario.
 */
public record ScenarioListItemDto(
    String name,
    Integer runType,
    String initialCondition,
    Integer initialTime,
    Integer terminalTime,
    String owner,
    String comment
) {
    public ScenarioListItemDto {
        // Kompakter Konstruktor – kann für Validierung oder Transformation verwendet werden
    }
}
