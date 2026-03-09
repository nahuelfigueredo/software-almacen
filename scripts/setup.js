const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

async function setup() {
  console.log('\n🚀 Configuración de Producción - MCN Almacén\n');

  const businessName = await question('Nombre del negocio: ');
  const ownerName = await question('Nombre del dueño: ');

  let ownerPin;
  while (true) {
    ownerPin = await question('PIN del dueño (4 dígitos numéricos): ');
    if (/^\d{4}$/.test(ownerPin)) break;
    console.log('❌ El PIN debe ser exactamente 4 dígitos numéricos. Intente de nuevo.');
  }

  // Generar JWT secret único
  const jwtSecret = crypto.randomBytes(32).toString('hex');

  // Crear .env
  const envContent = `# ===== PRODUCCIÓN =====
DEMO_MODE=false

# ===== JWT (GENERADO AUTOMÁTICAMENTE) =====
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# ===== SERVIDOR =====
PORT=3000
NODE_ENV=production

# ===== NEGOCIO =====
BUSINESS_NAME=${businessName}

# ===== USUARIO INICIAL =====
OWNER_NAME=${ownerName}
OWNER_PIN=${ownerPin}`;

  fs.writeFileSync(path.join(__dirname, '../.env'), envContent);

  console.log('\n✅ Archivo .env creado');
  console.log('✅ JWT Secret generado (único para este cliente)');
  console.log('\n📝 Usuario inicial:');
  console.log(`   Nombre: ${ownerName}`);
  console.log(`   PIN: ${ownerPin}`);
  console.log('   Rol: owner\n');
  console.log('🎯 Ejecutá: npm start\n');

  rl.close();
}

setup();
