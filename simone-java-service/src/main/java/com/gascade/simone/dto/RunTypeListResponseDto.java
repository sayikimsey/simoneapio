// package com.gascade.simone.dto;

// import java.util.List;

// /**
//  * A DTO to encapsulate a list of run types for API responses.
//  *
//  * @param runTypes The list of available run types.
//  */
// public record RunTypeListResponseDto(List<RunTypeDto> runTypes) {}

package com.gascade.simone.dto;

import java.util.List;

/**
 * Ein DTO zur Kapselung einer Liste von verfügbaren SIMONE-Simulationstypen
 * zur Rückgabe in einer API-Antwort.
 *
 * @param runTypes Die Liste der verfügbaren Simulationstypen.
 */
public record RunTypeListResponseDto(List<RunTypeDto> runTypes) {}
