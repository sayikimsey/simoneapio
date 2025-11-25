// // src/main/java/com/gascade/simone/dto/FilePathRequestDto.java
// package com.gascade.simone.dto;

// import jakarta.validation.constraints.NotBlank;

// public record FilePathRequestDto(
//     @NotBlank(message = "File path cannot be blank")
//     String path,
//     Integer flags // Optional flags
// ) {}

package com.gascade.simone.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Daten-Transfer-Objekt (DTO) zur Übergabe eines Datei- oder Verzeichnispfades an einen Endpunkt.
 * Wird z. B. beim Importieren von Netzwerkbeschreibungen oder Szenarien verwendet.
 *
 * @param path  Pfad zur Datei oder zum Verzeichnis. Darf nicht leer sein.
 * @param flags Optionale Flags für die Operation (z. B. Überschreiboptionen, Debug-Modi etc.).
 */
public record FilePathRequestDto(
    @NotBlank(message = "Dateipfad darf nicht leer sein.")
    String path,
    
    Integer flags
) {}
