import fs from 'fs/promises';
import path from 'path';
import prisma from '../../../lib/prisma';

async function readJson(relPath){
  const p = path.join(process.cwd(), relPath);
  const raw = await fs.readFile(p, 'utf-8');
  return JSON.parse(raw);
}

async function getData(){
  // Try DB first, fall back to local JSON if tables are missing
  try{
    const sensors = await prisma.sensor.findMany();
    const models = await prisma.mouseModel.findMany();
    const sensorMap = new Map(sensors.map(s=>[s.id,{ id:s.id,name:s.name,minDpi:s.minDpi,maxDpi:s.maxDpi,step:s.step,native:s.native }]));
    return models.map(m=>({
      brand: m.brand,
      model: m.model,
      sensor: sensorMap.get(m.sensorId) || null
    })).filter(m=>m.sensor);
  }catch(e){
    // likely tables not present; fall back
    const sensors = await readJson('data/mice/sensors.json');
    const models = await readJson('data/mice/models.json');
    const sensorMap = new Map(sensors.map(s=>[s.id,s]));
    return models.map(m=>({ brand:m.brand, model:m.model, sensor: sensorMap.get(m.sensorId) })).filter(m=>m.sensor);
  }
}

export async function GET(req){
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q')||'').toLowerCase();
  const data = await getData();
  const filtered = q
    ? data.filter(x=>
        x.brand.toLowerCase().includes(q) ||
        x.model.toLowerCase().includes(q) ||
        x.sensor.name.toLowerCase().includes(q)
      )
    : data;
  return new Response(JSON.stringify({ mice: filtered }), { headers:{ 'content-type':'application/json' } });
}

