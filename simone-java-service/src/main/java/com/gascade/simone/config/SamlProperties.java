package com.gascade.simone.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Konfigurations-Eigenschaften für die SAML 2.0 Identity Provider (IdP) Details.
 * Diese Klasse bindet Werte aus der application.properties (oder Umgebungsvariablen)
 * mit dem Präfix 'simone.saml.idp' an Java-Felder.
 */
@Component // Macht diese Klasse zu einer Spring-Bean, die injiziert werden kann.
@ConfigurationProperties(prefix = "simone.saml.idp") // Bindet Eigenschaften mit diesem Präfix.
public class SamlProperties {

    // IdP (Azure AD) Details
    private String entityId; // Die Entitäts-ID des IdP
    private String singleSignOnServiceLocation; // Die SSO-URL des IdP
    private String verificationCertificateLocation; // Pfad zum IdP-Verifizierungszertifikat

      // ✅ NEU: Feld für die SP Entitäts-ID
    private String spEntityId;

    // SP (Diese Anwendung) Details für das Signieren
    private String signingKeystoreLocation; // Pfad zum Keystore der SP
    private String signingKeystorePassword; // Passwort für den Keystore der SP
    private String signingKeyAlias; // Alias des Schlüssels im Keystore
    private String signingKeystoreType; // Typ des Keystores (z.B. PKCS12)

    // Standard-Konstruktor
    public SamlProperties() {
    }

    // Getter und Setter für alle Eigenschaften: benötigt für das Property-Binding

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    
    // ✅ NEU: Getter und Setter für die neue Eigenschaft
    public String getSpEntityId() {
        return spEntityId;
    }

    public void setSpEntityId(String spEntityId) {
        this.spEntityId = spEntityId;
    }

    public String getSingleSignOnServiceLocation() {
        return singleSignOnServiceLocation;
    }

    public void setSingleSignOnServiceLocation(String singleSignOnServiceLocation) {
        this.singleSignOnServiceLocation = singleSignOnServiceLocation;
    }

    public String getVerificationCertificateLocation() {
        return verificationCertificateLocation;
    }

    public void setVerificationCertificateLocation(String verificationCertificateLocation) {
        this.verificationCertificateLocation = verificationCertificateLocation;
    }

    public String getSigningKeystoreLocation() {
        return signingKeystoreLocation;
    }

    public void setSigningKeystoreLocation(String signingKeystoreLocation) {
        this.signingKeystoreLocation = signingKeystoreLocation;
    }

    public String getSigningKeystorePassword() {
        return signingKeystorePassword;
    }

    public void setSigningKeystorePassword(String signingKeystorePassword) {
        this.signingKeystorePassword = signingKeystorePassword;
    }

    public String getSigningKeyAlias() {
        return signingKeyAlias;
    }

    public void setSigningKeyAlias(String signingKeyAlias) {
        this.signingKeyAlias = signingKeyAlias;
    }

    public String getSigningKeystoreType() {
        return signingKeystoreType;
    }

    public void setSigningKeystoreType(String signingKeystoreType) {
        this.signingKeystoreType = signingKeystoreType;
    }

    // Für Debugging
    @Override
    public String toString() {
        return "SamlProperties{" +
               "entityId='" + entityId + '\'' +
               ", singleSignOnServiceLocation='" + singleSignOnServiceLocation + '\'' +
               ", verificationCertificateLocation='" + verificationCertificateLocation + '\'' +
               ", signingKeystoreLocation='" + signingKeystoreLocation + '\'' +
               ", signingKeyAlias='" + signingKeyAlias + '\'' +
               ", signingKeystoreType='" + signingKeystoreType + '\'' +
               '}'; 
    }
}