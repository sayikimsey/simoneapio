// // src/main/java/com/gascade/simone/dto/CalculationMessageDto.java
// package com.gascade.simone.dto;

// public record CalculationMessageDto(
//     int simoneStatus,         // Status of the simone_get_first_message API call
//     String statusMessage,      // A message describing the outcome of the API call (e.g., "Message found", "No messages")
//     String messageText,        // The actual message content from SIMONE (from SimString msg)
//     Integer messageTime,       // Time of the message (from SimTimeT msg_time, as int from getVal())
//                                // -1 if message does not have a time, null if not retrieved
//     Integer severity,          // Severity of the message (from SimInt severity)
//     String objectName,         // Name of the object the message relates to (from SimString obj_name)
//     String messageName         // Symbolic name of the message (from SimString msg_name)
// ) {
//     // Convenience factory method for "no message found" or error in API call
//     public static CalculationMessageDto noMessage(int status, String statusMessage) {
//         return new CalculationMessageDto(status, statusMessage, null, null, null, null, null);
//     }
// }

package com.gascade.simone.dto;

/**
 * Daten-Transfer-Objekt zur Darstellung einer SIMONE-Berechnungsnachricht.
 * Wird verwendet, um Meldungen (z. B. Warnungen, Fehler, Status) einer Netzberechnung zu übertragen.
 *
 * @param simoneStatus       Statuscode des Aufrufs {@code simone_get_first_message}.
 * @param statusMessage      Statusnachricht, die den Ausgang des API-Aufrufs beschreibt (z. B. „Nachricht gefunden“, „Keine Nachrichten“).
 * @param messageText        Inhalt der SIMONE-Nachricht (z. B. Warn- oder Fehlermeldung).
 * @param messageTime        Zeitpunkt der Nachricht als ganzzahliger Wert (aus {@code SimTimeT}), -1 falls nicht vorhanden, {@code null} wenn nicht abgerufen.
 * @param severity           Schweregrad der Nachricht (z. B. Info, Warnung, Fehler).
 * @param objectName         Name des betroffenen Objekts in der Nachricht (z. B. ein Knoten oder eine Leitung).
 * @param messageName        Symbolischer Name der Nachricht (z. B. {@code MSG_FLOW_TOO_HIGH}).
 */
public record CalculationMessageDto(
    int simoneStatus,
    String statusMessage,
    String messageText,
    Integer messageTime,
    Integer severity,
    String objectName,
    String messageName
) {
    /**
     * Fabrikmethode für leere bzw. nicht gefundene Nachrichten.
     * Wird verwendet, wenn {@code simone_get_first_message} keine gültige Nachricht liefert.
     *
     * @param status         Rückgabestatus des SIMONE-API-Aufrufs.
     * @param statusMessage  Statusbeschreibung.
     * @return Ein {@code CalculationMessageDto}-Objekt ohne Nachrichtendetails.
     */
    public static CalculationMessageDto noMessage(int status, String statusMessage) {
        return new CalculationMessageDto(status, statusMessage, null, null, null, null, null);
    }
}
