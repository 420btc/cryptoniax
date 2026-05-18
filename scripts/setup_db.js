const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function run() {
  console.log('🌟 Iniciando setup de Base de Datos de HodlVille...');
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ ERROR: Falta DATABASE_URL en .env.local');
    console.log('\nPara ejecutar las migraciones automáticamente, necesitas tu "Transaction pooler string" de Supabase.');
    console.log('1. Ve a tu proyecto en Supabase -> Project Settings -> Database');
    console.log('2. Baja a "Connection string" -> URI');
    console.log('3. Cópiala y añade DATABASE_URL="postgres://..." a tu .env.local (no olvides poner tu password)');
    console.log('4. Vuelve a ejecutar: node scripts/setup_db.js');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos Supabase');

    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`\n⏳ Ejecutando migración: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(sql);
        console.log(`✅ Migración ${file} completada con éxito.`);
      }
    }

    console.log('\n🎉 ¡Todas las migraciones se han ejecutado correctamente!');
    console.log('El proyecto HodlVille está listo para usar Supabase.');
  } catch (err) {
    console.error('\n❌ ERROR durante la ejecución de las migraciones:');
    console.error(err.message);
  } finally {
    await client.end();
  }
}

run();