// package com.gascade.simone.dto;

// public record SelectNetworkRequestDto(String networkName) {}

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Anfrage-DTO zur Auswahl eines SIMONE-Netzwerks.
 * Wird verwendet, um ein bestimmtes Netzwerk für nachfolgende Operationen auszuwählen.
 *
 * @param networkName Der Name des auszuwählenden Netzwerks (darf nicht leer sein).
 */
public record SelectNetworkRequestDto(
    @NotBlank(message = "Der Netzwerkname darf nicht leer sein.")
    String networkName
) {}
