const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const standalone = path.join(__dirname, "_wm.html");
fs.writeFileSync(standalone, fs.readFileSync(path.join(root,"index.html"),"utf8"));
const url = "file:///"+standalone.replace(/\\/g,"/");
const proc = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ["--headless=new","--disable-gpu","--window-size=1100,700","--remote-debugging-port=9243","--no-first-run",url], {stdio:"ignore"});
(async()=>{
  let t=null; for(let i=0;i<60;i++){ try{ const r=await fetch("http://127.0.0.1:9243/json"); const l=await r.json();
    t=l.find(x=>x.type==="page"&&x.webSocketDebuggerUrl); if(t)break;}catch(e){} await new Promise(r=>setTimeout(r,200)); }
  const ws=new WebSocket(t.webSocketDebuggerUrl); let id=0; const pend={}; const errs=[];
  const send=(m,p)=>new Promise(res=>{const i=++id;pend[i]=res;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});
  await new Promise(r=>ws.addEventListener("open",r));
  ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data);
    if(m.method==="Runtime.exceptionThrown")errs.push(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text);
    if(m.id&&pend[m.id]){pend[m.id](m.result);delete pend[m.id];}});
  await send("Page.enable");await send("Runtime.enable");await new Promise(r=>setTimeout(r,900));
  const shot=async n=>{ const s=await send("Page.captureScreenshot",{format:"png"}); fs.writeFileSync(path.join(__dirname,n),Buffer.from(s.data,"base64")); };
  // hatch + skip tour + force midday
  await send("Runtime.evaluate",{expression:`(function(){ var h=document.getElementById('cHatch'); if(h) h.click();
    var sk=document.querySelector('#tour-overlay .skip'); if(sk) sk.click();
    document.getElementById('dntoggle').click(); })()`});
  await new Promise(r=>setTimeout(r,400));
  // rain visuals
  await send("Runtime.evaluate",{expression:`window.__weather='rain';`}); await new Promise(r=>setTimeout(r,300)); await shot("weather_rain.png");
  // rainbow visuals
  await send("Runtime.evaluate",{expression:`window.__weather='rainbow';`}); await new Promise(r=>setTimeout(r,300)); await shot("weather_rainbow.png");
  // shooting star at night
  await send("Runtime.evaluate",{expression:`window.__weather='clear'; var b=document.getElementById('dntoggle'); b.click(); b.click(); window.__shootStar=Date.now();`});
  await new Promise(r=>setTimeout(r,400)); await shot("weather_star.png");
  console.log("weather shots saved | EXCEPTIONS:", errs.length?errs:"none");
  // ---- mobile pass ----
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:2,mobile:true});
  await send("Runtime.evaluate",{expression:`localStorage.clear(); location.reload();`});
  await new Promise(r=>setTimeout(r,1500));
  await shot("mobile_creator.png");
  await send("Runtime.evaluate",{expression:`(function(){ var h=document.getElementById('cHatch'); if(h) h.click();
    var sk=document.querySelector('#tour-overlay .skip'); if(sk) sk.click(); })()`});
  await new Promise(r=>setTimeout(r,500)); await shot("mobile_desktop.png");
  await send("Runtime.evaluate",{expression:`document.querySelector('[data-open="buddy"]').click();`});
  await new Promise(r=>setTimeout(r,400)); await shot("mobile_buddy.png");
  const mob=await send("Runtime.evaluate",{expression:`JSON.stringify({vw:window.innerWidth, winW:(document.getElementById('w-buddy').getBoundingClientRect().width|0), overflowX:document.documentElement.scrollWidth>window.innerWidth})`,returnByValue:true});
  console.log("MOBILE:", mob.result.value, "| EXCEPTIONS:", errs.length?errs:"none");
  ws.close(); proc.kill();
})();
