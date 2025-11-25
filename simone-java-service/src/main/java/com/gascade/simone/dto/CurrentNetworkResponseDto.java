// package com.gascade.simone.dto;

// public record CurrentNetworkResponseDto(String currentNetworkName) {}

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt (DTO) für die Rückgabe des aktuell ausgewählten SIMONE-Netzwerks.
 *
 * @param currentNetworkName Der Name des aktuell ausgewählten Netzwerks. Kann null sein, wenn kein Netzwerk ausgewählt ist.
 */
public record CurrentNetworkResponseDto(String currentNetworkName) {}
