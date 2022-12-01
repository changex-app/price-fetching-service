FROM node:16

WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY . .
RUN npm install
RUN npm run build
ENV DEPLYMENT=DEV
EXPOSE 8081
CMD ["npm", "run", "start"]
