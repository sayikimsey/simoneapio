// // src/main/java/com/gascade/simone/dto/WriteDataRequestDto.java
// package com.gascade.simone.dto;

// import java.util.List;

// public record WriteDataRequestDto(
//     List<WriteDataRequestItemDto> variables, // List of variables and values to write
//     Integer timeValue // Optional: Epoch seconds (int). If provided, simone_set_rtime will be called before writing.
//                       // If null, data is written at the current rtime in SIMONE.
// ) {}
package com.gascade.simone.dto;

import java.util.List;

/**
 * Datenübertragungsobjekt (DTO) für eine Schreibanfrage an SIMONE.
 * Es erlaubt das Schreiben mehrerer Variablenwerte zu einem bestimmten Zeitpunkt.
 *
 * @param variables  Liste von Variablen (mit Werten), die geschrieben werden sollen.
 * @param timeValue  Optionaler Zeitwert in Sekunden (Unix-Zeitstempel). Wenn angegeben,
 *                   wird {@code simone_set_rtime} auf diesen Wert gesetzt, bevor die Werte geschrieben werden.
 *                   Ist der Wert {@code null}, erfolgt das Schreiben zum aktuell gesetzten rtime in SIMONE.
 */
public record WriteDataRequestDto(
    List<WriteDataRequestItemDto> variables,
    Integer timeValue
) {}