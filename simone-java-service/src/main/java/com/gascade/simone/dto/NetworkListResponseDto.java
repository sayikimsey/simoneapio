// package com.gascade.simone.dto;

// public record NetworkListResponseDto(String message, java.util.List<String> networks) {}

package com.gascade.simone.dto;

import java.util.List;

/**
 * Daten-Transfer-Objekt zur Rückgabe einer Liste von Netzwerk-Namen zusammen mit einer Servicenachricht.
 *
 * @param message  Eine Nachricht vom Service, z. B. über Erfolg oder Fehler.
 * @param networks Eine Liste der verfügbaren Netzwerke.
 */
public record NetworkListResponseDto(String message, List<String> networks) {}
