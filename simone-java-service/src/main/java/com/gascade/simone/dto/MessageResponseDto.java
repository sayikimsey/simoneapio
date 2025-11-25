// package com.gascade.simone.dto;

// public record MessageResponseDto(String message) {}
package com.gascade.simone.dto;

/**
 * Einfaches Daten-Transfer-Objekt für Rückmeldungen mit einer Nachricht.
 * Wird häufig für erfolgreiche oder fehlerhafte Operationen verwendet.
 *
 * @param message Die zurückgegebene Nachricht vom Service.
 */
public record MessageResponseDto(String message) {}
