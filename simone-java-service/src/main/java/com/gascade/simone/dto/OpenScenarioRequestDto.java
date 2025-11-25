// // src/main/java/com/gascade/simone/dto/OpenScenarioRequestDto.java
// package com.gascade.simone.dto;

// import jakarta.validation.constraints.NotBlank;

// /**
//  * DTO for opening a SIMONE scenario.
//  * It includes the network name to ensure the operation is performed on the correct network,
//  * and the visibility flag.
//  */
// public record OpenScenarioRequestDto(
//     @NotBlank(message = "Network name must not be blank.")
//     String networkName,

//     @NotBlank(message = "Scenario name must not be blank.")
//     String scenarioName,

//     @NotBlank(message = "Mode must not be blank.")
//     String mode, // e.g., "READ", "WRITE"

//     boolean isVisible
// ) {
//     // A convenience constructor for cases where visibility is not explicitly provided.
//     public OpenScenarioRequestDto(String networkName, String scenarioName, String mode) {
//         this(networkName, scenarioName, mode, false);
//     }
// }

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Datenübertragungsobjekt (DTO) für das Öffnen eines SIMONE-Szenarios.
 * Enthält den Namen des Netzwerks, den Namen des Szenarios, den Öffnungsmodus und die Sichtbarkeit.
 *
 * @param networkName   Der Name des Netzwerks, in dem das Szenario geöffnet werden soll. Darf nicht leer sein.
 * @param scenarioName  Der Name des zu öffnenden Szenarios. Darf nicht leer sein.
 * @param mode          Der Öffnungsmodus des Szenarios (z. B. "READ", "WRITE"). Darf nicht leer sein.
 * @param isVisible     Gibt an, ob das Szenario sichtbar sein soll (z. B. für GUI-Tools).
 */
public record OpenScenarioRequestDto(
    @NotBlank(message = "Netzwerkname darf nicht leer sein.")
    String networkName,

    @NotBlank(message = "Szenarioname darf nicht leer sein.")
    String scenarioName,

    @NotBlank(message = "Modus darf nicht leer sein.")
    String mode,

    boolean isVisible
) {
    /**
     * Konstruktor ohne Sichtbarkeitsparameter – standardmäßig unsichtbar.
     *
     * @param networkName   Der Name des Netzwerks.
     * @param scenarioName  Der Name des Szenarios.
     * @param mode          Der Öffnungsmodus (READ oder WRITE).
     */
    public OpenScenarioRequestDto(String networkName, String scenarioName, String mode) {
        this(networkName, scenarioName, mode, false);
    }
}
