#!/bin/bash

# Script de despliegue rápido para Google Cloud Run
# Uso: ./deploy-cloud-run.sh

set -e

echo "🚀 Desplegando Prestamax Backend a Cloud Run..."

# Variables - REEMPLAZAR CON TUS VALORES
PROJECT_ID="YOUR_PROJECT_ID"
REGION="us-central1"
SERVICE_NAME="prestamax-backend"
DB_CONNECTION="YOUR_PROJECT_ID:YOUR_REGION:prestamax-db"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  Asegúrate de haber configurado las siguientes variables:${NC}"
echo "  - PROJECT_ID"
echo "  - DB_CONNECTION"
echo "  - DB_USER, DB_PASS, JWT_SECRET (se solicitarán)"
echo ""

read -p "Presiona Enter para continuar o Ctrl+C para cancelar..."

# Solicitar credenciales de forma segura
read -p "DB_USER: " DB_USER
read -sp "DB_PASS: " DB_PASS
echo ""
read -sp "JWT_SECRET: " JWT_SECRET
echo ""

cd prestamax-backend

echo -e "${GREEN}📦 Construyendo y desplegando...${NC}"

gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "DB_HOST=/cloudsql/$DB_CONNECTION" \
  --set-env-vars "DB_USER=$DB_USER" \
  --set-env-vars "DB_PASS=$DB_PASS" \
  --set-env-vars "DB_NAME=prestamax" \
  --set-env-vars "JWT_SECRET=$JWT_SECRET" \
  --set-env-vars "NODE_ENV=production" \
  --add-cloudsql-instances $DB_CONNECTION \
  --project $PROJECT_ID

echo -e "${GREEN}✅ Despliegue completado!${NC}"
echo ""
echo "Tu backend está disponible en:"
gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)"
