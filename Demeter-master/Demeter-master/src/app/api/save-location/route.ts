// src/app/api/save-location/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const { userId, country, region, coordinates } = data;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Filename based on userId
    const filePath = path.join(dataDir, `user-${userId}-locations.json`);
    
    // Read existing file if it exists
    let existingData = [];
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (err) {
      // File doesn't exist yet, that's fine
    }
    
    // Add new entry with timestamp
    const newEntry = {
      userId,
      country: country || null,
      region: region || null,
      coordinates: coordinates || null,
      timestamp: new Date().toISOString()
    };
    
    existingData.push(newEntry);
    
    // Write updated data
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving location data:', error);
    return NextResponse.json({ error: 'Failed to save location data' }, { status: 500 });
  }
}

