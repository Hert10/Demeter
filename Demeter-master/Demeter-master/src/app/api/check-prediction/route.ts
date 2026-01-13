import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const lat = url.searchParams.get('lat');
  const lng = url.searchParams.get('lng');
  
  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng parameters' }, { status: 400 });
  }
  
  const dirPath = path.join(process.cwd(), 'data', 'predictions');
  
  if (!fs.existsSync(dirPath)) {
    return NextResponse.json({ exists: false });
  }
  
  const files = fs.readdirSync(dirPath);
  

  const filePrefix = `prediction_nasa_power_data_${lat}_${lng}_`;
  const exists = files.some(file => file.startsWith(filePrefix));
  
  return NextResponse.json({ exists });
}