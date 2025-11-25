// // src/main/java/com/gascade/simone/controller/SimoneNetworkController.java
// package com.gascade.simone.controller;

// import java.util.Collections;
// import java.util.List;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired; // DTO for individual network object
// import org.springframework.http.HttpStatus; // DTO for the list response
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping; // For SIMONE_OBJTYPE_ALL
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// import com.gascade.simone.dto.CurrentNetworkResponseDto;
// import com.gascade.simone.dto.MessageResponseDto;
// import com.gascade.simone.dto.NetworkListResponseDto;
// import com.gascade.simone.dto.NetworkObjectDto;
// import com.gascade.simone.dto.NetworkObjectListResponseDto;
// import com.gascade.simone.dto.SelectNetworkRequestDto;
// import com.gascade.simone.service.SimoneNetworkService;

// import de.liwacom.simone.SimoneConst;


// @RestController
// @RequestMapping("/v1/networks")
// public class SimoneNetworkController {

//     private static final Logger logger = LoggerFactory.getLogger(SimoneNetworkController.class);
//     private final SimoneNetworkService simoneNetworkService;

//     @Autowired
//     public SimoneNetworkController(SimoneNetworkService simoneNetworkService) {
//         this.simoneNetworkService = simoneNetworkService;
//         logger.info("SimoneNetworkController wurde initialisiert.");
//     }

//     /**
//      * Gibt die Liste aller verfügbaren Netzwerke zurück (optional aus einem bestimmten Verzeichnis).
//      *
//      * @param directoryPath Optionaler Verzeichnispfad, aus dem Netzwerke geladen werden sollen.
//      * @return Liste der gefundenen Netzwerke.
//      */
//     @GetMapping
//     public ResponseEntity<NetworkListResponseDto> listNetworks(@RequestParam(required = false) String directoryPath) {
//         logger.info("Controller: GET /networks empfangen. Verzeichnis: [{}]", directoryPath == null ? "Standard" : directoryPath);
//         try {
//             List<String> networks = simoneNetworkService.listNetworks(directoryPath);
//             return ResponseEntity.ok(new NetworkListResponseDto("Netzwerke erfolgreich abgerufen.", networks));
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Bedingung für Netzwerkliste nicht erfüllt – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
//                 .body(new NetworkListResponseDto(e.getMessage(), Collections.emptyList()));
//         } catch (IllegalArgumentException e) {
//             logger.warn("Controller: Ungültiges Argument beim Abrufen der Netzwerkliste – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new NetworkListResponseDto(e.getMessage(), Collections.emptyList()));
//         } catch (RuntimeException e) {
//             logger.error("Controller: Fehler in SIMONE API beim Abrufen der Netzwerkliste – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new NetworkListResponseDto("Fehler beim Abrufen der Netzwerke: " + e.getMessage(), Collections.emptyList()));
//         } catch (Exception e) {
//             logger.error("Controller: Unerwarteter Fehler beim Abrufen der Netzwerke – {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new NetworkListResponseDto("Ein unerwarteter Fehler ist aufgetreten.", Collections.emptyList()));
//         }
//     }

//     /**
//      * Wählt ein Netzwerk aus, um es im SIMONE-Kontext aktiv zu schalten.
//      *
//      * @param requestDto enthält den Namen des Netzwerks.
//      * @return Erfolgs- oder Fehlermeldung.
//      */
//     @PostMapping("/current/select")
//     public ResponseEntity<MessageResponseDto> selectNetwork(@RequestBody SelectNetworkRequestDto requestDto) {
//         logger.info("Controller: POST /current/select für Netzwerk: {}", requestDto.networkName());
//         if (requestDto.networkName() == null || requestDto.networkName().trim().isEmpty()) {
//             return ResponseEntity.badRequest().body(new MessageResponseDto("Netzwerkname darf nicht leer sein."));
//         }
//         try {
//             String message = simoneNetworkService.selectNetwork(requestDto.networkName());
//             return ResponseEntity.ok(new MessageResponseDto(message));
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Bedingung für Netzauswahl nicht erfüllt – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new MessageResponseDto(e.getMessage()));
//         } catch (IllegalArgumentException e) {
//             logger.warn("Controller: Ungültiges Argument bei Netzauswahl – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponseDto(e.getMessage()));
//         } catch (RuntimeException e) {
//             logger.error("Controller: Fehler in SIMONE API bei Netzauswahl '{}' – {}", requestDto.networkName(), e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(e.getMessage()));
//         } catch (Exception e) {
//             logger.error("Controller: Unerwarteter Fehler bei Netzauswahl '{}' – {}", requestDto.networkName(), e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto("Netzwerkauswahl fehlgeschlagen aufgrund eines unerwarteten Fehlers."));
//         }
//     }

//     /**
//      * Gibt das aktuell im SIMONE-System ausgewählte Netzwerk zurück.
//      *
//      * @return Name des aktuellen Netzwerks oder Fehler.
//      */
//     @GetMapping("/current")
//     public ResponseEntity<CurrentNetworkResponseDto> getCurrentNetwork() {
//         logger.info("Controller: GET /current empfangen.");
//         try {
//             String currentNetwork = simoneNetworkService.getCurrentNetwork();
//             return ResponseEntity.ok(new CurrentNetworkResponseDto(currentNetwork));
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Fehler beim Abrufen des aktuellen Netzwerks – API nicht bereit: {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new CurrentNetworkResponseDto(null));
//         } catch (RuntimeException e) {
//             logger.error("Controller: Laufzeitfehler beim Abrufen des aktuellen Netzwerks – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new CurrentNetworkResponseDto(null));
//         } catch (Exception e) {
//             logger.error("Controller: Unerwarteter Fehler beim Abrufen des aktuellen Netzwerks – {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new CurrentNetworkResponseDto(null));
//         }
//     }

//     /**
//      * Deselektiert das aktuell gewählte Netzwerk.
//      *
//      * @return Bestätigung oder Fehlermeldung.
//      */
//     @PostMapping("/current/deselect")
//     public ResponseEntity<MessageResponseDto> deselectNetwork() {
//         logger.info("Controller: POST /current/deselect empfangen.");
//         try {
//             String message = simoneNetworkService.deselectNetwork();
//             return ResponseEntity.ok(new MessageResponseDto(message));
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Fehler beim Deselektieren des Netzwerks – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new MessageResponseDto(e.getMessage()));
//         } catch (RuntimeException e) {
//             logger.error("Controller: Laufzeitfehler beim Deselektieren des Netzwerks – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(e.getMessage()));
//         } catch (Exception e) {
//             logger.error("Controller: Unerwarteter Fehler beim Deselektieren des Netzwerks – {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto("Netzwerk konnte nicht deselektiert werden."));
//         }
//     }

//     /**
//      * Gibt die Liste aller Objekte im aktuell ausgewählten SIMONE-Netzwerk zurück.
//      *
//      * @param reqObjectType Objekttyp-Code (z. B. {@code SIMONE_OBJTYPE_NODE}); Standard: alle Objekte.
//      * @param reqSubsystemName Optionaler Subsystemname zur Filterung.
//      * @return Liste von Netzwerkobjekten.
//      */
//     @GetMapping("/current/objects")
//     public ResponseEntity<NetworkObjectListResponseDto> listNetworkObjects(
//             @RequestParam(name = "type", defaultValue = "" + SimoneConst.SIMONE_OBJTYPE_ALL) int reqObjectType,
//             @RequestParam(name = "subsystem", required = false) String reqSubsystemName) {

//         logger.info("Controller: GET /current/objects empfangen. Typ: {}, Subsystem: '{}'",
//             reqObjectType, reqSubsystemName == null ? "ALLE" : reqSubsystemName);

//         try {
//             List<NetworkObjectDto> objects = simoneNetworkService.listNetworkObjects(reqObjectType, reqSubsystemName);
//             return ResponseEntity.ok(new NetworkObjectListResponseDto("Netzwerkobjekte erfolgreich abgerufen.", objects));
//         } catch (IllegalStateException e) {
//             logger.warn("Controller: Bedingung für Objektliste nicht erfüllt – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
//                 .body(new NetworkObjectListResponseDto(e.getMessage(), Collections.emptyList()));
//         } catch (IllegalArgumentException e) {
//             logger.warn("Controller: Ungültiges Argument beim Abrufen der Netzwerkobjekte – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                 .body(new NetworkObjectListResponseDto(e.getMessage(), Collections.emptyList()));
//         } catch (RuntimeException e) {
//             logger.error("Controller: Fehler in SIMONE API beim Abrufen von Netzwerkobjekten – {}", e.getMessage());
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new NetworkObjectListResponseDto("Fehler beim Abrufen der Objekte: " + e.getMessage(), Collections.emptyList()));
//         } catch (Exception e) {
//             logger.error("Controller: Unerwarteter Fehler beim Abrufen von Netzwerkobjekten – {}", e.getMessage(), e);
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new NetworkObjectListResponseDto("Ein unerwarteter Fehler ist aufgetreten.", Collections.emptyList()));
//         }
//     }
// }

// src/main/java/com/gascade/simone/controller/SimoneNetworkController.java
package com.gascade.simone.controller;

import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gascade.simone.dto.CurrentNetworkResponseDto;
import com.gascade.simone.dto.MessageResponseDto;
import com.gascade.simone.dto.NetworkListResponseDto;
import com.gascade.simone.dto.NetworkObjectDto;
import com.gascade.simone.dto.NetworkObjectListResponseDto;
import com.gascade.simone.dto.SelectNetworkRequestDto;
import com.gascade.simone.dto.SetNetworkDirectoryRequestDto;
import com.gascade.simone.service.SimoneNetworkService;

import de.liwacom.simone.SimoneConst;


@RestController
@RequestMapping("/v1/networks")
public class SimoneNetworkController {

  private static final Logger logger = LoggerFactory.getLogger(SimoneNetworkController.class);
  private final SimoneNetworkService simoneNetworkService;

  @Autowired
  public SimoneNetworkController(SimoneNetworkService simoneNetworkService) {
    this.simoneNetworkService = simoneNetworkService;
    logger.info("SimoneNetworkController wurde initialisiert.");
  }

  /**
  * Gibt die Liste aller verfügbaren Netzwerke zurück (optional aus einem bestimmten Verzeichnis).
  *
  * @param directoryPath Optionaler Verzeichnispfad, aus dem Netzwerke geladen werden sollen.
  * @return Liste der gefundenen Netzwerke.
  */
  @GetMapping
  public ResponseEntity<NetworkListResponseDto> listNetworks(@RequestParam(required = false) String directoryPath) {
    logger.info("Controller: GET /networks empfangen. Verzeichnis: [{}]", directoryPath == null ? "Standard" : directoryPath);
    try {
      // ✅ KORRIGIERT: directoryPath aus dem @RequestParam-Parameter wird an den Service übergeben.
      List<String> networks = simoneNetworkService.listNetworks(directoryPath);
      return ResponseEntity.ok(new NetworkListResponseDto("Netzwerke erfolgreich abgerufen.", networks));
    } catch (IllegalStateException e) {
      logger.warn("Controller: Bedingung für Netzwerkliste nicht erfüllt – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
        .body(new NetworkListResponseDto(e.getMessage(), Collections.emptyList()));
    } catch (IllegalArgumentException e) {
      logger.warn("Controller: Ungültiges Argument beim Abrufen der Netzwerkliste – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new NetworkListResponseDto(e.getMessage(), Collections.emptyList()));
    } catch (RuntimeException e) {
      logger.error("Controller: Fehler in SIMONE API beim Abrufen der Netzwerkliste – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new NetworkListResponseDto("Fehler beim Abrufen der Netzwerke: " + e.getMessage(), Collections.emptyList()));
    } catch (Exception e) {
      logger.error("Controller: Unerwarteter Fehler beim Abrufen der Netzwerke – {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new NetworkListResponseDto("Ein unerwarteter Fehler ist aufgetreten.", Collections.emptyList()));
    }
  }

  /**
  * Setzt das individuelle Netzwerkverzeichnis für die aktuelle Benutzersitzung.
  * Dies wird vom Node.js-Backend aufgerufen.
  *
  * @param requestDto DTO mit dem Netzwerkpfad des Benutzers.
  * @return Eine Erfolgsmeldung.
  */
  @PostMapping("/set-network-directory")
  public ResponseEntity<MessageResponseDto> setNetworkDirectory(@RequestBody SetNetworkDirectoryRequestDto requestDto) {
    logger.info("Controller: POST /set-network-directory für Pfad: {}", requestDto.networkPath());
    try {
      String message = simoneNetworkService.setNetworkDirectory(requestDto.networkPath());
      return ResponseEntity.ok(new MessageResponseDto(message));
    } catch (IllegalArgumentException e) {
      logger.warn("Controller: Ungültiges Argument beim Setzen des Netzwerkverzeichnisses – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponseDto(e.getMessage()));
    } catch (Exception e) {
      logger.error("Controller: Unerwarteter Fehler beim Setzen des Netzwerkverzeichnisses – {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto("Ein unerwarteter Fehler ist aufgetreten."));
    }
  }

  /**
  * Wählt ein Netzwerk aus, um es im SIMONE-Kontext aktiv zu schalten.
  *
  * @param requestDto enthält den Namen des Netzwerks.
  * @return Erfolgs- oder Fehlermeldung.
  */
  @PostMapping("/current/select")
  public ResponseEntity<MessageResponseDto> selectNetwork(@RequestBody SelectNetworkRequestDto requestDto) {
    logger.info("Controller: POST /current/select für Netzwerk: {}", requestDto.networkName());
    if (requestDto.networkName() == null || requestDto.networkName().trim().isEmpty()) {
      return ResponseEntity.badRequest().body(new MessageResponseDto("Netzwerkname darf nicht leer sein."));
    }
    try {
      String message = simoneNetworkService.selectNetwork(requestDto.networkName());
      return ResponseEntity.ok(new MessageResponseDto(message));
    } catch (IllegalStateException e) {
      logger.warn("Controller: Bedingung für Netzauswahl nicht erfüllt – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new MessageResponseDto(e.getMessage()));
    } catch (IllegalArgumentException e) {
      logger.warn("Controller: Ungültiges Argument bei Netzauswahl – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageResponseDto(e.getMessage()));
    } catch (RuntimeException e) {
      logger.error("Controller: Fehler in SIMONE API bei Netzauswahl '{}' – {}", requestDto.networkName(), e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(e.getMessage()));
    } catch (Exception e) {
      logger.error("Controller: Unerwarteter Fehler bei Netzauswahl '{}' – {}", requestDto.networkName(), e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto("Netzwerkauswahl fehlgeschlagen aufgrund eines unerwarteten Fehlers."));
    }
  }

  /**
  * Gibt das aktuell im SIMONE-System ausgewählte Netzwerk zurück.
  *
  * @return Name des aktuellen Netzwerks oder Fehler.
  */
  @GetMapping("/current")
  public ResponseEntity<CurrentNetworkResponseDto> getCurrentNetwork() {
    logger.info("Controller: GET /current empfangen.");
    try {
      String currentNetwork = simoneNetworkService.getCurrentNetwork();
      return ResponseEntity.ok(new CurrentNetworkResponseDto(currentNetwork));
    } catch (IllegalStateException e) {
      logger.warn("Controller: Fehler beim Abrufen des aktuellen Netzwerks – API nicht bereit: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new CurrentNetworkResponseDto(null));
    } catch (RuntimeException e) {
      logger.error("Controller: Laufzeitfehler beim Abrufen des aktuellen Netzwerks – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new CurrentNetworkResponseDto(null));
    } catch (Exception e) {
      logger.error("Controller: Unerwarteter Fehler beim Abrufen des aktuellen Netzwerks – {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new CurrentNetworkResponseDto(null));
    }
  }

  /**
  * Deselektiert das aktuell gewählte Netzwerk.
  *
  * @return Bestätigung oder Fehlermeldung.
  */
  @PostMapping("/current/deselect")
  public ResponseEntity<MessageResponseDto> deselectNetwork() {
    logger.info("Controller: POST /current/deselect empfangen.");
    try {
      String message = simoneNetworkService.deselectNetwork();
      return ResponseEntity.ok(new MessageResponseDto(message));
    } catch (IllegalStateException e) {
      logger.warn("Controller: Fehler beim Deselektieren des Netzwerks – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new MessageResponseDto(e.getMessage()));
    } catch (RuntimeException e) {
      logger.error("Controller: Laufzeitfehler beim Deselektieren des Netzwerks – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto(e.getMessage()));
    } catch (Exception e) {
      logger.error("Controller: Unerwarteter Fehler beim Deselektieren des Netzwerks – {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new MessageResponseDto("Netzwerk konnte nicht deselektiert werden."));
    }
  }

  /**
  * Gibt die Liste aller Objekte im aktuell ausgewählten SIMONE-Netzwerk zurück.
  *
  * @param reqObjectType Objekttyp-Code (z. B. {@code SIMONE_OBJTYPE_NODE}); Standard: alle Objekte.
  * @param reqSubsystemName Optionaler Subsystemname zur Filterung.
  * @return Liste von Netzwerkobjekten.
  */
  @GetMapping("/current/objects")
  public ResponseEntity<NetworkObjectListResponseDto> listNetworkObjects(
      @RequestParam(name = "type", defaultValue = "" + SimoneConst.SIMONE_OBJTYPE_ALL) int reqObjectType,
      @RequestParam(name = "subsystem", required = false) String reqSubsystemName) {

    logger.info("Controller: GET /current/objects empfangen. Typ: {}, Subsystem: '{}'",
      reqObjectType, reqSubsystemName == null ? "ALLE" : reqSubsystemName);

    try {
      List<NetworkObjectDto> objects = simoneNetworkService.listNetworkObjects(reqObjectType, reqSubsystemName);
      return ResponseEntity.ok(new NetworkObjectListResponseDto("Netzwerkobjekte erfolgreich abgerufen.", objects));
    } catch (IllegalStateException e) {
      logger.warn("Controller: Bedingung für Objektliste nicht erfüllt – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
        .body(new NetworkObjectListResponseDto(e.getMessage(), Collections.emptyList()));
    } catch (IllegalArgumentException e) {
      logger.warn("Controller: Ungültiges Argument beim Abrufen der Netzwerkobjekte – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new NetworkObjectListResponseDto(e.getMessage(), Collections.emptyList()));
    } catch (RuntimeException e) {
      logger.error("Controller: Fehler in SIMONE API beim Abrufen von Netzwerkobjekten – {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new NetworkObjectListResponseDto("Fehler beim Abrufen der Objekte: " + e.getMessage(), Collections.emptyList()));
    } catch (Exception e) {
      logger.error("Controller: Unerwarteter Fehler beim Abrufen von Netzwerkobjekten – {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new NetworkObjectListResponseDto("Ein unerwarteter Fehler ist aufgetreten.", Collections.emptyList()));
    }
  }
}