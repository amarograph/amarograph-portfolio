/* CURSEUR */
const curWrap=document.getElementById('cur-wrap');
const cc=document.getElementById('cur-canvas');
const cx=cc.getContext('2d');
const CX=27,CY=27;
let lx=0,ly=0,angle=0,spd=1,tgt=1,lt=0;

document.addEventListener('mousemove',e=>{
  curWrap.style.left=e.clientX+'px';
  curWrap.style.top=e.clientY+'px';
  const dx=e.clientX-lx,dy=e.clientY-ly,vel=Math.sqrt(dx*dx+dy*dy);
  tgt=0.8+vel*0.08;lx=e.clientX;ly=e.clientY;
});

function drawHUD(a){
  cx.clearRect(0,0,54,54);
  const B='#00AAFF',R='#CC0020',W='#FFFFFF',G='rgba(255,255,255,0.5)';

  cx.save();cx.translate(CX,CY);cx.rotate(a);

  // ── outer ring base ──
  cx.beginPath();cx.arc(0,0,23,0,Math.PI*2);
  cx.strokeStyle='rgba(0,170,255,0.25)';cx.lineWidth=1;cx.stroke();

  // ── ARC SEGMENTS outer (séparés par des gaps) ──
  const segs=[
    {start:-0.3, end:0.9,  col:B, w:3.5},
    {start:1.1,  end:2.1,  col:W, w:2},
    {start:2.3,  end:3.3,  col:R, w:3.5},
    {start:3.5,  end:4.5,  col:W, w:2},
    {start:4.7,  end:5.7,  col:B, w:3},
    {start:5.9,  end:6.5,  col:R, w:2},
  ];
  segs.forEach(s=>{
    cx.beginPath();cx.arc(0,0,23,s.start,s.end);
    cx.strokeStyle=s.col;cx.lineWidth=s.w;
    cx.lineCap='round';cx.stroke();
  });

  // ── middle ring ──
  cx.beginPath();cx.arc(0,0,18,0,Math.PI*2);
  cx.strokeStyle='rgba(255,255,255,0.12)';cx.lineWidth=0.8;cx.stroke();

  // mid arc segments
  const msegs=[
    {start:0.2,  end:1.4,  col:W, w:2},
    {start:1.6,  end:2.6,  col:B, w:1.5},
    {start:2.8,  end:3.8,  col:W, w:2.5},
    {start:4.0,  end:5.0,  col:R, w:1.5},
    {start:5.2,  end:6.1,  col:W, w:2},
  ];
  msegs.forEach(s=>{
    cx.beginPath();cx.arc(0,0,18,s.start,s.end);
    cx.strokeStyle=s.col;cx.lineWidth=s.w;
    cx.lineCap='round';cx.stroke();
  });

  // ── inner ring ──
  const isegs=[
    {start:-0.5, end:0.5,  col:B, w:1.5},
    {start:0.8,  end:1.8,  col:R, w:2},
    {start:2.1,  end:3.2,  col:W, w:1.5},
    {start:3.5,  end:4.4,  col:B, w:2},
    {start:4.7,  end:5.5,  col:R, w:1.5},
    {start:5.8,  end:6.5,  col:W, w:1},
  ];
  isegs.forEach(s=>{
    cx.beginPath();cx.arc(0,0,13,s.start,s.end);
    cx.strokeStyle=s.col;cx.lineWidth=s.w;
    cx.lineCap='round';cx.stroke();
  });

  // ── tick marks sur outer ring ──
  for(let i=0;i<24;i++){
    const ta=i*Math.PI*2/24;
    const isMain=i%4===0;
    const r1=isMain?20:22,r2=isMain?23:22;
    cx.beginPath();
    cx.moveTo(Math.cos(ta)*r1,Math.sin(ta)*r1);
    cx.lineTo(Math.cos(ta)*r2,Math.sin(ta)*r2);
    cx.strokeStyle=isMain?W:G;
    cx.lineWidth=isMain?1.2:0.6;
    cx.stroke();
  }

  // ── petits rectangles décoratifs ──
  [[23,0],[0,23],[-23,0],[0,-23]].forEach(([px,py],i)=>{
    cx.save();cx.translate(px,py);cx.rotate(i*Math.PI/2);
    cx.fillStyle=i%2===0?B:R;
    cx.fillRect(-3,-2.5,6,5);
    cx.restore();
  });

  // ── crosshair lines fixes (contre-rotation) ──
  cx.restore();
  cx.save();cx.translate(CX,CY);

  cx.strokeStyle=B;cx.lineWidth=1;
  cx.beginPath();cx.moveTo(-25,0);cx.lineTo(-9,0);cx.stroke();
  cx.beginPath();cx.moveTo(9,0);cx.lineTo(25,0);cx.stroke();
  cx.strokeStyle=R;
  cx.beginPath();cx.moveTo(0,-25);cx.lineTo(0,-9);cx.stroke();
  cx.beginPath();cx.moveTo(0,9);cx.lineTo(0,25);cx.stroke();

  // ── dot central pulsant ──
  const pulse=0.7+Math.sin(Date.now()*0.004)*0.3;
  cx.beginPath();cx.arc(0,0,2*pulse,0,Math.PI*2);
  cx.fillStyle=W;cx.fill();
  cx.beginPath();cx.arc(0,0,3*pulse,0,Math.PI*2);
  cx.strokeStyle='rgba(0,170,255,0.6)';cx.lineWidth=1;cx.stroke();

  cx.restore();
}

(function aR(ts){
  const dt=lt?(ts-lt)/1000:0.016;lt=ts;
  spd+=(tgt-spd)*0.1;tgt+=(0.8-tgt)*0.04;
  angle+=spd*dt;
  drawHUD(angle);
  requestAnimationFrame(aR);
})(0);
/* ══════════════════════════════════
   HEXAGONE BACKGROUND — VAGUE NEON BLEU↔ROUGE
══════════════════════════════════ */
const hc=document.getElementById('hexbg');
const hx=hc.getContext('2d');
let W,H,hexes=[];

// Neon border canvas désactivé
function resizeNeon(){}
function drawNeonBorder(){}

/* ── HEXAGONES ── */
function resize(){
  W=hc.width=window.innerWidth;
  H=hc.height=Math.max(document.body.scrollHeight,window.innerHeight);
  hc.style.height=H+'px';buildHexes();
}
function buildHexes(){
  hexes=[];
  const R=24,dx=R*Math.sqrt(3),dy=R*1.5;
  const cols=Math.ceil(W/dx)+3,rows=Math.ceil(H/dy)+3;
  for(let row=-1;row<rows;row++)for(let col=-1;col<cols;col++){
    const x=col*dx+(row%2)*dx/2,y=row*dy;
    hexes.push({x,y,R,
      ph:Math.random()*Math.PI*2,
      sp:.15+Math.random()*.3,
      ba:.018+Math.random()*.025});
  }
}
function hexP(cx,cy,r){
  hx.beginPath();
  for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;i===0?hx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):hx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a))}
  hx.closePath();
}
let mx=-999,my=-999;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY+window.scrollY});

function drawHex(t){
  hx.clearRect(0,0,W,H);
  const scrollY=window.scrollY;

  // Vague néon diagonale qui balaye l'écran
  // La vague se déplace en diagonale, créant un dégradé bleu→rouge
  const waveSpeed=0.12;
  const wavePos=t*waveSpeed;

  hexes.forEach(h=>{
    const pulse=h.ba+Math.sin(t*h.sp+h.ph)*.015;

    // Boost souris
    const dmx=h.x-mx,dmy=h.y-my,distM=Math.sqrt(dmx*dmx+dmy*dmy);
    const boostMouse=distM<200?.3*(1-distM/200):0;

    // Vague néon — position normalisée de l'hexagone sur la diagonale
    const diag=(h.x/W+h.y/H)*0.5; // 0 à 1 en diagonale
    const wavePhase=(diag-wavePos)%1;
    // Intensité de la vague (pic lumineux qui passe)
    const waveDist=Math.abs(((wavePhase%1)+1)%1-0.5)*2; // 0 au centre, 1 aux bords
    const waveGlow=Math.pow(Math.max(0,1-waveDist*3),2)*0.45;

    const boost=Math.max(boostMouse,waveGlow);
    const a=Math.min(pulse+boost,.7);

    // Couleur dégradé bleu↔rouge basé sur la position diagonale + temps
    const colorPhase=((diag+t*0.05)%1+1)%1;
    const sinP=Math.sin(colorPhase*Math.PI);
    const colR=Math.round(sinP*204);
    const colG=Math.round((1-sinP)*170);
    const colB=Math.round(255-(255-32)*sinP);

    hexP(h.x,h.y,h.R);

    // Contour
    hx.strokeStyle=`rgba(${colR},${colG},${colB},${Math.min(a+.04,.8)})`;
    hx.lineWidth=waveGlow>0.1?1.3:.7;
    hx.stroke();

    // Remplissage lumineux
    if(boost>.06||Math.sin(t*h.sp+h.ph)>.85){
      const fillA=waveGlow>0.05?Math.min(waveGlow*.6,.3):Math.min(a*.25,.08);
      hx.fillStyle=`rgba(${colR},${colG},${colB},${fillA})`;
      hx.fill();
    }
  });
}

/* SIDE FLASH */
const flc=document.getElementById('fl'),flx2=flc.getContext('2d');
const frc=document.getElementById('fr'),frx2=frc.getContext('2d');
let SH=window.innerHeight;
function resizeFlash(){SH=window.innerHeight;flc.height=frc.height=SH;flc.style.height=frc.style.height=SH+'px';}
window.addEventListener('resize',resizeFlash);resizeFlash();
const beams=[
  {side:'l',col:'0,170,255',y:.12,h:.1,sp:.16,ph:0,w:60},{side:'l',col:'204,0,32',y:.38,h:.16,sp:.10,ph:1.9,w:42},
  {side:'l',col:'0,170,255',y:.65,h:.08,sp:.20,ph:3.5,w:70},{side:'l',col:'204,0,32',y:.88,h:.13,sp:.13,ph:5.2,w:38},
  {side:'r',col:'204,0,32',y:.07,h:.1,sp:.18,ph:.8,w:65},{side:'r',col:'0,170,255',y:.32,h:.15,sp:.12,ph:2.7,w:48},
  {side:'r',col:'204,0,32',y:.60,h:.09,sp:.22,ph:4.3,w:58},{side:'r',col:'0,170,255',y:.80,h:.14,sp:.15,ph:6.1,w:40},
];
function drawFlash(ctx,side,t){
  ctx.clearRect(0,0,110,SH);
  beams.filter(b=>b.side===side).forEach(b=>{
    const raw=(Math.sin(t*b.sp+b.ph)+1)/2,a=raw*raw;if(a<.015)return;
    const cy=b.y*SH,bh=b.h*SH,x0=side==='l'?0:110,bx=side==='l'?0:110-b.w;
    const g=ctx.createLinearGradient(x0,0,side==='l'?b.w:110-b.w,0);
    g.addColorStop(0,`rgba(${b.col},${Math.min(a*.55,.55)})`);g.addColorStop(1,`rgba(${b.col},0)`);
    ctx.save();ctx.globalCompositeOperation='screen';ctx.fillStyle=g;ctx.fillRect(bx,cy-bh/2,b.w,bh);
    ctx.strokeStyle=`rgba(${b.col},${Math.min(a*.9,.9)})`;ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(x0,cy-bh/2);ctx.lineTo(x0,cy+bh/2);ctx.stroke();ctx.restore();
  });
}

window.addEventListener('resize',()=>{resize();resizeFlash();resizeNeon();});
resize();
function loop(ts){
  const t=ts*.001;
  drawNeonBorder(t);
  drawHex(t);
  drawFlash(flx2,'l',t);
  drawFlash(frx2,'r',t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function fc(cat,btn){document.querySelectorAll('.fb').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('.pc').forEach(c=>{c.style.display=(cat==='all'||c.dataset.cat===cat)?'':'none';});}
/* fs() defini plus bas — formulaire Discord webhook */

/* ══════════════════════════════════
   ADMIN SYSTEM
══════════════════════════════════ */
const ADM_PWD = 'Amarograph2025!';
const STORE_KEY = 'amaro_data';

function admGetData(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY))||{photos:[],texts:{},services:[]}; }
  catch(e){ return {photos:[],texts:{},services:[]}; }
}
function admSetData(d){ localStorage.setItem(STORE_KEY, JSON.stringify(d)); }

function admOpen(){ document.getElementById('admin-login').classList.add('open'); document.getElementById('adm-pwd').focus(); }
function admClose(){ document.getElementById('admin-login').classList.remove('open'); document.getElementById('adm-pwd').value=''; document.getElementById('adm-err').style.display='none'; }
function admLogout(){ document.getElementById('admin-panel').classList.remove('open'); }

function admLogin(){
  const pwd = document.getElementById('adm-pwd').value;
  if(pwd === ADM_PWD){
    admClose();
    admOpenPanel();
  } else {
    document.getElementById('adm-err').style.display='block';
    document.getElementById('adm-pwd').value='';
  }
}

function admTab(name, el){
  document.querySelectorAll('.adm-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.adm-tab-content').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('atab-'+name).classList.add('active');
}

function toast(msg='Sauvegardé !'){
  const t=document.getElementById('adm-toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}

/* ── PHOTOS ── */
function admRenderPhotos(){
  const d=admGetData();
  const grid=document.getElementById('adm-photos-grid');
  grid.innerHTML='';
  d.photos.forEach((p,i)=>{
    const div=document.createElement('div');
    div.className='adm-photo-item';
    div.innerHTML=`<img src="${p.src}" alt="${p.name}">
      <button class="adm-photo-del" onclick="admDelPhoto(${i})" title="Supprimer">✕</button>
      <div class="adm-photo-info">
        <input value="${p.cat}" placeholder="Catégorie" onchange="admEditPhotoField(${i},'cat',this.value)">
        <input value="${p.name}" placeholder="Nom" onchange="admEditPhotoField(${i},'name',this.value)">
        <input value="${p.desc}" placeholder="Description" onchange="admEditPhotoField(${i},'desc',this.value)">
      </div>`;
    grid.appendChild(div);
  });
  renderPublicPortfolio();
}

function admAddPhoto(){
  const file=document.getElementById('adm-file-new').files[0];
  if(!file)return;
  const cat=document.getElementById('adm-cat-new').value;
  const name=document.getElementById('adm-name-new').value||'Création';
  const desc=document.getElementById('adm-desc-new').value||'';
  const reader=new FileReader();
  reader.onload=e=>{
    applyWatermark(e.target.result, (watermarked) => {
      const d=admGetData();
      d.photos.push({src:watermarked,cat,name,desc});
      admSetData(d);
      admRenderPhotos();
      document.getElementById('adm-file-new').value='';
      document.getElementById('adm-name-new').value='';
      document.getElementById('adm-desc-new').value='';
      toast('Photo ajoutée avec watermark !');
    });
  };
  reader.readAsDataURL(file);
}

function admDelPhoto(i){
  if(!confirm('Supprimer cette photo ?'))return;
  const d=admGetData();
  d.photos.splice(i,1);
  admSetData(d);
  admRenderPhotos();
  toast('Photo supprimée');
}

function admEditPhotoField(i,field,val){
  const d=admGetData();
  d.photos[i][field]=val;
  admSetData(d);
  renderPublicPortfolio();
}

/* ── PUBLIC PORTFOLIO ── */
function renderPublicPortfolio(cat='all'){
  const d=admGetData();
  const grid=document.getElementById('portfolio-grid');
  const empty=document.getElementById('port-empty');
  const photos=cat==='all'?d.photos:d.photos.filter(p=>p.cat===cat);
  grid.innerHTML='';
  if(photos.length===0){
    const em=document.createElement('div');
    em.className='pg-empty';
    em.id='port-empty';
    em.textContent='Aucune création pour l\'instant — revenez bientôt !';
    grid.appendChild(em);
    return;
  }
  // Trouver l'index reel dans d.photos pour la lightbox
  const allPhotos = d.photos;
  photos.forEach((p,i)=>{
    const realIdx = allPhotos.indexOf(p);
    const div=document.createElement('div');
    div.className='pg-photo';
    div.style.aspectRatio='4/3';
    div.onclick = () => lbOpen(realIdx);
    div.innerHTML=`<img src="${p.src}" alt="${p.name}" loading="lazy">
      <div class="pg-photo-ov">
        <p class="pg-photo-cat" style="color:var(--b)">${p.cat}</p>
        <p class="pg-photo-name">${p.name}</p>
        ${p.desc?`<p style="font-family:'Quantum',sans-serif;font-size:.78rem;color:var(--muted);margin-top:.4rem">${p.desc}</p>`:''}
      </div>`;
    grid.appendChild(div);
    // Ajouter reveal pour les nouvelles photos
    div.classList.add('reveal','reveal-d'+((i%4)+1));
    revealObs.observe(div);
  });
}

function pfFilter(cat, btn){
  document.querySelectorAll('.fb').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderPublicPortfolio(cat);
}

/* ── TEXTES ── */
function liveEdit(id,val){
  const el=document.getElementById(id);
  if(el)el.textContent=val;
}
function liveEditArc(id,val){
  const el=document.getElementById(id);
  if(!el)return;
  // Préserver le <span> pour le dégradé si présent
  if(id==='txt-about-title'){
    el.innerHTML=val+' <span>?</span>';
  } else {
    el.textContent=val;
  }
}
function liveEditP(id,val){
  const el=document.getElementById(id);
  if(el)el.innerHTML=val;
}

function admLoadTexts(){
  const d=admGetData();
  const t=d.texts||{};
  const fields={
    'edit-eyebrow':'txt-eyebrow',
    'edit-hero-title':'txt-hero-title',
    'edit-hero-sub':'txt-hero-sub',
    'edit-about-title':'txt-about-title',
    'edit-contact-title':'txt-contact-title',
  };
  Object.entries(fields).forEach(([inp,out])=>{
    const el=document.getElementById(out);
    const inEl=document.getElementById(inp);
    if(inEl&&el) inEl.value=t[out]||el.textContent.trim();
  });
  // paragraphes about
  ['about-p1','about-p2','about-p3'].forEach((id,i)=>{
    const ps=document.querySelectorAll('.at p');
    const inEl=document.getElementById('edit-'+id);
    if(inEl&&ps[i]){
      ps[i].id=id;
      inEl.value=t[id]||ps[i].innerHTML.trim();
    }
  });
  // contact sub
  const csub=document.querySelector('#cbg p[style]');
  if(csub){ csub.id='txt-contact-sub'; const inEl=document.getElementById('edit-contact-sub'); if(inEl) inEl.value=t['txt-contact-sub']||csub.textContent.trim(); }
}

function admSaveTexts(){
  const d=admGetData();
  const t={};
  ['eyebrow','hero-title','hero-sub','about-title','contact-title','contact-sub'].forEach(k=>{
    const el=document.getElementById('edit-'+k);
    if(el) t['txt-'+k]=el.value;
  });
  ['about-p1','about-p2','about-p3'].forEach(id=>{
    const el=document.getElementById('edit-'+id);
    if(el) t[id]=el.value;
  });
  d.texts=t;
  admSetData(d);
  toast('Textes sauvegardés !');
}

/* ── SERVICES ── */
const DEFAULT_SERVICES=[
  {icon:'hex-b',name:'Vêtements FiveM',desc:'Création de tenues personnalisées — uniformes, civils, faction, EUP.',tags:['EUP','YTD','Addon'],color:'b'},
  {icon:'hex-r',name:'Retexturation Mapping',desc:'Retexture complète de bâtiments, intérieurs et environnements.',tags:['YMAP','YTD','MLO'],color:'r'},
  {icon:'hex-b',name:'Livery Véhicule',desc:'Livrées sur mesure pour véhicules FiveM — police, SAMU, pompiers.',tags:['DDS','YTD','4K'],color:'b'},
  {icon:'hex-r',name:'Design Graphique',desc:'Logos, bannières, overlays stream, identité visuelle Discord.',tags:['Logo','Bannière','UI'],color:'r'},
];

function admLoadServices(){
  const d=admGetData();
  const svcs=d.services&&d.services.length?d.services:DEFAULT_SERVICES;
  const list=document.getElementById('adm-services-list');
  list.innerHTML='';
  svcs.forEach((s,i)=>{
    const div=document.createElement('div');
    div.className='adm-section';
    div.innerHTML=`<div class="adm-label">Service ${i+1}</div>
      <label class="adm-label">Nom</label>
      <input class="adm-input" id="svc-name-${i}" value="${s.name}">
      <label class="adm-label">Description</label>
      <textarea class="adm-input" id="svc-desc-${i}" rows="2" style="resize:vertical">${s.desc}</textarea>
      <label class="adm-label">Tags (séparés par virgule)</label>
      <input class="adm-input" id="svc-tags-${i}" value="${s.tags.join(',')}">`;
    list.appendChild(div);
  });
}

function admSaveServices(){
  const d=admGetData();
  const svcs=d.services&&d.services.length?d.services:[...DEFAULT_SERVICES];
  svcs.forEach((s,i)=>{
    const n=document.getElementById('svc-name-'+i);
    const de=document.getElementById('svc-desc-'+i);
    const tg=document.getElementById('svc-tags-'+i);
    if(n)s.name=n.value;
    if(de)s.desc=de.value;
    if(tg)s.tags=tg.value.split(',').map(t=>t.trim());
  });
  d.services=svcs;
  admSetData(d);
  renderPublicServices();
  toast('Services sauvegardés !');
}

function renderPublicServices(){
  const d=admGetData();
  const svcs=d.services&&d.services.length?d.services:DEFAULT_SERVICES;
  const snames=document.querySelectorAll('.sn');
  const sdescs=document.querySelectorAll('.sd');
  const stagDivs=document.querySelectorAll('.stags');
  svcs.forEach((s,i)=>{
    if(snames[i])snames[i].textContent=s.name;
    if(sdescs[i])sdescs[i].textContent=s.desc;
    if(stagDivs[i]){
      stagDivs[i].innerHTML=s.tags.map(t=>`<span class="st${s.color||'b'}">${t}</span>`).join('');
    }
  });
}

/* ── INIT ── */
function admOpenPanel(){
  document.getElementById('admin-panel').classList.add('open');
  admTab('photos',document.querySelector('.adm-tab'));
  admRenderPhotos();
  admLoadTexts();
  admLoadServices();
  admLoadParams();
}

function admLoadParams(){
  const d=admGetData();
  const el=document.getElementById('adm-webhook');
  if(el) el.value=d.webhook||'';
}

function admSaveWebhook(){
  const d=admGetData();
  d.webhook=document.getElementById('adm-webhook').value.trim();
  admSetData(d);
  toast('Webhook sauvegardé !');
}

function admApplySaved(){
  const d=admGetData();
  // textes
  const t=d.texts||{};
  Object.entries(t).forEach(([id,val])=>{
    const el=document.getElementById(id);
    if(el){
      if(id==='txt-about-title') el.innerHTML=val+' <span>?</span>';
      else if(id.startsWith('about-p')) el.innerHTML=val;
      else el.textContent=val;
    }
  });
  // services
  if(d.services&&d.services.length) renderPublicServices();
  // photos
  renderPublicPortfolio();
}

// Appliquer au chargement
document.addEventListener('DOMContentLoaded', admApplySaved);

/* ══════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });

document.addEventListener('DOMContentLoaded', () => {
  // Appliquer .reveal aux elements cibles
  document.querySelectorAll('.sc').forEach((el,i) => { el.classList.add('reveal','reveal-d'+(i+1)); revealObs.observe(el); });
  document.querySelectorAll('.pg-photo').forEach((el,i) => { el.classList.add('reveal','reveal-d'+((i%4)+1)); revealObs.observe(el); });
  document.querySelectorAll('#aboutbg .ai, #cbg .ci').forEach(el => { el.classList.add('reveal'); revealObs.observe(el); });
  document.querySelectorAll('.stit, .slbl').forEach(el => { el.classList.add('reveal'); revealObs.observe(el); });
});

/* ══════════════════════════════════
   NAV ACTIVE INDICATOR
══════════════════════════════════ */
const navLinks = document.querySelectorAll('.navl a');
const sectionIds = ['services','portfolio','about','contact'];
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if(e.isIntersecting){
      const id = e.target.id || e.target.closest('[id]')?.id;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#'+id);
      });
    }
  });
}, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

document.addEventListener('DOMContentLoaded', () => {
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if(el) navObserver.observe(el);
  });
});

/* ══════════════════════════════════
   LIGHTBOX
══════════════════════════════════ */
let lbPhotos = [];
let lbIdx = 0;

function lbOpen(idx) {
  const d = admGetData();
  lbPhotos = d.photos || [];
  if(!lbPhotos.length) return;
  lbIdx = idx;
  lbShow();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function lbShow() {
  const p = lbPhotos[lbIdx];
  if(!p) return;
  document.getElementById('lb-img').src = p.src;
  document.getElementById('lb-img').alt = p.name;
  document.getElementById('lb-name').textContent = p.name;
  document.getElementById('lb-desc').textContent = p.desc || '';
  document.getElementById('lb-counter').textContent = (lbIdx+1) + ' / ' + lbPhotos.length;
}

function lbClose() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lbNav(dir) {
  lbIdx = (lbIdx + dir + lbPhotos.length) % lbPhotos.length;
  lbShow();
}

document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if(!lb.classList.contains('open')) return;
  if(e.key === 'Escape') lbClose();
  if(e.key === 'ArrowLeft') lbNav(-1);
  if(e.key === 'ArrowRight') lbNav(1);
});

document.getElementById('lightbox').addEventListener('click', e => {
  if(e.target.classList.contains('lightbox')) lbClose();
});

/* ══════════════════════════════════
   WATERMARK CANVAS (graver dans l'image)
══════════════════════════════════ */
function applyWatermark(imgSrc, callback) {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // Watermark diagonal
    ctx.save();
    ctx.translate(c.width/2, c.height/2);
    ctx.rotate(-Math.PI/6);
    ctx.font = Math.max(c.width/14, 28) + 'px Arc, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.letterSpacing = '8px';
    ctx.fillText('AMAROGRAPH', 0, 0);
    // Deuxieme ligne plus petite
    ctx.font = Math.max(c.width/28, 14) + 'px Quantum, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillText('amarograph.com', 0, Math.max(c.width/14, 28) * 1.2);
    ctx.restore();
    callback(c.toDataURL('image/jpeg', 0.92));
  };
  img.src = imgSrc;
}

/* ══════════════════════════════════
   FORMULAIRE DISCORD WEBHOOK
══════════════════════════════════ */
function fs(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.fsub');
  const name = form.querySelector('input[placeholder*="Nom"]')?.value?.trim();
  const contact = form.querySelector('input[placeholder*="Discord"]')?.value?.trim();
  const cat = form.querySelector('select')?.value;
  const msg = form.querySelector('textarea')?.value?.trim();

  // Validation
  if(!name || !contact || !msg) {
    btn.textContent = 'Remplissez tous les champs';
    btn.classList.add('error');
    setTimeout(() => { btn.textContent = 'Envoyer la demande'; btn.classList.remove('error'); }, 2500);
    return;
  }

  // Recuperer le webhook depuis localStorage
  const d = admGetData();
  const webhookUrl = d.webhook || '';
  if(!webhookUrl) {
    btn.textContent = 'Webhook non configuré';
    btn.classList.add('error');
    setTimeout(() => { btn.textContent = 'Envoyer la demande'; btn.classList.remove('error'); }, 2500);
    return;
  }

  btn.textContent = 'Envoi en cours...';
  btn.classList.add('loading');

  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: '📩 Nouvelle demande — ' + cat,
        color: 43775,
        fields: [
          { name: 'Nom', value: name, inline: true },
          { name: 'Contact', value: contact, inline: true },
          { name: 'Catégorie', value: cat, inline: true },
          { name: 'Message', value: msg }
        ],
        footer: { text: 'Amarograph — Formulaire de contact' },
        timestamp: new Date().toISOString()
      }]
    })
  }).then(r => {
    btn.classList.remove('loading');
    if(r.ok) {
      btn.textContent = 'Demande envoyée ✓';
      btn.classList.add('success');
      btn.disabled = true;
      form.reset();
    } else {
      throw new Error('Erreur ' + r.status);
    }
  }).catch(() => {
    btn.classList.remove('loading');
    btn.textContent = 'Erreur — réessayez';
    btn.classList.add('error');
    setTimeout(() => { btn.textContent = 'Envoyer la demande'; btn.classList.remove('error'); }, 3000);
  });
}
