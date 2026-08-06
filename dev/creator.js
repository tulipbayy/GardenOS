// Test the Sproutling creator: load fresh, screenshot creator, make choices, hatch, screenshot desktop.
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const standalone = path.join(__dirname, "_creator.html");
fs.writeFileSync(standalone, "<!doctype html><html><head><meta charset='utf-8'></head><body>"+fs.readFileSync(path.join(root,"index.html"),"utf8")+"</body></html>");
const url = "file:///"+standalone.replace(/\\/g,"/");
const proc = spawn("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ["--headless=new","--disable-gpu","--window-size=1000,760","--remote-debugging-port=9229","--no-first-run",url], {stdio:"ignore"});
(async()=>{
  let t=null; for(let i=0;i<60;i++){ try{ const r=await fetch("http://127.0.0.1:9229/json"); const l=await r.json();
    t=l.find(x=>x.type==="page"&&x.webSocketDebuggerUrl); if(t)break;}catch(e){} await new Promise(r=>setTimeout(r,200)); }
  const ws=new WebSocket(t.webSocketDebuggerUrl); let id=0; const pend={}; const errs=[];
  const send=(m,p)=>new Promise(res=>{const i=++id;pend[i]=res;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});
  await new Promise(r=>ws.addEventListener("open",r));
  ws.addEventListener("message",ev=>{const m=JSON.parse(ev.data);
    if(m.method==="Runtime.exceptionThrown") errs.push(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text);
    if(m.id&&pend[m.id]){pend[m.id](m.result);delete pend[m.id];}});
  await send("Page.enable"); await send("Runtime.enable"); await new Promise(r=>setTimeout(r,500));
  await send("Runtime.evaluate",{expression:`try{localStorage.clear()}catch(e){}`});
  await send("Page.reload"); await new Promise(r=>setTimeout(r,1100));
  // make selections in the creator
  var sel=await send("Runtime.evaluate",{expression:`(function(){ if(!document.getElementById('creator')) return 'NO CREATOR';
    document.querySelectorAll('#cShape .opt')[1].click(); document.querySelectorAll('#cCrown .opt')[1].click();
    document.querySelectorAll('#cColor .sw')[5].click(); var i=document.getElementById('cInput'); i.value='Fern'; i.dispatchEvent(new Event('input'));
    return 'creator shown, choices set'; })()`,returnByValue:true});
  console.log("STEP1:", sel.result.value);
  await new Promise(r=>setTimeout(r,250));
  var s1=await send("Page.captureScreenshot",{format:"png"}); fs.writeFileSync(path.join(__dirname,"creator.png"),Buffer.from(s1.data,"base64"));
  // hatch
  var h=await send("Runtime.evaluate",{expression:`(function(){ document.getElementById('cHatch').click();
    return { creatorGone:!document.getElementById('creator'), buddyTitle:(document.querySelector('#w-buddy .ttl')||{}).textContent }; })()`,returnByValue:true});
  console.log("HATCH:", JSON.stringify(h.result.value));
  await new Promise(r=>setTimeout(r,500));
  // open the buddy window to see the rendered sprout
  await send("Runtime.evaluate",{expression:`var sk=document.querySelector('.tbtn.skip'); if(sk) sk.click(); var b=document.querySelector('[data-open="buddy"]'); if(b) b.click();`});
  await new Promise(r=>setTimeout(r,400));
  // exercise care: feed + play a couple times, then read stats
  var st=await send("Runtime.evaluate",{expression:`(function(){ document.getElementById('feedBtn').click(); document.getElementById('playBtn').click(); document.getElementById('restBtn').click();
    var p=JSON.parse(localStorage.getItem('gardenos_pet_v1')); return 'hunger='+Math.round(p.hunger)+' happy='+Math.round(p.happy)+' energy='+Math.round(p.energy); })()`,returnByValue:true});
  console.log("PET after care:", st.result.value);
  await new Promise(r=>setTimeout(r,300));
  var s2=await send("Page.captureScreenshot",{format:"png"}); fs.writeFileSync(path.join(__dirname,"desktop.png"),Buffer.from(s2.data,"base64"));
  console.log("EXCEPTIONS:", errs.length?errs:"none");
  ws.close(); proc.kill();
})();
