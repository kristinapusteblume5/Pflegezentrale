const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- Symbole (ein Strichset, überall gleich stark) ---------- */
const ICN={
 check:'<path d="M20 6L9 17l-5-5"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 calx:'<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5L12 18l2.5-2.5"/>',
 book:'<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="10" r="2.4"/><path d="M8.3 16.8a4 4 0 017.4 0"/>',
 plane:'<path d="M21 3L3 10.5l7 3 3 7L21 3z"/><path d="M10 13.5L21 3"/>',
 home:'<path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-9.5z"/>',
 build:'<path d="M5 21V4.5A1.5 1.5 0 016.5 3h7A1.5 1.5 0 0115 4.5V21M15 10h3.5A1.5 1.5 0 0120 11.5V21M3 21h18M8.5 7h3M8.5 11h3M8.5 15h3"/>',
 cross:'<path d="M3 12.5h3.8l2.1-5.5 3.4 11 2.3-7 1.6 3.5H21"/>',
 pin:'<path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 phone:'<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v3a2 2 0 01-2.2 2A17 17 0 014.5 5.7 2 2 0 016.5 3.5z"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
 pen:'<path d="M16.5 3.5l4 4L8 20H4v-4L16.5 3.5z"/>',
 trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',
 bell:'<path d="M6 9a6 6 0 1112 0c0 4 1.5 6 1.5 6H4.5S6 13 6 9z"/><path d="M10 19a2 2 0 004 0"/>',
 gear:'<path d="M4 7h9M19 7h1M4 17h3M13 17h7"/><circle cx="16" cy="7" r="2.4"/><circle cx="10" cy="17" r="2.4"/>',
 user:'<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0115 0"/>',
 note:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
 chat:'<path d="M20 14.5a2.5 2.5 0 01-2.5 2.5H8l-4 3.5V6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v8z"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
 link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 10-5.7-5.7L11.5 7M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 105.7 5.7L12.5 17"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 5.5A1.5 1.5 0 0014.5 4h-9A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16"/>',
 lock:'<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7a4 4 0 018 0v3"/>',
 car:'<path d="M4.5 16.5v2.5h3v-2.5M16.5 16.5V19h3v-2.5M3.5 16.5h17v-4l-1.8-4.4A2 2 0 0016.9 7H7.1a2 2 0 00-1.8 1.1L3.5 12.5v4z"/><path d="M6.5 14h1M16.5 14h1"/>',
 list:'<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
 wrench:'<path d="M20.3 4.6a4.6 4.6 0 01-5.9 5.9l-7.8 7.8a2.2 2.2 0 11-3.1-3.1l7.8-7.8a4.6 4.6 0 015.9-5.9l-2.9 2.9 1.5 2.1 2.1 1.5 2.4-3.4z"/>'
};
const ic=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICN[n]||''}</svg>`;

const day=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);return d};
const fmt=d=>new Date(d).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const ST=['Offen','In Bearbeitung','Wartet auf Rückmeldung','Erledigt'],SS=['Offen','In Arbeit','Wartet','Erledigt'],TH=['Immobilie','Wohnen Papa','Gesundheit','Weitere'],WHO=()=>[...PE,'Beide'],PE=[];
const CL=['Ärzte','Organisatorisch','Demenzwohnen','Immobilie Nürnberg','Mieter','Handwerker'],HSTAT=['Idee','Angefragt','Besichtigung geplant','Besichtigt','Warteliste','Zusage','Absage','Entschieden dagegen'],HART=['Demenz-WG','Pflegeheim','Betreutes Wohnen','Wohnung','Sonstiges'];
const PHOTO='/api/photo';
let showNewA=false,openA=null,aTab='next',aFilt='alle',apf=null,aerr='';
let user=null,tab='aufgaben',tp='alle',tth='alle',showNew=false,showNewK=false,showDone=false,showArch=false,openT=null,kcl='alle',kq='',setTab='mail',tplSel='t1',dTab=null,del=null,kerr='',homeOpen=null,unitOpen=null,wTab='obj',iTab='over',showNewH=false,showNewU=false,newTaskFor=null,openK=null;
const tel=t=>'tel:'+t.replace(/\s/g,'');
let tasks=[],contacts=[],appts=[],tpls=[],drafts=[],logs=[],homes=[],units=[];
let trip={id:'trip',from:iso(day(30)),to:iso(day(37)),grund:''};
let prop={id:'prop',notes:[]};
let FEED='',CARE='',phase='loading',codeErr='',REV='',banner='';
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-5);
const PENDING=[];
const L=m=>{logs.unshift({t:new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}),u:user||'System',m});PENDING.push(m);pendingToast=true};
const days=()=>{const a=new Date(trip.from),b=new Date(trip.to);return(isNaN(a)||isNaN(b)||b<a)?0:Math.round((b-a)/864e5)+1};
const mail=n=>(contacts.find(c=>c.n===n&&c.m)||{}).m||null;
const fill=(s,v)=>s.split('\n').filter(l=>!(l.includes('{grund}')&&!v.grund)).join('\n').replace(/\{(\w+)\}/g,(m,k)=>v[k]??m);
function mkDrafts(){const n=days();if(!n){drafts=[];return}const v={von:fmt(trip.from),bis:fmt(trip.to),tage:n,grund:trip.grund.trim()};
 drafts=tpls.filter(t=>t.on).map(t=>{const a=mail(t.to);return{id:t.id,tid:t.id,name:t.n,to:t.to?(a?`${t.to} <${a}>`:`${t.to} (keine E-Mail-Adresse hinterlegt)`):'Kein Empfänger gewählt',ok:!!a,sub:fill(t.sub,v),body:fill(t.body,v),s:'Entwurf'}})}

/* ---------- kleine Bausteine ---------- */
const stc=i=>['','ac','wa','ok'][i],ti=h=>Math.max(0,TH.indexOf(h));
const tg=h=>`<span class="tg t${ti(h)}">${esc(h)}</span>`;
const avc=p=>'a'+(PE.indexOf(p)+1);
const av=w=>w==='Beide'
 ?`<span class="avs" title="Beide">${PE.map(p=>`<span class="av ${avc(p)}" title="${esc(p)}">${esc(p[0])}</span>`).join('')}</span>`
 :`<span class="av ${avc(w)}" title="${esc(w)}">${esc(w[0])}</span>`;
const opts=(a,v)=>a.map(x=>`<option ${x===v?'selected':''}>${esc(x)}</option>`).join('');
const call=c=>`<a class="call" href="${tel(c.t)}" aria-label="${esc(c.n)} anrufen">${ic('phone')}${esc(c.t)}</a>`;
const tabs=(items,cur,key)=>`<div class="tabs" role="tablist">${items.map(([v,l])=>`<button role="tab" data-${key}="${esc(v)}" aria-selected="${cur===v}">${l}</button>`).join('')}</div>`;
const chips=(items,cur,key)=>`<div class="chips">${items.map(([v,l])=>`<button data-${key}="${esc(v)}" aria-pressed="${cur===v}">${l}</button>`).join('')}</div>`;
const confirmBox=t=>`<div class="cf">${t}<div class="row" style="margin-top:10px"><button class="s dg" data-delyes="1">${ic('trash')}Löschen</button><button class="s" data-delno="1">Abbrechen</button></div></div>`;
const h2=(t,n)=>`<h2>${t}${n===undefined?'':` <span class="n">(${n})</span>`}</h2>`;
const empty=(t,s)=>`<div class="empty"><b>${t}</b>${s}</div>`;
const listOf=(a,fb)=>a.length?`<div class="list">${a.join('')}</div>`:fb;
const sheet=(title,body,foot)=>`<div class="shbg" data-closesheet="1"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="shh"><b>${esc(title)}</b><button class="ic" data-closesheet="1" aria-label="Schließen">${ic('x')}</button></div><div class="shb">${body}</div><div class="shf">${foot}</div></div>`;
function closeSheets(){showNew=showNewK=showNewA=showNewH=showNewU=false;openA=null;newTaskFor=null;aerr='';kerr='';apf=null;del=null}
let toastT=null,pendingToast=false;
function toast(m){const e=$('#toast');if(!e)return;e.innerHTML=ic('check')+esc(m);e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),2200)}

/* ---------- Termine ---------- */
const REP=[['none','Einmalig'],['1y','Jährlich'],['6m','Halbjährlich'],['3m','Vierteljährlich'],['1m','Monatlich'],['custom','Eigenes Intervall']];
const REM=[['0','Keine Erinnerung'],['1','1 Tag vorher'],['3','3 Tage vorher'],['7','1 Woche vorher'],['14','2 Wochen vorher'],['30','1 Monat vorher']];
const dl=d=>new Date(d).toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'});
const rel=dd=>dd===0?'heute':dd===1?'morgen':`in ${dd} Tagen`;
const dayDiff=o=>Math.round((o-day(0))/864e5);
const repLabel=r=>!r?'Einmalig':(r.n===1&&r.u==='y')?'Jährlich':(r.n===6&&r.u==='m')?'Halbjährlich':(r.n===3&&r.u==='m')?'Vierteljährlich':(r.n===1&&r.u==='m')?'Monatlich':(r.n===1&&r.u==='w')?'Wöchentlich':`Alle ${r.n} ${{w:'Wochen',m:'Monate',y:'Jahre'}[r.u]}`;
const repKey=r=>{if(!r)return 'none';const k=''+r.n+r.u;return ['1y','6m','3m','1m'].includes(k)?k:'custom'};
function addU(s,n,u){const x=new Date(s);if(u==='w'){x.setDate(x.getDate()+7*n);return x}
 const m=u==='y'?12*n:n,dd=x.getDate();x.setDate(1);x.setMonth(x.getMonth()+m);x.setDate(Math.min(dd,new Date(x.getFullYear(),x.getMonth()+1,0).getDate()));return x}
function nextOcc(a,from=day(0)){const s=new Date(a.date+'T00:00');if(!a.rep)return s>=from?s:null;let k=0,c=s;while(c<from&&k<600){k++;c=addU(s,a.rep.n*k,a.rep.u)}return c>=from?c:null}
const upcoming=()=>appts.map(a=>({a,occ:nextOcc(a)})).filter(x=>x.occ).sort((x,y)=>x.occ-y.occ||(x.a.time||'').localeCompare(y.a.time||''));
const arztName=a=>a.arzt?(contacts.find(c=>c.id===a.arzt)||{n:'(Kontakt gelöscht)'}).n:(linkTarget(a.link)||{n:artLabel(artOf(a))}).n;
const dueRem=()=>upcoming().filter(x=>x.a.rem>0&&dayDiff(x.occ)<=x.a.rem);
const apfNew=()=>({art:'arzt',arzt:'',what:'',date:iso(day(14)),time:'09:00',rep:'none',n:'6',u:'m',rem:'7',note:'',hin:'offen',link:''});
const apfFrom=a=>({art:artOf(a),arzt:a.arzt||'',what:a.what,date:a.date,time:a.time||'',rep:repKey(a.rep),n:a.rep?String(a.rep.n):'6',u:a.rep?a.rep.u:'m',rem:String(a.rem||0),note:a.note||'',hin:a.hin||'offen',link:a.link?a.link.k+':'+a.link.id:''});
function readForm(){const f=Object.assign({},apf||apfNew());['art','arzt','what','date','time','rep','n','u','rem','note','hin','link'].forEach(k=>{const e=$('#ap_'+k);if(e)f[k]=e.value});apf=f;return f}
const ART=[['arzt','Arzt','cross','Arzt'],['wohnen','Besichtigung Demenzwohnen','home','Demenzwohnen'],['immo','Immobilie (Besichtigung, Handwerker, Mieter)','build','Immobilie'],['sonst','Sonstiges','pin','Sonstiges']];
const artOf=a=>a.art||'arzt',artRow=k=>ART.find(x=>x[0]===k)||ART[0],artLabel=k=>artRow(k)[1],artIcon=k=>artRow(k)[2],artShort=k=>artRow(k)[3];
const needsHin=a=>['arzt','wohnen'].includes(artOf(a));
const HIN_KEYS=()=>['offen','pflege',...PE.map(p=>'p:'+p),'ok'];
const hinLabel=v=>{v=v||'offen';
 return v==='pflege'?'Pflegedienst bringt':v==='ok'?'Ist organisiert'
  :v==='selbst'?'Geht selbst hin':v==='andere'?'Andere bringen'
  :v.startsWith('p:')?v.slice(2)+' organisiert':'Transport offen'};
const hinOpts=hv=>{const k=HIN_KEYS();if(!k.includes(hv))k.push(hv);
 return k.map(x=>`<option value="${x}" ${x===hv?'selected':''}>${esc(hinLabel(x))}</option>`).join('')};
const CATS_FOR={arzt:['Ärzte'],wohnen:['Demenzwohnen'],immo:['Immobilie Nürnberg','Handwerker','Mieter'],sonst:CL};
const contactsForArt=(art,sel)=>contacts.filter(c=>(CATS_FOR[art]||CL).includes(c.cl)||c.id===sel);
function apFields(f){const docs=contactsForArt(f.art,f.arzt);
 const lk=f.art==='wohnen'?`<label for="ap_link">Wohnobjekt (optional)</label><select id="ap_link"><option value="">– keins –</option>${homes.slice().sort(byName).map(h=>`<option value="home:${h.id}" ${f.link==='home:'+h.id?'selected':''}>${esc(h.n)}</option>`).join('')}</select>`
  :f.art==='immo'?`<label for="ap_link">Nutzer / Wohnung (optional)</label><select id="ap_link"><option value="">– keine –</option>${units.slice().sort(byName).map(u=>`<option value="unit:${u.id}" ${f.link==='unit:'+u.id?'selected':''}>${esc(u.n)}</option>`).join('')}</select>`:'';
 return `<label for="ap_art">Art des Termins</label><select id="ap_art">${ART.map(([k,l])=>`<option value="${k}" ${k===f.art?'selected':''}>${esc(l)}</option>`).join('')}</select>
 <label for="ap_arzt">${f.art==='arzt'?'Arzt (Kontakt)':'Kontakt (optional)'}</label><div class="row" style="flex-wrap:nowrap"><select id="ap_arzt"><option value="">${f.art==='arzt'?'– bitte wählen –':'– keiner –'}</option>${CL.map(cl=>{const x=docs.filter(c=>c.cl===cl).sort(byName);return x.length?`<optgroup label="${cl}">${x.map(c=>`<option value="${c.id}" ${c.id===f.arzt?'selected':''}>${esc(c.n)} · ${esc(c.r)}</option>`).join('')}</optgroup>`:''}).join('')}</select><button class="s" data-goarzt="1" style="white-space:nowrap">${ic('plus')}Kontakt</button></div>
 ${lk}
 <label for="ap_what">Anlass</label><input id="ap_what" value="${esc(f.what)}" placeholder="${f.art==='arzt'?'z. B. Kontrolle, Check-up':f.art==='wohnen'?'z. B. Besichtigung, Probewohnen':'z. B. Besichtigung, Übergabe'}">
 <div class="fg"><div><label for="ap_date">Datum</label><input id="ap_date" type="date" value="${f.date}"></div><div><label for="ap_time">Uhrzeit</label><input id="ap_time" type="time" value="${f.time}"></div></div>
 ${needsHin(f)?`<label for="ap_hin">Wer bringt ${esc(CARE)} hin?</label><select id="ap_hin">${hinOpts(f.hin||'offen')}</select>`:''}
 <label for="ap_rep">Turnus</label><select id="ap_rep">${REP.map(([v,l])=>`<option value="${v}" ${v===f.rep?'selected':''}>${l}</option>`).join('')}</select>
 ${f.rep==='custom'?`<div class="row" style="flex-wrap:nowrap;margin-top:8px"><span class="mu">Alle</span><input id="ap_n" type="number" min="1" value="${esc(f.n)}" style="width:84px"><select id="ap_u">${[['w','Wochen'],['m','Monate'],['y','Jahre']].map(([v,l])=>`<option value="${v}" ${v===f.u?'selected':''}>${l}</option>`).join('')}</select></div>`:''}
 <label for="ap_rem">Erinnerung</label><select id="ap_rem">${REM.map(([v,l])=>`<option value="${v}" ${v===f.rem?'selected':''}>${l}</option>`).join('')}</select>
 <label for="ap_note">Notiz (optional)</label><input id="ap_note" value="${esc(f.note)}">
 <div class="mu" style="margin-top:8px">Bitte keine Diagnosen oder Befunde eintragen.</div><div class="err mu">${esc(aerr)}</div>`}
function apSheet(){
 if(showNewA)return sheet('Neuer Termin',apFields(apf||apfNew()),`<button class="p" data-apsave="new">Termin anlegen</button>`);
 if(!openA)return '';
 const a=appts.find(x=>x.id===openA);if(!a){openA=null;return ''}
 const doc=contacts.find(c=>c.id===a.arzt);
 return sheet(a.what||'Termin',apFields(apf||apfFrom(a))
  +`<div class="row" style="margin-top:16px;gap:6px">${doc?call(doc):''}<a class="lnk" href="/api/ics?id=${a.id}">${ic('calx')}Zum Kalender</a><button class="s gh" data-apt="${a.id}">${ic('plus')}Als Aufgabe</button><button class="ic" style="color:var(--er)" data-del="t:${a.id}" aria-label="Termin löschen">${ic('trash')}</button></div>`
  +(del==='t:'+a.id?confirmBox(`Termin „${esc(a.what)}“ wirklich löschen${a.rep?' (die ganze Serie)':''}?`):''),
  `<button class="p" data-apsave="${a.id}">Änderungen speichern</button>`)}
function acard(a,occ,feat){const dd=dayDiff(occ),due=a.rem>0&&dd>=0&&dd<=a.rem,doc=contacts.find(c=>c.id===a.arzt),
 rl=(REM.find(r=>r[0]===String(a.rem))||[])[1],tgt=linkTarget(a.link),hv=a.hin||'offen',nh=needsHin(a),k=artOf(a);
 const when=[dl(occ),a.time||'',a.rep?repLabel(a.rep).toLowerCase():''].filter(Boolean).join(' · ');
 const place=a.link?esc(tgt?tgt.n+(tgt.adr?' · '+tgt.adr:''):'(gelöscht)'):'';
 const meta=place||(doc?esc(doc.n+' · '+doc.r):(a.arzt?'(Kontakt gelöscht)':''));
 return `<div class="blk tk k-${k}${feat?' big':''}${due?' due':''}${dd<0?' old':''}" data-opena="${a.id}">
 <div class="row sp" style="flex-wrap:nowrap;gap:10px;align-items:flex-start">
  <div class="apt">${esc(a.what)}</div>${dd>=0?`<span class="rel">${rel(dd)}</span>`:''}</div>
 <div class="apw">${esc(when)}</div>
 ${meta?`<div class="mu">${meta}</div>`:''}
 ${due?`<div class="mu row warn" style="gap:5px;margin-top:5px;font-weight:650">${ic('bell')}Erinnerung: ${rl||a.rem+' Tage vorher'}</div>`:''}
 ${nh?`<div class="row sp" style="margin-top:12px;gap:8px"><select class="ss ${hv==='offen'?'wa':'ok'}" data-hin="${a.id}" aria-label="Wer bringt ${esc(CARE)} hin?">${hinOpts(hv)}</select><a class="lnk" href="/api/ics?id=${a.id}">${ic('calx')}Kalender</a></div>`
  :`<div class="row" style="margin-top:10px"><a class="lnk" href="/api/ics?id=${a.id}">${ic('calx')}Kalender</a></div>`}</div>`}
const remBlock=btn=>{const r=dueRem();return r.length?h2('Erinnerungen',r.length)+listOf(r.map(x=>`<div class="card att"><div class="row" style="gap:8px;flex-wrap:nowrap"><span class="warn" style="display:flex">${ic('bell')}</span><b>${esc(x.a.what)}</b></div><div class="mu" style="margin-top:2px">${rel(dayDiff(x.occ))} · ${dl(x.occ)} · ${esc(arztName(x.a))}</div>${needsHin(x.a)&&(x.a.hin||'offen')==='offen'?'<div class="warn mu">Begleitung noch nicht geklärt</div>':''}${btn?`<button class="s" data-apt="${x.a.id}" style="margin-top:9px">${ic('plus')}Als Aufgabe anlegen</button>`:''}</div>`),''):''};
const hinOpen=up=>{const o=up.filter(x=>needsHin(x.a)&&(x.a.hin||'offen')==='offen'&&dayDiff(x.occ)<=14);
 return o.length?`<div class="alert"><div class="row" style="gap:8px;flex-wrap:nowrap"><span class="warn" style="display:flex">${ic('car')}</span><b>Begleitung noch nicht geklärt (${o.length})</b></div>${o.slice(0,4).map(x=>`<div class="mu" style="margin-top:3px">${dl(x.occ)} · ${esc(x.a.what)}</div>`).join('')}</div>`:''};
function apptBlock(k,id){const l=upcoming().filter(x=>x.a.link&&x.a.link.k===k&&x.a.link.id===id);
 return `<div class="row sp">${h2('Termine',l.length)}<button class="s" data-newapl="${k}:${id}">${ic('plus')}Termin</button></div>${l.length?l.map(x=>acard(x.a,x.occ)).join(''):empty('Keine Termine','Besichtigungen und andere Termine hier anlegen.')}`}
function vTermine(){const today=day(0);
 const up=upcoming().filter(x=>aFilt==='alle'||artOf(x.a)===aFilt);
 const ser=up.filter(x=>x.a.rep);
 const past=appts.filter(a=>!a.rep&&new Date(a.date+'T00:00')<today&&(aFilt==='alle'||artOf(a)===aFilt)).sort((x,y)=>y.date.localeCompare(x.date));
 const n=x=>x?`<sup>${x}</sup>`:'';
 const nav=tabs([['next','Anstehend'+n(up.length)],['series','Wiederkehrend'+n(ser.length)],['past','Vergangen'+n(past.length)]],aTab,'at');
 const flt=chips(['alle',...ART.map(x=>x[0])].map(k=>[k,k==='alle'?'Alle':`${ic(artIcon(k))}${artShort(k)}`]),aFilt,'af');
 let b='';
 if(aTab==='next'){b=hinOpen(up);
  b+=up.length
   ?h2('Nächster Termin')+acard(up[0].a,up[0].occ,true)+(up.length>1?h2('Danach')+up.slice(1).map(x=>acard(x.a,x.occ)).join(''):'')
   :empty('Keine anstehenden Termine','Mit „Termin“ oben einen Arzttermin oder eine Besichtigung eintragen.')}
 if(aTab==='series')b=ser.length?h2('Turnus-Termine')+ser.map(x=>acard(x.a,x.occ)).join(''):empty('Noch keine wiederkehrenden Termine','Beim Anlegen einen Turnus wählen, etwa jährlich für den Check-up.');
 if(aTab==='past')b=past.length?h2('Vergangene Termine')+past.map(a=>acard(a,new Date(a.date+'T00:00'))).join(''):empty('Nichts im Rückblick','Vergangene Einzeltermine sammeln sich hier.');
 return nav+flt+b+`<div class="mu" style="margin:18px 0 4px">Alle Termine laufend im Kalender: <button class="s gh" data-tab="settings" data-set="kal">${ic('calx')}Kalender abonnieren</button></div>`}

/* ---------- Verknüpfungen, Notizen, Aufgabenblöcke ---------- */
const HC={'Zusage':'ok','Absage':'er','Entschieden dagegen':'er','Besichtigung geplant':'ac','Besichtigt':'ac','Warteliste':'wa'};
const HCOL={'Zusage':'c2','Absage':'c4','Entschieden dagegen':'c4','Besichtigung geplant':'c0','Besichtigt':'c0','Warteliste':'c0'};
const KCOL={'Ärzte':'c2','Organisatorisch':'c3','Demenzwohnen':'c1','Immobilie Nürnberg':'c0','Mieter':'c0','Handwerker':'c4'};
const KICN={'Ärzte':'cross','Organisatorisch':'note','Demenzwohnen':'home','Immobilie Nürnberg':'build','Mieter':'user','Handwerker':'wrench'};
const ini=(t,col)=>`<span class="ini ${col}">${esc((t||'?').trim()[0]||'?').toUpperCase()}</span>`;
const iconBadge=(name,col)=>`<span class="ini ${col}">${ic(name)}</span>`;
const hb=st=>`<span class="badge ${HC[st]||''}">${esc(st)}</span>`;
const byName=(a,b)=>a.n.localeCompare(b.n,'de',{numeric:true});
const parseLink=v=>{if(!v)return null;const i=v.indexOf(':');return{k:v.slice(0,i),id:v.slice(i+1)}};
const linkTarget=l=>l?(l.k==='unit'?units:homes).find(x=>x.id===l.id):null;
const linkTag=t=>t.link?`<span class="tg t3">${esc((linkTarget(t.link)||{n:'(gelöscht)'}).n)}</span>`:'';
const linkOpts=sel=>`<option value="">– keine –</option>${units.length?`<optgroup label="Nutzer Immobilie">${units.slice().sort(byName).map(u=>`<option value="unit:${u.id}" ${sel==='unit:'+u.id?'selected':''}>${esc(u.n)}</option>`).join('')}</optgroup>`:''}${homes.length?`<optgroup label="Wohnobjekte">${homes.slice().sort(byName).map(h=>`<option value="home:${h.id}" ${sel==='home:'+h.id?'selected':''}>${esc(h.n)}</option>`).join('')}</optgroup>`:''}`;
const tasksFor=(k,id)=>tasks.filter(t=>!t.arch&&t.link&&t.link.k===k&&t.link.id===id);
const openCount=(k,id)=>tasksFor(k,id).filter(t=>t.st!==3).length;
const objOf=key=>{const[k,id]=key.split(':');return k==='unit'?units.find(x=>x.id===id):k==='home'?homes.find(x=>x.id===id):k==='prop'?prop:null};
const cnts=a=>a.filter(([n])=>n>0).map(([n,s,p])=>`${n} ${n===1?s:p}`).join(' · ');
const lastNote=o=>{const n=(o.notes||[]).filter(x=>!/^Status: /.test(x.t)).sort((a,b)=>b.d-a.d)[0];return n?`<div class="mu">Zuletzt ${fmt(n.d)}: ${esc(n.t.length>52?n.t.slice(0,52)+' …':n.t)}</div>`:''};
function notesBlock(o,key,ph){const l=o.notes||[];
 return h2('Notizen und Stand',l.length)+(l.length?`<div class="card">${l.slice().sort((a,b)=>b.d-a.d).map(n=>`<div class="note${n.u===user?' me':''}"><div class="nh">${esc(n.u)} · ${fmt(n.d)}${n.s?` · <span class="tg t3">${esc(n.s)}</span>`:''}</div>${esc(n.t)}</div>`).join('')}</div>`:empty('Noch keine Einträge','Halte hier fest, was besprochen wurde — dein Bruder sieht es sofort.'))+
 `<div class="card"><textarea id="nn_t" style="min-height:84px" placeholder="${esc(ph)}" aria-label="Neue Notiz"></textarea><button class="p s" data-addnote="${key}" style="margin-top:10px">Eintrag speichern</button></div>`}
function contactBlock(o,key){const ids=o.contacts||[],items=ids.map(i=>contacts.find(c=>c.id===i)).filter(Boolean);
 return h2('Kontakte',items.length)+listOf(items.map(c=>`<div class="card row sp" style="flex-wrap:nowrap"><div style="min-width:0"><b>${esc(c.n)}</b><div class="mu">${esc(c.r)}</div></div><div class="row" style="gap:2px;flex-wrap:nowrap">${call(c)}<button class="ic" data-unlink="${key}|${c.id}" aria-label="Verknüpfung zu ${esc(c.n)} entfernen">${ic('x')}</button></div></div>`),empty('Noch keine verknüpft','Unten einen Kontakt auswählen und verknüpfen.'))+
 `<div class="row" style="flex-wrap:nowrap;margin-top:8px"><select id="lk_sel" aria-label="Kontakt verknüpfen"><option value="">Kontakt verknüpfen …</option>${CL.map(cl=>{const x=contacts.filter(c=>c.cl===cl&&!ids.includes(c.id)).sort(byName);return x.length?`<optgroup label="${cl}">${x.map(c=>`<option value="${c.id}">${esc(c.n)} · ${esc(c.r)}</option>`).join('')}</optgroup>`:''}).join('')}</select><button class="s" data-link="${key}">${ic('link')}Verknüpfen</button></div>`}
function taskBlock(k,id,th,list){const key=`${k}:${id}:${th}`,ts=list||tasksFor(k,id);
 return `<div class="row sp">${h2('Aufgaben',ts.filter(t=>t.st!==3).length+' offen')}<button class="s" data-nt="${key}">${newTaskFor===key?'Abbrechen':ic('plus')+'Aufgabe'}</button></div>${newTaskFor===key?`<div class="card"><input id="nt2" placeholder="Was ist zu tun?" aria-label="Aufgabe"><div class="row" style="margin-top:10px;flex-wrap:nowrap"><select id="nt2w" aria-label="Zuständig">${opts(WHO(),user)}</select><button class="p s" data-addt2="${key}">Anlegen</button></div></div>`:''}${ts.length?ts.map(trow).join(''):empty('Keine Aufgaben','Was hier offen ist, taucht auch in der Aufgabenliste auf.')}`}

function trow(t){const o=openT===t.id;
 let h=`<div class="blk tk c${ti(t.th)}${t.st===3?' old':''}" data-open="${t.id}"><div class="row sp" style="flex-wrap:nowrap;gap:10px;align-items:flex-start"><b class="apt">${esc(t.t)}</b>
 <select class="ss ${stc(t.st)}" data-st="${t.id}" aria-label="Status: ${ST[t.st]}" title="${ST[t.st]}">${SS.map((x,i)=>`<option value="${i}" ${i===t.st?'selected':''}>${x}</option>`).join('')}</select></div>
 <div class="row" style="margin-top:9px;gap:6px"><span class="tg">${esc(t.th)}</span>${linkTag(t)}${av(t.who)}${t.c.length?`<span class="mu row" style="gap:3px">${ic('chat')}${t.c.length}</span>`:''}</div>`;
 if(o)h+=`<div class="ed"><label for="e_t">Titel</label><input id="e_t" value="${esc(t.t)}">
 <div class="fg"><div><label for="e_th">Thema</label><select id="e_th">${opts(TH,t.th)}</select></div><div><label for="e_w">Zuständig</label><select id="e_w">${opts(WHO(),t.who)}</select></div></div>
 <label for="e_p">Priorität</label><select id="e_p">${opts(['hoch','mittel','niedrig'],t.pr)}</select>
 <label for="e_link">Zuordnung (Nutzer / Wohnobjekt)</label><select id="e_link">${linkOpts(t.link?t.link.k+':'+t.link.id:'')}</select>
 <div class="row" style="margin-top:14px"><button class="p s" data-save="${t.id}">Speichern</button><button class="s" data-arch="${t.id}">Archivieren</button></div>
 <label style="margin-bottom:0">Kommentare</label>${t.c.map(c=>`<div class="note${c.u===user?' me':''}"><div class="nh">${esc(c.u)} · ${c.t}</div>${esc(c.x)}</div>`).join('')||'<div class="mu" style="margin:8px 0">Noch keine.</div>'}
 <div class="row" style="margin-top:8px;flex-wrap:nowrap"><input id="c_x" placeholder="Kommentar schreiben"><button class="s" data-cm="${t.id}">Senden</button></div></div>`;
 return h+'</div>'}

/* ---------- Aufgaben (Startbildschirm) ---------- */
function hero(){return `<div class="hero" role="img" aria-label="Foto von ${esc(CARE)}" style="background-color:#2b2824;background-image:linear-gradient(180deg,rgba(0,0,0,0) 38%,rgba(0,0,0,.74)),url(${PHOTO})"><div><div class="hn">${esc(CARE)}</div><div class="hs">Alles für den Papa, alles für den Club.</div></div></div>`}
function vTasks(){const base=tasks.filter(t=>!t.arch&&(tp==='alle'||t.who===tp||t.who==='Beide')),cnt=h=>base.filter(t=>t.st!==3&&(h==='alle'||t.th===h)).length;
 const list=base.filter(t=>tth==='alle'||t.th===tth),arch=tasks.filter(t=>t.arch);
 const form=showNew?sheet('Neue Aufgabe',`<label for="nt">Titel</label><input id="nt" placeholder="Was ist zu tun?">
 <div class="fg"><div><label for="nth">Thema</label><select id="nth">${opts(TH,tth==='alle'?'Gesundheit':tth)}</select></div><div><label for="nw">Zuständig</label><select id="nw">${opts(WHO(),user)}</select></div></div>
 <label for="nlink">Zuordnung (Nutzer / Wohnobjekt, optional)</label><select id="nlink">${linkOpts('')}</select>
 <div id="err" class="err mu" style="margin-top:10px"></div>`,`<button class="p" id="add">Aufgabe anlegen</button>`):'';
 const secs=ST.map((s,i)=>{const x=list.filter(t=>t.st===i);if(!x.length)return '';
  if(i===3)return `<div class="row sp">${h2('Erledigt',x.length)}<button class="s gh" data-sd="1">${showDone?'Ausblenden':'Anzeigen'}</button></div>${showDone?x.map(trow).join(''):''}`;
  return h2(s,x.length)+x.map(trow).join('')}).join('');
 return `${hero()}${remBlock(false)}<div class="ph2"><h1 class="pt">Aufgaben</h1><button class="p s" data-new="1">${showNew?'Abbrechen':ic('plus')+'Aufgabe'}</button></div>${form}
 ${tabs(['alle',...PE].map(x=>[x,x==='alle'?'Alle':x]),tp,'tp')}
 ${chips(['alle',...TH].map(x=>[x,`${x==='alle'?'':`<span class="dot t${ti(x)}"></span>`}${x==='alle'?'Alle Themen':x} (${cnt(x)})`]),tth,'th')}
 ${secs||empty('Keine Aufgaben für diese Auswahl','Anderen Filter wählen oder oben eine Aufgabe anlegen.')}
 ${arch.length?`<div class="row sp">${h2('Archiv',arch.length)}<button class="s gh" data-sa="1">${showArch?'Ausblenden':'Anzeigen'}</button></div>`:''}${showArch?listOf(arch.map(t=>`<div class="card row sp"><div style="min-width:0"><b>${esc(t.t)}</b><div class="mu">${t.th}</div></div><button class="s" data-unarch="${t.id}">Wiederherstellen</button></div>`),''):''}`}

/* ---------- Kontakte ---------- */
function vContacts(){
 const form=showNewK?sheet('Neuer Kontakt',`<label for="nk_n">Name</label><input id="nk_n">
 <label for="nk_r">Funktion</label><input id="nk_r" placeholder="z. B. Hausarzt, Hausmeister, Mieter Wohnung 3">
 <label for="nk_cl">Kategorie</label><select id="nk_cl">${opts(CL,kcl==='alle'?CL[0]:kcl)}</select>
 <div class="fg"><div><label for="nk_t">Telefon</label><input id="nk_t" type="tel"></div><div><label for="nk_m">E-Mail (optional)</label><input id="nk_m" type="email"></div></div>
 <label for="nk_note">Notiz (optional)</label><input id="nk_note" placeholder="z. B. nur vormittags erreichbar">
 <div class="err mu" style="margin-top:10px">${esc(kerr)}</div>`,`<button class="p" data-addk="1">Kontakt speichern</button>`):'';
 return `${form}<div class="srch">${ic('search')}<input id="kq" type="search" placeholder="Name, Funktion oder Notiz" value="${esc(kq)}" aria-label="Kontakte suchen"></div>
 ${tabs(['alle',...CL].map(x=>[x,x==='alle'?'Alle':x]),kcl,'kc')}<div id="cl"></div>`}
function kList(){const q=kq.trim().toLowerCase();
 const f=contacts.filter(c=>(kcl==='alle'||c.cl===kcl)&&(!q||(c.n+' '+c.r+' '+c.cl+' '+(c.note||'')).toLowerCase().includes(q))).sort(byName);
 const card=c=>{const ua=appts.filter(a=>a.arzt===c.id).length,ln=[...units,...homes].filter(o=>(o.contacts||[]).includes(c.id)).length,used=c.m?tpls.filter(t=>t.to===c.n).map(t=>t.n):[];
  const ed=openK===c.id?`<div class="ed"><label for="ek_n">Name</label><input id="ek_n" value="${esc(c.n)}"><label for="ek_r">Funktion</label><input id="ek_r" value="${esc(c.r)}"><label for="ek_cl">Kategorie</label><select id="ek_cl">${opts(CL,c.cl)}</select>
  <div class="fg"><div><label for="ek_t">Telefon</label><input id="ek_t" type="tel" value="${esc(c.t)}"></div><div><label for="ek_m">E-Mail</label><input id="ek_m" type="email" value="${esc(c.m||'')}"></div></div>
  <label for="ek_note">Notiz</label><textarea id="ek_note" style="min-height:76px">${esc(c.note||'')}</textarea>
  <div class="row" style="margin-top:14px"><button class="p s" data-ksave="${c.id}">Speichern</button></div><div class="err mu">${esc(kerr)}</div></div>`:'';
  return `<div class="card tk" data-openk="${c.id}"><div class="row sp" style="flex-wrap:nowrap;gap:10px;align-items:flex-start">${iconBadge(KICN[c.cl]||'note',KCOL[c.cl]||'c3')}<div style="min-width:0;flex:1"><b>${esc(c.n)}</b><div class="mu">${esc(c.r)}</div>${c.note?`<div class="mu row" style="margin-top:3px;gap:5px;flex-wrap:nowrap"><span style="display:flex;flex:none">${ic('note')}</span>${esc(c.note)}</div>`:''}</div><span style="white-space:nowrap"><button class="ic" data-edk="${c.id}" aria-label="${esc(c.n)} bearbeiten">${ic('pen')}</button><button class="ic" data-del="c:${c.id}" aria-label="${esc(c.n)} löschen">${ic('trash')}</button></span></div>
  ${del==='c:'+c.id?confirmBox(`Kontakt „${esc(c.n)}“ wirklich löschen?${used.length?` Er ist noch Empfänger der Vorlage ${esc(used.join(', '))}.`:''}${ua?` Er ist noch in ${ua} Termin(en) eingetragen.`:''}${ln?` Er ist noch mit ${ln} Eintrag/Einträgen (Nutzer, Wohnobjekte) verknüpft.`:''}`):`<div class="row" style="margin-top:10px">${call(c)}${c.m?`<a class="call alt" href="mailto:${esc(c.m)}">${ic('mail')}E-Mail</a>`:''}</div>`}${ed}</div>`};
 $('#cl').innerHTML=CL.map(cl=>{const x=f.filter(c=>c.cl===cl);return x.length?h2(`<span class="dot ${KCOL[cl]||'c3'}"></span>${esc(cl)}`,x.length)+listOf(x.map(card),''):''}).join('')||empty('Keine Kontakte gefunden',q?'Andere Schreibweise versuchen oder oben „Kontakt“ anlegen.':'Mit „Kontakt“ oben Ärzte, Handwerker und Mieter anlegen.')}

/* ---------- Urlaub ---------- */
function draftsUI(){if(!drafts.length)return empty('Keine Entwürfe','Welche E-Mails hier erscheinen, legst du in den Einstellungen unter E-Mail-Entwürfe fest.');
 let i=drafts.findIndex(x=>x.tid===dTab);if(i<0)i=0;const d=drafts[i];dTab=d.tid;
 return `${tabs(drafts.map(x=>[x.tid,(x.s==='Entwurf'?'':'✓ ')+esc(x.name)]),d.tid,'dr')}
 <div class="card"><div class="row sp"><b>${esc(d.name)}</b><span class="badge">${d.s}</span></div><div class="mu ${d.ok?'':'warn'}" style="margin-top:2px">An: ${esc(d.to)}</div>
 <label for="b${i}">Betreff</label><input id="b${i}" data-subj="${i}" value="${esc(d.sub)}"><label for="x${i}">Text</label><textarea id="x${i}" data-body="${i}">${esc(d.body)}</textarea>
 <div class="row" style="margin-top:12px"><button class="s" data-cp="${i}">${ic('copy')}Kopieren</button><button class="s" data-sent="${i}">${ic('check')}Als gesendet markieren</button></div></div>`}
function vTrip(){const n=days();
 return `<div class="card c2" style="background:var(--f);border-color:transparent"><div class="fg"><div><label style="margin-top:0" for="tf">Reisebeginn</label><input id="tf" type="date" value="${trip.from}"></div><div><label style="margin-top:0" for="tt">Reiseende</label><input id="tt" type="date" value="${trip.to}"></div></div>
 <label for="tg">Grund (optional)</label><input id="tg" value="${esc(trip.grund)}" placeholder="z. B. Familienbesuch, Kur">
 <div class="mu" style="margin-top:10px">${n?`Zeitraum: <b>${n} Tage</b>`:'<span class="err">Bitte gültigen Zeitraum wählen</span>'}</div></div>
 <div class="row sp">${h2('E-Mail-Entwürfe')}<button class="s gh" data-tab="settings" data-set="mail">${ic('pen')}Vorlagen ändern</button></div>
 ${draftsUI()}
 <div class="mu" style="margin-top:10px">Es wird nichts versendet. „Gesendet“ markiert ihr selbst.</div>`}

/* ---------- Demenzwohnen ---------- */
function vWohnen(){
 if(homeOpen){const h=homes.find(x=>x.id===homeOpen);if(h)return vHome(h);homeOpen=null}
 const nav=tabs([['obj','Objekte'],['stand','Aktueller Stand']],wTab,'wt');
 const form=showNewH?sheet('Neues Wohnobjekt',`<label for="nh_n">Name des Objekts</label><input id="nh_n" placeholder="z. B. Demenz-WG Beispielstraße">
 <label for="nh_art">Wohnkonzept</label><select id="nh_art">${opts(HART,HART[0])}</select>
 <div class="err mu" style="margin-top:10px">${esc(kerr)}</div>`,`<button class="p" data-addh="1">Objekt anlegen</button>`):'';
 const sorted=homes.slice().sort((a,b)=>HSTAT.indexOf(a.status)-HSTAT.indexOf(b.status)||byName(a,b));
 let b='';
 if(wTab==='obj')b=sorted.length?sorted.map(h=>{const c=cnts([[openCount('home',h.id),'offene Aufgabe','offene Aufgaben']]);
  return `<button class="blk tk ${HCOL[h.status]||'c3'}" data-oh="${h.id}" style="width:100%;text-align:left;display:block;font-weight:400">
  <div class="apt">${esc(h.n)}</div>
  <div class="apw">${esc(h.art)}${h.kosten?' · '+esc(h.kosten):''}</div>
  ${h.adr?`<div class="mu">${esc(h.adr)}</div>`:''}${lastNote(h)}
  <div class="row" style="margin-top:10px;gap:8px"><span class="rel">${esc(h.status)}</span>${c?`<span class="mu">${c}</span>`:''}</div></button>`}).join('')
  :empty('Noch keine Objekte','Lege jede Einrichtung an, die infrage kommt — mit Stand, Kontakten und Aufgaben an einem Ort.');
 else b=sorted.length?`<div class="card wrap" style="padding:0"><table><tr><th>Objekt</th><th>Art</th><th>Status</th><th>Letzter Eintrag</th><th>Offen</th></tr>${sorted.map(h=>{const n=(h.notes||[]).slice().sort((a,c)=>c.d-a.d)[0];return `<tr><td><button class="s gh" data-oh="${h.id}" style="padding:0;min-height:0;font-weight:650">${esc(h.n)}</button></td><td>${esc(h.art)}</td><td>${esc(h.status)}</td><td>${n?fmt(n.d)+': '+esc(n.t.length>40?n.t.slice(0,40)+' …':n.t):'–'}</td><td>${openCount('home',h.id)}</td></tr>`}).join('')}</table></div>`:empty('Noch keine Objekte','Sobald Objekte angelegt sind, stehen sie hier nebeneinander zum Vergleich.');
 return form+nav+b}
function vHome(h){const key='home:'+h.id;
 return `<button class="s gh" data-oh="" style="margin:4px 0 2px;padding-left:4px">${ic('back')}Alle Objekte</button>
 <div class="row sp" style="margin:6px 0 12px;flex-wrap:nowrap;gap:10px;align-items:flex-start"><b class="ttl-l">${esc(h.n)}</b><button class="ic" data-del="h:${h.id}" aria-label="Objekt löschen">${ic('trash')}</button></div>
 ${del==='h:'+h.id?confirmBox(`Objekt „${esc(h.n)}“ wirklich löschen? Verknüpfte Aufgaben bleiben erhalten.`):''}
 <div class="card"><label style="margin-top:0" for="hf_status">Status</label><select id="hf_status">${opts(HSTAT,h.status)}</select>
 <label for="hf_n">Name</label><input id="hf_n" value="${esc(h.n)}">
 <label for="hf_art">Wohnkonzept</label><select id="hf_art">${opts(HART,h.art)}</select>
 <label for="hf_adr">Adresse</label><input id="hf_adr" value="${esc(h.adr||'')}">
 <label for="hf_kosten">Kosten / Konditionen</label><input id="hf_kosten" value="${esc(h.kosten||'')}">
 <label for="hf_beschr">Beschreibung</label><textarea id="hf_beschr" style="min-height:76px">${esc(h.beschr||'')}</textarea></div>
 ${contactBlock(h,key)}${apptBlock('home',h.id)}${taskBlock('home',h.id,'Wohnen Papa')}${notesBlock(h,key,'z. B. Telefonat, Besichtigung, Rückmeldung')}`}

/* ---------- Immobilie ---------- */
function vImmo(){
 if(unitOpen){const u=units.find(x=>x.id===unitOpen);if(u)return vUnit(u);unitOpen=null}
 const nav=tabs([['over','Übersicht'],['users','Nutzer']],iTab,'it');
 const form=showNewU?sheet('Neuer Nutzer',`<label for="nu_n">Bezeichnung</label><input id="nu_n" placeholder="z. B. Wohnung 3">
 <label for="nu_lage">Lage</label><input id="nu_lage" placeholder="z. B. 1. OG links">
 <label for="nu_nutzer">Nutzer / Mieter</label><input id="nu_nutzer">
 <div class="err mu" style="margin-top:10px">${esc(kerr)}</div>`,`<button class="p" data-addu="1">Nutzer anlegen</button>`):'';
 let b='';
 if(iTab==='over'){const open=tasks.filter(t=>!t.arch&&t.th==='Immobilie'&&t.st!==3),auto=contacts.filter(c=>c.cl==='Immobilie Nürnberg'||c.cl==='Handwerker').sort(byName);
  b=`<div class="row" style="gap:10px;flex-wrap:nowrap"><div class="blk c0" style="flex:1;margin:10px 0"><div class="num">${units.length}</div><div class="mu">${units.length===1?'Nutzer':'Nutzer insgesamt'}</div></div><div class="blk ${open.length?'c4':'c2'}" style="flex:1;margin:10px 0"><div class="num">${open.length}</div><div class="mu">${open.length===1?'offene Aufgabe':'offene Aufgaben'}</div></div></div>
  ${taskBlock('prop','prop','Immobilie',tasks.filter(t=>!t.arch&&t.th==='Immobilie'))}
  ${h2('Kontakte zur Immobilie',auto.length)}${listOf(auto.map(c=>`<div class="card row sp" style="flex-wrap:nowrap"><div style="min-width:0"><b>${esc(c.n)}</b><div class="mu">${esc(c.cl)} · ${esc(c.r)}</div></div>${call(c)}</div>`),empty('Noch keine Kontakte','Lege sie unter Kontakte mit der Kategorie „Immobilie Nürnberg“ oder „Handwerker“ an — sie erscheinen dann hier.'))}
  ${notesBlock(prop,'prop:prop','Allgemeine Notizen zur Immobilie')}`}
 else b=listOf(units.slice().sort(byName).map(u=>{const c=cnts([[openCount('unit',u.id),'offene Aufgabe','offene Aufgaben'],[(u.contacts||[]).length,'Kontakt','Kontakte']]);
  return `<button class="card tk" data-ou="${u.id}" style="width:100%;text-align:left;display:block;font-weight:400"><div class="row" style="flex-wrap:nowrap;gap:10px;align-items:flex-start">${ini((u.n.match(/\d+/)||[u.n])[0],'c0')}<div style="min-width:0;flex:1"><div class="row sp" style="flex-wrap:nowrap;gap:8px"><b class="ttl">${esc(u.n)}</b><span class="mu">${esc(u.lage||'')}</span></div><div class="mu">${u.nutzer?esc(u.nutzer):'Kein Nutzer eingetragen'}</div>${lastNote(u)}${c?`<div class="mu">${c}</div>`:''}</div></div></button>`}),
  `<div class="empty"><b>Noch keine Nutzer eingetragen</b>Für ein Haus mit acht Parteien legen wir die Wohnungen auf einen Schlag an.<div style="margin-top:12px"><button class="s" data-seed8="1">${ic('plus')}8 Wohnungen als Vorlage anlegen</button></div></div>`);
 return form+nav+b}
function vUnit(u){const key='unit:'+u.id;
 return `<button class="s gh" data-ou="" style="margin:4px 0 2px;padding-left:4px">${ic('back')}Alle Nutzer</button>
 <div class="row sp" style="margin:6px 0 12px;flex-wrap:nowrap;gap:10px;align-items:flex-start"><b class="ttl-l">${esc(u.n)}</b><button class="ic" data-del="u:${u.id}" aria-label="Nutzer löschen">${ic('trash')}</button></div>
 ${del==='u:'+u.id?confirmBox(`„${esc(u.n)}“ wirklich löschen? Verknüpfte Aufgaben bleiben erhalten.`):''}
 <div class="card"><label style="margin-top:0" for="uf_n">Bezeichnung</label><input id="uf_n" value="${esc(u.n)}">
 <label for="uf_lage">Lage</label><input id="uf_lage" value="${esc(u.lage||'')}">
 <label for="uf_nutzer">Nutzer / Mieter</label><input id="uf_nutzer" value="${esc(u.nutzer||'')}"></div>
 ${contactBlock(u,key)}${apptBlock('unit',u.id)}${taskBlock('unit',u.id,'Immobilie')}${notesBlock(u,key,'z. B. Schlüsselübergabe, Mängel, Absprachen')}`}

/* ---------- Einstellungen ---------- */
function vSet(){const head=tabs([['mail','E-Mail-Entwürfe'],['kal','Kalender'],['konto','Person'],['prot','Protokoll']],setTab,'sett');
 if(setTab==='kal'){const https=location.origin+FEED,web='webcal://'+location.host+FEED;
  return `${head}<div class="card"><b>Einzelne Termine</b><div class="mu" style="margin-top:3px">Bei jedem Termin gibt es „Zum Kalender“. Auf dem iPhone öffnet sich der Kalender mit dem Termin, mit Turnus und Erinnerung.</div></div>
  <div class="card"><b>Alle Termine laufend abonnieren</b><div class="mu" style="margin:3px 0 12px">Neue und geänderte Termine erscheinen danach automatisch im Kalender.</div><a class="call" href="${esc(web)}">${ic('calx')}Kalender abonnieren</a>
  <label for="feedurl">Oder Adresse kopieren</label><input id="feedurl" readonly data-sel="1" value="${esc(https)}" aria-label="Adresse zum Abonnieren">
  <div class="alert" style="margin-top:12px">Wer diese Adresse kennt, sieht alle Termine. Bitte nicht weitergeben. Zum Sperren der Adresse SESSION_SECRET ändern.</div></div>`}
 if(setTab==='prot')return `${head}${logs.length?`<div class="card">${logs.map(l=>`<div class="kv"><dt>${l.t} · ${esc(l.u)}</dt><dd>${esc(l.m)}</dd></div>`).join('')}</div>`:empty('Noch nichts protokolliert','Jede Änderung von dir oder deinem Bruder erscheint hier mit Uhrzeit.')}`;
 if(setTab==='konto')return `${head}<div class="card"><b>Ich bin</b><div class="mu" style="margin:3px 0 10px">Aufgaben und Einträge werden dieser Person zugeordnet.</div>${chips(PE.map(p=>[p,p]),user,'login')}</div>
  <div class="card"><b>App sperren</b><div class="mu" style="margin:3px 0 10px">Auf diesem Gerät wieder nach dem Familiencode fragen.</div><button class="s" id="lock">${ic('lock')}Sperren</button></div>`;
 const k=tpls.find(x=>x.id===tplSel)||tpls[0],names=[...new Set(contacts.filter(c=>c.m).map(c=>c.n))];
 return `${head}<div class="row sp" style="margin-bottom:8px;gap:10px"><span class="mu" style="flex:1">Aktive Vorlagen (✓) erzeugen im Urlaubsassistenten einen Entwurf.</span><button class="s" data-newt="1">${ic('plus')}Vorlage</button></div>
 ${tabs(tpls.map(t=>[t.id,(t.on?'✓ ':'')+esc(t.n)]),k.id,'tpl')}
 <div class="card"><label class="ck"><input type="checkbox" id="tp_on" ${k.on?'checked':''}> Bei Urlaub einen Entwurf erstellen</label>
 <label for="tp_n">Name</label><input id="tp_n" value="${esc(k.n)}">
 <label for="tp_to">Empfänger (Kontakte mit E-Mail)</label><select id="tp_to"><option value="">– bitte wählen –</option>${names.map(n=>`<option ${n===k.to?'selected':''}>${esc(n)}</option>`).join('')}</select>
 <label for="tp_sub">Betreff</label><input id="tp_sub" value="${esc(k.sub)}"><label for="tp_body">Text</label><textarea id="tp_body">${esc(k.body)}</textarea>
 <div class="mu" style="margin-top:10px">Platzhalter: {von} {bis} {tage} {grund}. Zeilen mit {grund} entfallen, wenn kein Grund eingetragen ist. Keine Gesundheitsdetails im Betreff.</div></div>`}

/* ---------- Einstiegsbildschirme ---------- */
function vLogin(){return `<div style="margin-top:64px"><h1 class="pt" style="font-size:var(--f8)">Wer bist du?</h1><div class="lead">Danach siehst du deine Aufgaben. Das lässt sich jederzeit oben ändern.</div>
 <div class="row" style="flex-direction:column;align-items:stretch;gap:10px">${PE.map((p,i)=>`<button class="p" style="min-height:54px;justify-content:flex-start;gap:12px" data-login="${esc(p)}"><span class="av a${i+1}" style="width:28px;height:28px;font-size:13px;border:0">${esc(p[0])}</span>${esc(p)}</button>`).join('')}</div></div>`}
function vCode(){return `<div style="margin-top:64px"><h1 class="pt" style="font-size:var(--f8)">Pflegezentrale</h1><div class="lead">Bitte den Familiencode eingeben. Danach bleibt dieses Gerät angemeldet.</div>
 <div class="card"><label style="margin-top:0" for="fc">Familiencode</label><input id="fc" type="password" autocomplete="current-password" aria-label="Familiencode"><button class="p" id="fcgo" style="margin-top:14px;width:100%;min-height:48px">Öffnen</button><div class="err mu" style="margin-top:10px" role="alert">${esc(codeErr)}</div></div></div>`}
const vErr=()=>`<div style="margin-top:64px">${empty('Die Daten konnten nicht geladen werden','Prüfe die Verbindung und versuche es noch einmal.')}<button class="p" data-reload="1" style="margin-top:4px">Neu laden</button></div>`;

function render(){
 if(phase!=='ready'){$('#hu').innerHTML='';$('#nv').hidden=true;$('#v').innerHTML=phase==='code'?vCode():phase==='error'?vErr():'<div class="mu" style="margin-top:64px;text-align:center">Lade …</div>';return}
 $('#hu').innerHTML=user?`<button class="s gh" data-logout="1" aria-label="Person wechseln">${ic('user')}${esc(user)}</button><button class="ic" data-tab="settings" aria-label="Einstellungen">${ic('gear')}</button>`:'';
 $('#nv').hidden=!user;if(!user){$('#v').innerHTML=vLogin();return}
 const mine=tasks.filter(t=>!t.arch&&t.st!==3&&(t.who===user||t.who==='Beide')).length;
 const attn=dueRem().length+upcoming().filter(x=>needsHin(x.a)&&(x.a.hin||'offen')==='offen'&&dayDiff(x.occ)<=14).length;
 const BD={aufgaben:mine?`<span class="nb">${mine}</span>`:'',termine:attn?`<span class="nb w">${attn}</span>`:''};
 const T=[['aufgaben','Aufgaben','check'],['termine','Termine','cal'],['kontakte','Kontakte','book'],['urlaub','Urlaub','plane'],['wohnen','Wohnen','home'],['immobilie','Immobilie','build']];
 $('#nav').innerHTML=T.map(([k,n,i])=>`<button data-tab="${k}" aria-current="${tab===k}">${ic(i)}${n}${BD[k]||''}</button>`).join('');
 const TT={termine:'Termine',kontakte:'Kontakte',urlaub:'Urlaub',wohnen:'Demenzwohnen',immobilie:'Immobilie Nürnberg',settings:'Einstellungen'};
 const A={termine:`<button class="p s" data-newap="1">${showNewA?'Abbrechen':ic('plus')+'Termin'}</button>`,kontakte:`<button class="p s" data-newk="1">${showNewK?'Abbrechen':ic('plus')+'Kontakt'}</button>`,
  wohnen:homeOpen?'':`<button class="p s" data-newh="1">${showNewH?'Abbrechen':ic('plus')+'Objekt'}</button>`,immobilie:unitOpen?'':`<button class="p s" data-newu="1">${showNewU?'Abbrechen':ic('plus')+'Nutzer'}</button>`}[tab]||'';
 $('#v').innerHTML=(banner?`<div class="alert" role="alert">${esc(banner)}</div>`:'')+(tab==='aufgaben'?'':`<div class="ph2"><h1 class="pt">${TT[tab]}</h1>${A}</div>`)+{aufgaben:vTasks,termine:vTermine,kontakte:vContacts,urlaub:vTrip,wohnen:vWohnen,immobilie:vImmo,settings:vSet}[tab]()+apSheet();
 if(tab==='kontakte')kList()}
document.addEventListener('click',e=>{const cs=e.target.closest('[data-closesheet]');
 if(cs){closeSheets();render();return}
 const b=e.target.closest('button');
 if(!b){const ap=e.target.closest('[data-opena]');if(ap&&!e.target.closest('select,input,textarea,label,.ed,a')){const id=ap.dataset.opena;openA=openA===id?null:id;showNewA=false;aerr='';apf=openA?apfFrom(appts.find(x=>x.id===id)):null;render();return}
 const kc=e.target.closest('[data-openk]');if(kc&&!e.target.closest('select,input,textarea,label,.ed,a')){openK=openK===kc.dataset.openk?null:kc.dataset.openk;kerr='';render();return}
 const c=e.target.closest('[data-open]');if(c&&!e.target.closest('select,input,textarea,label,.ed')){openT=openT===c.dataset.open?null:c.dataset.open;render()}return}
 const d=b.dataset;
 if(b.id==='fcgo'){doLogin();return}
 if(d.reload){boot();return}
 if(b.id==='lock'){api('POST','/api/logout',{}).then(()=>{phase='code';codeErr='';user=null;render()});return}
 if(banner){banner=''}
 if(d.edk){openK=openK===d.edk?null:d.edk;kerr='';return render()}
 if(d.af){aFilt=d.af;return render()}
 if(d.newapl){const[k,id]=d.newapl.split(':'),o=objOf(d.newapl);tab='termine';aTab='next';showNewA=true;openA=null;aerr='';apf=Object.assign(apfNew(),{art:k==='home'?'wohnen':'immo',link:d.newapl,arzt:(o&&o.contacts&&o.contacts[0])||''});return render()}
 if(d.dr){dTab=d.dr;return render()}
 if(d.at){aTab=d.at;return render()}
 if(d.newap){showNewA=!showNewA;openA=null;aerr='';apf=showNewA?apfNew():null;return render()}
 if(d.goarzt){readForm();tab='kontakte';showNewK=true;kcl='Ärzte';kerr='';return render()}
 if(d.apsave){const f=readForm();if((f.art==='arzt'&&!f.arzt)||!f.what.trim()||!f.date){aerr=f.art==='arzt'?'Bitte Arzt (Kontakt), Anlass und Datum angeben.':'Bitte Anlass und Datum angeben.';return render()}
  let rp=null;if(f.rep!=='none'){rp=f.rep==='custom'?{n:Math.max(1,parseInt(f.n)||1),u:f.u}:{n:parseInt(f.rep),u:f.rep.slice(-1)}}
  const rec={art:f.art,arzt:f.arzt||'',what:f.what.trim(),date:f.date,time:f.time,rep:rp,rem:+f.rem,note:f.note.trim()};
  if(needsHin({art:f.art}))rec.hin=f.hin||'offen';const lk=parseLink(f.link);if(lk&&['wohnen','immo'].includes(f.art))rec.link=lk;
  if(d.apsave==='new'){appts.push({id:'p'+uid(),...rec});showNewA=false;L(`Termin angelegt: ${rec.what}`)}else{const t=appts.find(x=>x.id===d.apsave);delete t.hin;delete t.link;Object.assign(t,rec);openA=null;L(`Termin geändert: ${rec.what}`)}
  aerr='';apf=null;return render()}
 if(d.apt){const a=appts.find(x=>x.id===d.apt),o=nextOcc(a)||new Date(a.date+'T00:00');tasks.unshift({id:uid(),t:`Termin: ${a.what} (${arztName(a)}) am ${fmt(o)}`,th:'Gesundheit',who:user,st:0,pr:'mittel',c:[]});L(`Aufgabe aus Termin angelegt: ${a.what}`);return render()}
 if(d.login){user=d.login;tab='aufgaben';tp=d.login;try{localStorage.setItem('pz_user',user)}catch(_){}return render()}
 if(d.logout){user=null;openT=null;try{localStorage.removeItem('pz_user')}catch(_){}return render()}
 if(d.tab){tab=d.tab;del=null;if(d.set)setTab=d.set;return render()}
 if(d.tp){tp=d.tp;return render()}
 if(d.th){tth=d.th;return render()}
 if(d.tpl){tplSel=d.tpl;return render()}
 if(d.new){showNew=!showNew;return render()}
 if(d.newk){showNewK=!showNewK;kerr='';return render()}
 if(d.sd){showDone=!showDone;return render()}
 if(d.sa){showArch=!showArch;return render()}
 if(d.kc){kcl=d.kc;del=null;return render()}
 if(d.wt){wTab=d.wt;return render()}
 if(d.it){iTab=d.it;return render()}
 if(d.oh!==undefined){homeOpen=d.oh||null;del=null;newTaskFor=null;return render()}
 if(d.ou!==undefined){unitOpen=d.ou||null;del=null;newTaskFor=null;return render()}
 if(d.newh){showNewH=!showNewH;kerr='';return render()}
 if(d.newu){showNewU=!showNewU;kerr='';return render()}
 if(d.addh){const n=$('#nh_n').value.trim();if(!n){kerr='Bitte einen Namen eintragen.';return render()}const h={id:'h'+uid(),n,art:$('#nh_art').value,status:HSTAT[0],notes:[],contacts:[]};homes.push(h);showNewH=false;kerr='';homeOpen=h.id;L(`Wohnobjekt angelegt: ${n}`);return render()}
 if(d.addu){const n=$('#nu_n').value.trim();if(!n){kerr='Bitte eine Bezeichnung eintragen.';return render()}const u={id:'u'+uid(),n,lage:$('#nu_lage').value.trim(),nutzer:$('#nu_nutzer').value.trim(),notes:[],contacts:[]};units.push(u);showNewU=false;kerr='';unitOpen=u.id;L(`Nutzer angelegt: ${n}`);return render()}
 if(d.seed8){['EG links','EG rechts','1. OG links','1. OG rechts','2. OG links','2. OG rechts','3. OG links','3. OG rechts'].forEach((l,i)=>units.push({id:'u'+uid(),n:'Wohnung '+(i+1),lage:l,nutzer:'',notes:[],contacts:[]}));L('8 Wohnungen als Vorlage angelegt');return render()}
 if(d.addnote){const o=objOf(d.addnote),t=($('#nn_t')||{}).value;if(!o||!t||!t.trim())return;(o.notes=o.notes||[]).push({u:user,d:new Date(),t:t.trim()});L(`Notiz: ${o.n||'Immobilie'}`);return render()}
 if(d.link){const o=objOf(d.link),v=$('#lk_sel').value;if(!o||!v)return;o.contacts=o.contacts||[];if(!o.contacts.includes(v))o.contacts.push(v);const c=contacts.find(x=>x.id===v);L(`Kontakt verknüpft: ${c?c.n:''} mit ${o.n||'Immobilie'}`);return render()}
 if(d.unlink){const[key,cid]=d.unlink.split('|'),o=objOf(key);if(o){o.contacts=(o.contacts||[]).filter(x=>x!==cid)}L('Verknüpfung entfernt');return render()}
 if(d.nt){newTaskFor=newTaskFor===d.nt?null:d.nt;return render()}
 if(d.addt2){const[k,id,th]=d.addt2.split(':'),t=($('#nt2')||{}).value;if(!t||!t.trim())return;tasks.unshift({id:uid(),t:t.trim(),th,who:$('#nt2w').value,st:0,pr:'mittel',c:[],...(k==='prop'?{}:{link:{k,id}})});newTaskFor=null;L(`Aufgabe angelegt: ${t.trim()}`);return render()}
 if(d.ksave){const v=i=>$('#'+i).value.trim(),c=contacts.find(x=>x.id===d.ksave),n=v('ek_n'),t=v('ek_t');if(!n||!t){kerr='Bitte Name und Telefonnummer eintragen.';return render()}
  Object.assign(c,{n,r:v('ek_r')||'–',cl:$('#ek_cl').value,t});if(v('ek_m'))c.m=v('ek_m');else delete c.m;if(v('ek_note'))c.note=v('ek_note');else delete c.note;
  openK=null;kerr='';mkDrafts();L(`Kontakt geändert: ${n}`);return render()}
 if(d.sett){setTab=d.sett;return render()}
 if(d.del){del=d.del;return render()}
 if(d.delno){del=null;return render()}
 if(d.delyes){const[k,id]=del.split(':');
  if(k==='c'){const c=contacts.find(x=>x.id===id);contacts.splice(contacts.indexOf(c),1);mkDrafts();L(`Kontakt gelöscht: ${c.n}`)}
  if(k==='t'){const a=appts.find(x=>x.id===id);appts.splice(appts.indexOf(a),1);openA=null;apf=null;L(`Termin gelöscht: ${a.what}`)}
  if(k==='h'){const h=homes.find(x=>x.id===id);homes.splice(homes.indexOf(h),1);tasks.forEach(t=>{if(t.link&&t.link.k==='home'&&t.link.id===id)delete t.link});homeOpen=null;L(`Wohnobjekt gelöscht: ${h.n}`)}
  if(k==='u'){const u=units.find(x=>x.id===id);units.splice(units.indexOf(u),1);tasks.forEach(t=>{if(t.link&&t.link.k==='unit'&&t.link.id===id)delete t.link});unitOpen=null;L(`Nutzer gelöscht: ${u.n}`)}
  del=null;return render()}
 if(d.newt){const id='t'+uid();tpls.push({id,n:'Neue Vorlage',on:false,to:'',sub:'',body:''});tplSel=id;L('Vorlage angelegt');return render()}
 if(d.addk){const v=i=>$('#'+i).value.trim(),n=v('nk_n'),t=v('nk_t');if(!n||!t){kerr='Bitte Name und Telefonnummer eintragen.';return render()}
  const cl=$('#nk_cl').value,c={id:'k'+uid(),n,r:v('nk_r')||'–',cl,t};if(v('nk_m'))c.m=v('nk_m');if(v('nk_note'))c.note=v('nk_note');
  contacts.push(c);kerr='';showNewK=false;kcl='alle';kq='';L(`Kontakt angelegt: ${n}`);return render()}
 if(b.id==='add'){const t=$('#nt').value.trim();if(!t){$('#err').textContent='Bitte einen Titel eingeben.';return}
  tasks.unshift({id:uid(),t,th:$('#nth').value,who:$('#nw').value,st:0,pr:'mittel',c:[],...(parseLink($('#nlink').value)?{link:parseLink($('#nlink').value)}:{})});showNew=false;L(`Aufgabe angelegt: ${t}`);return render()}
 if(d.save){const k=tasks.find(x=>x.id==d.save),t=$('#e_t').value.trim()||k.t;L(`Aufgabe geändert: „${k.t}“ (Zuständig: ${$('#e_w').value}, Thema: ${$('#e_th').value})`);Object.assign(k,{t,th:$('#e_th').value,who:$('#e_w').value,pr:$('#e_p').value});{const lk=parseLink($('#e_link').value);if(lk)k.link=lk;else delete k.link}openT=null;return render()}
 if(d.arch){const k=tasks.find(x=>x.id==d.arch);k.arch=true;openT=null;L(`Aufgabe archiviert: ${k.t}`);return render()}
 if(d.unarch){const k=tasks.find(x=>x.id==d.unarch);k.arch=false;L(`Aufgabe wiederhergestellt: ${k.t}`);return render()}
 if(d.cm){const x=$('#c_x').value.trim();if(!x)return;const k=tasks.find(y=>y.id==d.cm);k.c.push({u:user,t:new Date().toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'}),x});L(`Kommentar zu „${k.t}“`);return render()}
 if(d.cp!==undefined){const x=drafts[d.cp],txt=`${x.sub}\n\n${x.body}`;
  (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).catch(()=>{const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(_){}a.remove()});
  x.s='Kopiert';L(`Entwurf kopiert: ${x.name}`);return render()}
 if(d.sent!==undefined){drafts[d.sent].s='Als gesendet markiert';L(`Als gesendet markiert: ${drafts[d.sent].name}`);render()}});
document.addEventListener('change',e=>{const t=e.target,id=t.id||'';
 if(id==='ap_rep'){readForm();render();return}
 if(id==='ap_art'){readForm();if(!contactsForArt(apf.art,'').some(c=>c.id===apf.arzt))apf.arzt='';apf.link='';render();return}
 if(t.dataset.hin){const a=appts.find(x=>x.id===t.dataset.hin);a.hin=t.value;L(`Begleitung „${a.what}“: ${hinLabel(t.value)}`);render()}
 if(id.startsWith('hf_')){const h=homes.find(x=>x.id===homeOpen),f={hf_status:'status',hf_n:'n',hf_art:'art',hf_adr:'adr',hf_kosten:'kosten',hf_beschr:'beschr'}[id];
  if(f==='status'&&t.value!==h.status){(h.notes=h.notes||[]).push({u:user,d:new Date(),t:`Status: ${h.status} → ${t.value}`,s:t.value});L(`Wohnobjekt „${h.n}“: ${h.status} → ${t.value}`)}
  h[f]=f==='n'&&!t.value.trim()?h.n:t.value;render()}
 if(id.startsWith('uf_')){const u=units.find(x=>x.id===unitOpen),f={uf_n:'n',uf_lage:'lage',uf_nutzer:'nutzer'}[id];u[f]=f==='n'&&!t.value.trim()?u.n:t.value;L(`Nutzer „${u.n}“ geändert`);render()}
 if(t.dataset.st){const k=tasks.find(x=>x.id==t.dataset.st),o=ST[k.st];k.st=+t.value;L(`„${k.t}“: ${o} → ${ST[k.st]}`);render()}
 if(id==='tf'||id==='tt'||id==='tg'){trip[id==='tf'?'from':id==='tt'?'to':'grund']=t.value;mkDrafts();render()}
 if(id.startsWith('tp_')){const k=tpls.find(x=>x.id===tplSel);if(id==='tp_on')k.on=t.checked;else k[id.slice(3)]=t.value;mkDrafts();L(`Vorlage „${k.n}“ geändert`);render()}
});
document.addEventListener('input',e=>{const t=e.target;if(t.id==='kq'){kq=t.value;kList()}
 if(t.dataset.subj)drafts[t.dataset.subj].sub=t.value;if(t.dataset.body)drafts[t.dataset.body].body=t.value});

// ===== Speicherung auf dem Server =====
const REVS={},SNAP={},CRE={};
const COLS={tasks:()=>tasks,contacts:()=>contacts,appts:()=>appts,tpls:()=>tpls,drafts:()=>drafts,homes:()=>homes,units:()=>units,trip:()=>[trip],prop:()=>[prop]};
let syncing=false,again=false,timer=null;
async function api(method,url,body){try{const r=await fetch(url,{method,headers:{'Content-Type':'application/json','X-Requested-With':'pz','X-Person':user||''},body:body===undefined?undefined:JSON.stringify(body),credentials:'same-origin'});let j=null;try{j=await r.json()}catch(_){}return{ok:r.ok,status:r.status,json:j}}catch(e){return{ok:false,status:0,json:null}}}
function applyState(s){
 CARE=s.config.careName;FEED=s.config.feed||'';PE.splice(0,PE.length,...s.config.people);REV=s.rev;
 for(const c in COLS){REVS[c]=new Map();CRE[c]=new Map();SNAP[c]=new Map()}
 const load=c=>s.items[c].map(x=>{const o=x.data;o.id=x.id;if(Array.isArray(o.notes))o.notes.forEach(n=>n.d=new Date(n.d));REVS[c].set(x.id,x.rev);CRE[c].set(x.id,x.created);return o});
 tasks=load('tasks').sort((a,b)=>new Date(CRE.tasks.get(b.id))-new Date(CRE.tasks.get(a.id)));
 contacts=load('contacts');appts=load('appts');tpls=load('tpls');drafts=load('drafts');homes=load('homes');units=load('units');
 const tr=s.items.trip[0];if(tr){Object.keys(trip).forEach(k=>delete trip[k]);Object.assign(trip,tr.data);REVS.trip.set('trip',tr.rev)}
 const pr=s.items.prop[0];if(pr){Object.keys(prop).forEach(k=>delete prop[k]);Object.assign(prop,pr.data);prop.notes=(prop.notes||[]).map(n=>({...n,d:new Date(n.d)}));REVS.prop.set('prop',pr.rev)}
 logs=s.activity.map(a=>({t:new Date(a.at).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}),u:a.actor||'System',m:a.summary}));
 for(const c in COLS)for(const it of COLS[c]()){if((c==='trip'||c==='prop')&&!REVS[c].has(c))continue;SNAP[c].set(it.id,JSON.stringify(it))}
}
async function reload(){const r=await api('GET','/api/state');if(r.ok&&r.json.items){applyState(r.json);render()}}
function scheduleSync(ms=400){clearTimeout(timer);timer=setTimeout(()=>{timer=null;sync()},ms)}
async function sync(){
 if(phase!=='ready'||!user)return;
 if(syncing){again=true;return}
 syncing=true;
 const flush=pendingToast;pendingToast=false;
 try{do{again=false;
  for(const c of Object.keys(COLS)){
   const seen=new Set();
   for(const it of COLS[c]()){if(!it||!it.id)continue;seen.add(it.id);
    const js=JSON.stringify(it);if(SNAP[c].get(it.id)===js)continue;
    const r=await api('PUT','/api/item',{collection:c,id:it.id,data:JSON.parse(js),baseRev:REVS[c].has(it.id)?REVS[c].get(it.id):null});
    if(r.ok){REVS[c].set(it.id,r.json.rev);SNAP[c].set(it.id,js)}
    else if(r.status===409){banner='Jemand hat gleichzeitig etwas geändert. Die Ansicht wurde aktualisiert, bitte die Änderung noch einmal machen.';await reload();return}
    else if(r.status===401){phase='code';render();return}
    else{banner='Speichern hat nicht geklappt. Es wird erneut versucht.';render();scheduleSync(5000);return}
   }
   for(const id of [...SNAP[c].keys()]){if(seen.has(id)||c==='trip'||c==='prop')continue;
    const r=await api('DELETE',`/api/item?collection=${c}&id=${encodeURIComponent(id)}`);
    if(r.ok||r.status===404){SNAP[c].delete(id);REVS[c].delete(id)}
    else if(r.status===401){phase='code';render();return}
    else{banner='Löschen hat nicht geklappt. Es wird erneut versucht.';render();scheduleSync(5000);return}
   }
  }
  if(PENDING.length){const e=PENDING.splice(0);const r=await api('POST','/api/log',{entries:e});if(!r.ok)PENDING.unshift(...e)}
 }while(again)
  if(flush&&!banner)toast('Gespeichert');
 }finally{syncing=false}
}
['click','change','input'].forEach(ev=>document.addEventListener(ev,()=>scheduleSync()));
async function poll(){
 if(phase!=='ready'||document.hidden||syncing||timer)return;
 if(openT||openA||openK||showNew||showNewK||showNewA||showNewH||showNewU||newTaskFor)return;
 if(($('#nn_t')&&$('#nn_t').value)||($('#nt2')&&$('#nt2').value))return;
 const ae=document.activeElement;if(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)&&$('#v').contains(ae))return;
 const r=await api('GET','/api/state?rev='+encodeURIComponent(REV));
 if(r.status===401){phase='code';render();return}
 if(r.ok&&r.json&&!r.json.unchanged){applyState(r.json);render()}
}
async function doLogin(){const c=$('#fc').value;if(!c)return;const r=await api('POST','/api/login',{code:c});
 if(r.ok){codeErr='';boot()}else{codeErr=r.status===429?'Zu viele Versuche. Bitte später erneut versuchen.':r.status===401?'Der Code stimmt nicht.':'Das hat nicht geklappt. Bitte erneut versuchen.';render()}}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='fc')doLogin();
 if(e.key==='Escape'&&(showNew||showNewK||showNewA||showNewH||showNewU||openA)){closeSheets();render()}});
async function boot(){
 phase='loading';render();
 const r=await api('GET','/api/state');
 if(r.status===401){phase='code';render();return}
 if(!r.ok||!r.json||!r.json.items){phase='error';render();return}
 applyState(r.json);
 let u=null;try{u=localStorage.getItem('pz_user')}catch(_){}
 user=PE.includes(u)?u:null;tp=user||'alle';
 if(!drafts.length)mkDrafts();
 phase='ready';render();scheduleSync(0);
}
setInterval(poll,15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});
boot();

document.addEventListener('focusin',e=>{if(e.target&&e.target.dataset&&e.target.dataset.sel)e.target.select()});
['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault()));
