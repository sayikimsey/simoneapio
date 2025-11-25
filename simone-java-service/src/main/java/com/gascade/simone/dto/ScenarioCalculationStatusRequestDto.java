// // src/main/java/com/gascade/simone/dto/ScenarioCalculationStatusRequestDto.java
// package com.gascade.simone.dto;

// public record ScenarioCalculationStatusRequestDto(
//     String scenarioName,
//     Integer flags // Optional: For the 'flags' parameter of simone_calculation_status_ex
// ) {
//     public ScenarioCalculationStatusRequestDto {
//         if (scenarioName == null || scenarioName.trim().isEmpty()) {
//             throw new IllegalArgumentException("Scenario name cannot be null or empty.");
//         }
//     }
// }
package com.gascade.simone.dto;

/**
 * DTO zur Abfrage des Berechnungsstatus eines bestimmten SIMONE-Szenarios.
 *
 * @param scenarioName Der Name des Szenarios, dessen Berechnungsstatus geprüft werden soll.
 * @param flags        Optionale Flags zur Weitergabe an die Methode {@code simone_calculation_status_ex}.
 */
public record ScenarioCalculationStatusRequestDto(
    String scenarioName,
    Integer flags
) {
    /**
     * Validierung im Konstruktor zur Sicherstellung, dass der Szenarioname nicht leer ist.
     *
     * @throws IllegalArgumentException wenn der Szenarioname leer oder null ist.
     */
    public ScenarioCalculationStatusRequestDto {
        if (scenarioName == null || scenarioName.trim().isEmpty()) {
            throw new IllegalArgumentException("Szenarioname darf nicht leer oder null sein.");
        }
    }
}
