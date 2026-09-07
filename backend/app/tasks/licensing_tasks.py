from datetime import datetime, timedelta
from typing import Any, Dict, List
from sqlalchemy.orm import Session
from app.models.license import License
from app.services.email import EmailService


class LicensingTasks:
    """Tarefas em segundo plano (Cron / Background) para monitorização e manutenção de licenças."""

    @staticmethod
    def check_expiring_licenses_and_warn(db: Session) -> Dict[str, int]:
        """
        Verifica licenças ativas e envia avisos para prazos de 30 dias, 7 dias e 1 dia.
        """
        now = datetime.utcnow()
        active_licenses = db.query(License).filter(License.status == "active").all()

        warnings_sent = 0
        expired_updated = 0

        for lic in active_licenses:
            if lic.expires_at < now:
                lic.status = "expired"
                expired_updated += 1
                if lic.customer_email:
                    EmailService.send_license_expired_email(
                        customer_email=lic.customer_email,
                        customer_name=lic.customer_name,
                        license_key=lic.license_key,
                    )
            else:
                delta_days = (lic.expires_at - now).total_seconds() / 86400.0
                days_left = int(round(delta_days))
                if days_left in [30, 7, 1] and lic.customer_email:
                    EmailService.send_license_expiring_soon_email(
                        customer_email=lic.customer_email,
                        customer_name=lic.customer_name,
                        days_remaining=days_left,
                        license_key=lic.license_key,
                    )
                    warnings_sent += 1

        db.commit()
        return {
            "warnings_sent": warnings_sent,
            "expired_updated": expired_updated,
        }

    @staticmethod
    def generate_weekly_revenue_report(db: Session) -> Dict[str, Any]:
        """Gera sumário analítico de subscrições para a equipa executiva."""
        licenses = db.query(License).all()
        return {
            "total_issued": len(licenses),
            "active": sum(1 for l in licenses if l.status == "active"),
            "report_generated_at": datetime.utcnow().isoformat(),
        }
