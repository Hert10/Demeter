import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params; 
  const filePath = path.join(process.cwd(), 'data', `user-${userId}-locations.json`);

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const locations = JSON.parse(fileContent);
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}



export async function DELETE(request:NextRequest, {params}:{params:{userId:string}}) {
    const {userId} = params;
    const{lat, lng} = await request.json();
    const filePath = path.join(process.cwd(), 'data', `user-${userId}-locations.json`);
try{
    const content =await fs.readFile(filePath, 'utf-8');
    const locations = JSON.parse(content);
    const updated = locations.filter(
        (loc:any)=> 
            !(loc.coordinates[0] === lat && loc.coordinates[1] === lng)
    );
    await fs.writeFile(filePath,JSON.stringify(updated,null,2));
    return NextResponse.json({success: true});
    
}catch(err){
    console.error('delete error', err);
    return NextResponse.json({err:'cant delete'}, {status:500});
}
    
}
