FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files and Prisma schema so that `prisma generate` (postinstall)
# can run during `npm install` inside the container.
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/main.js"]

