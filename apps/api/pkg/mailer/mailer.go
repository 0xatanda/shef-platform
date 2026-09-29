package mailer

import (
	"crypto/tls"
	"fmt"
	"html"
	"log"
	"net"
	"net/smtp"
	"os"
	"strings"
)

type Mailer struct {
	host     string
	port     string
	username string
	password string
	from     string
	to       string
}

func NewFromEnv() *Mailer {
	return &Mailer{
		host:     os.Getenv("SMTP_HOST"),
		port:     os.Getenv("SMTP_PORT"),
		username: os.Getenv("SMTP_USERNAME"),
		password: os.Getenv("SMTP_PASSWORD"),
		from:     os.Getenv("SMTP_FROM"),
		to:       os.Getenv("CONTACT_ADMIN_EMAIL"),
	}
}

func (m *Mailer) Enabled() bool {
	return m.host != "" &&
		m.port != "" &&
		m.username != "" &&
		m.password != "" &&
		m.from != "" &&
		m.to != ""
}

func (m *Mailer) SendContactNotification(
	name string,
	email string,
	phone string,
	subject string,
	message string,
) error {
	if !m.Enabled() {
		return fmt.Errorf("SMTP email configuration is incomplete")
	}

	safeName := html.EscapeString(name)
	safeEmail := html.EscapeString(email)
	safePhone := html.EscapeString(phone)
	safeSubject := html.EscapeString(subject)
	safeMessage := html.EscapeString(message)

	body := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<title>New Contact Message — SHEF Website</title>
		</head>

		<body style="margin:0;padding:0;background:#f5f7f5;font-family:Arial,sans-serif;color:#1f2937;">
			<div style="max-width:680px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

				<div style="background:#15803d;padding:24px 30px;">
					<h1 style="margin:0;color:#ffffff;font-size:22px;">
						New Contact Message
					</h1>

					<p style="margin:8px 0 0;color:#dcfce7;font-size:14px;">
						SHEF Website
					</p>
				</div>

				<div style="padding:30px;">

					<p style="font-size:16px;margin-top:0;">
						A visitor has submitted a new message through the SHEF website contact form.
					</p>

					<table style="width:100%%;border-collapse:collapse;margin-top:24px;">
						<tr>
							<td style="padding:10px 0;font-weight:bold;width:140px;">
								Name
							</td>
							<td style="padding:10px 0;">
								%s
							</td>
						</tr>

						<tr>
							<td style="padding:10px 0;font-weight:bold;">
								Email
							</td>
							<td style="padding:10px 0;">
								<a href="mailto:%s">%s</a>
							</td>
						</tr>

						<tr>
							<td style="padding:10px 0;font-weight:bold;">
								Phone
							</td>
							<td style="padding:10px 0;">
								%s
							</td>
						</tr>

						<tr>
							<td style="padding:10px 0;font-weight:bold;">
								Subject
							</td>
							<td style="padding:10px 0;">
								%s
							</td>
						</tr>
					</table>

					<div style="margin-top:24px;">
						<h2 style="font-size:16px;margin-bottom:10px;">
							Message
						</h2>

						<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:18px;line-height:1.7;white-space:pre-wrap;">
							%s
						</div>
					</div>

					<div style="margin-top:30px;padding-top:20px;border-top:1px solid #e5e7eb;">
						<p style="margin:0;color:#6b7280;font-size:13px;">
							This message has also been saved in the SHEF Admin dashboard under Contacts.
						</p>
					</div>

				</div>
			</div>
		</body>
		</html>
`,
		safeName,
		safeEmail,
		safeEmail,
		safePhone,
		safeSubject,
		safeMessage,
	)

	headers := make(map[string]string)

	headers["From"] = m.from
	headers["To"] = m.to
	headers["Subject"] = fmt.Sprintf(
		"New Contact Message — %s",
		subject,
	)
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = `text/html; charset="UTF-8"`

	var messageBuilder strings.Builder

	for key, value := range headers {
		messageBuilder.WriteString(key)
		messageBuilder.WriteString(": ")
		messageBuilder.WriteString(value)
		messageBuilder.WriteString("\r\n")
	}

	messageBuilder.WriteString("\r\n")
	messageBuilder.WriteString(body)

	auth := smtp.PlainAuth(
		"",
		m.username,
		m.password,
		m.host,
	)

	address := net.JoinHostPort(
		m.host,
		m.port,
	)

	// Gmail requires TLS.
	tlsConfig := &tls.Config{
		ServerName: m.host,
		MinVersion: tls.VersionTLS12,
	}

	conn, err := tls.Dial(
		"tcp",
		address,
		tlsConfig,
	)

	if err != nil {
		return fmt.Errorf(
			"SMTP TLS connection failed: %w",
			err,
		)
	}

	client, err := smtp.NewClient(
		conn,
		m.host,
	)

	if err != nil {
		_ = conn.Close()

		return fmt.Errorf(
			"SMTP client creation failed: %w",
			err,
		)
	}

	defer func() {
		_ = client.Close()
	}()

	if err := client.Auth(auth); err != nil {
		return fmt.Errorf(
			"SMTP authentication failed: %w",
			err,
		)
	}

	if err := client.Mail(m.from); err != nil {
		return fmt.Errorf(
			"SMTP sender failed: %w",
			err,
		)
	}

	if err := client.Rcpt(m.to); err != nil {
		return fmt.Errorf(
			"SMTP recipient failed: %w",
			err,
		)
	}

	writer, err := client.Data()

	if err != nil {
		return fmt.Errorf(
			"SMTP data command failed: %w",
			err,
		)
	}

	if _, err := writer.Write(
		[]byte(messageBuilder.String()),
	); err != nil {
		_ = writer.Close()

		return fmt.Errorf(
			"SMTP message write failed: %w",
			err,
		)
	}

	if err := writer.Close(); err != nil {
		return fmt.Errorf(
			"SMTP message close failed: %w",
			err,
		)
	}

	if err := client.Quit(); err != nil {
		return fmt.Errorf(
			"SMTP quit failed: %w",
			err,
		)
	}

	return nil
}

// LogConfigurationWarning logs a warning during application startup
// when email notification has not been configured.
func (m *Mailer) LogConfigurationWarning() {
	if !m.Enabled() {
		log.Println(
			"WARNING: contact email notifications are disabled because SMTP configuration is incomplete",
		)
	}
}
