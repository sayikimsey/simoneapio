// import nodemailer from "nodemailer";

// // Create a reusable transporter object using the SMTP transport
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: parseInt(process.env.EMAIL_PORT || "587", 10),
//   secure: false, // true for 465, false for other ports (like 587)
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // This will use the App Password from your .env file
//   },
//   // Add a timeout to prevent hanging connections
//   connectionTimeout: 10000, // 10 seconds
//   greetingTimeout: 10000, // 10 seconds
// });

// /**
//  * Sends a password reset email to a user.
//  * @param to The recipient's email address.
//  * @param token The password reset token.
//  * @throws An error if the email fails to send.
//  */
// export const sendPasswordResetEmail = async (to: string, token: string) => {
//   // Construct the password reset link using the frontend URL from environment variables
//   const resetLink = `${
//     process.env.FRONTEND_URL || "http://localhost:3000"
//   }/auth/reset-password?token=${token}`;

//   const mailOptions = {
//     from: process.env.EMAIL_FROM,
//     to: to,
//     subject: "Anforderung zum Zurücksetzen Ihres Passworts",
//     html: `
//       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//         <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
//           <h2 style="color: #04285e;">Passwort zurücksetzen</h2>
//           <p>Sie haben eine Anforderung zum Zurücksetzen Ihres Passworts für Ihr SIMONE Simulation-Konto erhalten.</p>
//           <p>Bitte klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen. Der Link ist eine Stunde lang gültig:</p>
//           <p style="text-align: center;">
//             <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Passwort zurücksetzen</a>
//           </p>
//           <p>Wenn Sie diese Anforderung nicht gestellt haben, können Sie diese E-Mail einfach ignorieren.</p>
//           <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
//           <p style="font-size: 0.8em; color: #777;">Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht darauf.</p>
//         </div>
//       </div>
//     `,
//   };

//   try {
//     // --- THIS IS THE KEY CHANGE ---
//     // We now check if the required environment variables are present before trying to send.
//     if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//       console.error(
//         "🔥 FATAL: Email credentials (EMAIL_USER, EMAIL_PASS) are not configured in .env file."
//       );
//       throw new Error("Email service is not configured on the server.");
//     }

//     const info = await transporter.sendMail(mailOptions);
//     console.log(`✅ Password reset email sent to ${to}: ${info.messageId}`);
//   } catch (error) {
//     console.error(`🔥 Failed to send password reset email to ${to}:`, error);
//     // Re-throw the error so the calling function (in authRoutes.ts) can catch it
//     // and send a proper 500 server error response to the user.
//     throw new Error("Failed to send password reset email.");
//   }
// };

import nodemailer from "nodemailer"; // Importiert die Nodemailer-Bibliothek zum Senden von E-Mails

// -------------------------------------------------------------------
// ✅ E-Mail-Transporter-Konfiguration
// Erstellt ein wiederverwendbares Transporter-Objekt, das den SMTP-Transport verwendet.
// Die Konfigurationsdetails werden aus Umgebungsvariablen geladen, um sie flexibel
// und sicher zu halten (z.B. für verschiedene E-Mail-Dienstanbieter).
// -------------------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // SMTP-Host des E-Mail-Anbieters (z.B. 'smtp.gmail.com')
  port: parseInt(process.env.EMAIL_PORT || "587", 10), // Port des SMTP-Servers (z.B. 587 für TLS/STARTTLS, 465 für SSL)
  secure: false, // 'true' für Port 465 (SSL), 'false' für andere Ports (wie 587 mit STARTTLS)
  auth: {
    user: process.env.EMAIL_USER, // Benutzername für die SMTP-Authentifizierung (Ihre E-Mail-Adresse)
    pass: process.env.EMAIL_PASS, // Passwort für die SMTP-Authentifizierung (oft ein App-Passwort für Google/Outlook)
  },
  // Fügt Timeouts hinzu, um hängende Verbindungen zu verhindern und die Robustheit zu erhöhen.
  connectionTimeout: 10000, // 10 Sekunden Timeout für den Verbindungsaufbau
  greetingTimeout: 10000, // 10 Sekunden Timeout für die SMTP-Begrüßung
});

/**
 * -------------------------------------------------------------------
 * ✅ sendPasswordResetEmail
 * Zweck: Sendet eine E-Mail zum Zurücksetzen des Passworts an einen Benutzer.
 * @param to Die E-Mail-Adresse des Empfängers.
 * @param token Der Passwort-Reset-Token, der in den Link eingefügt wird.
 * @throws Ein Fehler, wenn das Senden der E-Mail fehlschlägt (z.B. Konfigurationsfehler, Netzwerkprobleme).
 * -------------------------------------------------------------------
 */
export const sendPasswordResetEmail = async (to: string, token: string) => {
  // Konstruiert den Passwort-Reset-Link.
  // Die Basis-URL des Frontends wird aus Umgebungsvariablen geladen,
  // um sicherzustellen, dass der Link zur richtigen Anwendung führt.
  const resetLink = `${
    process.env.FRONTEND_URL || "http://localhost:3000" // Fallback auf localhost für Entwicklung
  }/auth/reset-password?token=${token}`; // Der Token wird als Query-Parameter angehängt

  // Optionen für die zu sendende E-Mail
  const mailOptions = {
    from: process.env.EMAIL_FROM, // Absender-E-Mail-Adresse (muss oft mit EMAIL_USER übereinstimmen)
    to: to, // Empfänger-E-Mail-Adresse
    subject: "Anforderung zum Zurücksetzen Ihres Passworts", // Betreff der E-Mail
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #04285e;">Passwort zurücksetzen</h2>
          <p>Sie haben eine Anforderung zum Zurücksetzen Ihres Passworts für Ihr SIMONE Simulation-Konto erhalten.</p>
          <p>Bitte klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen. Der Link ist eine Stunde lang gültig:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Passwort zurücksetzen</a>
          </p>
          <p>Wenn Sie diese Anforderung nicht gestellt haben, können Sie diese E-Mail einfach ignorieren.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.8em; color: #777;">Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht darauf.</p>
        </div>
      </div>
    `, // HTML-Inhalt der E-Mail für eine ansprechende Formatierung
  };

  try {
    // --- DIES IST DIE WICHTIGSTE ÄNDERUNG ---
    // Wir prüfen nun, ob die erforderlichen Umgebungsvariablen für die E-Mail-Anmeldedaten vorhanden sind,
    // BEVOR wir versuchen, die E-Mail zu senden. Dies verhindert Laufzeitfehler, wenn die Konfiguration fehlt.
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error(
        "🔥 FATAL: E-Mail-Anmeldedaten (EMAIL_USER, EMAIL_PASS) sind in der .env-Datei nicht konfiguriert."
      );
      throw new Error("E-Mail-Dienst ist auf dem Server nicht konfiguriert.");
    }

    // Versucht, die E-Mail mit dem konfigurierten Transporter und den Mail-Optionen zu senden.
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Passwort-Reset-E-Mail an ${to} gesendet: ${info.messageId}`
    );
  } catch (error) {
    // Fehler beim Senden der E-Mail abfangen und protokollieren.
    console.error(
      `🔥 Fehler beim Senden der Passwort-Reset-E-Mail an ${to}:`,
      error
    );
    // Wirft den Fehler erneut, damit die aufrufende Funktion (z.B. in authRoutes.ts) ihn abfangen
    // und eine entsprechende 500er-Serverfehlerantwort an den Benutzer senden kann.
    throw new Error("Fehler beim Senden der Passwort-Reset-E-Mail.");
  }
};
