# frontend-descrições

Formulário React para criação de descrições de produtos, com upload de imagens via Cloudinary e envio ao workflow n8n.

Servido em `/descricoes/` — compatível com subpath deployment atrás de Traefik.

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Descrição |
|---|---|
| `VITE_N8N_WEBHOOK_URL` | URL pública completa do webhook no n8n |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud name da sua conta Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Nome do preset de upload não-assinado |

---

## Rodando localmente

```bash
cp .env.example .env
# edite .env com seus valores

npm install
npm run dev
# → http://localhost:5173/descricoes/
```

---

## Build e Docker

### Build da imagem

```bash
docker build \
  --build-arg VITE_N8N_WEBHOOK_URL=https://n8n.seudominio.com/webhook/descricoes \
  --build-arg VITE_CLOUDINARY_CLOUD_NAME=seu_cloud \
  --build-arg VITE_CLOUDINARY_UPLOAD_PRESET=seu_preset \
  -t frontend-descricoes:latest .
```

> As variáveis `VITE_*` são embutidas no bundle durante o build — por isso são passadas como `--build-arg`, não como env em runtime.

### Rodar isolado (teste)

```bash
docker run -p 8080:80 frontend-descricoes:latest
# → http://localhost:8080/descricoes/
```

---

## Integração ao docker-compose existente (n8n + Traefik)

Adicione ao seu `docker-compose.yml`:

```yaml
services:
  frontend-descricoes:
    image: frontend-descricoes:latest
    build:
      context: ./frontend-descricoes
      args:
        VITE_N8N_WEBHOOK_URL: ${VITE_N8N_WEBHOOK_URL}
        VITE_CLOUDINARY_CLOUD_NAME: ${VITE_CLOUDINARY_CLOUD_NAME}
        VITE_CLOUDINARY_UPLOAD_PRESET: ${VITE_CLOUDINARY_UPLOAD_PRESET}
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.descricoes.rule=Host(`seudominio.com`) && PathPrefix(`/descricoes`)"
      - "traefik.http.routers.descricoes.entrypoints=websecure"
      - "traefik.http.routers.descricoes.tls.certresolver=letsencrypt"
      - "traefik.http.services.descricoes.loadbalancer.server.port=80"
    networks:
      - traefik_public   # mesma rede que o Traefik já usa

networks:
  traefik_public:
    external: true
```

Adicione as variáveis no `.env` do compose:

```env
VITE_N8N_WEBHOOK_URL=https://seudominio.com/webhook/descricoes
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud
VITE_CLOUDINARY_UPLOAD_PRESET=seu_preset
```

---

## Estrutura do projeto

```
src/
├── components/
│   ├── ui/               # Primitivos shadcn/ui (Button, Input, …)
│   ├── DescricaoForm.tsx # Formulário principal
│   ├── HtmlPreview.tsx   # Preview sanitizado via DOMPurify
│   └── ImageUpload.tsx   # Upload drag-drop → Cloudinary
├── lib/
│   ├── cloudinary.ts     # Upload unsigned
│   ├── schema.ts         # Zod schema + tipos
│   └── utils.ts          # cn()
├── App.tsx
├── main.tsx
└── index.css
```

## Payload enviado ao n8n

```json
{
  "titulo": "string",
  "descricao_curta": "string",
  "descricao_longa_html": "string (HTML sanitizado no frontend)",
  "imagens": [
    { "url": "https://res.cloudinary.com/…", "public_id": "…", "alt": "…" }
  ],
  "categoria": "string | undefined",
  "preco": "string | undefined",
  "sku": "string | undefined"
}
```
