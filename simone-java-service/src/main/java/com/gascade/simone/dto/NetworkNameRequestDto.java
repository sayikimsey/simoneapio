// // src/main/java/com/gascade/simone/dto/NetworkNameRequestDto.java
// package com.gascade.simone.dto;

// import jakarta.validation.constraints.NotBlank; // Optional: for Spring validation

// public record NetworkNameRequestDto(
//     @NotBlank(message = "Network name cannot be blank")
//     String networkName,
//     Integer flags // Optional flags for some operations
// ) {
//     // If flags is not provided, a default (like SimoneConst.SIMONE_NO_FLAG) will be used in the service.
// }

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Daten-Transfer-Objekt für Operationen, die einen Netzwerknamen erfordern.
 * Wird z. B. verwendet beim Erstellen, Speichern oder Löschen eines SIMONE-Netzwerks.
 *
 * @param networkName Der Name des Netzwerks. Darf nicht leer sein.
 * @param flags       Optionale Flags für die Operation (z. B. zum Überschreiben bestehender Netzwerke).
 */
public record NetworkNameRequestDto(
    @NotBlank(message = "Netzwerkname darf nicht leer sein")
    String networkName,
    Integer flags
) {
    // Falls keine Flags angegeben werden, verwendet der Service standardmäßig z. B. SimoneConst.SIMONE_NO_FLAG.
}
