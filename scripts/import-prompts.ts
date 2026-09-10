import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Memuat environment variables dari .env.local dan .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
  console.log('Pastikan Anda telah mengisi variabel tersebut di file .env.local Anda.');
  process.exit(1);
}

// Gunakan Service Role Key untuk bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importPrompts() {
  const filePath = path.resolve('e:/AI Agen/8500+Prompt.txt');
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Membaca file dari ${filePath}...`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split(/\r?\n/);
  
  const prompts = [];
  let currentCategory = 'Uncategorized';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (!line) {
      i++;
      continue;
    }

    // Jika menemukan kata "Section", baris berikutnya (non-kosong) adalah Kategori
    if (line.toLowerCase().startsWith('section')) {
      i++;
      while (i < lines.length && !lines[i].trim()) {
        i++;
      }
      if (i < lines.length) {
        currentCategory = lines[i].trim();
      }
    } else {
      // Selain itu, dianggap sebagai prompt
      prompts.push({
        category: currentCategory,
        content: line
      });
    }
    i++;
  }

  console.log(`Berhasil mem-parsing ${prompts.length} prompts. Memulai proses insert ke database (batch)...`);
  
  const BATCH_SIZE = 500;
  let insertedCount = 0;

  for (let j = 0; j < prompts.length; j += BATCH_SIZE) {
    const batch = prompts.slice(j, j + BATCH_SIZE);
    
    const { error } = await supabase
      .from('ai_prompts_bank')
      .insert(batch);
      
    if (error) {
      console.error(`Error pada batch mulai dari baris ke-${j}:`, error.message);
    } else {
      insertedCount += batch.length;
      console.log(`Berhasil memasukkan ${insertedCount} dari ${prompts.length} prompts...`);
    }
  }

  console.log('🎉 Import selesai!');
}

importPrompts().catch(console.error);
