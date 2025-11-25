// src/main/java/com/gascade/simone/dto/SetNetworkDirectoryRequestDto.java
package com.gascade.simone.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO für die Anfrage, ein individuelles Netzwerkverzeichnis zu setzen.
 *
 * <p>Enthält den Pfad zum Netzwerkordner des Benutzers, der vom
 * Node.js-Backend empfangen und an den SimoneNetworkService übergeben wird.</p>
 */
public record SetNetworkDirectoryRequestDto(
        @NotBlank(message = "Der Netzwerkpfad darf nicht leer sein.")
        String networkPath
) {
    @JsonCreator
    public SetNetworkDirectoryRequestDto(@JsonProperty("networkPath") String networkPath) {
        this.networkPath = networkPath;
    }
}