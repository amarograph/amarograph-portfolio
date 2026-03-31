/* CURSEUR HUD */
const curWrap=document.getElementById('cur-wrap');
const cc=document.getElementById('cur-canvas');
const cx=cc.getContext('2d');
const CX=27,CY=27;
let lx=0,ly=0,angle=0,spd=1,tgt=1;
let hovering=false;
let pageVisible=true;

document.addEventListener('mousemove',e=>{
  curWrap.style.left=e.clientX+'px';
  curWrap.style.top=e.clientY+'px';
  const dx=e.clientX-lx,dy=e.clientY-ly,vel=Math.sqrt(dx*dx+dy*dy);
  const baseSpd=hovering?4:0.8;
  tgt=baseSpd+vel*0.08;lx=e.clientX;ly=e.clientY;
});

const clickableSelector='a,button,select,input,textarea,[onclick],.fb,.sb,.hcta,.fsub,.sc,.pg-photo,.lb-close,.lb-nav,.adm-btn,.adm-tab,.shop-item,.shop-cart-item-remove,label';
document.addEventListener('mouseover',e=>{if(e.target.closest(clickableSelector)){hovering=true;tgt=4.5;}});
document.addEventListener('mouseout',e=>{if(e.target.closest(clickableSelector)){hovering=false;tgt=0.8;}});

/* Pause quand onglet cache */
document.addEventListener('visibilitychange',()=>{pageVisible=!document.hidden;});

function drawHUD(a){
  cx.clearRect(0,0,54,54);
  const B='#00AAFF',R='#CC0020',W='#FFFFFF',G='rgba(255,255,255,0.5)';
  cx.save();cx.translate(CX,CY);cx.rotate(a);
  cx.beginPath();cx.arc(0,0,23,0,Math.PI*2);
  cx.strokeStyle='rgba(0,170,255,0.25)';cx.lineWidth=1;cx.stroke();
  const segs=[
    {start:-0.3,end:0.9,col:B,w:3.5},{start:1.1,end:2.1,col:W,w:2},
    {start:2.3,end:3.3,col:R,w:3.5},{start:3.5,end:4.5,col:W,w:2},
    {start:4.7,end:5.7,col:B,w:3},{start:5.9,end:6.5,col:R,w:2},
  ];
  segs.forEach(s=>{cx.beginPath();cx.arc(0,0,23,s.start,s.end);cx.strokeStyle=s.col;cx.lineWidth=s.w;cx.lineCap='round';cx.stroke();});
  cx.beginPath();cx.arc(0,0,18,0,Math.PI*2);cx.strokeStyle='rgba(255,255,255,0.12)';cx.lineWidth=0.8;cx.stroke();
  [{start:0.2,end:1.4,col:W,w:2},{start:1.6,end:2.6,col:B,w:1.5},
   {start:2.8,end:3.8,col:W,w:2.5},{start:4.0,end:5.0,col:R,w:1.5},{start:5.2,end:6.1,col:W,w:2}
  ].forEach(s=>{cx.beginPath();cx.arc(0,0,18,s.start,s.end);cx.strokeStyle=s.col;cx.lineWidth=s.w;cx.lineCap='round';cx.stroke();});
  [{start:-0.5,end:0.5,col:B,w:1.5},{start:0.8,end:1.8,col:R,w:2},
   {start:2.1,end:3.2,col:W,w:1.5},{start:3.5,end:4.4,col:B,w:2},
   {start:4.7,end:5.5,col:R,w:1.5},{start:5.8,end:6.5,col:W,w:1}
  ].forEach(s=>{cx.beginPath();cx.arc(0,0,13,s.start,s.end);cx.strokeStyle=s.col;cx.lineWidth=s.w;cx.lineCap='round';cx.stroke();});
  for(let i=0;i<16;i++){
    const ta=i*Math.PI*2/16,isMain=i%4===0;
    cx.beginPath();cx.moveTo(Math.cos(ta)*(isMain?20:22),Math.sin(ta)*(isMain?20:22));
    cx.lineTo(Math.cos(ta)*23,Math.sin(ta)*23);
    cx.strokeStyle=isMain?W:G;cx.lineWidth=isMain?1.2:0.5;cx.stroke();
  }
  [[23,0],[0,23],[-23,0],[0,-23]].forEach(([px,py],i)=>{
    cx.save();cx.translate(px,py);cx.rotate(i*Math.PI/2);
    cx.fillStyle=i%2===0?B:R;cx.fillRect(-3,-2.5,6,5);cx.restore();
  });
  cx.restore();cx.save();cx.translate(CX,CY);
  cx.strokeStyle=B;cx.lineWidth=1;
  cx.beginPath();cx.moveTo(-25,0);cx.lineTo(-9,0);cx.stroke();
  cx.beginPath();cx.moveTo(9,0);cx.lineTo(25,0);cx.stroke();
  cx.strokeStyle=R;
  cx.beginPath();cx.moveTo(0,-25);cx.lineTo(0,-9);cx.stroke();
  cx.beginPath();cx.moveTo(0,9);cx.lineTo(0,25);cx.stroke();
  const pulse=0.7+Math.sin(Date.now()*0.004)*0.3;
  cx.beginPath();cx.arc(0,0,2*pulse,0,Math.PI*2);cx.fillStyle=W;cx.fill();
  cx.beginPath();cx.arc(0,0,3*pulse,0,Math.PI*2);cx.strokeStyle='rgba(0,170,255,0.6)';cx.lineWidth=1;cx.stroke();
  cx.restore();
}

/* ══════════════════════════════════
   HEXAGONES BACKGROUND — MEME RENDU, OPTIMISE
   - Canvas fixe viewport (pas toute la page)
   - Hexagones 30fps au lieu de 60fps
   - shadowBlur supprime (tres lourd GPU)
   - Une seule boucle RAF au lieu de 3
══════════════════════════════════ */
const hc=document.getElementById('hexbg');
const hx=hc.getContext('2d');
let W,H,hexes=[];

function resizeNeon(){}
function drawNeonBorder(){}

function resize(){
  W=hc.width=window.innerWidth;
  H=hc.height=window.innerHeight;
  hc.style.position='fixed';
  hc.style.height=H+'px';
  buildHexes();
}
function buildHexes(){
  hexes=[];
  const R=28,gap=5;
  const dx=(R+gap)*Math.sqrt(3),dy=(R+gap)*1.5;
  const cols=Math.ceil(W/dx)+2,rows=Math.ceil(H/dy)+2;
  for(let row=-1;row<rows;row++)for(let col=-1;col<cols;col++){
    const x=col*dx+(row%2)*dx/2,y=row*dy;
    hexes.push({x,y,R,glow:0,rnd:Math.random()*0.06-0.03});
  }
}
function hexP(cx2,cy2,r){
  hx.beginPath();
  for(let i=0;i<6;i++){
    const a=Math.PI/3*i-Math.PI/6;
    i===0?hx.moveTo(cx2+r*Math.cos(a),cy2+r*Math.sin(a)):hx.lineTo(cx2+r*Math.cos(a),cy2+r*Math.sin(a));
  }
  hx.closePath();
}
let mx=-999,my=-999;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});

let hexLastT=0;
function drawHex(t){
  if(t-hexLastT<33)return;
  hexLastT=t;
  hx.clearRect(0,0,W,H);
  const cycleLen=9,wavePos=(t%cycleLen)/cycleLen;
  hexes.forEach(h=>{
    const diag=(h.x+h.y*0.7)/(W+H*0.7)+h.rnd;
    const waveWidth=0.18;
    const dMin=Math.min(Math.abs(diag-wavePos),Math.abs(diag-wavePos+1),Math.abs(diag-wavePos-1));
    const raw=Math.max(0,1-dMin/waveWidth);
    const waveGlow=raw*raw*(3-2*raw)*0.5;
    const dmx=h.x-mx,dmy=h.y-my,distM=Math.sqrt(dmx*dmx+dmy*dmy);
    const mouseRaw=Math.max(0,1-distM/180);
    const boostMouse=mouseRaw*mouseRaw*0.4;
    const targetGlow=Math.min(Math.max(waveGlow,boostMouse),1);
    h.glow+=(targetGlow-h.glow)*0.1;
    const g=h.glow;
    const colorMix=Math.max(0,1-dMin/(waveWidth*1.5));
    const cm=colorMix*colorMix;
    const colR=Math.round(cm*204),colG=Math.round((1-cm)*170*(0.3+g*0.7)),colB=Math.round((1-cm)*255+cm*32);
    hexP(h.x,h.y,h.R);
    hx.fillStyle='rgba(5,7,12,0.5)';hx.fill();
    hx.strokeStyle='rgba('+colR+','+colG+','+colB+','+(0.03+g*0.45)+')';
    hx.lineWidth=0.6+g*1.1;hx.stroke();
    if(g>0.15){hexP(h.x,h.y,h.R);hx.fillStyle='rgba('+colR+','+colG+','+colB+','+(g*g*0.07)+')';hx.fill();}
  });
}

window.addEventListener('resize',()=>{resize();});
resize();

/* ══ BOUCLE UNIQUE ══ */
let lt2=0;
function masterLoop(ts){
  if(!pageVisible){requestAnimationFrame(masterLoop);return;}
  const dt=lt2?(ts-lt2)/1000:0.016;lt2=ts;
  spd+=(tgt-spd)*0.12;
  if(!hovering)tgt+=(0.8-tgt)*0.04;
  angle+=spd*dt;
  drawHUD(angle);
  const t=ts*0.001;
  drawHex(t);
  requestAnimationFrame(masterLoop);
}
requestAnimationFrame(masterLoop);

/* ══════════════════════════════════
   CHAT WIDGET
══════════════════════════════════ */
let chatOpen = false;
let chatSent = false;

function chatToggle() {
  const win = document.getElementById('chat-window');
  chatOpen = !chatOpen;
  win.classList.toggle('open', chatOpen);
  if (chatOpen) {
    document.getElementById('chat-notif').style.display = 'none';
    setTimeout(() => {
      const inp = document.getElementById('chat-pseudo');
      if (inp && !inp.value) inp.focus();
      else {
        const ta = document.getElementById('chat-input');
        if (ta) ta.focus();
      }
    }, 250);
  }
}

function chatAddMsg(text, type) {
  const msgs = document.getElementById('chat-msgs');
  const typing = document.getElementById('chat-typing');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + type;
  div.textContent = text;
  msgs.insertBefore(div, typing);
  msgs.scrollTop = msgs.scrollHeight;
}

function chatShowTyping(show) {
  const t = document.getElementById('chat-typing');
  if (t) t.style.display = show ? 'flex' : 'none';
}

function chatSend() {
  const pseudo = (document.getElementById('chat-pseudo')?.value || '').trim();
  const ta = document.getElementById('chat-input');
  const msg = (ta?.value || '').trim();

  if (!pseudo) {
    document.getElementById('chat-pseudo').focus();
    document.getElementById('chat-pseudo').style.borderColor = 'var(--r)';
    setTimeout(() => { document.getElementById('chat-pseudo').style.borderColor = ''; }, 1500);
    return;
  }
  if (!msg) {
    ta.focus();
    return;
  }
  if (chatSent) {
    chatAddMsg('Message déjà envoyé ! Je te réponds rapidement sur Discord.', 'bot');
    return;
  }

  // Affiche le message de l'utilisateur
  chatAddMsg(msg, 'user');
  ta.value = '';
  ta.style.height = '38px';

  // Animation typing
  chatShowTyping(true);
  document.getElementById('chat-msgs').scrollTop = 999999;

  // Envoi via webhook Discord
  const webhookUrl = 'https://discord.com/api/webhooks/1488328029116563598/GtoFdDdZDtAkQ2KFeBeyIDOfq66misxRs1CnLGyizuJOygZ1Lz_6YNgslh2futQYd_xD';

  if (!webhookUrl) {
    setTimeout(() => {
      chatShowTyping(false);
      chatAddMsg("Configure d'abord un webhook Discord dans le panneau admin !", 'bot');
    }, 800);
    return;
  }

  const page = window.location.pathname.split('/').pop() || 'index.html';

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: '💬 Nouveau message chat — ' + pseudo,
        color: 43775,
        fields: [
          { name: 'Pseudo', value: pseudo, inline: true },
          { name: 'Page', value: page, inline: true },
          { name: 'Message', value: msg }
        ],
        footer: { text: 'Amarograph Chat · ' + new Date().toLocaleString('fr-FR') }
      }]
    })
  })
  .then(r => {
    chatShowTyping(false);
    if (r.ok) {
      chatSent = true;
      chatAddMsg("Message reçu ! Je te réponds rapidement sur Discord 🎮", 'bot');
    } else {
      chatAddMsg("Erreur d'envoi. Essaie le formulaire de contact !", 'bot');
    }
  })
  .catch(() => {
    chatShowTyping(false);
    chatAddMsg("Erreur réseau. Essaie le formulaire de contact !", 'bot');
  });
}

// Enter dans le champ pseudo → focus textarea
document.addEventListener('DOMContentLoaded', () => {
  const pseudo = document.getElementById('chat-pseudo');
  if (pseudo) {
    pseudo.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('chat-input')?.focus();
      }
    });
  }
  // Afficher la bulle avec une légère animation
  const bubble = document.getElementById('chat-bubble');
  if (bubble) {
    setTimeout(() => {
      bubble.style.transform = 'scale(1.08)';
      setTimeout(() => { bubble.style.transform = ''; }, 300);
    }, 2000);
  }
});

/* ══════════════════════════════════
   PAGE CONTACT — CHAT PLEIN ECRAN
══════════════════════════════════ */
let cpSent = false;

function cpAddMsg(text, type) {
  const msgs = document.getElementById('cp-msgs');
  if (!msgs) return;
  const typing = document.getElementById('cp-typing');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + type;
  div.textContent = text;
  msgs.insertBefore(div, typing);
  msgs.scrollTop = msgs.scrollHeight;
}

function cpShowTyping(show) {
  const t = document.getElementById('cp-typing');
  if (t) t.style.display = show ? 'flex' : 'none';
}

function cpSend() {
  const pseudo = (document.getElementById('cp-pseudo')?.value || '').trim();
  const ta = document.getElementById('cp-input');
  const msg = (ta?.value || '').trim();

  if (!pseudo) {
    document.getElementById('cp-pseudo').focus();
    document.getElementById('cp-pseudo').style.borderColor = 'var(--r)';
    setTimeout(() => { document.getElementById('cp-pseudo').style.borderColor = ''; }, 1500);
    return;
  }
  if (!msg) { ta?.focus(); return; }
  if (cpSent) { cpAddMsg('Message déjà envoyé ! Je te réponds rapidement sur Discord 🎮', 'bot'); return; }

  cpAddMsg(msg, 'user');
  ta.value = ''; ta.style.height = '42px';
  cpShowTyping(true);
  document.getElementById('cp-msgs').scrollTop = 999999;

  const webhookUrl = 'https://discord.com/api/webhooks/1488328029116563598/GtoFdDdZDtAkQ2KFeBeyIDOfq66misxRs1CnLGyizuJOygZ1Lz_6YNgslh2futQYd_xD';
  if (!webhookUrl) {
    setTimeout(() => {
      cpShowTyping(false);
      cpAddMsg("Configure d'abord un webhook Discord dans le panneau admin !", 'bot');
    }, 800);
    return;
  }

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: '🎫 Nouveau ticket — ' + pseudo,
        color: 43775,
        fields: [
          { name: 'Pseudo', value: pseudo, inline: true },
          { name: 'Page', value: 'contact.html', inline: true },
          { name: 'Message', value: msg }
        ],
        footer: { text: 'Amarograph Contact • ' + new Date().toLocaleString('fr-FR') }
      }]
    })
  })
  .then(r => {
    cpShowTyping(false);
    if (r.ok) {
      cpSent = true;
      cpAddMsg("Message reçu ! 🚀 Un ticket va être créé. Je te réponds rapidement sur Discord.", 'bot');
    } else {
      cpAddMsg("Erreur d'envoi. Réessaie ou contacte-moi directement sur Discord.", 'bot');
    }
  })
  .catch(() => {
    cpShowTyping(false);
    cpAddMsg("Erreur réseau. Réessaie dans quelques instants.", 'bot');
  });
}

/* Enter pour envoyer dans la page contact */
document.addEventListener('DOMContentLoaded', () => {
  const cpInput = document.getElementById('cp-input');
  if (cpInput) {
    cpInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); cpSend(); }
    });
  }
  const cpPseudo = document.getElementById('cp-pseudo');
  if (cpPseudo) {
    cpPseudo.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); document.getElementById('cp-input')?.focus(); }
    });
  }
});
