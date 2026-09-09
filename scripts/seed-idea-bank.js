const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const FILE_PATH = path.resolve(__dirname, '../6.000+ Content Ideas untuk Berbagai Niche.xlsx');

async function seed() {
  console.log('Loading Excel file...');
  const workbook = xlsx.readFile(FILE_PATH);
  
  console.log('Clearing old data in content_idea_bank...');
  await supabase.from('content_idea_bank').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  let totalImported = 0;

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(`Processing sheet: ${sheetName} (${rawData.length} rows)`);

    const recordsToInsert = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || !Array.isArray(row)) continue;

      let items = []; // Array of {title, description} for this row

      // 1. Penanganan Khusus untuk "List Hashtag"
      if (sheetName === 'List Hashtag') {
        if (i < 10) continue; // Skip header/deskripsi panjang di awal
        
        // Pola tabel: B,C (1,2) | F,G (5,6) | J,K (9,10) | N,O (13,14) | R,S (17,18)
        const columnPairs = [[1, 2], [5, 6], [9, 10], [13, 14], [17, 18]];
        for (const [colTitle, colDesc] of columnPairs) {
          if (row[colTitle] && String(row[colTitle]).trim() !== '') {
            items.push({
              title: String(row[colTitle]).trim(),
              description: row[colDesc] ? String(row[colDesc]).trim() : ''
            });
          }
        }
      }
      // 2. Penanganan Khusus untuk "QUOTE"
      else if (sheetName.includes('QUOTE')) {
        const validCells = row.filter(cell => cell != null && String(cell).trim() !== '');
        if (validCells.length < 2) continue;
        
        const firstCellLower = String(validCells[0]).toLowerCase();
        if (firstCellLower === 'no' || firstCellLower === 'sudah dipakai' || firstCellLower === 'quote') continue;

        let quote = '';
        let author = '';

        if (!isNaN(Number(validCells[0])) && String(validCells[0]).length < 4) {
           quote = String(validCells[1]).trim();
           author = validCells.slice(2).join(' - ').trim();
        } else {
           quote = String(validCells[0]).trim();
           author = validCells.slice(1).join(' - ').trim();
        }
        
        if (quote && quote.length > 5) {
          items.push({ title: quote, description: author });
        }
      }
      // 3. Penanganan Khusus untuk "Tebak-Tebakan" atau "Pertanyaan"
      else if (sheetName.includes('Tebak-Tebakan') || sheetName.includes('This or That') || sheetName.includes('Pertanyaan')) {
        // Biasa: No, Sudah Dipakai, Pertanyaan, Jawaban
        const strCells = row.map(c => String(c || '').trim()).filter(c => c !== '');
        
        if (strCells.length === 0) continue;

        // Skip header
        if (strCells[0].toLowerCase() === 'no' || strCells[0].toLowerCase().includes('pertanyaan')) continue;

        if (strCells.length >= 3) {
          // Asumsi: No (0), Pertanyaan (1), Jawaban (2) (Setelah difilter yg kosong)
          if (!isNaN(Number(strCells[0]))) {
            items.push({ title: strCells[1], description: strCells.slice(2).join(' - ') });
          } else {
            items.push({ title: strCells[0], description: strCells.slice(1).join(' - ') });
          }
        } else if (strCells.length === 2) {
          if (!isNaN(Number(strCells[0]))) {
            items.push({ title: strCells[1], description: '' });
          } else {
            items.push({ title: strCells[0], description: strCells[1] });
          }
        } else if (strCells.length === 1 && isNaN(Number(strCells[0]))) {
          items.push({ title: strCells[0], description: '' });
        }
      }
      // 4. Default penanganan umum (Ide Konten, Hook, Kalimat Promosi, dll)
      else {
        const validCells = row.filter(cell => cell != null && String(cell).trim() !== '');
        if (validCells.length === 0) continue;
        
        const firstCellLower = String(validCells[0]).toLowerCase();
        if (['no', 'title', 'judul', 'hook', 'ide konten'].includes(firstCellLower)) continue;

        let title = '';
        let description = '';

        if (validCells.length >= 2 && !isNaN(Number(validCells[0])) && String(validCells[0]).length < 4) {
          title = String(validCells[1]).trim();
          description = validCells.slice(2).join(' - ').trim();
        } else if (validCells.length >= 2) {
          title = String(validCells[0]).trim();
          description = validCells.slice(1).join(' - ').trim();
        } else {
          title = String(validCells[0]).trim();
        }

        if (title.length > 2) {
          items.push({ title, description });
        }
      }

      // Masukkan semua items yang ditemukan di baris ini
      for (const item of items) {
        recordsToInsert.push({
          category: sheetName,
          title: item.title,
          description: item.description
        });
      }
    }

    if (recordsToInsert.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
        const chunk = recordsToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('content_idea_bank').insert(chunk);
        if (error) console.error(`Error inserting chunk for ${sheetName}:`, error);
        else totalImported += chunk.length;
      }
    }
  }

  console.log(`\n✅ Seeding complete! Successfully imported ${totalImported} ideas.`);
}

seed().catch(console.error);
