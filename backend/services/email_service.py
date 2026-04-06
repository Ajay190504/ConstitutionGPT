import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_reset_email(to_email: str, reset_link: str):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("FROM_EMAIL", smtp_username)
    
    # Fallback to console print if SMTP is not configured
    if not all([smtp_server, smtp_port, smtp_username, smtp_password]):
        print("\n" + "="*50)
        print("MOCK EMAIL SENT (SMTP not configured in .env)")
        print(f"To: {to_email}")
        print(f"Reset Link: {reset_link}")
        print("="*50 + "\n")
        return True

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Password Reset Request - ConstitutionGPT"
    msg["From"] = from_email
    msg["To"] = to_email

    text = f"Hello,\n\nPlease use the following link to reset your password:\n{reset_link}\n\nThis link will expire in 15 minutes."
    html = f"""\
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for ConstitutionGPT.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="{reset_link}" style="padding: 10px 20px; background-color: #007bff; color: write; text-decoration: none; border-radius: 5px; display: inline-block; color: white;">Reset Password</a></p>
        <p>Or copy and paste this URL into your browser:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <br>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </body>
    </html>
    """
    
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    msg.attach(part1)
    msg.attach(part2)

    try:
        port = int(smtp_port)
        if port == 465:
            server = smtplib.SMTP_SSL(smtp_server, port)
        else:
            server = smtplib.SMTP(smtp_server, port)
            server.starttls()
            
        server.login(smtp_username, smtp_password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email via SMTP: {e}")
        # Print link as fallback so test isn't blocked
        print("\n" + "="*50)
        print("FALLBACK MOCK EMAIL (SMTP failed)")
        print(f"To: {to_email}")
        print(f"Reset Link: {reset_link}")
        print("="*50 + "\n")
        return False
