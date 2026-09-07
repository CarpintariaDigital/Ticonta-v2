import random
import time
from locust import HttpUser, task, between


class LoadTestUser(HttpUser):
    wait_time = between(0.1, 0.5)
    token = None
    headers = {}

    def on_start(self):
        """Autenticar utilizador no início da sessão de carga."""
        res = self.client.post(
            "/api/v1/auth/login",
            json={"username": "admin_user", "pin": "1234"},
        )
        if res.status_code == 200:
            self.token = res.json().get("access_token")
            self.headers = {"Authorization": f"Bearer {self.token}"}

    @task(5)
    def query_sales(self):
        """Consulta paginada de vendas."""
        self.client.get("/api/v1/sales", headers=self.headers, name="/api/v1/sales [GET]")

    @task(3)
    def create_sale(self):
        """Emissão rápida de venda no POS."""
        payload = {
            "company_id": 1,
            "customer_id": 1,
            "payment_method": random.choice(["cash", "mpesa", "emola", "card"]),
            "items": [
                {
                    "product_id": random.choice([1, 2]),
                    "quantity": random.randint(1, 3),
                    "unit_price": "7500.00",
                    "tax_rate": "16.00",
                }
            ],
            "discount": "0.00",
        }
        self.client.post("/api/v1/sales", json=payload, headers=self.headers, name="/api/v1/sales [POST]")

    @task(2)
    def create_and_move_lead(self):
        """Criação e avanço de lead no CRM."""
        res = self.client.post(
            "/api/v1/crm/leads",
            json={
                "company_id": 1,
                "name": f"Lead Carga {random.randint(1000, 99999)}",
                "phone": "+258840000000",
                "value": str(random.randint(10000, 200000)),
                "source": "whatsapp",
            },
            headers=self.headers,
            name="/api/v1/crm/leads [POST]",
        )
        if res.status_code == 201:
            lead_id = res.json().get("id")
            if lead_id:
                self.client.put(
                    f"/api/v1/crm/leads/{lead_id}/stage",
                    json={"stage": "proposta", "probability": 50},
                    headers=self.headers,
                    name="/api/v1/crm/leads/:id/stage [PUT]",
                )

    @task(2)
    def generate_reports(self):
        """Consulta de balancetes e relatórios analíticos."""
        self.client.get(
            "/api/v1/accounting/trial-balance",
            headers=self.headers,
            name="/api/v1/accounting/trial-balance [GET]",
        )
        self.client.get(
            "/api/v1/reports/sales?company_id=1",
            headers=self.headers,
            name="/api/v1/reports/sales [GET]",
        )
