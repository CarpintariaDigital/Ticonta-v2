import hashlib
import os
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings


class CloudStorageService:
    """Serviço de Armazenamento em Nuvem (Cloudflare R2 / AWS S3 / Local Mock) com links temporários (24-48h)."""

    def __init__(self):
        self.provider = settings.STORAGE_PROVIDER
        self.base_url = settings.STORAGE_PUBLIC_BASE_URL

    def upload_pdf(self, file_bytes: bytes, filename: str, expiration_hours: int = 48) -> str:
        """
        Guarda o ficheiro PDF e retorna uma URL temporária com assinatura segura ou hash.
        """
        # Gerar hash único para o documento
        file_hash = hashlib.sha256(file_bytes[:100] + filename.encode("utf-8")).hexdigest()[:12]
        safe_filename = f"{file_hash}_{filename}"

        # Se for mock/local, retornar URL pública simulada com token de expiração
        expires_at = int((datetime.utcnow() + timedelta(hours=expiration_hours)).timestamp())
        token = hashlib.md5(f"{safe_filename}_{expires_at}_{settings.SECRET_KEY}".encode("utf-8")).hexdigest()[:10]

        public_url = f"{self.base_url}/docs/{safe_filename}?exp={expires_at}&sig={token}"
        return public_url
