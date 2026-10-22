# Imagen única para desarrollo y build. Node fijado a la versión más reciente
# disponible al crear el proyecto (ver memories/infraestructura.md para actualizarla).
FROM node:26.12.1-alpine

WORKDIR /app

# Instalar dependencias primero para aprovechar la caché de capas.
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 4321

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4321"]
