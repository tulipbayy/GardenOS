const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const standalone = path.join(__dirname, "_hc.html");
fs.writeFileSync(standalone, fs.readFileSync(path.join(root,"index.html"),"utf8"));
const url = "file:///"+standalone.replace(/\\/g,"/");
const proc = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ["--headless=new","--disable-gpu","--window-size=1100,700","--remote-debugging-port=9241","--no-first-run",url], {stdio:"ignore"});
(async()=>{
  let t=null; for(let i=0;i<60;i++){ try{ const r=await fetch("http://127.0.0.1:9241/json"); const l=await r.json();
    t=l.find(x=>x.type==="page"&&x.webSocketDebuggerUrl); if(t)break;}catch(e){} await new Promise(r=>setTimeout(r,200)); }
  const ws=new WebSocket(t.webSocketDebuggerUrl); let id=0; const pend={}; const errs=[];
  const send=(m,p)=>new Promise(res=>{const i=++id;pend[i]=res;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});
  await new Promise(r=>ws.addEventListener("open",r));
  ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data);
    if(m.method==="Runtime.exceptionThrown")errs.push(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text);
    if(m.id&&pend[m.id]){pend[m.id](m.result);delete pend[m.id];}});
  await send("Page.enable");await send("Runtime.enable");await new Promise(r=>setTimeout(r,900));
  // seed 2 plants that are 170s old (bloom at 180s), reload, open kitchen while still unripe
  await send("Runtime.evaluate",{expression:`(function(){ var t=Date.now()-170000, w=Date.now();
    localStorage.setItem('gardenos_sprout_v1', JSON.stringify({shape:'round',crown:'sprout',color:'#bfe9cf',cheek:'#ff9ecf',name:'Test'}));
    localStorage.setItem('sprite_grove_tour','1');
    localStorage.setItem('bayanos_garden_v2', JSON.stringify([
      {t:t,w:w,type:'rose',x:30,y:20,spread:true},{t:t,w:w,type:'daisy',x:60,y:30,spread:true}])); })()`});
  await send("Page.reload"); await new Promise(r=>setTimeout(r,1200));
  await send("Runtime.evaluate",{expression:`document.getElementById('dntoggle').click(); document.querySelector('[data-open="kitchen"]').click();`});
  await new Promise(r=>setTimeout(r,400));
  const d0=await send("Runtime.evaluate",{expression:`document.getElementById('harvestBtn').disabled`,returnByValue:true});
  console.log("kitchen open at 170s age, harvest disabled:", d0.result.value, "(expect true — not ripe)");
  await new Promise(r=>setTimeout(r,14000));  // plants cross the 180s bloom mark; 3s tick should wake the button
  const d1=await send("Runtime.evaluate",{expression:`JSON.stringify({disabled:document.getElementById('harvestBtn').disabled, label:document.getElementById('harvestBtn').textContent})`,returnByValue:true});
  console.log("after bloom + refresh tick:", d1.result.value, "(expect enabled + '2 ready')");
  console.log("EXCEPTIONS:", errs.length?errs:"none");
  ws.close(); proc.kill();
})();
