import logging
from datetime import datetime, date
from decimal import Decimal
from typing import Dict, Any, Optional
from app.integrations.twilio import TwilioIntegration
from app.models.debit import Debit
from app.models.informal_customer import InformalCustomer

logger = logging.getLogger("debit_reminders")


class DebitReminderService:
    """
    Serviço de lembretes automáticos e notificações via WhatsApp e SMS
    para clientes informais com pagamentos fiados/a dever.
    """

    def __init__(self):
        self.twilio = TwilioIntegration()

    def generate_reminder_text(
        self,
        customer_name: str,
        amount_owed: Decimal,
        due_date: Optional[datetime] = None,
        reminder_type: str = "due_today",
        company_name: str = "TiConta Vendas"
    ) -> str:
        formatted_amount = f"{amount_owed:,.2f} MT".replace(",", " ")
        due_str = due_date.strftime("%d/%m/%Y") if due_date else "acordada"

        if reminder_type == "partial_payment_received":
            return (
                f"Olá {customer_name}! Recebemos a sua amortização com sucesso. "
                f"O seu saldo devedor restante em {company_name} é de {formatted_amount}. "
                f"Muito obrigado pela preferência e pontualidade!"
            )
        elif reminder_type == "due_soon":
            return (
                f"Olá {customer_name}, lembramos que a sua compra fiada no valor de {formatted_amount} "
                f"vence amanhã ({due_str}). Caso precise de pagar via M-Pesa ou E-Mola, avise-nos. Obrigado!"
            )
        elif reminder_type == "due_today":
            return (
                f"Olá {customer_name}! Passando para lembrar que a sua conta de {formatted_amount} "
                f"em {company_name} vence hoje ({due_str}). Agradecemos a sua confirmação. Obrigado!"
            )
        elif reminder_type == "overdue":
            return (
                f"Prezado(a) {customer_name}, a sua conta de {formatted_amount} em {company_name} "
                f"está vencida desde {due_str}. Por favor, entre em contacto connosco para regularizar a sua situação. Obrigado!"
            )
        elif reminder_type == "fully_paid":
            return (
                f"Parabéns {customer_name}! A sua dívida em {company_name} foi totalmente quitada. "
                f"O seu limite de crédito de confiança foi aumentado! Boas compras!"
            )
        else:
            return (
                f"Olá {customer_name}! O saldo devedor da sua conta em {company_name} é de {formatted_amount}. "
                f"Estamos à disposição. Obrigado!"
            )

    def send_debit_reminder(
        self,
        debit: Debit,
        reminder_type: str = "due_today",
        channel: str = "whatsapp",
        custom_message: Optional[str] = None,
        company_name: str = "TiConta Vendas"
    ) -> Dict[str, Any]:
        customer: InformalCustomer = debit.customer
        if not customer or not customer.phone:
            logger.warning(f"Cliente sem telefone cadastrado para o débito ID {debit.id}")
            return {
                "success": False,
                "error": "Cliente sem telefone cadastrado.",
                "status": "failed"
            }

        phone = customer.phone.strip()
        body = custom_message or self.generate_reminder_text(
            customer_name=customer.name,
            amount_owed=Decimal(str(debit.amount_owed)),
            due_date=debit.due_date,
            reminder_type=reminder_type,
            company_name=company_name
        )

        if channel == "sms":
            result = self.twilio.send_sms_message(to_phone=phone, body=body)
        else:
            result = self.twilio.send_whatsapp_message(to_phone=phone, body=body)

        logger.info(f"Lembrete de débito enviado ({channel}) para {customer.name} ({phone}): {result}")
        return {
            "success": result.get("success", False),
            "channel": channel,
            "recipient": phone,
            "message": body,
            "status": result.get("status", "sent"),
            "sid": result.get("sid"),
            "sent_at": datetime.utcnow()
        }


debit_reminder_service = DebitReminderService()
