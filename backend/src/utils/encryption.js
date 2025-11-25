"use strict";
// // backend/src/utils/encryption.ts
// import crypto from "crypto";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptMfaSecret = exports.encryptMfaSecret = void 0;
// const ALGORITHM = "aes-256-gcm";
// const IV_LENGTH = 12; // GCM recommended IV size is 12 bytes (96 bits)
// const AUTH_TAG_LENGTH = 16; // GCM produces a 16-byte auth tag
// const ENCRYPTION_KEY_HEX = process.env.MFA_ENCRYPTION_KEY;
// if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
//   console.error(
//     "🔥 FATAL: MFA_ENCRYPTION_KEY is not defined in .env or is not a 64-char hex string (32 bytes)."
//   );
//   // In a real app, you might throw an error here to prevent startup if the key is missing/invalid for MFA functionality.
//   // For now, we'll log an error. MFA encryption/decryption will fail if key is bad.
// }
// const KEY = ENCRYPTION_KEY_HEX
//   ? Buffer.from(ENCRYPTION_KEY_HEX, "hex")
//   : Buffer.alloc(32); // Fallback to a zeroed buffer if key is missing, which is insecure but prevents crash
// export const encryptMfaSecret = (plainSecret: string): string | null => {
//   if (!ENCRYPTION_KEY_HEX || KEY.length !== 32) {
//     // Double check key validity
//     console.error(
//       "🔥 MFA Encryption failed: Encryption key is invalid or missing."
//     );
//     return null; // Or throw error
//   }
//   try {
//     const iv = crypto.randomBytes(IV_LENGTH);
//     const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
//     let encrypted = cipher.update(plainSecret, "utf8", "hex");
//     encrypted += cipher.final("hex");
//     const authTag = cipher.getAuthTag();
//     // Store iv, authTag, and encrypted data together, e.g., iv:authTag:encrypted
//     return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
//   } catch (error) {
//     console.error("🔥 MFA Secret Encryption Error:", error);
//     return null; // Or throw error
//   }
// };
// export const decryptMfaSecret = (encryptedValue: string): string | null => {
//   if (!ENCRYPTION_KEY_HEX || KEY.length !== 32) {
//     // Double check key validity
//     console.error(
//       "🔥 MFA Decryption failed: Encryption key is invalid or missing."
//     );
//     return null; // Or throw error
//   }
//   try {
//     const parts = encryptedValue.split(":");
//     if (parts.length !== 3) {
//       throw new Error("Invalid encrypted MFA secret format.");
//     }
//     const [ivHex, authTagHex, encryptedSecretHex] = parts;
//     const iv = Buffer.from(ivHex, "hex");
//     const authTag = Buffer.from(authTagHex, "hex");
//     const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
//     decipher.setAuthTag(authTag); // Critical for GCM: verifies integrity
//     let decrypted = decipher.update(encryptedSecretHex, "hex", "utf8");
//     decrypted += decipher.final("utf8");
//     return decrypted;
//   } catch (error) {
//     console.error("🔥 MFA Secret Decryption Error:", error);
//     return null; // Or throw error indicating decryption failure
//   }
// };
// backend/src/utils/encryption.ts
const crypto_1 = __importDefault(require("crypto")); // Importiert das Node.js 'crypto'-Modul für kryptografische Operationen
// -------------------------------------------------------------------
// ✅ Kryptografie-Konstanten
// Diese Konstanten definieren den verwendeten Verschlüsselungsalgorithmus
// und die notwendigen Längen für Initialisierungsvektor (IV) und
// Authentifizierungs-Tag (AuthTag) für AES-256-GCM.
// -------------------------------------------------------------------
const ALGORITHM = "aes-256-gcm"; // Der verwendete Verschlüsselungsalgorithmus: Advanced Encryption Standard mit 256-Bit-Schlüssel im Galois/Counter Mode (GCM). GCM bietet Authenticated Encryption with Associated Data (AEAD).
const IV_LENGTH = 12; // Empfohlene IV-Größe für GCM ist 12 Bytes (96 Bit). Jeder IV muss einmalig sein.
const AUTH_TAG_LENGTH = 16; // GCM erzeugt einen 16-Byte-Authentifizierungs-Tag, der die Datenintegrität und Authentizität gewährleistet.
// Die Verschlüsselungsschlüssel-Hex-Darstellung wird aus den Umgebungsvariablen geladen.
// Dieser Schlüssel ist entscheidend für die Sicherheit der MFA-Secrets.
const ENCRYPTION_KEY_HEX = process.env.MFA_ENCRYPTION_KEY;
// -------------------------------------------------------------------
// ✅ Schlüsselvalidierung und -initialisierung
// -------------------------------------------------------------------
// Überprüfen, ob der Verschlüsselungsschlüssel in der .env-Datei definiert ist
// und die korrekte Länge von 64 Hex-Zeichen (entspricht 32 Bytes für AES-256) hat.
if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== 64) {
    console.error("🔥 FATAL: MFA_ENCRYPTION_KEY ist nicht in .env definiert oder ist kein 64-stelliger Hex-String (32 Bytes).");
    // In einer echten Anwendung sollte hier ein Fehler geworfen werden, um den Start der Anwendung zu verhindern,
    // wenn der Schlüssel für die MFA-Funktionalität fehlt/ungültig ist.
    // Vorerst wird nur ein Fehler protokolliert. Die MFA-Verschlüsselung/-Entschlüsselung schlägt fehl, wenn der Schlüssel schlecht ist.
}
// Erstellt einen Buffer aus dem Hex-String des Schlüssels.
// Wenn der Schlüssel fehlt, wird ein Puffer mit Nullen erstellt (was unsicher ist, aber einen Absturz verhindert).
const KEY = ENCRYPTION_KEY_HEX
    ? Buffer.from(ENCRYPTION_KEY_HEX, "hex")
    : Buffer.alloc(32);
// -------------------------------------------------------------------
// ✅ Funktion: encryptMfaSecret
// Zweck: Verschlüsselt ein Klartext-MFA-Secret.
// Verwendet AES-256-GCM für sichere, authentifizierte Verschlüsselung.
// @param plainSecret Das unverschlüsselte MFA-Secret (String).
// @returns Den verschlüsselten Wert als String (im Format IV:AuthTag:EncryptedData) oder null im Fehlerfall.
// -------------------------------------------------------------------
const encryptMfaSecret = (plainSecret) => {
    // Doppelte Überprüfung der Schlüsselgültigkeit vor der Verschlüsselung
    if (!ENCRYPTION_KEY_HEX || KEY.length !== 32) {
        console.error("🔥 MFA-Verschlüsselung fehlgeschlagen: Verschlüsselungsschlüssel ist ungültig oder fehlt.");
        return null; // Oder einen Fehler werfen, je nach gewünschtem Fehlerverhalten
    }
    try {
        // Generiert einen zufälligen Initialisierungsvektor (IV). Dies ist entscheidend für die Sicherheit.
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        // Erstellt ein Cipher-Objekt für die Verschlüsselung im GCM-Modus.
        const cipher = crypto_1.default.createCipheriv(ALGORITHM, KEY, iv);
        // Aktualisiert das Cipher mit den Klartextdaten und erhält den verschlüsselten Teil (Hex-Format).
        let encrypted = cipher.update(plainSecret, "utf8", "hex");
        // Schließt den Verschlüsselungsprozess ab und fügt alle verbleibenden verschlüsselten Daten hinzu.
        encrypted += cipher.final("hex");
        // Ruft den Authentifizierungs-Tag ab. Dieser Tag wird für die Integritätsprüfung bei der Entschlüsselung verwendet.
        const authTag = cipher.getAuthTag();
        // Speichert IV, AuthTag und verschlüsselte Daten zusammen, getrennt durch Doppelpunkte.
        // Dies ist ein gängiges Format, um alle benötigten Teile für die Entschlüsselung zu übergeben.
        return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
    }
    catch (error) {
        console.error("🔥 MFA-Secret-Verschlüsselungsfehler:", error);
        return null; // Oder einen Fehler werfen
    }
};
exports.encryptMfaSecret = encryptMfaSecret;
// -------------------------------------------------------------------
// ✅ Funktion: decryptMfaSecret
// Zweck: Entschlüsselt einen verschlüsselten MFA-Secret-String.
// Verwendet AES-256-GCM und überprüft die Datenintegrität mit dem AuthTag.
// @param encryptedValue Der verschlüsselte Wert (String im Format IV:AuthTag:EncryptedData).
// @returns Das entschlüsselte Klartext-Secret (String) oder null im Fehlerfall.
// -------------------------------------------------------------------
const decryptMfaSecret = (encryptedValue) => {
    // Doppelte Überprüfung der Schlüsselgültigkeit vor der Entschlüsselung
    if (!ENCRYPTION_KEY_HEX || KEY.length !== 32) {
        console.error("🔥 MFA-Entschlüsselung fehlgeschlagen: Verschlüsselungsschlüssel ist ungültig oder fehlt.");
        return null; // Oder einen Fehler werfen
    }
    try {
        // Teilt den verschlüsselten String in seine Bestandteile: IV, AuthTag, verschlüsseltes Secret.
        const parts = encryptedValue.split(":");
        if (parts.length !== 3) {
            throw new Error("Ungültiges Format des verschlüsselten MFA-Secrets.");
        }
        const [ivHex, authTagHex, encryptedSecretHex] = parts;
        // Konvertiert die Hex-Strings von IV und AuthTag zurück in Buffer.
        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        // Erstellt ein Decipher-Objekt für die Entschlüsselung.
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, KEY, iv);
        // Setzt den Authentifizierungs-Tag. Dies ist KRITISCH für GCM, da es die Integrität der Daten überprüft.
        // Wenn der Tag nicht übereinstimmt, bedeutet dies, dass die Daten manipuliert wurden.
        decipher.setAuthTag(authTag);
        // Aktualisiert das Decipher mit den verschlüsselten Daten und erhält den entschlüsselten Teil.
        let decrypted = decipher.update(encryptedSecretHex, "hex", "utf8");
        // Schließt den Entschlüsselungsprozess ab und fügt alle verbleibenden entschlüsselten Daten hinzu.
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    catch (error) {
        console.error("🔥 MFA-Secret-Entschlüsselungsfehler:", error);
        // Rückgabe von null, um anzuzeigen, dass die Entschlüsselung fehlgeschlagen ist (z.B. wegen Manipulation oder falschem Schlüssel)
        return null;
    }
};
exports.decryptMfaSecret = decryptMfaSecret;
