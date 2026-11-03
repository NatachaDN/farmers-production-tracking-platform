package com.farmer.tracking.common.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Sends transactional emails on behalf of the Acrea platform.
 *
 * <p>SMTP credentials are injected via environment variables:
 * {@code MAIL_USERNAME}, {@code MAIL_PASSWORD}, {@code MAIL_HOST}, {@code MAIL_PORT}.
 * When {@code MAIL_USERNAME} is blank the service logs the message body instead of
 * attempting a real delivery, so the application starts correctly in dev without
 * any mail configuration.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@acrea.app}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------

    /**
     * Sends the 6-digit password reset code to the farmer's registered email.
     *
     * @param toEmail   the destination email address
     * @param resetCode the 6-digit OTP
     */
    public void sendPasswordResetCode(String toEmail, String resetCode) {
        String subject = "Your Acrea password reset code";
        String body = buildResetEmailHtml(toEmail, resetCode);

        if (smtpUsername == null || smtpUsername.isBlank()) {
            // No SMTP configured — dev / test mode: just log the code.
            log.warn("[EmailService] SMTP not configured. Password reset code for [{}]: {}", toEmail, resetCode);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, /* html = */ true);
            mailSender.send(message);
            log.info("[EmailService] Password reset code sent to [{}]", toEmail);
        } catch (MessagingException e) {
            log.error("[EmailService] Failed to send password reset email to [{}]: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Could not send password reset email. Please try again later.");
        }
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    private String buildResetEmailHtml(String recipientEmail, String code) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>Password Reset</title>
                </head>
                <body style="margin:0;padding:0;background:#F9F6F0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#F9F6F0;padding:40px 16px;">
                    <tr>
                      <td align="center">
                        <table width="520" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:12px;border:1px solid #ECE7DC;
                                      box-shadow:0 4px 24px rgba(22,66,48,0.08);overflow:hidden;">

                          <!-- Header -->
                          <tr>
                            <td style="background:#164230;padding:28px 40px;text-align:center;">
                              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">
                                🌿 Acrea
                              </span>
                              <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:6px 0 0;">
                                Agricultural Production Tracking Platform
                              </p>
                            </td>
                          </tr>

                          <!-- Body -->
                          <tr>
                            <td style="padding:36px 40px;">
                              <h1 style="font-size:20px;font-weight:700;color:#1A1A1A;margin:0 0 8px;">
                                Password reset request
                              </h1>
                              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 28px;">
                                We received a request to reset the password for
                                <strong style="color:#164230;">%s</strong>.
                                Use the code below in the app. It expires in
                                <strong>15 minutes</strong>.
                              </p>

                              <!-- Code box -->
                              <div style="background:#F0F7F4;border:2px dashed #164230;border-radius:10px;
                                          padding:24px;text-align:center;margin-bottom:28px;">
                                <p style="font-size:12px;color:#888;margin:0 0 8px;text-transform:uppercase;
                                          letter-spacing:0.08em;">Your verification code</p>
                                <span style="font-size:40px;font-weight:800;letter-spacing:0.18em;
                                             color:#164230;font-family:'Courier New',monospace;">
                                  %s
                                </span>
                              </div>

                              <p style="font-size:13px;color:#888;line-height:1.6;margin:0;">
                                If you did not request a password reset, you can safely ignore this email.
                                Your password will remain unchanged.
                              </p>
                            </td>
                          </tr>

                          <!-- Footer -->
                          <tr>
                            <td style="background:#F9F6F0;padding:20px 40px;border-top:1px solid #ECE7DC;
                                        text-align:center;">
                              <p style="font-size:11px;color:#aaa;margin:0;">
                                © Acrea Agricultural Platform · Secure &amp; Private
                              </p>
                            </td>
                          </tr>

                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(recipientEmail, code);
    }
}
