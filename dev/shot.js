// Screenshot GardenOS with a seeded bloomed garden so we can see the composition.
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const standalone = path.join(__dirname, "_shot.html");
fs.writeFileSync(standalone, "<!doctype html><html><head><meta charset='utf-8'></head><body>"+fs.readFileSync(path.join(root,"index.html"),"utf8")+"</body></html>");
const url = "file:///"+standalone.replace(/\\/g,"/");
const outPng = path.join(__dirname, "shot.png");
const proc = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ["--headless=new","--disable-gpu","--window-size=1400,900","--remote-debugging-port=9225","--no-first-run",url], {stdio:"ignore"});
(async()=>{
  let t=null; for(let i=0;i<60;i++){ try{ const r=await fetch("http://127.0.0.1:9225/json"); const l=await r.json();
    t=l.find(x=>x.type==="page"&&x.webSocketDebuggerUrl); if(t)break;}catch(e){} await new Promise(r=>setTimeout(r,200)); }
  const ws=new WebSocket(t.webSocketDebuggerUrl); let id=0; const pend={};
  const send=(m,p)=>new Promise(res=>{const i=++id;pend[i]=res;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});
  await new Promise(r=>ws.addEventListener("open",r));
  ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data); if(m.id&&pend[m.id]){pend[m.id](m.result);delete pend[m.id];}});
  await send("Page.enable"); await send("Runtime.enable");
  await new Promise(r=>setTimeout(r,700));
  await send("Runtime.evaluate",{expression:`(function(){var now=Date.now();var g=[];var ty=['tulip','sun','rose','daisy','bell','lav','mush'];
    for(var i=0;i<10;i++){g.push({t:now-9e8,w:now,type:ty[i%ty.length],x:6+i*9,y:(i*7)%40});}
    localStorage.setItem('bayanos_garden_v2',JSON.stringify(g));localStorage.setItem('sprite_grove_tour','1');})()`});
  await send("Page.reload",{});
  await new Promise(r=>setTimeout(r,1500));
  await send("Runtime.evaluate",{expression:`document.querySelectorAll('.win.open .x').forEach(function(x){x.click();});`});
  await new Promise(r=>setTimeout(r,400));
  const shot=await send("Page.captureScreenshot",{format:"png"});
  fs.writeFileSync(outPng, Buffer.from(shot.data,"base64"));
  console.log("saved", outPng, fs.statSync(outPng).size, "bytes");
  ws.close(); proc.kill();
})();
