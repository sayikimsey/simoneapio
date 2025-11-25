// // src/main/java/com/gascade/simone/dto/ExecuteScenarioRequestDto.java
// package com.gascade.simone.dto;

// public record ExecuteScenarioRequestDto(
//     // Flags are important for simone_execute_ex.
//     // Client can pass an integer representing combined flags.
//     // e.g., SimoneConst.SIMONE_NO_FLAG or SimoneConst.SIMONE_FLAG_INTERACTIVE_MSG
//     Integer flags 
// ) {
//     // Default constructor will set flags to null if not provided.
//     // Service layer will default to SIMONE_NO_FLAG if flags is null.
// }

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt (DTO) zur Ausführung eines SIMONE-Szenarios.
 * Enthält optional Flags zur Steuerung des Verhaltens bei der Ausführung.
 * 
 * Beispiel: {@code SimoneConst.SIMONE_NO_FLAG} oder {@code SimoneConst.SIMONE_FLAG_INTERACTIVE_MSG}.
 * Wenn kein Wert gesetzt ist, wird im Service-Layer standardmäßig {@code SIMONE_NO_FLAG} verwendet.
 *
 * @param flags Integer-Wert, der die auszuführenden Flags repräsentiert. Kann null sein.
 */
public record ExecuteScenarioRequestDto(
    Integer flags
) {}
