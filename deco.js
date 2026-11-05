/* nosushidesu ♡ deco.js
   Stiker, background quilt, stiker bisa digeser, jejak sparkle, confetti.
   Cara pakai stiker di HTML:
   <i class="sticker" data-icon="bow" data-color="#f39cc0" style="width:60px"></i>
   icon: bow, heart, star, sparkle, cloud, flower, sushi */
(function(){
  const ICONS = {
    heart:(c)=>`<svg viewBox="0 0 24 22"><path fill="${c}" stroke="#0001" stroke-width=".6" d="M12 21s-7.8-4.8-10-9.6C.4 7.8 2.6 3.6 6.4 3.6c2.2 0 3.8 1.3 4.6 2.8.8-1.5 2.4-2.8 4.6-2.8 3.8 0 6 4.2 4.4 7.8C19.8 16.2 12 21 12 21z"/><ellipse cx="7" cy="8" rx="1.8" ry="1.1" fill="#fff" opacity=".7" transform="rotate(-30 7 8)"/></svg>`,
    star:(c)=>`<svg viewBox="0 0 24 24"><path fill="${c}" stroke="${c}" stroke-width="2.4" stroke-linejoin="round" d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/><circle cx="9.6" cy="9.4" r="1.1" fill="#fff" opacity=".75"/></svg>`,
    sparkle:(c)=>`<svg viewBox="0 0 24 24"><path fill="${c}" d="M12 0C13 8 16 11 24 12 16 13 13 16 12 24 11 16 8 13 0 12 8 11 11 8 12 0Z"/></svg>`,
    bow:(c)=>`<svg viewBox="0 0 48 40"><g fill="${c}" stroke="#0002" stroke-width=".8"><path d="M24 17C16 4 3 5 4 15s13 9 20 2z"/><path d="M24 17c8-13 21-12 20-2s-13 9-20 2z"/><path d="M22 19l-8 18 5-2 2 4 4-19z"/><path d="M26 19l8 18-5-2-2 4-4-19z"/><circle cx="24" cy="18" r="4.4"/></g><g fill="#fff" opacity=".8"><circle cx="10" cy="12" r="1.3"/><circle cx="15" cy="16" r="1.1"/><circle cx="13" cy="9" r="1"/><circle cx="37" cy="12" r="1.3"/><circle cx="33" cy="16" r="1.1"/><circle cx="39" cy="17" r="1"/><circle cx="18" cy="30" r="1"/><circle cx="30" cy="30" r="1"/></g></svg>`,
    cloud:(c)=>`<svg viewBox="0 0 64 40"><path fill="${c}" stroke="#0001" d="M50 38H14a12 12 0 0 1-1-24 16 16 0 0 1 30-4 11 11 0 0 1 7 28z"/></svg>`,
    flower:(c)=>`<svg viewBox="0 0 24 24"><g fill="${c}">${[0,72,144,216,288].map(a=>`<circle cx="12" cy="6" r="4.6" transform="rotate(${a} 12 12)"/>`).join('')}</g><circle cx="12" cy="12" r="3.4" fill="#fff6cf"/></svg>`,
    sushi:()=>`<svg viewBox="0 0 48 36"><ellipse cx="24" cy="26" rx="20" ry="8" fill="#fff"  stroke="#0002"/><path d="M6 22c0-8 36-8 36 0-6 6-30 6-36 0z" fill="#ffb4a8"/><path d="M10 18c8-3 20-3 28 0M12 21c8-2 18-2 24 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/><rect x="21" y="16" width="6" height="18" rx="1" fill="#6f8f7a" opacity=".85"/><circle cx="17" cy="27" r="1.2" fill="#5b5679"/><circle cx="31" cy="27" r="1.2" fill="#5b5679"/><path d="M22 30q2 2 4 0" stroke="#5b5679" stroke-width="1" fill="none"/><circle cx="14" cy="30" r="2" fill="#f39cc0" opacity=".5"/><circle cx="34" cy="30" r="2" fill="#f39cc0" opacity=".5"/></svg>`
  };
  window.NSD_ICON = (name,color)=> (ICONS[name]||ICONS.heart)(color||'#f39cc0');

  function paintStickers(root=document){
    root.querySelectorAll('[data-icon]').forEach(el=>{
      if(el.dataset.done) return;
      el.innerHTML = NSD_ICON(el.dataset.icon, el.dataset.color);
      el.dataset.done = 1;
    });
  }

  /* background quilt (seperti referensi patchwork) */
  function buildQuilt(){
    if(document.querySelector('.quilt')) return;
    const q = document.createElement('div'); q.className='quilt'; q.setAttribute('aria-hidden','true');
    const patches = [
      ['pat-dots-pink',''],['pat-stripe-blue','w2'],['pat-gingham-pink','h2'],
      ['pat-stripe-butter','h2'],['pat-dots-blue',''],['pat-lilac',''],
      ['pat-gingham-mint',''],['pat-pink','w2'],['pat-sage',''],
      ['pat-dots-pink',''],['pat-stripe-blue',''],['pat-gingham-pink','w2'],
      ['pat-dots-blue',''],['pat-stripe-butter',''],['pat-lilac','w2'],['pat-gingham-mint','']
    ];
    const motifs = [['bow','#f6a9c9'],['star','#a9c8f5'],['heart','#f6b3cf'],['bow','#fff1b8'],['star','#f6b3cf'],['heart','#a9c8f5']];
    patches.forEach((p,i)=>{
      const d=document.createElement('div'); d.className='patch '+p[0]+' '+p[1];
      if(i%2===0){
        const m=motifs[i%motifs.length];
        const s=document.createElement('i'); s.className='motif';
        s.style.cssText=`width:${34+(i*7)%26}px;left:${20+(i*23)%55}%;top:${18+(i*31)%55}%;transform:rotate(${(i*37)%40-20}deg)`;
        s.innerHTML=NSD_ICON(m[0],m[1]); d.appendChild(s);
      }
      q.appendChild(d);
    });
    document.body.prepend(q);
  }

  /* gem sprinkles di elemen [data-gems="8"] */
  function sprinkleGems(){
    const cols=['#f3bdc4','#bfc4ff','#b2f9e7','#ffe7ff','#f39cc0','#c6e4e2','#fff6cf'];
    document.querySelectorAll('[data-gems]').forEach(box=>{
      const n=+box.dataset.gems||8;
      for(let i=0;i<n;i++){
        const g=document.createElement('i'); g.className='gem';
        const s=6+Math.random()*10;
        g.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*96}%;top:${Math.random()*96}%;--c:${cols[i%cols.length]}`;
        box.appendChild(g);
      }
    });
  }

  /* stiker .drag bisa digeser */
  function enableDrag(){
    document.querySelectorAll('.drag').forEach(el=>{
      let sx,sy,ox=0,oy=0,moving=false;
      el.addEventListener('pointerdown',e=>{moving=true;sx=e.clientX-ox;sy=e.clientY-oy;el.setPointerCapture(e.pointerId);el.style.zIndex=20});
      el.addEventListener('pointermove',e=>{if(!moving)return;ox=e.clientX-sx;oy=e.clientY-sy;el.style.translate=`${ox}px ${oy}px`});
      el.addEventListener('pointerup',()=>{moving=false;pop(el)});
    });
  }
  function pop(el){el.animate([{scale:1},{scale:1.25},{scale:1}],{duration:300,easing:'ease-out'})}

  /* jejak sparkle kursor (desktop saja) */
  function trail(){
    if(!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const set=[['sparkle','#f39cc0'],['star','#bfc4ff'],['heart','#f3bdc4'],['sparkle','#8fd9c4']];
    let last=0,i=0;
    addEventListener('pointermove',e=>{
      const now=performance.now(); if(now-last<55) return; last=now;
      const t=document.createElement('i'); t.className='trail';
      const s=set[i++%set.length]; t.innerHTML=NSD_ICON(s[0],s[1]);
      t.style.left=(e.clientX-8)+'px'; t.style.top=(e.clientY-8)+'px';
      document.body.appendChild(t); setTimeout(()=>t.remove(),900);
    });
  }

  /* muncul pas di-scroll */
  function reveal(){
    const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.15});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  }

  /* confetti pita + hati, dipanggil NSD_confetti() */
  window.NSD_confetti = function(n=60){
    if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const set=[['bow','#f39cc0'],['heart','#f3bdc4'],['star','#bfc4ff'],['sparkle','#8fd9c4'],['heart','#ffe7ff'],['star','#fff1b8']];
    for(let i=0;i<n;i++){
      const c=document.createElement('i'); const s=set[i%set.length];
      c.innerHTML=NSD_ICON(s[0],s[1]);
      const size=14+Math.random()*18;
      c.style.cssText=`position:fixed;z-index:9999;pointer-events:none;width:${size}px;left:${Math.random()*100}vw;top:-40px`;
      document.body.appendChild(c);
      c.animate([{transform:'translateY(0) rotate(0)'},{transform:`translate(${(Math.random()-.5)*200}px,${innerHeight+80}px) rotate(${Math.random()*720}deg)`}],
        {duration:2200+Math.random()*1800,easing:'cubic-bezier(.3,.6,.5,1)',delay:Math.random()*400}).onfinish=()=>c.remove();
    }
  };

  /* tandai tab aktif */
  function navActive(){
    const p=location.pathname.replace(/\/$/,'/index').replace('.html','');
    document.querySelectorAll('.tabs a').forEach(a=>{
      const h=new URL(a.href).pathname.replace(/\/$/,'/index').replace('.html','');
      if(h===p) a.classList.add('on');
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    buildQuilt(); paintStickers(); sprinkleGems(); enableDrag(); trail(); reveal(); navActive();
  });
  window.NSD_paint = paintStickers;
})();
