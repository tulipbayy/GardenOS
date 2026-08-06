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
  // walk the guided tour end-to-end (7 steps)
  var tour=await send("Runtime.evaluate",{expression:`(function(){ try{ var o=document.getElementById('tour-overlay');
    document.getElementById('guideBtn').click();
    var steps=[], guard=0; while(o.style.display==='block' && guard<12){ steps.push(document.querySelector('#tour-bubble .tt').textContent);
      document.querySelector('#tour-bubble .next').click(); guard++; }
    return JSON.stringify({steps:steps, closed:o.style.display!=='block'}); }catch(e){ return 'ERR:'+e.message; } })()`,returnByValue:true});
  console.log("TOUR:", tour.result.value);
  // --- Kitchen test: plant, backdate to bloom, reload, harvest, feed ---
  await send("Runtime.evaluate",{expression:`(function(){ document.getElementById('dntoggle').click(); /* auto -> midday */
    document.querySelector('[data-open="buddy"]').click(); var pb=document.getElementById('plantBtn'); for(var i=0;i<5;i++) pb.click();
    var g=JSON.parse(localStorage.getItem('bayanos_garden_v2')||'[]'); var old=Date.now()-200000; g.forEach(function(p){ p.t=old; }); localStorage.setItem('bayanos_garden_v2', JSON.stringify(g)); return 'planted '+g.length; })()`,returnByValue:true}).then(r=>console.log("SEED:",r.result.value));
  await send("Page.reload"); await new Promise(r=>setTimeout(r,1300));
  var kit=await send("Runtime.evaluate",{expression:`(function(){ document.getElementById('dntoggle').click(); /* auto -> midday */
    document.querySelector('[data-open="kitchen"]').click(); var h=document.getElementById('harvestBtn'); var ready=h.textContent; h.click();
    var food=JSON.parse(localStorage.getItem('gardenos_food_v1')||'{}'); var f=document.querySelector('#pantry button'); var fed=!!f; if(f) f.click();
    return JSON.stringify({harvestBtn:ready, pantryTypes:Object.keys(food).length, fed:fed, msg:document.getElementById('kitMsg').textContent}); })()`,returnByValue:true});
  console.log("KITCHEN:", kit.result.value);
  // Shop test: coins from harvest, buy a crown (open, wait for observer, then buy)
  await send("Runtime.evaluate",{expression:`document.querySelector('[data-open="shop"]').click();`});
  await new Promise(r=>setTimeout(r,350));
  var shop=await send("Runtime.evaluate",{expression:`(function(){ var w=JSON.parse(localStorage.getItem('gardenos_wallet_v1')||'{}');
    var before=w.coins; var items=document.querySelectorAll('.shoprow button'); var msg1='', msg2='';
    if(items.length){ items[0].click(); msg1=document.getElementById('shopMsg').textContent; }   // star (15) — expect refusal w/ 10
    items=document.querySelectorAll('.shoprow button');
    if(items.length>4){ items[4].click(); msg2=document.getElementById('shopMsg').textContent; } // mossy stone (10) — expect placed
    var w2=JSON.parse(localStorage.getItem('gardenos_wallet_v1')||'{}');
    var decorOnDesk=document.querySelectorAll('#desktop-garden canvas.decor').length;
    return JSON.stringify({coinsAfterHarvest:before, crownRow:document.querySelectorAll('#shopCrowns button').length, decorRow:document.querySelectorAll('#shopDecor button').length, starMsg:msg1, stoneMsg:msg2, coinsNow:w2.coins, decor:w2.decor, gardenDecor:decorOnDesk}); })()`,returnByValue:true});
  console.log("SHOP:", shop.result.value);
  // drag the placed decor to a new spot and confirm it persists
  var drag=await send("Runtime.evaluate",{expression:`(function(){ var dc=document.querySelector('#desktop-garden canvas.decor'); if(!dc) return 'NO DECOR';
    var r=dc.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
    dc.dispatchEvent(new PointerEvent('pointerdown',{clientX:cx,clientY:cy,bubbles:true,pointerId:1}));
    dc.dispatchEvent(new PointerEvent('pointermove',{clientX:window.innerWidth*0.25,clientY:window.innerHeight-80,bubbles:true,pointerId:1}));
    dc.dispatchEvent(new PointerEvent('pointerup',{clientX:window.innerWidth*0.25,clientY:window.innerHeight-80,bubbles:true,pointerId:1}));
    var w3=JSON.parse(localStorage.getItem('gardenos_wallet_v1')||'{}');
    return JSON.stringify({movedTo:{x:Math.round(w3.decor[0].x), y:Math.round(w3.decor[0].y)}}); })()`,returnByValue:true});
  console.log("DECOR-DRAG:", drag.result.value);
  var ss=await send("Page.captureScreenshot",{format:"png"}); fs.writeFileSync(path.join(__dirname,"shop.png"),Buffer.from(ss.data,"base64"));
  await new Promise(r=>setTimeout(r,300));
  var sk=await send("Page.captureScreenshot",{format:"png"}); fs.writeFileSync(path.join(__dirname,"kitchen.png"),Buffer.from(sk.data,"base64"));
  // open Playground + start a round
  await send("Runtime.evaluate",{expression:`var p=document.querySelector('[data-open="play"]'); if(p) p.click(); var s=document.getElementById('playStart'); if(s) s.click();`});
  await new Promise(r=>setTimeout(r,1400));
  await send("Runtime.evaluate",{expression:`'play open='+document.getElementById('w-play').classList.contains('open')+', bubbles drawn'`,returnByValue:true}).then(r=>console.log("PLAY:",r.result.value));
  var sp=await send("Page.captureScreenshot",{format:"png"}); fs.writeFileSync(path.join(__dirname,"playground.png"),Buffer.from(sp.data,"base64"));
  // Nap Nook: tuck in, watch energy rise
  var e0=(await send("Runtime.evaluate",{expression:`JSON.parse(localStorage.getItem('gardenos_pet_v1')||'{}').energy`,returnByValue:true})).result.value;
  await send("Runtime.evaluate",{expression:`var n=document.querySelector('[data-open="nap"]'); if(n) n.click(); var b=document.getElementById('napBtn'); if(b) b.click();`});
  await new Promise(r=>setTimeout(r,2200));
  var e1=(await send("Runtime.evaluate",{expression:`JSON.parse(localStorage.getItem('gardenos_pet_v1')||'{}').energy`,returnByValue:true})).result.value;
  console.log("NAP: energy", e0, "→", e1, "| msg:", (await send("Runtime.evaluate",{expression:`document.getElementById('napMsg').textContent`,returnByValue:true})).result.value);
  var sn=await send("Page.captureScreenshot",{format:"png"}); fs.writeFileSync(path.join(__dirname,"nap.png"),Buffer.from(sn.data,"base64"));
  await send("Runtime.evaluate",{expression:`document.querySelectorAll('.win').forEach(function(w){ if(w.classList.contains('open')){ var x=w.querySelector('.x'); if(x) x.click(); } });`});
  await new Promise(r=>setTimeout(r,500));
  var s2=await send("Page.captureScreenshot",{format:"png"}); fs.writeFileSync(path.join(__dirname,"desktop.png"),Buffer.from(s2.data,"base64"));
  console.log("default scene:", (await send("Runtime.evaluate",{expression:`document.documentElement.getAttribute('data-scene')`,returnByValue:true})).result.value);
  await send("Runtime.evaluate",{expression:`var b=document.getElementById('dntoggle'); b.click(); b.click(); b.click();`});
  await new Promise(r=>setTimeout(r,500));
  console.log("after 3 clicks:", (await send("Runtime.evaluate",{expression:`document.documentElement.getAttribute('data-scene')`,returnByValue:true})).result.value);
  var s3=await send("Page.captureScreenshot",{format:"png"}); fs.writeFileSync(path.join(__dirname,"desktop_night.png"),Buffer.from(s3.data,"base64"));
  // night consistency: nap nook must agree the pet is asleep, messages use the pet's name
  var nc=await send("Runtime.evaluate",{expression:`(function(){ document.querySelector('[data-open="buddy"]').click(); document.querySelector('[data-open="nap"]').click();
    return JSON.stringify({ mood:document.getElementById('mood').textContent, napDisabled:document.getElementById('napBtn').disabled, napMsg:document.getElementById('napMsg').textContent }); })()`,returnByValue:true});
  console.log("NIGHT-CONSISTENCY:", nc.result.value);
  console.log("EXCEPTIONS:", errs.length?errs:"none");
  ws.close(); proc.kill();
})();
