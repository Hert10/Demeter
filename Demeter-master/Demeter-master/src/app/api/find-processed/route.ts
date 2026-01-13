import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return new Response(JSON.stringify({ error: 'Missing lat or lng' }), { status: 400 });
  }

  const processedDir = path.join(process.cwd(), 'data', 'processed');

  try {
    const files = await fs.readdir(processedDir);

    const targetLat = parseFloat(lat).toFixed(4);
    const targetLng = parseFloat(lng).toFixed(4);

    const matchingFile = files.find(file => {
      if (!file.startsWith('enhanced_nasa_power_data_')) return false;
      
      const parts = file.split('_');
      const fileLat = parseFloat(parts[5]).toFixed(4);
      const fileLng = parseFloat(parts[4]).toFixed(4);

      return fileLat === targetLat && fileLng === targetLng;
    });

    if (!matchingFile) {
      return new Response(JSON.stringify({ error: 'Processed file not found' }), { status: 404 });
    }

    const filePath = path.join(processedDir, matchingFile);
    const csvData = await fs.readFile(filePath, 'utf-8');

    const records = parse(csvData, {columns:true, skip_empty_lines:true});

    return new Response(JSON.stringify(records), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Server error', details: error.message }), { status: 500 });
  }
}
