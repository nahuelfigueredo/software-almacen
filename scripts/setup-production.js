#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('🎯 Setup de Producción - Sistema de Almacén\n');

  const businessName = await question('Nombre del negocio: ');
  const ownerName = await question('Nombre del dueño: ');
  let ownerPin = await question('PIN del dueño (4 dígitos): ');
  while (!/^\d{4}$/.test(ownerPin)) {
    console.log('❌ El PIN debe ser exactamente 4 dígitos numéricos.');
    ownerPin = await question('PIN del dueño (4 dígitos): ');
  }

  // Generar JWT_SECRET aleatorio
  const jwtSecret = crypto.randomBytes(32).toString('hex');

  // Crear .env
  const envContent = `# ==================================
# CONFIGURACIÓN DE PRODUCCIÓN
# ==================================
DEMO_MODE=false
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# Negocio
BUSINESS_NAME=${businessName}

# Usuario inicial
OWNER_NAME=${ownerName}
OWNER_PIN=${ownerPin}
`;

  fs.writeFileSync('.env', envContent);

  // Borrar BD existente
  const dbPath = path.join(__dirname, '../data/almacen.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  console.log('\n✅ Configuración completada!');
  console.log('\n📝 Siguiente paso:');
  console.log('   npm start\n');
  console.log(`👤 Accede con: ${ownerName} / PIN: ${ownerPin}\n`);

  rl.close();
}

setup().catch(console.error);
