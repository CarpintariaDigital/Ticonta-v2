# TiConta ERP v2 — Sistema de Gestão Empresarial & POS
## Ecossistema Carpintaria Digital (Moçambique)

Sistema ERP e PDV Offline-First de alta performance com arquitetura híbrida (Frontend Next.js + Dexie.js / IndexedDB + Capacitor Android e Backend FastAPI / Cloudflare Worker).

---

## 📱 Empacotamento Mobile Nativo (Capacitor Android)

O frontend Next.js é compilado em modo estático (`output: 'export'`) e embrulhado pelo **Capacitor** para distribuição como APK Android.

### 1. Build Estático & Sincronização:
```bash
cd frontend
npm run build:android
# Este comando executa automaticamente:
# 1) next build (gera os ficheiros estáticos na pasta /out)
# 2) npx cap sync android (copia os assets para android/app/src/main/assets/public)
```

### 2. Abrir no Android Studio:
```bash
cd frontend
npx cap open android
```

### 3. Geração do APK no Android Studio:
1. No Android Studio, vá a **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. O binário gerado estará localizado em:
   `frontend/android/app/build/outputs/apk/debug/app-debug.apk`
3. Para produção, selecione **Build** > **Generate Signed Bundle / APK** com a keystore oficial.

> [!NOTE]
> **Acesso ao Backend:**
> O frontend empacotado no APK opera em modo offline-first via IndexedDB/Dexie.js. Para sincronização e recursos em nuvem, o backend FastAPI / Worker deve estar acessível através de HTTPS público configurado na variável `NEXT_PUBLIC_API_URL`.

---

## 💻 Desenvolvimento Local Web
```bash
cd frontend
npm run dev
# Servidor web local em: http://localhost:3000
```
