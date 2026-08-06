// Smoke-test GardenOS: load ../index.html headless, exercise it, report errors + a few counts.
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const root = path.resolve(__dirname, "..");
const src = path.join(root, "index.html");
const standalone = path.join(__dirname, "_standalone.html");
fs.writeFileSync(standalone, "<!doctype html><html><head><meta charset='utf-8'></head><body>" + fs.readFileSync(src, "utf8") + "</body></html>");
const url = "file:///" + standalone.replace(/\\/g, "/");
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const proc = spawn(chrome, ["--headless=new","--disable-gpu","--remote-debugging-port=9223","--no-first-run", url], { stdio: "ignore" });
(async () => {
  let target=null;
  for(let i=0;i<60;i++){ try{ const r=await fetch("http://127.0.0.1:9223/json"); const l=await r.json();
    target=l.find(t=>t.type==="page"&&t.webSocketDebuggerUrl); if(target)break; }catch(e){} await new Promise(r=>setTimeout(r,200)); }
  if(!target){ console.log("no target"); proc.kill(); return; }
  const ws=new WebSocket(target.webSocketDebuggerUrl); let id=0; const pend={}; const errs=[];
  const send=(m,p)=>new Promise(res=>{const i=++id;pend[i]=res;ws.send(JSON.stringify({id:i,method:m,params:p||{}}));});
  await new Promise(r=>ws.addEventListener("open",r));
  ws.addEventListener("message",ev=>{ const m=JSON.parse(ev.data);
    if(m.method==="Runtime.exceptionThrown") errs.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
    if(m.id&&pend[m.id]){pend[m.id](m.result);delete pend[m.id];} });
  await send("Runtime.enable"); await send("Page.enable");
  await new Promise(r=>setTimeout(r,1200));
  const expr=`(function(){try{
    document.querySelectorAll('.dicon').forEach(d=>d.click());
    document.getElementById('feedBtn').click();
    var opts=document.querySelectorAll('.type-opt'); opts.forEach(function(o){o.click();document.getElementById('plantBtn').click();});
    document.getElementById('waterBtn').click();
    var fx=document.querySelectorAll('.fairy'); if(fx.length) fx[0].click();
    var cat=document.getElementById('catNap'); if(cat) cat.click();
    document.getElementById('dntoggle').click(); var nf=document.querySelectorAll('.fairy').length; document.getElementById('dntoggle').click();
    document.getElementById('guideBtn').click(); var nb=document.querySelector('#tour-bubble .next'); var st=0;
    while(document.getElementById('tour-overlay').style.display==='block'&&st<15){nb.click();st++;}
    document.querySelector('.house.main').click(); var roomOpen=document.getElementById('w-room').classList.contains('open');
    document.querySelectorAll('.room-obj').forEach(function(o){o.click();});
    var skillsOpen=document.getElementById('w-skills').classList.contains('open');
    var hobbiesOpen=document.getElementById('w-hobbies').classList.contains('open');
    document.querySelector('.turbine').click(); document.getElementById('tower').click();
    return JSON.stringify({title:document.title,start:document.getElementById('start').textContent,
      plants:document.querySelectorAll('#desktop-garden canvas').length, nightFairies:nf,
      bugs:document.querySelectorAll('.bug').length, cottages:document.querySelectorAll('.cottage').length,
      trees:document.querySelectorAll('#trees canvas').length, tourSteps:st,
      roomOpen:roomOpen, skillsOpen:skillsOpen, hobbiesOpen:hobbiesOpen,
      hostBuddy:!!document.getElementById('hostBuddy'), toasts:document.querySelectorAll('.toast').length});
  }catch(e){return 'EXEC_ERROR: '+e.message;}})()`;
  const r=await send("Runtime.evaluate",{expression:expr,returnByValue:true});
  console.log("RESULT:", r.result.value);
  console.log("EXCEPTIONS:", errs.length?errs:"none");
  ws.close(); proc.kill();
})();
