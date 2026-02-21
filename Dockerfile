# Dockerfile para el Sistema de Seguimiento del Neurodesarrollo
FROM node:20-alpine

# Instalar dependencias del sistema para SQLite
RUN apk add --no-cache sqlite python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiar archivos de dependencias y configuración
COPY package*.json ./
COPY vite.config.mjs ./

# Instalar dependencias
RUN npm ci && npm cache clean --force

# Copiar y configurar script de entrada ANTES del código fuente
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Copiar código fuente
COPY --chown=nextjs:nodejs . .
COPY assets /usr/share/nginx/html/assets

# Crear directorios necesarios con permisos correctos
RUN mkdir -p /app/server/data && \
    mkdir -p /app/dist && \
    chown -R nextjs:nodejs /app

# Cambiar al usuario no-root
USER nextjs

# Construir la aplicación
RUN npm run build

# Exponer puertos
EXPOSE 3000 8001

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=8001

# Punto de entrada
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["both"]
