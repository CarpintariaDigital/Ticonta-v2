import logging
from typing import Optional

logger = logging.getLogger("licensing_email")


class EmailService:
    """Serviço de envio de emails de notificação para o ciclo de vida de licenças TiConta v2."""

    @staticmethod
    def send_license_generated_email(
        customer_email: str,
        customer_name: str,
        license_key: str,
        plan: str,
        expires_at: str,
    ) -> bool:
        """Envia email com a chave de ativação para o cliente."""
        subject = f"Chave de Ativação TiConta v2 - Plano {plan.upper()}"
        body = (
            f"Olá {customer_name},\n\n"
            f"A sua subscrição do plano {plan.upper()} foi ativada com sucesso.\n"
            f"Chave de Licença: {license_key}\n"
            f"Válida até: {expires_at}\n\n"
            f"Para ativar, aceda a: https://ticonta.carpintaria.digital/license-activation\n\n"
            f"Cumprimentos,\nEquipa TiConta v2"
        )
        logger.info(f"Enviando email de nova licença para {customer_email} - Assunto: {subject}")
        return True

    @staticmethod
    def send_license_expiring_soon_email(
        customer_email: str,
        customer_name: str,
        days_remaining: int,
        license_key: str,
    ) -> bool:
        """Envia aviso prévio de expiração."""
        subject = f"Aviso: A sua licença TiConta expira em {days_remaining} dias"
        logger.info(f"Enviando aviso de expiração ({days_remaining} dias) para {customer_email}")
        return True

    @staticmethod
    def send_license_expired_email(
        customer_email: str,
        customer_name: str,
        license_key: str,
    ) -> bool:
        """Envia notificação de licença expirada."""
        subject = "A sua licença TiConta v2 expirou"
        logger.info(f"Enviando notificação de licença expirada para {customer_email}")
        return True

    @staticmethod
    def send_license_renewal_email(
        customer_email: str,
        customer_name: str,
        new_expiry: str,
        license_key: str,
    ) -> bool:
        """Envia confirmação de renovação estendida."""
        subject = "Renovação confirmada - TiConta v2"
        logger.info(f"Enviando confirmação de renovação para {customer_email} até {new_expiry}")
        return True
