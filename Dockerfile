# Dockerfile para el Sistema de Seguimiento del Neurodesarrollo
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Copiar el resto de los archivos
COPY . .

# Exponer puertos (3000 frontend, 8001 backend)
EXPOSE 3000 8001

# Comando por defecto
CMD ["npm", "run", "dev"]
