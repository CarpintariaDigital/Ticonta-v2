import logging
from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, Optional
from app.integrations.twilio import TwilioIntegration
from app.models.takeaway import TakeawayOrder

logger = logging.getLogger("takeaway_notifications")


class TakeawayNotificationService:
    """
    Serviço de atualizações e notificações em tempo real via WhatsApp e SMS
    para clientes de Takeaway e Encomendas para Entrega (Delivery).
    """

    def __init__(self):
        self.twilio = TwilioIntegration()

    def generate_notification_text(
        self,
        order: TakeawayOrder,
        event: str,
        company_name: str = "TiConta Restaurante & Takeaway"
    ) -> str:
        name = order.customer_name
        num = order.order_number
        total_str = f"{order.total:,.2f} MT".replace(",", " ")

        if event == "order_confirmed":
            if order.order_type == "delivery":
                return (
                    f"Olá {name}! Seu pedido de entrega *#{num}* foi confirmado com sucesso em {company_name}. "
                    f"Valor total: {total_str}. "
                    f"Tempo estimado de preparo: ~{order.estimated_prep_minutes} min. "
                    f"Avisaremos assim que sair com o estafeta!"
                )
            else:
                return (
                    f"Olá {name}! Seu pedido para viagem *#{num}* foi confirmado com sucesso em {company_name}. "
                    f"Valor total: {total_str}. "
                    f"Previsão de prontidão: ~{order.estimated_prep_minutes} min. "
                    f"Avisaremos quando estiver pronto para levantamento no balcão!"
                )

        elif event == "order_ready":
            if order.order_type == "takeaway":
                return (
                    f"🛎️ Olá {name}! Seu pedido *#{num}* está PRONTO para levantamento no balcão de {company_name}. "
                    f"Pode vir retirar a qualquer momento. Bom apetite!"
                )
            else:
                return (
                    f"🍽️ Olá {name}! Seu pedido *#{num}* acabou de ser finalizado pela nossa cozinha e "
                    f"está a ser embalado para envio com o estafeta!"
                )

        elif event == "in_transit":
            rider_name = order.delivery.delivery_person_name if order.delivery else "Nosso estafeta"
            rider_phone = f" ({order.delivery.delivery_person_phone})" if order.delivery and order.delivery.delivery_person_phone else ""
            eta = order.estimated_delivery_minutes
            return (
                f"🛵 Olá {name}! Seu pedido *#{num}* SAIU PARA ENTREGA com {rider_name}{rider_phone}. "
                f"Previsão de chegada no seu endereço: ~{eta} min. Por favor, mantenha o telefone atento!"
            )

        elif event == "delivered" or event == "picked_up":
            action = "entregue" if order.order_type == "delivery" else "levantado"
            return (
                f"✅ Olá {name}! Seu pedido *#{num}* foi {action} com sucesso. "
                f"Muito obrigado por escolher {company_name}! Desejamos-lhe um excelente apetite!"
            )

        elif event == "cancelled":
            return (
                f"⚠️ Prezado(a) {name}, informamos que o seu pedido *#{num}* foi cancelado em {company_name}. "
                f"Para dúvidas ou reagendamento, entre em contacto connosco. Obrigado!"
            )

        else:
            return f"Olá {name}! Atualização do seu pedido *#{num}* em {company_name}: status atual {order.status}."

    def send_order_update(
        self,
        order: TakeawayOrder,
        event: str,
        channel: str = "whatsapp",
        custom_message: Optional[str] = None,
        company_name: str = "TiConta Restaurante & Takeaway"
    ) -> Dict[str, Any]:
        if not order.customer_phone:
            logger.warning(f"Pedido #{order.order_number} sem contacto telefónico do cliente.")
            return {"success": False, "error": "Sem contacto telefónico", "status": "failed"}

        phone = order.customer_phone.strip()
        body = custom_message or self.generate_notification_text(
            order=order,
            event=event,
            company_name=company_name
        )

        if channel == "sms":
            result = self.twilio.send_sms_message(to_phone=phone, body=body)
        else:
            result = self.twilio.send_whatsapp_message(to_phone=phone, body=body)

        logger.info(f"Notificação Takeaway ({event}) enviada ({channel}) para {order.customer_name} ({phone}): {result}")
        return {
            "success": result.get("success", False),
            "channel": channel,
            "recipient": phone,
            "message": body,
            "status": result.get("status", "sent"),
            "sent_at": datetime.utcnow()
        }


takeaway_notification_service = TakeawayNotificationService()
