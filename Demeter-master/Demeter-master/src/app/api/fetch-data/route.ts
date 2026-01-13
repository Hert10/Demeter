import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

export async function POST(req: Request) {
  const { lat, lng, startDate, endDate } = await req.json();
  const parameters = "T2M,T2M_MAX,T2M_MIN,PRECTOT,RH2M,WS2M,ALLSKY_SFC_SW_DWN,GWETROOT";

  return new Promise((resolve, reject) => {
    // Step 1: Fetch data
    const py = spawn('python', [
      'src/python/fetch_and_process.py',
      lat,
      lng,
      startDate,
      endDate,
      parameters
    ]);
    
    let data = '';
    py.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    py.stderr.on('data', (err) => {
      console.error('Python error:', err.toString());
    });
    
    py.on('close', () => {
      const fileName = data.trim();
      if (!fileName || fileName === "[]") {
        resolve(new Response(
          JSON.stringify({ error: "Failed to fetch data" }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        ));
        return;
      }
      
      const enhancedFilePath = path.join(process.cwd(), 'data', 'processed', `enhanced_${fileName}`);
      const pyProcess = spawn('python', [
        'src/python/process_climate_data.py',
        path.join(process.cwd(), 'data', fileName), 
        enhancedFilePath  
      ]);
      
      let processedFileName = '';
      pyProcess.stdout.on('data', (chunk) => {
        processedFileName += chunk.toString();
      });
      
      pyProcess.stderr.on('data', (err) => {
        console.error('Processing error:', err.toString());
      });
      
      pyProcess.on('close', async (code) => {
        const outputFile = processedFileName.trim();
        if (code !== 0 || !outputFile) {
          resolve(new Response(
            JSON.stringify({ error: "Failed to process data" }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          ));
          return;
        }

        try {
          const fileStream = fs.createReadStream(enhancedFilePath);
          
          const formData = new FormData();
          formData.append('file', fileStream, {
            filename: `enhanced_${fileName}`,
            contentType: 'text/csv',
          });
          
          const response = await fetch('http://localhost:8000/predict/?days=30', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
          });
          
          const predictionData = await response.json();
          
          const resultsFilePath = path.join(
            process.cwd(), 
            'data', 
            'predictions', 
            `prediction_${path.basename(fileName, '.csv')}.json`
          );
          
          const predictionsDir = path.join(process.cwd(), 'data', 'predictions');
          if (!fs.existsSync(predictionsDir)){
            fs.mkdirSync(predictionsDir, { recursive: true });
          }
          
          fs.writeFileSync(resultsFilePath, JSON.stringify(predictionData, null, 2));
          
          resolve(new Response(
            JSON.stringify({
              fileUrl: `/processed_data/enhanced_${fileName}`,
              predictionUrl: `/predictions/prediction_${path.basename(fileName, '.csv')}.json`,
              prediction: predictionData
            }),
            { headers: { 'Content-Type': 'application/json' } }
          ));
          
        } catch (error) {
          console.error('FastAPI request error:', error);
          resolve(new Response(
            JSON.stringify({ 
              error: "Failed to get prediction from model",
              fileUrl: `/processed_data/enhanced_${fileName}` 
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          ));
        }
      });
    });
  });
}