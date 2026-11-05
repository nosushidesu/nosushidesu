/* helper kecil yang dipakai beberapa halaman */
const NSD = {
  esc:s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
  months:['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
  colors:['#bfc4ff','#f3bdc4','#b2f9e7','#ffe7ff','#c6e4e2','#fff6cf'],

  fmtDate(iso){
    if(!iso) return {d:'?',m:'TBA',full:'TBA'};
    const [y,mo,da]=iso.split('-').map(Number);
    if(!da) return {d:'✦',m:(mo?NSD.months[mo-1]+' ':'')+y,full:(mo?NSD.months[mo-1]+' ':'')+y};
    return {d:da,m:NSD.months[mo-1]+' '+y,full:`${da} ${NSD.months[mo-1]} ${y}`};
  },

  ticket(ev,i=0){
    const dt=NSD.fmtDate(ev.event_date);
    const cap=ev.capacity||0, used=ev.confirmed_count||0, left=Math.max(cap-used,0);
    const pct=cap?Math.min(100,Math.round(used/cap*100)):0;
    let state, btn;
    if(ev.status==='closed'){state='RSVP ditutup';btn=`<span class="btn sm white off">closed</span>`}
    else if(left>0){state=`sisa <b>${left}</b> dari ${cap} slot`;btn=`<a class="btn sm" href="/events.html?e=${encodeURIComponent(ev.slug)}">RSVP ✿</a>`}
    else if(ev.waitlist_enabled){state=`slot penuh · waiting list dibuka (${ev.waitlist_count||0} antre)`;btn=`<a class="btn sm butter" href="/events.html?e=${encodeURIComponent(ev.slug)}">join waiting list</a>`}
    else {state='slot penuh';btn=`<span class="btn sm white off">full</span>`}
    return `<article class="ticket" style="--c:${NSD.colors[i%NSD.colors.length]};transform:rotate(${i%2?.6:-.6}deg)">
      <div class="stub"><div class="d">${dt.d}</div><div class="m">${dt.m}</div></div>
      <div class="body">
        ${ev.category?`<span class="stamp">${NSD.esc(ev.category)}</span>`:''}
        <h3>${NSD.esc(ev.title)}</h3>
        <div class="meta">${ev.event_time?`<span>🕒 ${NSD.esc(ev.event_time)}</span>`:''}${ev.venue?`<span>📍 ${NSD.esc(ev.venue)}</span>`:''}</div>
        <div class="slots"><div class="bar"><i style="width:${pct}%"></i></div><small>${state}</small></div>
        ${btn}
      </div></article>`;
  },

  async getJSON(url,opt){
    const r=await fetch(url,opt); const j=await r.json().catch(()=>({}));
    if(!r.ok) throw Object.assign(new Error(j.error||('HTTP '+r.status)),{data:j,status:r.status});
    return j;
  }
};
