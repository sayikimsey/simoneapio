// // src/main/java/com/gascade/simone/dto/ReadDataResponseDto.java
// package com.gascade.simone.dto;

// import java.util.List;

// public record ReadDataResponseDto(
//     String message, // Overall message
//     List<ReadDataResponseItemDto> results
// ) {}

package com.gascade.simone.dto;

import java.util.List;

/**
 * Datenübertragungsobjekt (DTO) für die Antwort auf eine Datenleseanfrage aus SIMONE.
 * Enthält eine Nachricht über den Gesamtstatus sowie eine Liste von Einzelwerten.
 *
 * @param message  Allgemeine Statusnachricht über das Ergebnis der Anfrage.
 * @param results  Liste der gelesenen Werte pro Objekt/Variable.
 */
public record ReadDataResponseDto(
    String message,
    List<ReadDataResponseItemDto> results
) {}
