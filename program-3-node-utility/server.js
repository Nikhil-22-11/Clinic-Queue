// Program 3: Node.js File System, Path, Streams, EventEmitter and HTTP server.
const http = require("http");
const fs = require("fs");
const path = require("path");
const {EventEmitter} = require("events");

const DATA_DIR = path.join(__dirname,"data");
const DATA_FILE = path.join(DATA_DIR,"queue.json");
const events = new EventEmitter();

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR,{recursive:true});
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE,JSON.stringify([],null,2));

events.on("patient:added", patient => {
  console.log(`[EVENT] Patient added: ${patient.name} (token ${patient.token})`);
});

function readRecords(){
  return JSON.parse(fs.readFileSync(DATA_FILE,"utf8"));
}
function writeRecords(records){
  fs.writeFileSync(DATA_FILE,JSON.stringify(records,null,2));
}
const server = http.createServer((req,res)=>{
  if(req.method==="GET" && req.url==="/"){
    res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});
    return res.end("<h1>Clinic Queue Node Utility</h1><p>Use GET /api/records to view saved queue records.</p>");
  }
  if(req.method==="GET" && req.url==="/api/records"){
    const records=readRecords();
    res.writeHead(200,{"Content-Type":"application/json"});
    return res.end(JSON.stringify(records));
  }
  if(req.method==="POST" && req.url==="/api/records"){
    let body="";
    req.on("data",chunk=>body+=chunk);
    req.on("end",()=>{
      try{
        const input=JSON.parse(body);
        if(!input.name || !input.reason) throw new Error("name and reason are required");
        const records=readRecords();
        const patient={...input,token:records.length+1,createdAt:new Date().toISOString()};
        records.push(patient);writeRecords(records);events.emit("patient:added",patient);
        res.writeHead(201,{"Content-Type":"application/json"});
        res.end(JSON.stringify(patient));
      }catch(error){
        res.writeHead(400,{"Content-Type":"application/json"});
        res.end(JSON.stringify({error:error.message}));
      }
    });
    return;
  }
  res.writeHead(404,{"Content-Type":"application/json"});
  res.end(JSON.stringify({error:"Route not found"}));
});

server.listen(3001,()=>console.log("Node utility server running at http://localhost:3001"));

// Streams example: create a backup without loading the entire file into memory.
function createBackup(){
  const source=fs.createReadStream(DATA_FILE);
  const destination=fs.createWriteStream(path.join(DATA_DIR,"queue-backup.json"));
  source.pipe(destination);
  destination.on("finish",()=>console.log("Backup created using streams."));
}
createBackup();
