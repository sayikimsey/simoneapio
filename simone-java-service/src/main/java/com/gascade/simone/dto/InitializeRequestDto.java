// package com.gascade.simone.dto;

// public record InitializeRequestDto(String configFilePath, Boolean useTemporaryConfigCopy) {}

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt (DTO) für den Initialisierungsaufruf des SIMONE-Backends.
 * Wird verwendet, um optionale Konfigurationsparameter anzugeben, wenn der Dienst gestartet wird.
 *
 * @param configFilePath            Der Pfad zur Konfigurationsdatei. Wenn {@code null}, wird die Standardkonfiguration verwendet.
 * @param useTemporaryConfigCopy    Gibt an, ob eine temporäre Kopie der Konfigurationsdatei verwendet werden soll (z. B. für parallele Instanzen).
 */
public record InitializeRequestDto(
    String configFilePath,
    Boolean useTemporaryConfigCopy
) {}
