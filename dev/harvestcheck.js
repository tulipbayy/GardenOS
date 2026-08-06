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
  // hatch through creator, force midday, plant 2, open kitchen right away
  await send("Runtime.evaluate",{expression:`(function(){ var h=document.getElementById('cHatch'); if(h) h.click();
    var tb=document.querySelector('#tour-overlay .skip'); if(tb) tb.click();
    document.getElementById('dntoggle').click(); /* auto -> midday */
    document.querySelector('[data-open="buddy"]').click(); var pb=document.getElementById('plantBtn'); pb.click(); pb.click();
    document.querySelector('[data-open="kitchen"]').click(); })()`});
  await new Promise(r=>setTimeout(r,600));
  const d0=await send("Runtime.evaluate",{expression:`document.getElementById('harvestBtn').disabled`,returnByValue:true});
  console.log("right after planting, harvest disabled:", d0.result.value, "(expect true — not ripe)");
  await new Promise(r=>setTimeout(r,24000));  // wait past 20s bloom + 3s refresh tick
  const d1=await send("Runtime.evaluate",{expression:`JSON.stringify({disabled:document.getElementById('harvestBtn').disabled, label:document.getElementById('harvestBtn').textContent})`,returnByValue:true});
  console.log("after 24s with kitchen open:", d1.result.value, "(expect enabled + '2 ready')");
  console.log("EXCEPTIONS:", errs.length?errs:"none");
  ws.close(); proc.kill();
})();
