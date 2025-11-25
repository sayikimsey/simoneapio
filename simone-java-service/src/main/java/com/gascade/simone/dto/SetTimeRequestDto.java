// // src/main/java/com/gascade/simone/dto/SetTimeRequestDto.java
// package com.gascade.simone.dto;

// public record SetTimeRequestDto(
//     int timeValue // Changed from long to int, representing epoch seconds or SIMONE time
// ) {}

// src/main/java/com/gascade/simone/dto/SetTimeRequestDto.java
package com.gascade.simone.dto;

/**
 * Anfrage-DTO zum Setzen der aktuellen SIMONE-Zeit.
 * Die Zeit wird als Sekundenwert (Epoch-Zeit oder SIMONE-spezifische Zeit) übergeben.
 *
 * @param timeValue Zeitwert in Sekunden (Unix-Timestamp oder SIMONE-Zeit als int).
 */
public record SetTimeRequestDto(
    int timeValue
) {}
