const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const standalone = path.join(__dirname, "_rc.html");
fs.writeFileSync(standalone, fs.readFileSync(path.join(root,"index.html"),"utf8"));
const url = "file:///"+standalone.replace(/\\/g,"/");
const proc = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ["--headless=new","--disable-gpu","--window-size=1100,700","--remote-debugging-port=9242","--no-first-run",url], {stdio:"ignore"});
(async()=>{
  let t=null; for(let i=0;i<60;i++){ try{ const r=await fetch("http://127.0.0.1:9242/json"); const l=await r.json();
    t=l.find(x=>x.type==="page"&&x.webSocketDebuggerUrl); if(t)break;}catch(e){} await new Promise(r=>setTimeout(r,200)); }
  const ws=new WebSocket(t.webSocketDebuggerUrl); let id=0; const pend={}; const errs=[];
  const send=(m,p)=>new Promise(res=>{const i=++id;pend[i]=res;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});
  await new Promise(r=>ws.addEventListener("open",r));
  ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data);
    if(m.method==="Runtime.exceptionThrown")errs.push(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text);
    if(m.id&&pend[m.id]){pend[m.id](m.result);delete pend[m.id];}});
  await send("Page.enable");await send("Runtime.enable");await new Promise(r=>setTimeout(r,900));
  // seed a bloomed shroom cluster + a sprout config, then reload so the world boots with them
  await send("Runtime.evaluate",{expression:`(function(){ var old=Date.now()-200000, w=Date.now();
    localStorage.setItem('gardenos_sprout_v1', JSON.stringify({shape:'round',crown:'sprout',color:'#bfe9cf',cheek:'#ff9ecf',name:'Test'}));
    localStorage.setItem('sprite_grove_tour','1');
    localStorage.setItem('bayanos_garden_v2', JSON.stringify([
      {t:old,w:w,type:'mush',x:40,y:20,spread:true},{t:old,w:w,type:'mush',x:44,y:30,spread:true},{t:old,w:w,type:'mush',x:48,y:25,spread:true}])); })()`});
  await send("Page.reload"); await new Promise(r=>setTimeout(r,2500));
  const r1=await send("Runtime.evaluate",{expression:`(function(){ var r=document.querySelector('.fairy-ring');
    return JSON.stringify({ringExists:!!r, dots:r?r.children.length:0}); })()`,returnByValue:true});
  console.log("RING:", r1.result.value, "| EXCEPTIONS:", errs.length?errs:"none");
  const s=await send("Page.captureScreenshot",{format:"png"}); fs.writeFileSync(path.join(__dirname,"ring.png"),Buffer.from(s.data,"base64"));
  ws.close(); proc.kill();
})();
