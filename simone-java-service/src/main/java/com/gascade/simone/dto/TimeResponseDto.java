// // src/main/java/com/gascade/simone/dto/TimeResponseDto.java
// package com.gascade.simone.dto;

// public record TimeResponseDto(
//     Integer timeValue,    
//     String formattedTime 
// ) {}

// src/main/java/com/gascade/simone/dto/TimeResponseDto.java
package com.gascade.simone.dto;

/**
 * Antwort-DTO zur Darstellung der aktuellen SIMONE-Zeit.
 *
 * @param timeValue      Der Zeitwert in Sekunden (z. B. Unix-Timestamp oder SIMONE-Zeit).
 * @param formattedTime  Der formatierte Zeitstring (z. B. "2025-07-16 13:00:00").
 */
public record TimeResponseDto(
    Integer timeValue,
    String formattedTime
) {}
