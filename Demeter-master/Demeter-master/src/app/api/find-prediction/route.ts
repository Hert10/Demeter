import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return new Response(JSON.stringify({ error: 'Missing lat or lng' }), { status: 400 });
  }

  const predictionsDir = path.join(process.cwd(), 'data', 'predictions');

  try {
    const files = await fs.readdir(predictionsDir);

    const targetLat = parseFloat(lat).toFixed(4);
    const targetLng = parseFloat(lng).toFixed(4);

    const matchingFile = files.find(file => {
      if (!file.startsWith('prediction_nasa_power_data_')) return false;
      
      const parts = file.split('_');
      const fileLat = parseFloat(parts[4]).toFixed(4);
      const fileLng = parseFloat(parts[5]).toFixed(4);

      return fileLat === targetLat && fileLng === targetLng;
    });

    if (!matchingFile) {
      return new Response(JSON.stringify({ error: 'Prediction file not found' }), { status: 404 });
    }

    const filePath = path.join(predictionsDir, matchingFile);
    const fileData = await fs.readFile(filePath, 'utf-8');

    return new Response(fileData, {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Server error', details: error.message }), { status: 500 });
  }
}
