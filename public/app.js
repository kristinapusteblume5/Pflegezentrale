const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const day=n=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);return d};
const fmt=d=>new Date(d).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const ST=['Offen','In Bearbeitung','Wartet auf Rückmeldung','Erledigt'],SS=['Offen','In Arbeit','Wartet','Erledigt'],TH=['Immobilie','Wohnen Papa','Gesundheit','Weitere'],PE=[];
const CL=['Ärzte','Organisatorisch','Demenzwohnen','Immobilie Nürnberg','Mieter','Handwerker'],HSTAT=['Idee','Angefragt','Besichtigung geplant','Besichtigt','Warteliste','Zusage','Absage','Entschieden dagegen'],HART=['Demenz-WG','Pflegeheim','Betreutes Wohnen','Wohnung','Sonstiges'];
const PHOTO='/api/photo';
let showNewA=false,openA=null,aTab='next',apf=null,aerr='';
let user=null,tab='aufgaben',nid=40,tp='alle',tth='alle',showNew=false,showNewK=false,showDone=false,showArch=false,openT=null,kcl='alle',kq='',setTab='mail',tplSel='t1',dTab=null,del=null,kerr='',homeOpen=null,unitOpen=null,wTab='obj',iTab='over',showNewH=false,showNewU=false,newTaskFor=null,openK=null;
const tel=t=>'tel:'+t.replace(/\s/g,'');
let tasks=[],contacts=[],appts=[],tpls=[],drafts=[],logs=[],homes=[],units=[];
let trip={id:'trip',from:iso(day(30)),to:iso(day(37)),grund:''};
let prop={id:'prop',notes:[]};
let FEED='',CARE='',phase='loading',codeErr='',REV='',banner='';
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-5);
const PENDING=[];
const L=m=>{logs.unshift({t:new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}),u:user||'System',m});PENDING.push(m)};
const days=()=>{const a=new Date(trip.from),b=new Date(trip.to);return(isNaN(a)||isNaN(b)||b<a)?0:Math.round((b-a)/864e5)+1};
const mail=n=>(contacts.find(c=>c.n===n&&c.m)||{}).m||null;
const fill=(s,v)=>s.split('\n').filter(l=>!(l.includes('{grund}')&&!v.grund)).join('\n').replace(/\{(\w+)\}/g,(m,k)=>v[k]??m);
function mkDrafts(){const n=days();if(!n){drafts=[];return}const v={von:fmt(trip.from),bis:fmt(trip.to),tage:n,grund:trip.grund.trim()};
 drafts=tpls.filter(t=>t.on).map(t=>{const a=mail(t.to);return{id:t.id,tid:t.id,name:t.n,to:t.to?(a?`${t.to} <${a}>`:`${t.to} (keine E-Mail-Adresse hinterlegt)`):'Kein Empfänger gewählt',ok:!!a,sub:fill(t.sub,v),body:fill(t.body,v),s:'Entwurf'}})}
const stc=i=>['','ac','wa','ok'][i],ti=h=>Math.max(0,TH.indexOf(h));
const tg=h=>`<span class="tg t${ti(h)}">${esc(h)}</span>`,av=w=>`<span class="av" title="${esc(w)}">${esc(w[0])}</span>`;
const opts=(a,v)=>a.map(x=>`<option ${x===v?'selected':''}>${esc(x)}</option>`).join('');
const call=c=>`<a class="call" href="${tel(c.t)}" aria-label="${esc(c.n)} anrufen">📞 ${esc(c.t)}</a>`;
const tabs=(items,cur,key)=>`<div class="tabs" role="tablist">${items.map(([v,l])=>`<button role="tab" data-${key}="${esc(v)}" aria-selected="${cur===v}">${l}</button>`).join('')}</div>`;
const chips=(items,cur,key)=>`<div class="chips">${items.map(([v,l])=>`<button data-${key}="${esc(v)}" aria-pressed="${cur===v}">${l}</button>`).join('')}</div>`;
const confirmBox=(txt)=>`<div class="cf">${txt}<div class="row" style="margin-top:6px"><button class="s dg" data-delyes="1">Löschen</button><button class="s" data-delno="1">Abbrechen</button></div></div>`;

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
const arztName=a=>(contacts.find(c=>c.id===a.arzt)||{n:'(Kontakt gelöscht)'}).n;
const dueRem=()=>upcoming().filter(x=>x.a.rem>0&&dayDiff(x.occ)<=x.a.rem);
const apfNew=()=>({arzt:'',what:'',date:iso(day(14)),time:'09:00',rep:'none',n:'6',u:'m',rem:'7',note:''});
const apfFrom=a=>({arzt:a.arzt,what:a.what,date:a.date,time:a.time||'',rep:repKey(a.rep),n:a.rep?String(a.rep.n):'6',u:a.rep?a.rep.u:'m',rem:String(a.rem||0),note:a.note||''});
function readForm(){const f=Object.assign({},apf||apfNew());['arzt','what','date','time','rep','n','u','rem','note'].forEach(k=>{const e=$('#ap_'+k);if(e)f[k]=e.value});apf=f;return f}
function apForm(f,id){const docs=contacts;
 return `<div class="ed"><label style="margin-top:0">Mit (Kontakt)</label><div class="row" style="flex-wrap:nowrap"><select id="ap_arzt"><option value="">– bitte wählen –</option>${CL.map(cl=>{const x=docs.filter(c=>c.cl===cl).sort(byName);return x.length?`<optgroup label="${cl}">${x.map(c=>`<option value="${c.id}" ${c.id===f.arzt?'selected':''}>${esc(c.n)} · ${esc(c.r)}</option>`).join('')}</optgroup>`:''}).join('')}</select><button class="s" data-goarzt="1" style="white-space:nowrap">＋ Kontakt</button></div>
 <label>Anlass</label><input id="ap_what" value="${esc(f.what)}" placeholder="z. B. Kontrolle, Check-up">
 <div class="row"><div style="flex:1"><label>Datum</label><input id="ap_date" type="date" value="${f.date}"></div><div style="flex:1"><label>Uhrzeit</label><input id="ap_time" type="time" value="${f.time}"></div></div>
 <label>Turnus</label><select id="ap_rep">${REP.map(([v,l])=>`<option value="${v}" ${v===f.rep?'selected':''}>${l}</option>`).join('')}</select>
 ${f.rep==='custom'?`<div class="row" style="flex-wrap:nowrap;margin-top:8px"><span class="mu">Alle</span><input id="ap_n" type="number" min="1" value="${esc(f.n)}" style="width:80px"><select id="ap_u">${[['w','Wochen'],['m','Monate'],['y','Jahre']].map(([v,l])=>`<option value="${v}" ${v===f.u?'selected':''}>${l}</option>`).join('')}</select></div>`:''}
 <label>Erinnerung</label><select id="ap_rem">${REM.map(([v,l])=>`<option value="${v}" ${v===f.rem?'selected':''}>${l}</option>`).join('')}</select>
 <label>Notiz (optional)</label><input id="ap_note" value="${esc(f.note)}"><div class="mu" style="margin-top:6px">Bitte keine Diagnosen oder Befunde eintragen.</div><div class="err mu">${esc(aerr)}</div>
 <div class="row" style="margin-top:8px"><button class="p s" data-apsave="${id}">Speichern</button>${id!=='new'?`<button class="s" data-apt="${id}">Als Aufgabe</button><button class="s gh" data-del="t:${id}">🗑 Löschen</button>`:''}</div></div>`}
function acard(a,occ){const o=openA===a.id,dd=dayDiff(occ),due=a.rem>0&&dd>=0&&dd<=a.rem,doc=contacts.find(c=>c.id===a.arzt),rl=(REM.find(r=>r[0]===String(a.rem))||[])[1];
 return `<div class="card tk" data-opena="${a.id}" style="${due?'border-color:var(--wa)':''}"><div class="row sp" style="flex-wrap:nowrap"><b style="font-size:15px">${dl(occ)}${a.time?` · ${a.time}`:''}</b>${dd>=0?`<span class="mu">${rel(dd)}</span>`:''}</div>
 <div style="margin-top:2px">${esc(a.what)}</div><div class="mu">${esc(doc?doc.n+' · '+doc.r:'(Kontakt gelöscht)')}</div>
 <div class="row" style="margin-top:6px;gap:6px"><span class="tg t3">${repLabel(a.rep)}</span>${a.rem>0?`<span class="tg t3">🔔 ${rl||a.rem+' Tage vorher'}</span>`:''}</div>
 <div style="margin-top:8px"><a class="call alt" href="/api/ics?id=${a.id}">📅 Zum Kalender</a></div>
 ${due?`<div class="warn mu" style="margin-top:6px">Erinnerung: Termin ${rel(dd)}</div>`:''}
 ${del==='t:'+a.id?confirmBox(`Termin „${esc(a.what)}“ wirklich löschen${a.rep?' (die ganze Serie)':''}?`):''}
 ${o?apForm(apf||apfFrom(a),a.id)+(doc?`<div class="row" style="margin-top:8px">${call(doc)}</div>`:''):''}</div>`}
const remBlock=(btn)=>{const r=dueRem();return r.length?`<h2>Erinnerungen</h2>${r.map(x=>`<div class="card" style="border-color:var(--wa)"><b>🔔 ${esc(x.a.what)}</b><div class="mu">${rel(dayDiff(x.occ))} · ${dl(x.occ)} · ${esc(arztName(x.a))}</div>${btn?`<button class="s" data-apt="${x.a.id}" style="margin-top:6px">Als Aufgabe anlegen</button>`:''}</div>`).join('')}`:''};
function vTermine(){const up=upcoming(),today=day(0);
 const nav=tabs([['next','Anstehend'],['series','Wiederkehrend'],['past','Vergangen']],aTab,'at');
 const form=showNewA?`<div class="card">${apForm(apf||apfNew(),'new')}</div>`:'';
 let b='';
 if(aTab==='next')b=remBlock(true)+`<h2>Nächste Termine</h2>`+(up.map(x=>acard(x.a,x.occ)).join('')||'<div class="card mu">Keine anstehenden Termine.</div>');
 if(aTab==='series')b=`<h2>Turnus-Termine</h2>`+(up.filter(x=>x.a.rep).map(x=>acard(x.a,x.occ)).join('')||'<div class="card mu">Noch keine wiederkehrenden Termine.</div>');
 if(aTab==='past')b=`<h2>Vergangene Termine</h2>`+(appts.filter(a=>!a.rep&&new Date(a.date+'T00:00')<today).sort((x,y)=>y.date.localeCompare(x.date)).map(a=>acard(a,new Date(a.date+'T00:00'))).join('')||'<div class="card mu">Keine.</div>');
 return form+nav+b+`<div class="mu" style="margin-top:14px">Alle Termine laufend im Kalender: <button class="s gh" data-tab="settings" data-set="kal">Kalender abonnieren</button></div>`}
const byName=(a,b)=>a.n.localeCompare(b.n,'de',{numeric:true});
const parseLink=v=>{if(!v)return null;const i=v.indexOf(':');return{k:v.slice(0,i),id:v.slice(i+1)}};
const linkTarget=l=>l?(l.k==='unit'?units:homes).find(x=>x.id===l.id):null;
const linkTag=t=>t.link?`<span class="tg t3">${esc((linkTarget(t.link)||{n:'(gelöscht)'}).n)}</span>`:'';
const linkOpts=sel=>`<option value="">– keine –</option>${units.length?`<optgroup label="Nutzer Immobilie">${units.slice().sort(byName).map(u=>`<option value="unit:${u.id}" ${sel==='unit:'+u.id?'selected':''}>${esc(u.n)}</option>`).join('')}</optgroup>`:''}${homes.length?`<optgroup label="Wohnobjekte">${homes.slice().sort(byName).map(h=>`<option value="home:${h.id}" ${sel==='home:'+h.id?'selected':''}>${esc(h.n)}</option>`).join('')}</optgroup>`:''}`;
const tasksFor=(k,id)=>tasks.filter(t=>!t.arch&&t.link&&t.link.k===k&&t.link.id===id);
const openCount=(k,id)=>tasksFor(k,id).filter(t=>t.st!==3).length;
const objOf=key=>{const[k,id]=key.split(':');return k==='unit'?units.find(x=>x.id===id):k==='home'?homes.find(x=>x.id===id):k==='prop'?prop:null};
const lastNote=o=>{const n=(o.notes||[]).slice().sort((a,b)=>b.d-a.d)[0];return n?`<div class="mu">Zuletzt ${fmt(n.d)}: ${esc(n.t.length>70?n.t.slice(0,70)+' …':n.t)}</div>`:''};
function notesBlock(o,key,ph){const l=o.notes||[];
 return `<h2>Notizen und Stand (${l.length})</h2>${l.slice().sort((a,b)=>b.d-a.d).map(n=>`<div class="note"><b>${esc(n.u)}</b> · ${fmt(n.d)}${n.s?` · <span class="tg t3">${esc(n.s)}</span>`:''}<br>${esc(n.t)}</div>`).join('')||'<div class="mu">Noch keine Einträge.</div>'}
 <div class="card"><textarea id="nn_t" style="min-height:70px" placeholder="${esc(ph)}" aria-label="Neue Notiz"></textarea><button class="p s" data-addnote="${key}" style="margin-top:10px">Eintrag speichern</button></div>`}
function contactBlock(o,key){const ids=o.contacts||[],items=ids.map(i=>contacts.find(c=>c.id===i)).filter(Boolean);
 return `<h2>Kontakte (${items.length})</h2>${items.map(c=>`<div class="card row sp" style="flex-wrap:nowrap"><div><b>${esc(c.n)}</b><div class="mu">${esc(c.r)}</div></div><div class="row" style="gap:4px;flex-wrap:nowrap">${call(c)}<button class="s gh" data-unlink="${key}|${c.id}" aria-label="Verknüpfung zu ${esc(c.n)} entfernen">✕</button></div></div>`).join('')||'<div class="mu">Noch keine verknüpft.</div>'}
 <div class="row" style="flex-wrap:nowrap;margin-top:6px"><select id="lk_sel" aria-label="Kontakt verknüpfen"><option value="">Kontakt verknüpfen …</option>${CL.map(cl=>{const x=contacts.filter(c=>c.cl===cl&&!ids.includes(c.id)).sort(byName);return x.length?`<optgroup label="${cl}">${x.map(c=>`<option value="${c.id}">${esc(c.n)} · ${esc(c.r)}</option>`).join('')}</optgroup>`:''}).join('')}</select><button class="s" data-link="${key}">Verknüpfen</button></div>`}
function taskBlock(k,id,th,list){const key=`${k}:${id}:${th}`,ts=list||tasksFor(k,id);
 return `<div class="row sp"><h2>Aufgaben (${ts.filter(t=>t.st!==3).length} offen)</h2><button class="s" data-nt="${key}">${newTaskFor===key?'Abbrechen':'＋ Aufgabe'}</button></div>${newTaskFor===key?`<div class="card"><input id="nt2" placeholder="Was ist zu tun?" aria-label="Aufgabe"><div class="row" style="margin-top:8px;flex-wrap:nowrap"><select id="nt2w" aria-label="Zuständig">${opts(PE,user)}</select><button class="p s" data-addt2="${key}">Anlegen</button></div></div>`:''}${ts.map(trow).join('')||'<div class="mu">Keine Aufgaben.</div>'}`}

function trow(t){const o=openT===t.id;
 let h=`<div class="card tk" data-open="${t.id}"><div class="row sp" style="flex-wrap:nowrap"><b style="font-size:15px">${esc(t.t)}</b>
 <select class="ss ${stc(t.st)}" data-st="${t.id}" aria-label="Status: ${ST[t.st]}" title="${ST[t.st]}">${SS.map((x,i)=>`<option value="${i}" ${i===t.st?'selected':''}>${x}</option>`).join('')}</select></div>
 <div class="row" style="margin-top:6px;gap:6px">${tg(t.th)}${linkTag(t)}${av(t.who)}${t.c.length?`<span class="mu">💬 ${t.c.length}</span>`:''}</div>`;
 if(o)h+=`<div class="ed"><label>Titel</label><input id="e_t" value="${esc(t.t)}"><div class="row"><div style="flex:1"><label>Thema</label><select id="e_th">${opts(TH,t.th)}</select></div>
 <div style="flex:1"><label>Zuständig</label><select id="e_w">${opts(PE,t.who)}</select></div></div>
 <label>Priorität</label><select id="e_p">${opts(['hoch','mittel','niedrig'],t.pr)}</select><label>Zuordnung (Nutzer / Wohnobjekt)</label><select id="e_link">${linkOpts(t.link?t.link.k+':'+t.link.id:'')}</select>
 <div class="row" style="margin-top:10px"><button class="p s" data-save="${t.id}">Speichern</button><button class="s" data-arch="${t.id}">Archivieren</button></div>
 <div class="mu2">Kommentare</div>${t.c.map(c=>`<div class="note"><b>${esc(c.u)}</b> · ${c.t}<br>${esc(c.x)}</div>`).join('')||'<div class="mu">Noch keine.</div>'}
 <div class="row" style="margin-top:6px;flex-wrap:nowrap"><input id="c_x" placeholder="Kommentar schreiben"><button class="s" data-cm="${t.id}">Senden</button></div></div>`;
 return h+'</div>'}

function hero(){return `<div class="hero sm" role="img" aria-label="Foto von ${esc(CARE)}" style="background-color:#3d5a52;background-image:linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,.72)),url(${PHOTO})"><div><div class="hn">${esc(CARE)}</div><div class="hs">Gemeinsame Pflegezentrale · Hallo, ${esc(user)}</div></div></div>`}
function vTasks(){const base=tasks.filter(t=>!t.arch&&(tp==='alle'||t.who===tp)),cnt=h=>base.filter(t=>t.st!==3&&(h==='alle'||t.th===h)).length;
 const list=base.filter(t=>tth==='alle'||t.th===tth),arch=tasks.filter(t=>t.arch);
 const form=`<div class="card"><label style="margin-top:0" for="nt">Titel</label><input id="nt" placeholder="Was ist zu tun?">
 <div class="row"><div style="flex:1"><label>Thema</label><select id="nth">${opts(TH,tth==='alle'?'Gesundheit':tth)}</select></div><div style="flex:1"><label>Zuständig</label><select id="nw">${opts(PE,user)}</select></div></div>
 <label>Zuordnung (Nutzer / Wohnobjekt, optional)</label><select id="nlink">${linkOpts('')}</select>
 <button class="p" id="add" style="margin-top:12px">Anlegen</button><div id="err" class="err mu"></div></div>`;
 const secs=ST.map((s,i)=>{const x=list.filter(t=>t.st===i);if(!x.length)return '';
  if(i===3)return `<h2>Erledigt (${x.length}) <button class="s gh" data-sd="1">${showDone?'Ausblenden':'Anzeigen'}</button></h2>${showDone?x.map(trow).join(''):''}`;
  return `<h2>${s} (${x.length})</h2>${x.map(trow).join('')}`}).join('');
 return `${hero()}${remBlock(false)}<div class="ph2"><h1 class="pt">Aufgaben</h1><button class="p s" data-new="1">${showNew?'Abbrechen':'＋ Aufgabe'}</button></div>${showNew?form:''}
 ${tabs(['alle',...PE].map(x=>[x,x==='alle'?'Alle':x]),tp,'tp')}
 ${chips(['alle',...TH].map(x=>[x,`${x==='alle'?'':`<span class="dot t${ti(x)}"></span>`}${x==='alle'?'Alle Themen':x} (${cnt(x)})`]),tth,'th')}
 ${secs||'<div class="card mu">Keine Aufgaben für diese Auswahl.</div>'}
 ${arch.length?`<h2>Archiv (${arch.length}) <button class="s gh" data-sa="1">${showArch?'Ausblenden':'Anzeigen'}</button></h2>`:''}${showArch?arch.map(t=>`<div class="card row sp"><div><b>${esc(t.t)}</b><div class="mu">${t.th}</div></div><button class="s" data-unarch="${t.id}">Wiederherstellen</button></div>`).join(''):''}`}

function vContacts(){
 const form=`<div class="card"><label style="margin-top:0" for="nk_n">Name</label><input id="nk_n"><label for="nk_r">Funktion</label><input id="nk_r" placeholder="z. B. Hausarzt, Hausmeister, Mieter Wohnung 3">
 <label for="nk_cl">Kategorie</label><select id="nk_cl">${opts(CL,kcl==='alle'?CL[0]:kcl)}</select>
 <label for="nk_t">Telefon</label><input id="nk_t" type="tel"><label for="nk_m">E-Mail (optional)</label><input id="nk_m" type="email"><label for="nk_note">Notiz (optional)</label><input id="nk_note">
 <button class="p" data-addk="1" style="margin-top:12px">Speichern</button><div class="err mu">${esc(kerr)}</div></div>`;
 return `${showNewK?form:''}<input id="kq" type="search" placeholder="Suchen: Name, Funktion, Notiz" value="${esc(kq)}" aria-label="Kontakte suchen" style="margin-bottom:10px">
 ${tabs(['alle',...CL].map(x=>[x,x==='alle'?'Alle':x]),kcl,'kc')}<div id="cl"></div>`}
function kList(){const q=kq.trim().toLowerCase();
 const f=contacts.filter(c=>(kcl==='alle'||c.cl===kcl)&&(!q||(c.n+' '+c.r+' '+c.cl+' '+(c.note||'')).toLowerCase().includes(q))).sort(byName);
 const card=c=>{const ua=appts.filter(a=>a.arzt===c.id).length,ln=[...units,...homes].filter(o=>(o.contacts||[]).includes(c.id)).length,used=c.m?tpls.filter(t=>t.to===c.n).map(t=>t.n):[];
  const ed=openK===c.id?`<div class="ed"><label>Name</label><input id="ek_n" value="${esc(c.n)}"><label>Funktion</label><input id="ek_r" value="${esc(c.r)}"><label>Kategorie</label><select id="ek_cl">${opts(CL,c.cl)}</select><label>Telefon</label><input id="ek_t" type="tel" value="${esc(c.t)}"><label>E-Mail</label><input id="ek_m" type="email" value="${esc(c.m||'')}"><label>Notiz</label><textarea id="ek_note" style="min-height:70px">${esc(c.note||'')}</textarea><button class="p s" data-ksave="${c.id}" style="margin-top:10px">Speichern</button><div class="err mu">${esc(kerr)}</div></div>`:'';
  return `<div class="card tk" data-openk="${c.id}"><div class="row sp" style="flex-wrap:nowrap"><div><b>${esc(c.n)}</b><div class="mu">${esc(c.r)}</div>${c.note?`<div class="mu" style="margin-top:2px">📝 ${esc(c.note)}</div>`:''}</div><button class="s gh" data-del="c:${c.id}" aria-label="${esc(c.n)} löschen">🗑</button></div>
  ${del==='c:'+c.id?confirmBox(`Kontakt „${esc(c.n)}“ wirklich löschen?${used.length?` Er ist noch Empfänger der Vorlage ${esc(used.join(', '))}.`:''}${ua?` Er ist noch in ${ua} Termin(en) eingetragen.`:''}${ln?` Er ist noch mit ${ln} Eintrag/Einträgen (Nutzer, Wohnobjekte) verknüpft.`:''}`):`<div class="row" style="margin-top:8px">${call(c)}${c.m?`<a class="call alt" href="mailto:${esc(c.m)}">✉️ E-Mail</a>`:''}</div>`}${ed}</div>`};
 $('#cl').innerHTML=CL.map(cl=>{const x=f.filter(c=>c.cl===cl);return x.length?`<h2>${cl} (${x.length})</h2>`+x.map(card).join(''):''}).join('')||'<div class="card mu">Keine Kontakte gefunden.</div>'}

function draftsUI(){if(!drafts.length)return '<div class="card mu">Keine Entwürfe. Aktive Vorlagen legst du in den Einstellungen fest.</div>';
 let i=drafts.findIndex(x=>x.tid===dTab);if(i<0)i=0;const d=drafts[i];dTab=d.tid;
 return `${tabs(drafts.map(x=>[x.tid,(x.s==='Entwurf'?'':'✓ ')+esc(x.name)]),d.tid,'dr')}
 <div class="card"><div class="row sp"><b>${esc(d.name)}</b><span class="badge">${d.s}</span></div><div class="mu ${d.ok?'':'warn'}">An: ${esc(d.to)}</div>
 <label for="b${i}">Betreff</label><input id="b${i}" data-subj="${i}" value="${esc(d.sub)}"><label for="x${i}">Text</label><textarea id="x${i}" data-body="${i}">${esc(d.body)}</textarea>
 <div class="row" style="margin-top:10px"><button class="s" data-cp="${i}">Kopieren</button><button class="s" data-sent="${i}">Als gesendet markieren</button></div></div>`}
function vTrip(){const n=days();
 return `<div class="card"><div class="row"><div style="flex:1"><label style="margin-top:0" for="tf">Reisebeginn</label><input id="tf" type="date" value="${trip.from}"></div><div style="flex:1"><label style="margin-top:0" for="tt">Reiseende</label><input id="tt" type="date" value="${trip.to}"></div></div>
 <label for="tg">Grund (optional)</label><input id="tg" value="${esc(trip.grund)}" placeholder="z. B. Familienbesuch, Kur">
 <div class="mu" style="margin-top:8px">${n?`Zeitraum: <b>${n} Tage</b>`:'<span class="err">Bitte gültigen Zeitraum wählen</span>'}</div></div>
 <div class="row sp"><h2>E-Mail-Entwürfe</h2><button class="s gh" data-tab="settings" data-set="mail">Vorlagen ändern</button></div>
 ${draftsUI()}
 <div class="mu">Es wird nichts versendet. „Gesendet“ markiert ihr selbst.</div>`}

function vWohnen(){
 if(homeOpen){const h=homes.find(x=>x.id===homeOpen);if(h)return vHome(h);homeOpen=null}
 const nav=tabs([['obj','Objekte'],['stand','Aktueller Stand']],wTab,'wt');
 const form=showNewH?`<div class="card"><label style="margin-top:0" for="nh_n">Name des Objekts</label><input id="nh_n" placeholder="z. B. Demenz-WG Beispielstraße"><label for="nh_art">Wohnkonzept</label><select id="nh_art">${opts(HART,HART[0])}</select><button class="p" data-addh="1" style="margin-top:12px">Anlegen</button><div class="err mu">${esc(kerr)}</div></div>`:'';
 const sorted=homes.slice().sort((a,b)=>HSTAT.indexOf(a.status)-HSTAT.indexOf(b.status)||byName(a,b));
 let b='';
 if(wTab==='obj')b=sorted.map(h=>`<button class="card" data-oh="${h.id}" style="width:100%;text-align:left;display:block"><div class="row sp" style="flex-wrap:nowrap"><b>${esc(h.n)}</b><span class="badge">${esc(h.status)}</span></div><div class="mu">${esc(h.art)}${h.adr?' · '+esc(h.adr):''}${h.kosten?' · '+esc(h.kosten):''}</div>${lastNote(h)}<div class="mu">${openCount('home',h.id)} offene Aufgaben</div></button>`).join('')||'<div class="card mu">Noch keine Objekte. Mit „＋ Objekt“ eine Einrichtung oder ein Wohnkonzept anlegen.</div>';
 else b=sorted.length?`<div class="card wrap"><table><tr><th>Objekt</th><th>Art</th><th>Status</th><th>Letzter Eintrag</th><th>Offen</th></tr>${sorted.map(h=>{const n=(h.notes||[]).slice().sort((a,c)=>c.d-a.d)[0];return `<tr><td><button class="s gh" data-oh="${h.id}">${esc(h.n)}</button></td><td>${esc(h.art)}</td><td>${esc(h.status)}</td><td>${n?fmt(n.d)+': '+esc(n.t.length>40?n.t.slice(0,40)+' …':n.t):'–'}</td><td>${openCount('home',h.id)}</td></tr>`}).join('')}</table></div>`:'<div class="card mu">Noch keine Objekte.</div>';
 return nav+form+b}
function vHome(h){const key='home:'+h.id;
 return `<button class="s" data-oh="">← Alle Objekte</button>
 <div class="row sp" style="margin:10px 0 6px;flex-wrap:nowrap"><div class="row"><b style="font-size:18px">${esc(h.n)}</b><span class="badge">${esc(h.status)}</span></div><button class="s gh" data-del="h:${h.id}" aria-label="Objekt löschen">🗑 Löschen</button></div>
 ${del==='h:'+h.id?confirmBox(`Objekt „${esc(h.n)}“ wirklich löschen? Verknüpfte Aufgaben bleiben erhalten.`):''}
 <div class="card"><label style="margin-top:0" for="hf_status">Status</label><select id="hf_status">${opts(HSTAT,h.status)}</select><label for="hf_n">Name</label><input id="hf_n" value="${esc(h.n)}"><label for="hf_art">Wohnkonzept</label><select id="hf_art">${opts(HART,h.art)}</select>
 <label for="hf_adr">Adresse</label><input id="hf_adr" value="${esc(h.adr||'')}"><label for="hf_kosten">Kosten / Konditionen</label><input id="hf_kosten" value="${esc(h.kosten||'')}"><label for="hf_beschr">Beschreibung</label><textarea id="hf_beschr" style="min-height:70px">${esc(h.beschr||'')}</textarea></div>
 ${contactBlock(h,key)}${taskBlock('home',h.id,'Wohnen Papa')}${notesBlock(h,key,'z. B. Telefonat, Besichtigung, Rückmeldung')}`}
function vImmo(){
 if(unitOpen){const u=units.find(x=>x.id===unitOpen);if(u)return vUnit(u);unitOpen=null}
 const nav=tabs([['over','Übersicht'],['users','Nutzer']],iTab,'it');
 const form=showNewU?`<div class="card"><label style="margin-top:0" for="nu_n">Bezeichnung</label><input id="nu_n" placeholder="z. B. Wohnung 3"><label for="nu_lage">Lage</label><input id="nu_lage" placeholder="z. B. 1. OG links"><label for="nu_nutzer">Nutzer / Mieter</label><input id="nu_nutzer"><button class="p" data-addu="1" style="margin-top:12px">Anlegen</button><div class="err mu">${esc(kerr)}</div></div>`:'';
 let b='';
 if(iTab==='over'){const open=tasks.filter(t=>!t.arch&&t.th==='Immobilie'&&t.st!==3),auto=contacts.filter(c=>c.cl==='Immobilie Nürnberg'||c.cl==='Handwerker').sort(byName);
  b=`<div class="card"><b>${units.length} Nutzer</b> · ${open.length} offene Aufgaben zur Immobilie</div>
  ${taskBlock('prop','prop','Immobilie',tasks.filter(t=>!t.arch&&t.th==='Immobilie'))}
  <h2>Kontakte zur Immobilie (${auto.length})</h2>${auto.map(c=>`<div class="card row sp" style="flex-wrap:nowrap"><div><b>${esc(c.n)}</b><div class="mu">${esc(c.cl)} · ${esc(c.r)}</div></div>${call(c)}</div>`).join('')||'<div class="mu">Noch keine. In „Kontakte“ mit der Kategorie „Immobilie Nürnberg“ oder „Handwerker“ anlegen.</div>'}
  ${notesBlock(prop,'prop:prop','Allgemeine Notizen zur Immobilie')}`}
 else b=units.slice().sort(byName).map(u=>`<button class="card" data-ou="${u.id}" style="width:100%;text-align:left;display:block"><div class="row sp" style="flex-wrap:nowrap"><b>${esc(u.n)}</b><span class="mu">${esc(u.lage||'')}</span></div><div class="mu">${u.nutzer?'Nutzer: '+esc(u.nutzer):'Kein Nutzer eingetragen'}</div>${lastNote(u)}<div class="mu">${openCount('unit',u.id)} offene Aufgaben · ${(u.contacts||[]).length} Kontakte</div></button>`).join('')||'<div class="card"><div class="mu" style="margin-bottom:8px">Noch keine Nutzer eingetragen.</div><button class="s" data-seed8="1">8 Wohnungen als Vorlage anlegen</button></div>';
 return nav+form+b}
function vUnit(u){const key='unit:'+u.id;
 return `<button class="s" data-ou="">← Alle Nutzer</button>
 <div class="row sp" style="margin:10px 0 6px;flex-wrap:nowrap"><b style="font-size:18px">${esc(u.n)}</b><button class="s gh" data-del="u:${u.id}" aria-label="Nutzer löschen">🗑 Löschen</button></div>
 ${del==='u:'+u.id?confirmBox(`„${esc(u.n)}“ wirklich löschen? Verknüpfte Aufgaben bleiben erhalten.`):''}
 <div class="card"><label style="margin-top:0" for="uf_n">Bezeichnung</label><input id="uf_n" value="${esc(u.n)}"><label for="uf_lage">Lage</label><input id="uf_lage" value="${esc(u.lage||'')}"><label for="uf_nutzer">Nutzer / Mieter</label><input id="uf_nutzer" value="${esc(u.nutzer||'')}"></div>
 ${contactBlock(u,key)}${taskBlock('unit',u.id,'Immobilie')}${notesBlock(u,key,'z. B. Schlüsselübergabe, Mängel, Absprachen')}`}

function vSet(){const head=tabs([['mail','E-Mail-Entwürfe'],['kal','Kalender'],['konto','Person'],['prot','Protokoll']],setTab,'sett');
 if(setTab==='kal'){const https=location.origin+FEED,web='webcal://'+location.host+FEED;
  return `${head}<div class="card"><b>Einzelne Termine</b><div class="mu" style="margin-top:2px">Bei jedem Termin gibt es „📅 Zum Kalender“. Auf dem iPhone öffnet sich der Kalender mit dem Termin, mit Turnus und Erinnerung.</div></div>
  <div class="card"><b>Alle Termine laufend abonnieren</b><div class="mu" style="margin:2px 0 8px">Neue und geänderte Termine erscheinen danach automatisch im Kalender.</div><a class="call" href="${esc(web)}">📅 Kalender abonnieren</a>
  <label>Oder Adresse kopieren</label><input readonly data-sel="1" value="${esc(https)}" aria-label="Adresse zum Abonnieren"><div class="warn mu" style="margin-top:8px">Wer diese Adresse kennt, sieht alle Termine. Bitte nicht weitergeben. Zum Sperren der Adresse SESSION_SECRET ändern.</div></div>`}
 if(setTab==='prot')return `${head}${logs.map(l=>`<div class="mu" style="padding:3px 0">${l.t} · ${esc(l.u)} · ${esc(l.m)}</div>`).join('')||'<div class="card mu">Noch nichts protokolliert.</div>'}`;
 if(setTab==='konto')return `${head}<div class="card"><b>Ich bin</b><div class="mu" style="margin:2px 0 8px">Aufgaben und Einträge werden dieser Person zugeordnet.</div>${chips(PE.map(p=>[p,p]),user,'login')}</div><div class="card"><b>App sperren</b><div class="mu" style="margin:2px 0 8px">Auf diesem Gerät wieder nach dem Familiencode fragen.</div><button class="s" id="lock">Sperren</button></div>`;
 const k=tpls.find(x=>x.id===tplSel)||tpls[0],names=[...new Set(contacts.filter(c=>c.m).map(c=>c.n))];
 return `${head}<div class="row sp" style="margin-bottom:6px"><span class="mu">Aktive Vorlagen (✓) erzeugen im Urlaubsassistenten einen Entwurf.</span><button class="s" data-newt="1">＋ Vorlage</button></div>
 ${tabs(tpls.map(t=>[t.id,(t.on?'✓ ':'')+esc(t.n)]),k.id,'tpl')}
 <div class="card"><label style="margin-top:0"><input type="checkbox" id="tp_on" ${k.on?'checked':''} style="width:auto;min-height:0"> Bei Urlaub einen Entwurf erstellen</label>
 <label for="tp_n">Name</label><input id="tp_n" value="${esc(k.n)}">
 <label for="tp_to">Empfänger (Kontakte mit E-Mail)</label><select id="tp_to"><option value="">– bitte wählen –</option>${names.map(n=>`<option ${n===k.to?'selected':''}>${esc(n)}</option>`).join('')}</select>
 <label for="tp_sub">Betreff</label><input id="tp_sub" value="${esc(k.sub)}"><label for="tp_body">Text</label><textarea id="tp_body">${esc(k.body)}</textarea>
 <div class="mu" style="margin-top:8px">Platzhalter: {von} {bis} {tage} {grund}. Zeilen mit {grund} entfallen, wenn kein Grund eingetragen ist. Keine Gesundheitsdetails im Betreff.</div></div>`}

function vLogin(){return `<div style="margin-top:56px;text-align:center"><div class="hn" style="color:var(--tx);text-shadow:none">Wer bist du?</div><div class="mu" style="margin:4px 0 24px">Danach siehst du deine Aufgaben. Das lässt sich jederzeit oben ändern.</div>
 <div class="row" style="flex-direction:column;align-items:stretch;gap:10px">${PE.map(p=>`<button class="p" style="min-height:48px;font-size:16px" data-login="${p}">${p}</button>`).join('')}</div></div>`}
function vCode(){return `<div style="margin-top:56px;text-align:center"><div class="hn" style="color:var(--tx);text-shadow:none">Pflegezentrale</div><div class="mu" style="margin:4px 0 20px">Bitte den Familiencode eingeben.</div>
 <div class="card" style="text-align:left"><input id="fc" type="password" autocomplete="current-password" placeholder="Familiencode" aria-label="Familiencode"><button class="p" id="fcgo" style="margin-top:12px;width:100%">Öffnen</button><div class="err mu" style="margin-top:8px" role="alert">${esc(codeErr)}</div></div></div>`}
const vErr=()=>`<div style="margin-top:56px;text-align:center"><div class="mu">Die Daten konnten nicht geladen werden.</div><button class="p" data-reload="1" style="margin-top:12px">Neu laden</button></div>`;
function render(){
 if(phase!=='ready'){$('#hu').innerHTML='';$('#nv').hidden=true;$('#v').innerHTML=phase==='code'?vCode():phase==='error'?vErr():'<div class="mu" style="margin-top:56px;text-align:center">Lade …</div>';return}
 $('#hu').innerHTML=user?`<button class="s" data-logout="1" aria-label="Person wechseln">👤 ${esc(user)} · wechseln</button><button class="s gh" data-tab="settings" aria-label="Einstellungen">⚙️</button>`:'';
 $('#nv').hidden=!user;if(!user){$('#v').innerHTML=vLogin();return}
 const T=[['aufgaben','Aufgaben','✅'],['termine','Termine','📅'],['kontakte','Kontakte','📇'],['urlaub','Urlaub','✈️'],['wohnen','Wohnen','🏡'],['immobilie','Immobilie','🏢']];
 $('#nav').innerHTML=T.map(([k,n,ic])=>`<button data-tab="${k}" aria-current="${tab===k}"><span>${ic}</span>${n}</button>`).join('');
 const TT={termine:'Termine',kontakte:'Kontakte',urlaub:'Urlaub',wohnen:'Demenzwohnen',immobilie:'Immobilie Nürnberg',settings:'Einstellungen'};
 const A={termine:`<button class="p s" data-newap="1">${showNewA?'Abbrechen':'＋ Termin'}</button>`,kontakte:`<button class="p s" data-newk="1">${showNewK?'Abbrechen':'＋ Kontakt'}</button>`,
  wohnen:homeOpen?'':`<button class="p s" data-newh="1">${showNewH?'Abbrechen':'＋ Objekt'}</button>`,immobilie:unitOpen?'':`<button class="p s" data-newu="1">${showNewU?'Abbrechen':'＋ Nutzer'}</button>`}[tab]||'';
 $('#v').innerHTML=(banner?`<div class="card warn" role="alert">${esc(banner)}</div>`:'')+(tab==='aufgaben'?'':`<div class="ph2"><h1 class="pt">${TT[tab]}</h1>${A}</div>`)+{aufgaben:vTasks,termine:vTermine,kontakte:vContacts,urlaub:vTrip,wohnen:vWohnen,immobilie:vImmo,settings:vSet}[tab]();
 if(tab==='kontakte')kList()}
document.addEventListener('click',e=>{const b=e.target.closest('button');
 if(!b){const ap=e.target.closest('[data-opena]');if(ap&&!e.target.closest('select,input,textarea,label,.ed,a')){const id=ap.dataset.opena;openA=openA===id?null:id;showNewA=false;aerr='';apf=openA?apfFrom(appts.find(x=>x.id===id)):null;render();return}
 const kc=e.target.closest('[data-openk]');if(kc&&!e.target.closest('select,input,textarea,label,.ed,a')){openK=openK===kc.dataset.openk?null:kc.dataset.openk;kerr='';render();return}
 const c=e.target.closest('[data-open]');if(c&&!e.target.closest('select,input,textarea,label,.ed')){openT=openT===c.dataset.open?null:c.dataset.open;render()}return}
 const d=b.dataset;
 if(b.id==='fcgo'){doLogin();return}
 if(d.reload){boot();return}
 if(b.id==='lock'){api('POST','/api/logout',{}).then(()=>{phase='code';codeErr='';user=null;render()});return}
 if(banner){banner=''}
 if(d.dr){dTab=d.dr;return render()}
 if(d.at){aTab=d.at;return render()}
 if(d.newap){showNewA=!showNewA;openA=null;aerr='';apf=showNewA?apfNew():null;return render()}
 if(d.goarzt){readForm();tab='kontakte';showNewK=true;kcl='Ärzte';kerr='';return render()}
 if(d.apsave){const f=readForm();if(!f.arzt||!f.what.trim()||!f.date){aerr='Bitte Kontakt, Anlass und Datum angeben.';return render()}
  let rp=null;if(f.rep!=='none'){rp=f.rep==='custom'?{n:Math.max(1,parseInt(f.n)||1),u:f.u}:{n:parseInt(f.rep),u:f.rep.slice(-1)}}
  const rec={arzt:f.arzt,what:f.what.trim(),date:f.date,time:f.time,rep:rp,rem:+f.rem,note:f.note.trim()};
  if(d.apsave==='new'){appts.push({id:'p'+uid(),...rec});showNewA=false;L(`Termin angelegt: ${rec.what}`)}else{Object.assign(appts.find(x=>x.id===d.apsave),rec);openA=null;L(`Termin geändert: ${rec.what}`)}
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
 }while(again)}finally{syncing=false}
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
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='fc')doLogin()});
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
