# ========================
# STAGE 1: Build
# Compilam aplicatia React cu Node.js
# ========================

# Folosim Node.js 20 Alpine pentru build
FROM node:20-alpine AS builder

# Setam directorul de lucru
WORKDIR /app

# Copiem package.json primul pentru cache
COPY package*.json ./

# Instalam dependentele
RUN npm ci

# Copiem restul codului
COPY . .

# Builduim aplicatia React pentru productie
# Genereaza folderul /app/dist cu fisierele statice
RUN npm run build

# ========================
# STAGE 2: Production
# Servim fisierele statice cu Nginx
# De ce Nginx si nu Node.js?
# - Nginx e optimizat pentru servirea fisierelor statice
# - Mult mai rapid si mai eficient decat Node.js pentru asta
# - Consuma mult mai putina memorie
# ========================

# Folosim Nginx Alpine - imagine foarte mica (~25MB)
FROM nginx:alpine AS production

# Stergem configuratia default a Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copiem configuratia noastra Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiem fisierele buildate din stage-ul anterior
# dist/ contine index.html + JS + CSS bunduite
COPY --from=builder /app/dist /usr/share/nginx/html

# Expunem portul 80
EXPOSE 80

# Healthcheck pentru Kubernetes
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Pornim Nginx in foreground (nu daemon)
# daemon off = necesar in Docker ca sa nu iasa containerul
CMD ["nginx", "-g", "daemon off;"]