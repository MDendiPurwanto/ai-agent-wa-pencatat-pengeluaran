FROM node:16

# Set working directory
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Salin seluruh kode aplikasi
COPY . .

# Expose port
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]
