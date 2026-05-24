FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# Dev mode: Vite reads VITE_API_URL from environment at startup
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
