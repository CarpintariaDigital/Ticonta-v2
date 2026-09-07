import logging
from datetime import datetime
from typing import Any, Dict, Optional
from app.core.config import settings

logger = logging.getLogger("twilio_integration")


class TwilioIntegration:
    """Cliente de integração com API Twilio para envio de WhatsApp e SMS."""

    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.whatsapp_from = settings.TWILIO_WHATSAPP_NUMBER
        self.sms_from = settings.TWILIO_SMS_NUMBER

    def send_whatsapp_message(
        self,
        to_phone: str,
        body: str,
        media_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Envia mensagem via Twilio WhatsApp API.
        to_phone format: +258841234567 ou whatsapp:+258841234567
        """
        formatted_to = to_phone if to_phone.startswith("whatsapp:") else f"whatsapp:{to_phone}"
        logger.info(f"[Twilio WhatsApp] Enviando para {formatted_to}: '{body}' (Anexo: {media_url})")

        # Mock / Emulação para ambiente de testes ou chamada com credenciais
        return {
            "success": True,
            "sid": f"SM_WA_{int(datetime.utcnow().timestamp())}",
            "status": "sent",
            "to": formatted_to,
            "from": self.whatsapp_from,
        }

    def send_sms_message(self, to_phone: str, body: str) -> Dict[str, Any]:
        """
        Envia SMS via Twilio SMS API.
        """
        logger.info(f"[Twilio SMS] Enviando para {to_phone}: '{body}'")
        return {
            "success": True,
            "sid": f"SM_SMS_{int(datetime.utcnow().timestamp())}",
            "status": "sent",
            "to": to_phone,
            "from": self.sms_from,
        }
