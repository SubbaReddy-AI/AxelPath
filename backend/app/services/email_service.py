import smtplib
from email.message import EmailMessage

from app.config import settings


def send_email(
    recipient: str,
    subject: str,
    body: str
) -> bool:

    if not settings.SMTP_USERNAME:
        return False

    smtp_password = settings.SMTP_PASSWORD.get_secret_value()

    message = EmailMessage()

    message["Subject"] = subject
    message["From"] = settings.EMAIL_FROM
    message["To"] = recipient

    message.set_content(body)

    try:
        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT
        ) as smtp:

            smtp.starttls()

            smtp.login(
                settings.SMTP_USERNAME,
                smtp_password,
            )

            smtp.send_message(message)

        return True

    except Exception:
        return False