// package com.gascade.simone.dto;

// public record HealthResponse(String serviceStatus, String message, String simoneApiVersion) {}

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt (DTO) für den Gesundheitsstatus des SIMONE-Java-Dienstes.
 * Wird als Antwort auf den /health-Endpunkt verwendet, um den allgemeinen Zustand des Dienstes sowie die Version der SIMONE-API bereitzustellen.
 *
 * @param serviceStatus     Der aktuelle Status des Dienstes (z. B. "UP", "DEGRADED", "ERROR").
 * @param message           Eine erläuternde Nachricht zum Status (z. B. Betriebsbereitschaft, Fehlerbeschreibung).
 * @param simoneApiVersion  Die aktuell verwendete Version der SIMONE-API.
 */
public record HealthResponse(
    String serviceStatus,
    String message,
    String simoneApiVersion
) {}
