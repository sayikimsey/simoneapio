// // src/main/java/com/gascade/simone/dto/FlagsRequestDto.java
// package com.gascade.simone.dto;

// public record FlagsRequestDto(
//     Integer flags // Optional flags for the operation
// ) {}
package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt (DTO) zur Übergabe von optionalen Flags für eine SIMONE-Operation.
 * Dieses DTO wird verwendet, wenn eine Operation zusätzliche Steuerparameter (z. B. Ersetzungs-, Debug- oder Validierungs-Flags) akzeptiert.
 *
 * @param flags Optionale Flags für die Operation (z. B. {@code SimoneConst.SIMONE_FLAG_REPLACE}).
 */
public record FlagsRequestDto(
    Integer flags
) {}
