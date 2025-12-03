FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Exponer puerto (Cloud Run usa PORT env var, default 8080)
EXPOSE 8080

# Variables de entorno por defecto (serán sobrescritas por Cloud Run)
ENV NODE_ENV=production

# Comando de inicio
CMD ["node", "index.js"]
