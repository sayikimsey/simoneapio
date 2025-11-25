// // src/main/java/com/gascade/simone/dto/ReadDataRequestDto.java
// package com.gascade.simone.dto;

// import java.util.List;

// public record ReadDataRequestDto(
//     List<ReadDataRequestItemDto> variables // List of variables to read
//     // long timeValue; // Optionally, allow specifying rtime directly in this request
// ) {}

package com.gascade.simone.dto;

import java.util.List;

/**
 * Datenübertragungsobjekt (DTO) für das Lesen von Variablenwerten aus einem SIMONE-Szenario.
 * Dieses Objekt enthält eine Liste von Abfragen, die jeweils eine Variable beschreiben, die gelesen werden soll.
 *
 * @param variables Liste von Variablen, die gelesen werden sollen (jede als {@link ReadDataRequestItemDto} definiert).
 */
public record ReadDataRequestDto(
    List<ReadDataRequestItemDto> variables
) {}
