// package com.gascade.simone.config;

// import java.io.IOException;
// import java.io.InputStream;
// import java.net.URLEncoder;
// import java.nio.charset.StandardCharsets;
// import java.security.KeyStore;
// import java.security.PrivateKey;
// import java.security.cert.CertificateFactory;
// import java.security.cert.X509Certificate;
// import java.util.List;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.core.io.Resource;
// import org.springframework.core.io.ResourceLoader;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.saml2.core.Saml2X509Credential;
// import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
// import org.springframework.security.saml2.provider.service.authentication.Saml2Authentication;
// import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository;
// import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistration;
// import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
// import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
// import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
// import org.springframework.web.util.UriComponentsBuilder;

// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

// /**
//  * Spring Security Konfigurationsklasse für die Simone Java Service Anwendung.
//  * Diese Klasse definiert die Sicherheitsfilterkette und aktiviert die SAML 2.0 Authentifizierung.
//  *
//  * ✅ AKTUALISIERT: Der interne API-Schlüssel-Filter wurde entfernt, da die Backend-zu-Backend-Kommunikation
//  * diesen Schlüssel nicht mehr benötigt.
//  */
// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//     @Value("${node.backend.url:http://localhost:3001}")
//     private String nodeBackendUrl;

//     @Value("${java.simone.url}")
//     private String simoneBaseUrl;

//     private final ResourceLoader resourceLoader;
//     private final SamlProperties samlProperties; // Instanz der SamlProperties

//     @Autowired
//     public SecurityConfig(ResourceLoader resourceLoader, SamlProperties samlProperties) {
//         this.resourceLoader = resourceLoader;
//         this.samlProperties = samlProperties;
//     }

//     /**
//      * Definiert die Sicherheitsfilterkette für die HTTP-Anfragen.
//      *
//      * @param http Das HttpSecurity-Objekt zum Konfigurieren der Web-Sicherheit.
//      * @return Eine konfigurierte SecurityFilterChain-Instanz.
//      * @throws Exception Wenn bei der Konfiguration ein Fehler auftritt.
//      */
//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
//         requestCache.setCreateSessionAllowed(true);
//         requestCache.setMatchingRequestParameterName(null);

//         http
//             .requestCache(cache -> cache.requestCache(requestCache))
//             .sessionManagement(session -> session
//                 .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
//                 .sessionFixation().newSession()
//             )
//             .authorizeHttpRequests(authorize -> authorize                
//                 .requestMatchers("/v1/health").permitAll()                
//                 // Erlaubt auch alle Netzwerk-relevanten GET/POST-Endpunkte, die vom Node.js-Backend aufgerufen werden.
               
//                 .requestMatchers(
//                     "/v1/initialize",
//                     "/v1/terminate",
//                     "/v1/networks/**",
//                     "/v1/scenarios/**",
//                     "/v1/admin/networks",
//                     "/v1/admin/archives",
//                     "/v1/translate/**"
//                 ).permitAll()
//                 // Alle anderen Anfragen müssen authentifiziert sein (jetzt nur noch über SAML).
//                 .anyRequest().authenticated()
//             )
//             .saml2Login(saml2 -> {
//                 try {
//                     saml2
//                         .successHandler(samlAuthenticationSuccessHandler())
//                         .relyingPartyRegistrationRepository(relyingPartyRegistrationRepository());
//                 } catch (Exception e) {
//                     System.err.println("Fehler beim Konfigurieren des SAML2-Logins: " + e.getMessage());
//                     throw new RuntimeException("Fehler beim Konfigurieren des SAML2-Logins", e);
//                 }
//             });

//         http.csrf(csrf -> csrf.disable());

//         return http.build();
//     }

//     /**
//      * Definiert einen benutzerdefinierten AuthenticationSuccessHandler für SAML 2.0.
//      *
//      * @return Eine Instanz von AuthenticationSuccessHandler.
//      */
//     @Bean
//     public AuthenticationSuccessHandler samlAuthenticationSuccessHandler() {
//         return new AuthenticationSuccessHandler() {
//             @Override
//             public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
//                                                Authentication authentication) throws IOException, ServletException {
//                 if (authentication instanceof Saml2Authentication samlAuth) {
//                     Saml2AuthenticatedPrincipal principal = (Saml2AuthenticatedPrincipal) samlAuth.getPrincipal();

//                     String email = principal.getName();
//                     String firstName = getAttribute(principal,
//                                                     "givenname",
//                                                     "firstName",
//                                                     "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
//                                                     "http://schemas.microsoft.com/identity/claims/givenname",
//                                                     "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
//                                                     );
//                     String lastName = getAttribute(principal,
//                                                    "surname",
//                                                    "lastName",
//                                                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
//                                                    "http://schemas.microsoft.com/identity/claims/surname"
//                                                    );
//                     String azureAdObjectId = getAttribute(principal,
//                                                           "http://schemas.microsoft.com/identity/claims/objectidentifier",
//                                                           "objectidentifier",
//                                                           "sub"
//                                                           );

//                     UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(nodeBackendUrl)
//                             .path("/api/auth/sso/azure-ad-callback")
//                             .queryParam("email", encode(email));

//                     if (firstName != null) uriBuilder.queryParam("firstName", encode(firstName));
//                     if (lastName != null) uriBuilder.queryParam("lastName", encode(lastName));
//                     if (azureAdObjectId != null) uriBuilder.queryParam("azureAdId", encode(azureAdObjectId));

//                     String redirectUrl = uriBuilder.build().toUriString();
//                     response.sendRedirect(redirectUrl);
//                 } else {
//                     new SavedRequestAwareAuthenticationSuccessHandler().onAuthenticationSuccess(request, response, authentication);
//                 }
//             }

//             private String getAttribute(Saml2AuthenticatedPrincipal principal, String... attributeNames) {
//                 for (String name : attributeNames) {
//                     List<Object> attributes = principal.getAttributes().get(name);
//                     if (attributes != null && !attributes.isEmpty()) {
//                         String value = attributes.get(0).toString();
//                         if (!value.trim().isEmpty()) {
//                             return value;
//                         }
//                     }
//                 }
//                 return null;
//             }

//             private String encode(String value) {
//                 return URLEncoder.encode(value, StandardCharsets.UTF_8);
//             }
//         };
//     }

//     /**
//      * Definiert die RelyingPartyRegistrationRepository-Bean manuell.
//      * Nutzt die injizierten SamlProperties, um Konfigurationsdetails zu erhalten.
//      *
//      * @return Eine InMemoryRelyingPartyRegistrationRepository-Instanz.
//      * @throws Exception Bei Fehlern beim Laden von Zertifikaten oder Keystore.
//      */
//     @Bean
// public RelyingPartyRegistrationRepository relyingPartyRegistrationRepository() throws Exception {
//     // IdP (Azure AD) Signatur-Verifizierungszertifikat laden
//     Resource azureAdCertResource = resourceLoader.getResource(samlProperties.getVerificationCertificateLocation());
//     X509Certificate azureAdCertificate;
//     try (InputStream is = azureAdCertResource.getInputStream()) {
//         azureAdCertificate = (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(is);
//     }

//     // SP (Ihre Anwendung) Signatur-Schlüsselpaar laden
//     Resource spKeystoreResource = resourceLoader.getResource(samlProperties.getSigningKeystoreLocation());
//     KeyStore keyStore = KeyStore.getInstance(samlProperties.getSigningKeystoreType());
//     char[] keystorePassword = samlProperties.getSigningKeystorePassword().toCharArray();
//     try (InputStream is = spKeystoreResource.getInputStream()) {
//         keyStore.load(is, keystorePassword);
//     }

//     PrivateKey spPrivateKey = (PrivateKey) keyStore.getKey(samlProperties.getSigningKeyAlias(), samlProperties.getSigningKeystorePassword().toCharArray());
//     X509Certificate spCertificate = (X509Certificate) keyStore.getCertificate(samlProperties.getSigningKeyAlias());

//     if (spCertificate == null) {
//         throw new IllegalArgumentException("Zertifikat für Alias '" + samlProperties.getSigningKeyAlias() + "' ist null im Keystore. Sicherstellen, dass es korrekt generiert und gespeichert wurde.");
//     }

//     RelyingPartyRegistration registration = RelyingPartyRegistration.withRegistrationId("azure-ad")
        
//         .assertingPartyMetadata(party -> party        
//             // .entityId(samlProperties.getEntityId())
//             .entityId(simoneBaseUrl)
//             .singleSignOnServiceLocation(samlProperties.getSingleSignOnServiceLocation())
//             .verificationX509Credentials(c -> c.add(Saml2X509Credential.verification(azureAdCertificate)))
//         )
//         .signingX509Credentials(c -> c.add(Saml2X509Credential.signing(spPrivateKey, spCertificate)))
//         .assertionConsumerServiceLocation(simoneBaseUrl + "/login/saml2/sso/azure-ad")
//         .build();

//     return new InMemoryRelyingPartyRegistrationRepository(registration);
// }

// }


/************************************************************************* */




// package com.gascade.simone.config;

// import java.io.IOException;
// import java.io.InputStream;
// import java.net.URLEncoder;
// import java.nio.charset.StandardCharsets;
// import java.security.KeyStore;
// import java.security.PrivateKey;
// import java.security.cert.CertificateFactory;
// import java.security.cert.X509Certificate;
// import java.util.List;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.core.io.Resource;
// import org.springframework.core.io.ResourceLoader;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.core.Authentication;
// import org.springframework.security.saml2.core.Saml2X509Credential;
// import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
// import org.springframework.security.saml2.provider.service.authentication.Saml2Authentication;
// import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository;
// import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistration;
// import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
// import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
// import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
// import org.springframework.web.util.UriComponentsBuilder;

// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//     @Value("${node.backend.url:http://localhost:3001}")
//     private String nodeBackendUrl;

//     @Value("${java.simone.url}")
//     private String simoneBaseUrl;

//     private final ResourceLoader resourceLoader;
//     private final SamlProperties samlProperties;

//     @Autowired
//     public SecurityConfig(ResourceLoader resourceLoader, SamlProperties samlProperties) {
//         this.resourceLoader = resourceLoader;
//         this.samlProperties = samlProperties;
//     }

//     /**
//      * Definiert die Sicherheitsfilterkette für die HTTP-Anfragen.
//      *
//      * @param http Das HttpSecurity-Objekt zum Konfigurieren der Web-Sicherheit.
//      * @return Eine konfigurierte SecurityFilterChain-Instanz.
//      * @throws Exception Wenn bei der Konfiguration ein Fehler auftritt.
//      */
//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
//         requestCache.setCreateSessionAllowed(true);
//         requestCache.setMatchingRequestParameterName(null);

//         http
//             .requestCache(cache -> cache.requestCache(requestCache))
//             .sessionManagement(session -> session
//                 .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
//                 .sessionFixation().newSession()
//             )
//             .authorizeHttpRequests(authorize -> authorize
//                 .requestMatchers("/v1/health").permitAll()
//                 // Erlaubt auch alle Netzwerk-relevanten GET/POST-Endpunkte, die vom Node.js-Backend aufgerufen werden.
//                 .requestMatchers(
//                     "/v1/initialize",
//                     "/v1/terminate",
//                     "/v1/networks/**",
//                     "/v1/scenarios/**",
//                     "/v1/admin/networks",
//                     "/v1/admin/archives",
//                     "/v1/translate/**"
//                 ).permitAll()
//                 // Alle anderen Anfragen müssen authentifiziert sein (jetzt nur noch über SAML).
//                 .anyRequest().authenticated()
//             )
//             .saml2Login(saml2 -> {
//                 try {
//                     saml2
//                         .successHandler(samlAuthenticationSuccessHandler())
//                         .relyingPartyRegistrationRepository(relyingPartyRegistrationRepository());
//                 } catch (Exception e) {
//                     System.err.println("Fehler beim Konfigurieren des SAML2-Logins: " + e.getMessage());
//                     throw new RuntimeException("Fehler beim Konfigurieren des SAML2-Logins", e);
//                 }
//             });

//         http.csrf(csrf -> csrf.disable());

//         return http.build();
//     }

//     /**
//      * Definiert einen benutzerdefinierten AuthenticationSuccessHandler für SAML 2.0.
//      *
//      * @return Eine Instanz von AuthenticationSuccessHandler.
//      */
//     @Bean
//     public AuthenticationSuccessHandler samlAuthenticationSuccessHandler() {
//         return new AuthenticationSuccessHandler() {
//             @Override
//             public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
//                                                Authentication authentication) throws IOException, ServletException {
//                 if (authentication instanceof Saml2Authentication samlAuth) {
//                     Saml2AuthenticatedPrincipal principal = (Saml2AuthenticatedPrincipal) samlAuth.getPrincipal();

//                     String email = principal.getName();
//                     String firstName = getAttribute(principal,
//                                                     "givenname",
//                                                     "firstName",
//                                                     "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
//                                                     "http://schemas.microsoft.com/identity/claims/givenname",
//                                                     "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
//                                                     );
//                     String lastName = getAttribute(principal,
//                                                    "surname",
//                                                    "lastName",
//                                                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
//                                                    "http://schemas.microsoft.com/identity/claims/surname"
//                                                    );
//                     String azureAdObjectId = getAttribute(principal,
//                                                           "http://schemas.microsoft.com/identity/claims/objectidentifier",
//                                                           "objectidentifier",
//                                                           "sub"
//                                                           );

//                     UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(nodeBackendUrl)
//                             .path("/api/auth/sso/azure-ad-callback")
//                             .queryParam("email", encode(email));

//                     if (firstName != null) uriBuilder.queryParam("firstName", encode(firstName));
//                     if (lastName != null) uriBuilder.queryParam("lastName", encode(lastName));
//                     if (azureAdObjectId != null) uriBuilder.queryParam("azureAdId", encode(azureAdObjectId));

//                     String redirectUrl = uriBuilder.build().toUriString();
//                     response.sendRedirect(redirectUrl);
//                 } else {
//                     new SavedRequestAwareAuthenticationSuccessHandler().onAuthenticationSuccess(request, response, authentication);
//                 }
//             }

//             private String getAttribute(Saml2AuthenticatedPrincipal principal, String... attributeNames) {
//                 for (String name : attributeNames) {
//                     List<Object> attributes = principal.getAttributes().get(name);
//                     if (attributes != null && !attributes.isEmpty()) {
//                         String value = attributes.get(0).toString();
//                         if (!value.trim().isEmpty()) {
//                             return value;
//                         }
//                     }
//                 }
//                 return null;
//             }

//             private String encode(String value) {
//                 return URLEncoder.encode(value, StandardCharsets.UTF_8);
//             }
//         };
//     }

//     /**
//      * Definiert die RelyingPartyRegistrationRepository-Bean manuell.
//      * Nutzt die injizierten SamlProperties, um Konfigurationsdetails zu erhalten.
//      *
//      * @return Eine InMemoryRelyingPartyRegistrationRepository-Instanz.
//      * @throws Exception Bei Fehlern beim Laden von Zertifikaten oder Keystore.
//      */
//     @Bean
//     public RelyingPartyRegistrationRepository relyingPartyRegistrationRepository() throws Exception {
//         // IdP (Azure AD) Signatur-Verifizierungszertifikat laden
//         Resource azureAdCertResource = resourceLoader.getResource(samlProperties.getVerificationCertificateLocation());
//         X509Certificate azureAdCertificate;
//         try (InputStream is = azureAdCertResource.getInputStream()) {
//             azureAdCertificate = (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(is);
//         }

//         // SP (Ihre Anwendung) Signatur-Schlüsselpaar laden
//         Resource spKeystoreResource = resourceLoader.getResource(samlProperties.getSigningKeystoreLocation());
//         KeyStore keyStore = KeyStore.getInstance(samlProperties.getSigningKeystoreType());
//         char[] keystorePassword = samlProperties.getSigningKeystorePassword().toCharArray();
//         try (InputStream is = spKeystoreResource.getInputStream()) {
//             keyStore.load(is, keystorePassword);
//         }

//         PrivateKey spPrivateKey = (PrivateKey) keyStore.getKey(samlProperties.getSigningKeyAlias(), samlProperties.getSigningKeystorePassword().toCharArray());
//         X509Certificate spCertificate = (X509Certificate) keyStore.getCertificate(samlProperties.getSigningKeyAlias());

//         if (spCertificate == null) {
//             throw new IllegalArgumentException("Zertifikat für Alias '" + samlProperties.getSigningKeyAlias() + "' ist null im Keystore. Sicherstellen, dass es korrekt generiert und gespeichert wurde.");
//         }

//         RelyingPartyRegistration registration = RelyingPartyRegistration.withRegistrationId("azure-ad")
//             .assertingPartyMetadata(party -> party
//                 .entityId(simoneBaseUrl)
//                 .singleSignOnServiceLocation(samlProperties.getSingleSignOnServiceLocation())
//                 .verificationX509Credentials(c -> c.add(Saml2X509Credential.verification(azureAdCertificate)))
//             )
//             .signingX509Credentials(c -> c.add(Saml2X509Credential.signing(spPrivateKey, spCertificate)))
//             .assertionConsumerServiceLocation(simoneBaseUrl + "/login/saml2/sso/azure-ad")
//             .build();

//         return new InMemoryRelyingPartyRegistrationRepository(registration);
//     }
// }

package com.gascade.simone.config;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.saml2.core.Saml2X509Credential;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.security.saml2.provider.service.authentication.Saml2Authentication;
import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistration;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Spring Security Konfigurationsklasse für die Simone Java Service Anwendung.
 * Diese Klasse definiert die Sicherheitsfilterkette und aktiviert die SAML 2.0 Authentifizierung.
 *
 * Die Konfiguration ist so angepasst, dass sie automatisch die korrekten
 * Werte aus den 'application.properties' (Produktion) oder 'application-dev.properties'
 * (Entwicklung) lädt, basierend auf dem aktiven Spring-Profil.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${node.backend.url:http://localhost:3001}")
    private String nodeBackendUrl;

    @Value("${java.simone.url}")
    private String simoneBaseUrl;

    private final ResourceLoader resourceLoader;
    private final SamlProperties samlProperties;

    @Autowired
    public SecurityConfig(ResourceLoader resourceLoader, SamlProperties samlProperties) {
        this.resourceLoader = resourceLoader;
        this.samlProperties = samlProperties;
    }

    // @Bean
    // public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    //     HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
    //     requestCache.setCreateSessionAllowed(true);
    //     requestCache.setMatchingRequestParameterName(null);

    //     http
    //         .requestCache(cache -> cache.requestCache(requestCache))
    //         .sessionManagement(session -> session
    //             .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
    //             .sessionFixation().newSession()
    //         )
    //         .authorizeHttpRequests(authorize -> authorize
    //             .requestMatchers("/v1/health").permitAll()
    //             .requestMatchers(
    //                 "/v1/initialize",
    //                 "/v1/terminate",
    //                 "/v1/networks/**",
    //                 "/v1/scenarios/**",
    //                 "/v1/admin/networks",
    //                 "/v1/admin/archives",
    //                 "/v1/translate/**"
    //             ).permitAll()
    //             .anyRequest().authenticated()
    //         )
    //         .saml2Login(saml2 -> {
    //             try {
    //                 saml2
    //                     .successHandler(samlAuthenticationSuccessHandler())
    //                     .relyingPartyRegistrationRepository(relyingPartyRegistrationRepository());
    //             } catch (Exception e) {
    //                 System.err.println("Fehler beim Konfigurieren des SAML2-Logins: " + e.getMessage());
    //                 throw new RuntimeException("Fehler beim Konfigurieren des SAML2-Logins", e);
    //             }
    //         });

    //     http.csrf(csrf -> csrf.disable());

    //     return http.build();
    // }
    
    @Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    HttpSessionRequestCache requestCache = new HttpSessionRequestCache();
    requestCache.setCreateSessionAllowed(true);
    requestCache.setMatchingRequestParameterName(null);

    http
        .requestCache(cache -> cache.requestCache(requestCache))
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            .sessionFixation().newSession()
        )
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers("/v1/health").permitAll()
            .requestMatchers(
                "/v1/initialize",
                "/v1/terminate",
                "/v1/networks/**",
                "/v1/scenarios/**",
                "/v1/admin/networks",
                "/v1/admin/archives",
                "/v1/translate/**"
            ).permitAll()
            .anyRequest().authenticated()
        )
        // ⬇️ Use the SAML initiation URL as the “login page” so we never see /login
        .saml2Login(saml2 -> {
            try {
                saml2
                    .loginPage("/saml2/authenticate/azure-ad")
                    .successHandler(samlAuthenticationSuccessHandler())
                    .relyingPartyRegistrationRepository(relyingPartyRegistrationRepository());
            } catch (Exception e) {
                throw new RuntimeException("Fehler beim Konfigurieren des SAML2-Logins", e);
            }
        })
        // ⬇️ If Spring needs an entrypoint (e.g., after an error), redirect to SAML start
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint(
                new org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint(
                    "/saml2/authenticate/azure-ad"
                )
            )
        )
        .csrf(csrf -> csrf.disable());

    return http.build();
}

    @Bean
    public AuthenticationSuccessHandler samlAuthenticationSuccessHandler() {
        return new AuthenticationSuccessHandler() {
            @Override
            public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                               Authentication authentication) throws IOException, ServletException {
                if (authentication instanceof Saml2Authentication samlAuth) {
                    Saml2AuthenticatedPrincipal principal = (Saml2AuthenticatedPrincipal) samlAuth.getPrincipal();

                    String email = principal.getName();
                    String firstName = getAttribute(principal,
                                                    "givenname",
                                                    "firstName",
                                                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
                                                    "http://schemas.microsoft.com/identity/claims/givenname",
                                                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
                                                    );
                    String lastName = getAttribute(principal,
                                                   "surname",
                                                   "lastName",
                                                   "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
                                                   "http://schemas.microsoft.com/identity/claims/surname"
                                                   );
                    String azureAdObjectId = getAttribute(principal,
                                                          "http://schemas.microsoft.com/identity/claims/objectidentifier",
                                                          "objectidentifier",
                                                          "sub"
                                                          );

                    UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(nodeBackendUrl)
                            .path("/api/auth/sso/azure-ad-callback")
                            .queryParam("email", encode(email));

                    if (firstName != null) uriBuilder.queryParam("firstName", encode(firstName));
                    if (lastName != null) uriBuilder.queryParam("lastName", encode(lastName));
                    if (azureAdObjectId != null) uriBuilder.queryParam("azureAdId", encode(azureAdObjectId));

                    String redirectUrl = uriBuilder.build().toUriString();
                    response.sendRedirect(redirectUrl);
                } else {
                    new SavedRequestAwareAuthenticationSuccessHandler().onAuthenticationSuccess(request, response, authentication);
                }
            }

            private String getAttribute(Saml2AuthenticatedPrincipal principal, String... attributeNames) {
                for (String name : attributeNames) {
                    List<Object> attributes = principal.getAttributes().get(name);
                    if (attributes != null && !attributes.isEmpty()) {
                        String value = attributes.get(0).toString();
                        if (!value.trim().isEmpty()) {
                            return value;
                        }
                    }
                }
                return null;
            }

            private String encode(String value) {
                return URLEncoder.encode(value, StandardCharsets.UTF_8);
            }
        };
    }

    @Bean
    public RelyingPartyRegistrationRepository relyingPartyRegistrationRepository() throws Exception {
        // IdP (Azure AD) Signatur-Verifizierungszertifikat laden
        Resource azureAdCertResource = resourceLoader.getResource(samlProperties.getVerificationCertificateLocation());
        X509Certificate azureAdCertificate;
        try (InputStream is = azureAdCertResource.getInputStream()) {
            azureAdCertificate = (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(is);
        }

        // SP (Ihre Anwendung) Signatur-Schlüsselpaar laden
        Resource spKeystoreResource = resourceLoader.getResource(samlProperties.getSigningKeystoreLocation());
        KeyStore keyStore = KeyStore.getInstance(samlProperties.getSigningKeystoreType());
        char[] keystorePassword = samlProperties.getSigningKeystorePassword().toCharArray();
        try (InputStream is = spKeystoreResource.getInputStream()) {
            keyStore.load(is, keystorePassword);
        }

        PrivateKey spPrivateKey = (PrivateKey) keyStore.getKey(samlProperties.getSigningKeyAlias(), samlProperties.getSigningKeystorePassword().toCharArray());
        X509Certificate spCertificate = (X509Certificate) keyStore.getCertificate(samlProperties.getSigningKeyAlias());

        if (spCertificate == null) {
            throw new IllegalArgumentException("Zertifikat für Alias '" + samlProperties.getSigningKeyAlias() + "' ist null im Keystore. Sicherstellen, dass es korrekt generiert und gespeichert wurde.");
        }

        // Korrigierte Konfiguration: Die Entitäts-ID des SP wird explizit gesetzt.
        RelyingPartyRegistration registration = RelyingPartyRegistration.withRegistrationId("azure-ad")
            .entityId(samlProperties.getSpEntityId()) // <-- Hier wird die korrekte SP Entity ID gesetzt
            .assertingPartyMetadata(party -> party
                .entityId(samlProperties.getEntityId()) // IdP Entity ID
                .singleSignOnServiceLocation(samlProperties.getSingleSignOnServiceLocation())
                .verificationX509Credentials(c -> c.add(Saml2X509Credential.verification(azureAdCertificate)))
            )
            .signingX509Credentials(c -> c.add(Saml2X509Credential.signing(spPrivateKey, spCertificate)))
             .assertionConsumerServiceLocation(nodeBackendUrl  + "/login/saml2/sso/azure-ad")
            // .assertionConsumerServiceLocation(simoneBaseUrl + "/login/saml2/sso/azure-ad")
            .build();

        return new InMemoryRelyingPartyRegistrationRepository(registration);
    }
}