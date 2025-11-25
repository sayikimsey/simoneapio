// // src/main/java/com/gascade/simone/dto/WriteDataResponseDto.java
// package com.gascade.simone.dto;

// import java.util.List;

// public record WriteDataResponseDto(
//     String message, // Overall message for the batch operation
//     List<WriteDataResponseItemDto> results // Status for each item
// ) {}

package com.gascade.simone.dto;

import java.util.List;

/**
 * Datenübertragungsobjekt (DTO) für die Antwort einer Schreiboperation
 * mehrerer Werte im SIMONE-System.
 *
 * @param message Eine zusammenfassende Nachricht über die durchgeführte Batch-Operation
 *                (z. B. Erfolg, Teil-Erfolg, Fehler).
 * @param results Eine Liste mit Ergebnissen für jede einzelne Schreibanfrage.
 */
public record WriteDataResponseDto(
    String message,
    List<WriteDataResponseItemDto> results
) {}
