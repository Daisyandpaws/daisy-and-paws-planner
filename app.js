(()=>{'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];const P='dp3:'+((window.DP_USER&&window.DP_USER.id)||'guest')+':';let flashTimer;const save=(k,v)=>{localStorage.setItem(P+k,typeof v==='string'?v:JSON.stringify(v));const x=$('#saved');x.classList.add('show');clearTimeout(flashTimer);flashTimer=setTimeout(()=>x.classList.remove('show'),650)};const get=(k,d='')=>{const v=localStorage.getItem(P+k);if(v===null)return d;return v};const json=(k,d)=>{try{return JSON.parse(get(k,''))||d}catch{return d}};const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function go(id){$$('.page').forEach(p=>p.classList.toggle('active',p.id===id));$$('[data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===id));$('#tabs').classList.remove('open');scrollTo({top:0,behavior:'smooth'})}$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));$('#moreBtn').onclick=()=>$('#tabs').classList.toggle('open');
$$('[data-field]').forEach(el=>{el.value=get(el.dataset.field,'');el.oninput=()=>save(el.dataset.field,el.value);el.onchange=el.oninput});const now=new Date();$('#lessonDate').value=get('lesson-date',iso(now));$('#lessonDate').onchange=()=>save('lesson-date',$('#lessonDate').value);
let month=new Date(2026,8,1),selected='';function renderCal(){const y=month.getFullYear(),m=month.getMonth();$('#monthLabel').textContent=month.toLocaleDateString('en-GB',{month:'long',year:'numeric'});let h=['M','T','W','T','F','S','S'].map(x=>`<div class="dow">${x}</div>`).join('');const blank=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate();h+='<div></div>'.repeat(blank);for(let d=1;d<=days;d++){const k=iso(new Date(y,m,d)),n=get('cal:'+k,'');h+=`<button class="date ${k===iso(now)?'today':''} ${k===selected?'selected':''}" data-date="${k}"><b>${d}</b>${n?`<small>• ${n.slice(0,20)}</small>`:''}</button>`}$('#calendar').innerHTML=h;$$('[data-date]').forEach(b=>b.onclick=()=>selectDate(b.dataset.date))}function selectDate(k){selected=k;$('#selectedDate').value=k;$('#calendarNote').value=get('cal:'+k,'');renderCal()}$('#prevMonth').onclick=()=>{month.setMonth(month.getMonth()-1);renderCal()};$('#nextMonth').onclick=()=>{month.setMonth(month.getMonth()+1);renderCal()};$('#selectedDate').onchange=()=>selectDate($('#selectedDate').value);$('#calendarNote').oninput=()=>{if(selected){save('cal:'+selected,$('#calendarNote').value);renderCal()}};renderCal();
let monday=new Date(now);monday.setHours(12,0,0,0);monday.setDate(monday.getDate()-((monday.getDay()+6)%7));function renderWeek(){const end=new Date(monday);end.setDate(end.getDate()+4);$('#weekLabel').textContent=`${monday.toLocaleDateString('en-GB',{day:'numeric',month:'short'})} – ${end.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`;const names=['Monday','Tuesday','Wednesday','Thursday','Friday'];$('#weekGrid').innerHTML=names.map((n,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);const k='week:'+iso(monday)+':'+i;return `<div class="day"><h3>${n}<br>${d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</h3><textarea data-w="${k}" placeholder="Lessons, duties, reminders…"></textarea></div>`}).join('');$$('[data-w]').forEach(t=>{t.value=get(t.dataset.w,'');t.oninput=()=>save(t.dataset.w,t.value);t.addEventListener('click',()=>openLinkedWeeklyLesson(t))})}$('#prevWeek').onclick=()=>{monday.setDate(monday.getDate()-7);renderWeek()};$('#nextWeek').onclick=()=>{monday.setDate(monday.getDate()+7);renderWeek()};renderWeek();
function openLinkedWeeklyLesson(t){
  try{
    const key=String(t?.dataset?.w||'');
    const m=key.match(/^week:(\d{4}-\d{2}-\d{2}):(\d)$/);
    if(!m)return;
    const mon=new Date(m[1]+'T12:00:00');
    const idx=Number(m[2]);
    if(Number.isNaN(mon.getTime())||idx<0||idx>4)return;
    const d=new Date(mon);d.setDate(mon.getDate()+idx);
    const dateKey=iso(d);
    const linked=json('linked-lessons:'+dateKey,[]);
    if(!Array.isArray(linked)||!linked.length)return;

    // Work out which line the teacher actually clicked in the weekly box.
    const pos=typeof t.selectionStart==='number'?t.selectionStart:0;
    const before=String(t.value||'').slice(0,pos);
    const lineNo=(before.match(/\n/g)||[]).length;
    const line=String(t.value||'').split('\n')[lineNo]?.trim()||'';
    const norm=x=>String(x||'').toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ').trim();
    let lesson=linked.find(x=>norm([x.time,x.subject,x.title].filter(Boolean).join(' – '))===norm(line));
    if(!lesson){
      lesson=linked.find(x=>line && norm(line).includes(norm(x.time)) && norm(line).includes(norm(x.subject)));
    }
    if(!lesson)return;

    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;background:rgba(50,47,43,.42);z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px';
    const detail=(label,value)=>value?`<div style="margin-top:18px"><div style="font-weight:800;margin-bottom:5px">${esc(label)}</div><div style="white-space:pre-wrap;line-height:1.55">${esc(value)}</div></div>`:'';
    overlay.innerHTML=`<div style="width:min(860px,96vw);max-height:88vh;overflow:auto;background:#fffdf9;border:1px solid #ded4c5;border-radius:28px;padding:28px;color:#332f2b;font-family:inherit;box-shadow:0 18px 55px rgba(0,0,0,.18)"><div style="display:flex;justify-content:space-between;gap:18px;align-items:flex-start"><div><div style="font-size:.78rem;letter-spacing:.16em;font-weight:800;color:#777">WEEKLY PLANNING</div><h2 style="margin:7px 0 4px;font-size:2rem">${esc(lesson.subject||'Lesson')} · ${esc(lesson.title||'Planning')} 🌼</h2><div style="color:#6d6861">${esc(lesson.day||'')} · ${esc(lesson.time||'')} · ${esc(dateKey)}</div></div><button data-close-linked type="button" style="border:0;border-radius:50%;width:46px;height:46px;font-size:22px">×</button></div><div style="margin-top:20px;padding:18px 20px;border-radius:18px;background:#f7f3ec">${detail('Lesson focus',lesson.title)}${detail('Objective / scientific skill',lesson.objective)}${detail('Teaching notes',lesson.teaching)}${detail('Vocabulary',lesson.vocab)}${detail('Resources',lesson.resources)}${detail('Assessment / next steps',lesson.next)}</div><div style="display:flex;justify-content:flex-end;margin-top:20px"><button data-close-linked type="button" style="padding:11px 20px;border:1px solid #ded4c5;background:white;border-radius:999px;font:inherit">Close</button></div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelectorAll('[data-close-linked]').forEach(b=>b.onclick=()=>overlay.remove());
    overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};
  }catch(err){console.error('Daisy & Paws linked weekly planning open failed:',err)}
}
window.DP_OPEN_WEEK=(dateString)=>{const d=new Date(String(dateString)+'T12:00:00');if(Number.isNaN(d.getTime()))return false;d.setDate(d.getDate()-((d.getDay()+6)%7));d.setHours(12,0,0,0);monday=new Date(d);renderWeek();go('week');return true;};
let classes=json('classes',[{id:Date.now(),name:'My Class',notes:'',pupils:[]}]),classId=Number(get('classId',classes[0]?.id||0));function current(){return classes.find(c=>c.id===classId)||classes[0]}function saveClasses(){save('classes',classes);save('classId',String(classId))}function renderClasses(){if(!classes.length){classes=[{id:Date.now(),name:'My Class',notes:'',pupils:[]}];classId=classes[0].id}$('#classSelect').innerHTML=classes.map(c=>`<option value="${c.id}">${esc(c.name||'Untitled class')}</option>`).join('');$('#classSelect').value=String(classId);const c=current();$('#className').value=c.name;$('#classNotes').value=c.notes;$('#pupilRows').innerHTML=c.pupils.map((p,i)=>`<tr><td><input data-pn="${i}" value="${esc(p.name)}"></td><td><input data-pi="${i}" value="${esc(p.info)}"></td><td><button class="rowdel" data-pdel="${i}">×</button></td></tr>`).join('');$$('[data-pn]').forEach(x=>x.oninput=()=>{current().pupils[+x.dataset.pn].name=x.value;saveClasses()});$$('[data-pi]').forEach(x=>x.oninput=()=>{current().pupils[+x.dataset.pi].info=x.value;saveClasses()});$$('[data-pdel]').forEach(x=>x.onclick=()=>{current().pupils.splice(+x.dataset.pdel,1);saveClasses();renderClasses()})}const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));$('#classSelect').onchange=()=>{classId=+$('#classSelect').value;saveClasses();renderClasses()};$('#className').oninput=()=>{current().name=$('#className').value;saveClasses();$('#classSelect').selectedOptions[0].textContent=$('#className').value||'Untitled class'};$('#classNotes').oninput=()=>{current().notes=$('#classNotes').value;saveClasses()};$('#addClass').onclick=()=>{const c={id:Date.now(),name:'New Class',notes:'',pupils:[]};classes.push(c);classId=c.id;saveClasses();renderClasses()};$('#deleteClass').onclick=()=>{if(classes.length>1&&confirm('Delete this class?')){classes=classes.filter(c=>c.id!==classId);classId=classes[0].id;saveClasses();renderClasses()}};$('#addPupil').onclick=()=>{current().pupils.push({name:'',info:''});saveClasses();renderClasses()};renderClasses();
function tableRecords(key,tbody,addBtn,cols){let arr=json(key,[]);function draw(){$(tbody).innerHTML=arr.map((r,i)=>`<tr>${cols.map((c,j)=>`<td><input type="${c.type||'text'}" data-rec="${i}:${j}" value="${esc(r[c.k]||'')}"></td>`).join('')}<td><button class="rowdel" data-rdel="${i}">×</button></td></tr>`).join('');$$('[data-rec]').forEach(x=>x.oninput=()=>{const[i,j]=x.dataset.rec.split(':').map(Number);arr[i][cols[j].k]=x.value;save(key,arr)});$$('[data-rdel]').forEach(x=>x.onclick=()=>{arr.splice(+x.dataset.rdel,1);save(key,arr);draw()})}$(addBtn).onclick=()=>{arr.push(Object.fromEntries(cols.map(c=>[c.k,''])));save(key,arr);draw()};draw()}tableRecords('readers','#readerRows','#addReader',[{k:'child'},{k:'book'},{k:'date',type:'date'},{k:'notes'}]);
let tasks=json('tasks',[]);function drawTasks(){if(!tasks.length)tasks=[{text:'',done:false}];$('#tasks').innerHTML=tasks.map((t,i)=>`<div class="task"><input type="checkbox" data-tcheck="${i}" ${t.done?'checked':''}><input type="text" data-ttext="${i}" value="${esc(t.text)}" placeholder="Add a task…"><button class="rowdel" data-tdel="${i}">×</button></div>`).join('');$$('[data-tcheck]').forEach(x=>x.onchange=()=>{tasks[+x.dataset.tcheck].done=x.checked;save('tasks',tasks)});$$('[data-ttext]').forEach(x=>x.oninput=()=>{tasks[+x.dataset.ttext].text=x.value;save('tasks',tasks)});$$('[data-tdel]').forEach(x=>x.onclick=()=>{tasks.splice(+x.dataset.tdel,1);save('tasks',tasks);drawTasks()})}$('#addTask').onclick=()=>{tasks.push({text:'',done:false});save('tasks',tasks);drawTasks()};drawTasks();
function cardRecords(key,list,btn,type){let arr=json(key,[]);function draw(){if(!arr.length)arr=[{}];$(list).innerHTML=arr.map((r,i)=>`<div class="paper record"><button class="removeRecord" data-delcard="${i}">×</button><div class="grid2"><label>Date<input type="date" data-card="${i}:date" value="${esc(r.date||'')}"></label><label>${type==='meeting'?'Type':'Course / Training'}<input data-card="${i}:title" value="${esc(r.title||'')}"></label></div><label>${type==='meeting'?'Key points':'Key learning'}<textarea data-card="${i}:notes}">${esc(r.notes||'')}</textarea></label><label>${type==='meeting'?'Actions / follow up':'How I will use this'}<textarea data-card="${i}:action">${esc(r.action||'')}</textarea></label></div>`).join('').replace(/data-card="(\d+):notes}"/g,'data-card="$1:notes"');$$('[data-card]').forEach(x=>x.oninput=()=>{const[i,k]=x.dataset.card.split(':');arr[+i][k]=x.value;save(key,arr)});$$('[data-delcard]').forEach(x=>x.onclick=()=>{arr.splice(+x.dataset.delcard,1);save(key,arr);draw()})}$(btn).onclick=()=>{arr.push({});save(key,arr);draw()};draw()}cardRecords('meetings','#meetingList','#addMeeting','meeting');cardRecords('cpd','#cpdList','#addCpd','cpd');

// --- secure account controls ---
const LS=localStorage;
const lockNow=$('#lockNow'); if(lockNow) lockNow.onclick=()=>window.DP_SIGN_OUT&&window.DP_SIGN_OUT();
const settingsSignOut=$('#settingsSignOut'); if(settingsSignOut) settingsSignOut.onclick=()=>window.DP_SIGN_OUT&&window.DP_SIGN_OUT();
const accountEmail=$('#accountEmail'); if(accountEmail&&window.DP_USER) accountEmail.textContent='Signed in as '+(window.DP_USER.email||'your account')+'.';
function syncClassSelectors(){['#assessClass','#seatClass'].forEach(sel=>{$(sel).innerHTML=classes.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');$(sel).value=String(classId)})}function drawSeats(){const cid=+$('#seatClass').value||classId;let seats=json('seats:'+cid,Array.from({length:16},()=>''));$('#seatGrid').innerHTML=seats.map((v,i)=>`<div class="seat"><input data-seat="${i}" value="${esc(v)}" placeholder="Pupil"></div>`).join('');$$('[data-seat]').forEach(x=>x.oninput=()=>{seats[+x.dataset.seat]=x.value;save('seats:'+cid,seats)})}syncClassSelectors();$('#seatClass').onchange=drawSeats;$('#clearSeats').onclick=()=>{if(confirm('Clear this seating plan?')){save('seats:'+$('#seatClass').value,Array.from({length:16},()=>''));drawSeats()}};drawSeats();
// assessment + pastoral
let assessments=json('assessments',[]);function drawAssess(){const cid=+$('#assessClass').value||classId;const rows=assessments.map((r,i)=>[r,i]).filter(([r])=>r.classId===cid);$('#assessmentRows').innerHTML=rows.map(([r,i])=>`<tr>${['pupil','subject','current','target','note'].map(k=>`<td><input data-ass="${i}:${k}" value="${esc(r[k]||'')}"></td>`).join('')}<td><button class="rowdel" data-adel="${i}">×</button></td></tr>`).join('');$$('[data-ass]').forEach(x=>x.oninput=()=>{let[i,k]=x.dataset.ass.split(':');assessments[+i][k]=x.value;save('assessments',assessments)});$$('[data-adel]').forEach(x=>x.onclick=()=>{assessments.splice(+x.dataset.adel,1);save('assessments',assessments);drawAssess()})}$('#assessClass').onchange=drawAssess;$('#addAssessment').onclick=()=>{assessments.push({classId:+$('#assessClass').value,pupil:'',subject:'',current:'',target:'',note:''});save('assessments',assessments);drawAssess()};drawAssess();tableRecords('pastoral','#pastoralRows','#addPastoral',[{k:'date',type:'date'},{k:'child'},{k:'concern'},{k:'action'}]);
// backup controls
$('#exportBackup').onclick=()=>{const data={};for(let i=0;i<LS.length;i++){const k=LS.key(i);if(k.startsWith(P))data[k]=LS.getItem(k)}const blob=new Blob([JSON.stringify({product:'Daisy & Paws Digital Teacher Planner',version:4,exported:new Date().toISOString(),data},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Daisy-and-Paws-planner-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
$('#restoreBackup').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const b=JSON.parse(await f.text());Object.entries(b.data||{}).forEach(([k,v])=>{if(k.startsWith(P))LS.setItem(k,v)});alert('Backup restored. The planner will reload.');location.reload()}catch{alert('That backup file could not be read.')}};
$('#eraseData').onclick=()=>{if(confirm('Erase ALL planner data on this device? This cannot be undone unless you have a backup.')){[...Array(LS.length)].map((_,i)=>LS.key(i)).filter(k=>k&&k.startsWith(P)).forEach(k=>LS.removeItem(k));location.reload()}};


// --- Commercial beta onboarding, personalisation, lesson library & search ---
const profile=json('profile',{});
const onboarding=$('#onboarding');
function applyProfile(){const pr=json('profile',{});const n=pr.name||'Teacher';const tn=$('#teacherName');if(tn)tn.textContent=n;}
applyProfile();
if(!profile.setupComplete){onboarding.classList.remove('hidden');}
$('#finishSetup').onclick=()=>{const name=$('#setupName').value.trim()||'Teacher';const school=$('#setupSchool').value.trim();const mainClass=$('#setupClass').value.trim();const year=$('#setupYear').value;save('profile',{name,school,mainClass,year,setupComplete:true});if(mainClass&&classes.length===1&&classes[0].name==='My Class'){classes[0].name=mainClass;saveClasses();renderClasses();syncClassSelectors();}onboarding.classList.add('hidden');applyProfile();};

let templates=json('lessonTemplates',[]);
function lessonSnapshot(){return {id:Date.now(),title:(document.querySelector('[data-field="lesson-objective"]')?.value||'Untitled lesson').slice(0,80),className:document.querySelector('[data-field="lesson-class"]')?.value||'',objective:document.querySelector('[data-field="lesson-objective"]')?.value||'',success:document.querySelector('[data-field="lesson-success"]')?.value||'',vocab:document.querySelector('[data-field="lesson-vocab"]')?.value||'',resources:document.querySelector('[data-field="lesson-resources"]')?.value||'',next:document.querySelector('[data-field="lesson-next"]')?.value||''};}
function drawTemplates(){const box=$('#lessonTemplates');if(!box)return;box.innerHTML=templates.length?'<h3>Lesson library</h3>'+templates.map((t,i)=>`<div class="templateItem"><span><b>${esc(t.title)}</b><small>${esc(t.className)}</small></span><button class="secondary" data-loadtpl="${i}">Use</button><button class="rowdel" data-deltpl="${i}">×</button></div>`).join(''):'';$$('[data-loadtpl]').forEach(b=>b.onclick=()=>{const t=templates[+b.dataset.loadtpl];const map={'lesson-class':t.className,'lesson-objective':t.objective,'lesson-success':t.success,'lesson-vocab':t.vocab,'lesson-resources':t.resources,'lesson-next':t.next};Object.entries(map).forEach(([k,v])=>{const el=document.querySelector(`[data-field="${k}"]`);if(el){el.value=v;save('field:'+k,v)}});go('today')});$$('[data-deltpl]').forEach(b=>b.onclick=()=>{templates.splice(+b.dataset.deltpl,1);save('lessonTemplates',templates);drawTemplates()})}
$('#saveLessonTemplate').onclick=()=>{templates.push(lessonSnapshot());save('lessonTemplates',templates);drawTemplates();};
$('#duplicateLesson').onclick=()=>{const d=$('#lessonDate');if(d){let x=d.value?new Date(d.value+'T12:00:00'):new Date();x.setDate(x.getDate()+1);d.value=iso(x);d.dispatchEvent(new Event('change'));}alert('Lesson copied. Choose the new date and edit anything you need.');};
drawTemplates();

const searchOverlay=$('#searchOverlay'), searchInput=$('#globalSearch'), searchResults=$('#searchResults');
function openSearch(){searchOverlay.classList.remove('hidden');setTimeout(()=>searchInput.focus(),50)}
$('#openSearch').onclick=openSearch;$('#closeSearch').onclick=()=>searchOverlay.classList.add('hidden');
function collectSearch(){let out=[];const pr=json('profile',{});if(pr.school)out.push({page:'settings',title:'School',text:pr.school});classes.forEach(c=>{out.push({page:'classes',title:'Class',text:c.name+' '+(c.notes||'')});(c.pupils||[]).forEach(p=>out.push({page:'classes',title:'Pupil',text:(p.name||'')+' '+(p.info||'')}))});json('tasks',[]).forEach(t=>out.push({page:'todo',title:'To Do',text:t.text||''}));templates.forEach(t=>out.push({page:'today',title:'Lesson',text:[t.title,t.className,t.objective,t.success,t.vocab,t.resources].join(' ')}));['notes','wellbeing','term-objectives','term-topics','term-dates','term-notes','lesson-objective','lesson-success','lesson-reflection'].forEach(k=>{const v=get('field:'+k,get(k,''));if(v)out.push({page:k.startsWith('term')?'term':k.startsWith('lesson')?'today':k==='wellbeing'?'wellbeing':'notes',title:'Planner',text:v})});return out;}
searchInput.oninput=()=>{const q=searchInput.value.trim().toLowerCase();if(q.length<2){searchResults.innerHTML='<p class="gentle">Type at least 2 characters.</p>';return}const hits=collectSearch().filter(x=>x.text.toLowerCase().includes(q)).slice(0,30);searchResults.innerHTML=hits.length?hits.map((h,i)=>`<button class="searchHit" data-sh="${i}"><b>${esc(h.title)}</b><small>${esc(h.text.slice(0,150))}</small></button>`).join(''):'<p class="gentle">No matches found.</p>';$$('[data-sh]').forEach((b,i)=>b.onclick=()=>{searchOverlay.classList.add('hidden');go(hits[i].page)})};
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape')searchOverlay.classList.add('hidden')});

if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('./sw.js').catch(()=>{});

// Pre-release 5 dashboard enhancements
const dd=document.querySelector('#dashDate'); if(dd){dd.textContent=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());}
document.querySelectorAll('.miniTasks input').forEach((cb,i)=>{const k='dp3:dashTask:'+i;cb.checked=localStorage.getItem(k)==='1';cb.addEventListener('change',()=>localStorage.setItem(k,cb.checked?'1':'0'));});

// Commercial Beta 2 — visible feature additions
const planningFile = document.querySelector('#planningFile');
const planningPreview = document.querySelector('#planningPreview');

if (planningFile && planningPreview) {
  planningFile.addEventListener('change', async () => {
    const file = planningFile.files[0];
    if (!file) return;

  try {
    const fileName = file.name.toLowerCase();

   if (fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.convertToHtml({
        arrayBuffer: arrayBuffer
    });

    const temp = document.createElement('div');
    temp.innerHTML = result.value;

    // Turn Word table rows into readable rows separated by |
    temp.querySelectorAll('tr').forEach(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));

        if (cells.length) {
            const rowText = cells
                .map(cell => cell.innerText.trim().replace(/\s+/g, ' '))
                .filter(Boolean)
                .join(' | ');

            row.replaceWith(
                document.createTextNode('\n' + rowText + '\n')
            );
        }
    });

    planningPreview.value = temp.innerText
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    console.log(
        'WORD TABLE IMPORT LENGTH:',
        planningPreview.value.length
    );

    console.log(
        'WORD TABLE IMPORT TEXT:',
        planningPreview.value
    );
    } else {
        planningPreview.value = await file.text();
    }

} catch (e) {
    console.error('Planning import error:', e);
    planningPreview.value = 'Sorry, Daisy & Paws could not read this planning document.';
}
  });
}

document.querySelectorAll('.planningImportBtn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const text = planningPreview ? planningPreview.value.trim() : '';

    if (!text) {
      alert('Choose a planning file first.');
      return;
    }

    const planType = btn.dataset.planType;

    // Keep a copy of the original imported planning
    save('planningImportRaw', text);
    save('planningImportType', planType);

    if (planType === 'weekly') {
  // Look for "Week beginning: 28 September 2026"
  const dateMatch = text.match(
    /week\s*beginning\s*:?\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i
  );

  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);

    const months = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11
    };

    const month = months[dateMatch[2].toLowerCase()];
    const year = parseInt(dateMatch[3], 10);

    if (month !== undefined) {
      // Set the planner to the imported week
      monday = new Date(year, month, day, 12, 0, 0, 0);

      // Make sure it is actually Monday
      monday.setDate(
        monday.getDate() - ((monday.getDay() + 6) % 7)
      );

      document.querySelector('[data-go="week"]')?.click();
    }
  }

  const weeklyBoxes = Array.from(
    document.querySelectorAll('#weekGrid textarea[data-w]')
  );

  const dayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ];

  let foundDays = false;

  dayNames.forEach((dayName, index) => {
    const nextDay = dayNames[index + 1];

    let pattern;

    if (nextDay) {
      pattern = new RegExp(
        dayName +
          '\\s*:?\\s*([\\s\\S]*?)(?=\\n\\s*' +
          nextDay +
          '\\s*:?|$)',
        'i'
      );
    } else {
      pattern = new RegExp(
        dayName + '\\s*:?\\s*([\\s\\S]*)$',
        'i'
      );
    }

    const match = text.match(pattern);

    if (
      match &&
      match[1] &&
      match[1].trim() &&
      weeklyBoxes[index]
    ) {
      const content = match[1].trim();
      const storageKey = weeklyBoxes[index].dataset.w;

      save(storageKey, content);
      weeklyBoxes[index].value = content;

      foundDays = true;
    }
  });

  // If there are no Monday-Friday headings,
// do not dump the whole document into Monday.
if (!foundDays) {

    const weekRangeMatch = text.match(
        /\bWeeks?\s*:?\s*(\d+)\s*[-–]\s*(\d+)\b/i
    );

    const singleWeekMatch = text.match(
        /\bWeek\s*:?\s*(\d+)\b/i
    );

   if (weekRangeMatch) {
    const firstWeek = weekRangeMatch[1];
    const secondWeek = weekRangeMatch[2];
    const chosenWeek = prompt(
      'Daisy & Paws has recognised planning for Weeks ' + firstWeek + '–' + secondWeek +
      '.\n\nWhich week would you like to preview?\n\nEnter ' + firstWeek + ' or ' + secondWeek + ':'
    );

    if (chosenWeek !== firstWeek && chosenWeek !== secondWeek) {
      alert('No week was selected. Nothing has been added to your planner.');
      return;
    }

    // Word tables often split day labels across lines (for example Mo + n or Thu + rs).
    // Normalise only those labels, leaving the lesson text itself intact.
    const normalised = text
      .replace(/\bMo\s*n\b/gi, 'Monday')
      .replace(/\bTue\s*s?\b/gi, 'Tuesday')
      .replace(/\bWe\s*d\b/gi, 'Wednesday')
      .replace(/\bThu\s*rs\b/gi, 'Thursday')
      .replace(/\bFri\b/gi, 'Friday');

    // The document contains two detailed Monday-Friday timetable blocks.
    // Weeks 5-6 in the header map to the first and second timetable blocks respectively.
    const mondayStarts = [];
    const mondayRe = /\bMonday\b/gi;
    let mondayHit;
    while ((mondayHit = mondayRe.exec(normalised)) !== null) mondayStarts.push(mondayHit.index);

    const blockIndex = chosenWeek === firstWeek ? 0 : 1;
    const blockStart = mondayStarts[blockIndex];
    const blockEnd = mondayStarts[blockIndex + 1] ?? normalised.length;

    if (blockStart == null) {
      alert('Daisy & Paws could not find the detailed timetable for Week ' + chosenWeek + '.\n\nNothing has been added to your planner.');
      return;
    }

    const block = normalised.slice(blockStart, blockEnd);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const extracted = {};

    days.forEach((day, index) => {
      const nextDay = days[index + 1];
      const pattern = nextDay
        ? new RegExp('\\b' + day + '\\b([\\s\\S]*?)(?=\\b' + nextDay + '\\b)', 'i')
        : new RegExp('\\b' + day + '\\b([\\s\\S]*)$', 'i');
      const match = block.match(pattern);
      extracted[day] = match ? match[1].trim() : '';
    });

    const foundCount = days.filter(day => extracted[day]).length;
    if (foundCount < 3) {
      alert('Daisy & Paws found Week ' + chosenWeek + ', but could not safely separate enough of the Monday-Friday timetable yet.\n\nNothing has been added to your planner.');
      return;
    }

    const previewText = days.map(day =>
      '──────── ' + day + ' ────────\n' + (extracted[day] || '[No content detected]')
    ).join('\n\n');

    const previewBox = document.querySelector('#planningPreview');
    if (previewBox) previewBox.value = previewText;

    alert(
      'Week ' + chosenWeek + ' has been separated into ' + foundCount + ' day sections.\n\n' +
      'The five-day preview is now shown in the planning preview box.\n\n' +
      'Nothing has been added to your planner yet.'
    );
    return;
  } else if (singleWeekMatch) {
    alert(
      'Daisy & Paws has recognised planning for Week ' +
      singleWeekMatch[1] +
      '.\n\nThis document does not contain Monday–Friday headings, so nothing has been placed into individual days.'
    );
  } else {
    alert(
      'Daisy & Paws has recognised the planning, but it does not contain Monday–Friday headings.\n\nNothing has been placed into individual days.'
    );
  }
    }

  if (foundDays) {
    alert('Your weekly planning has been imported successfully.');
  }
  return;
}
  });
});
// Daisy & Paws planning analyser
const analysePlanningBtn = document.querySelector('#analysePlanningBtn');

if (analysePlanningBtn) {
  analysePlanningBtn.addEventListener('click', () => {
    const preview = document.querySelector('#planningPreview');
    const analysis = document.querySelector('#planningAnalysis');

    if (!preview || !preview.value.trim()) {
      alert('Choose a planning file first.');
      return;
    }

    const text = preview.value.trim();

// Clean Word's extracted text before analysing it
const cleanText = text
  .replace(/\r/g, '\n')
  .replace(/\u00A0/g, ' ')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n');


// -------------------------
// DETECT YEAR GROUP
// -------------------------

let year = 'Not detected';

const yearMatch = cleanText.match(
  /\byear\s*(?:group\s*)?[:\-]?\s*([1-6])\b/i
);

if (yearMatch) {
  year = 'Year ' + yearMatch[1];
}


// -------------------------
// DETECT SUBJECT
// -------------------------

let subject = 'Not detected';

// Score subject clues instead of accepting the first subject word found.
// This matters because a Science plan can legitimately contain words such as
// reading/writing/English without actually being an English plan.
const subjectScores = [
  ['Science', [
    [/\bscience\b|\bworking scientifically\b/i, 10],
    [/\bliving things?\b|\bhabitats?\b|\bmicrohabitats?\b/i, 9],
    [/\banimals?\b|\bplants?\b|\bhumans?\b|\boffspring\b/i, 5],
    [/\bfish\b|\bamphibians?\b|\breptiles?\b|\bbirds?\b|\bmammals?\b/i, 6],
    [/\bmaterials?\b|\bforces?\b|\bfood chains?\b|\benvironment\b/i, 4]
  ]],
  ['Maths', [[/\bmaths\b|\bmathematics\b|\bwhite rose\b/i, 10], [/\bnumber\b|\bplace value\b|\baddition\b|\bsubtraction\b|\bmultiplication\b|\bdivision\b/i, 3]]],
  ['English', [[/\benglish\b|\bliteracy\b/i, 10], [/\bphonics\b|\bgrammar\b|\bgenre\b|\bclass book\b/i, 5], [/\bwriting\b|\breading\b/i, 2]]],
  ['History', [[/\bhistory\b/i, 10]]],
  ['Geography', [[/\bgeography\b/i, 10]]],
  ['Computing', [[/\bcomputing\b|\bict\b/i, 10]]],
  ['Art', [[/\bart\b/i, 10]]],
  ['Music', [[/\bmusic\b/i, 10]]],
  ['PE', [[/\bphysical education\b|\bp\.?e\.?\b/i, 10]]],
  ['Design Technology', [[/\bdesign (?:&|and) technology\b|\bdesign technology\b|\bd\.?t\.?\b/i, 10]]],
  ['RE', [[/\breligious education\b|\br\.?e\.?\b/i, 10]]],
  ['PSHE', [[/\bpshe\b/i, 10]]]
];

let bestSubjectScore = 0;
for (const [name, clues] of subjectScores) {
  let score = 0;
  for (const [pattern, weight] of clues) if (pattern.test(cleanText)) score += weight;
  if (score > bestSubjectScore) {
    bestSubjectScore = score;
    subject = name;
  }
}


// -------------------------
// DETECT WEEK / DATE
// -------------------------

let week = 'Not detected';

const datePatterns = [
  /\bweek\s*(?:beginning|commencing)\s*[:\-]?\s*(?:monday\s*)?(\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{4})?)/i,

  /\bw\/?b\s*[:\-]?\s*(?:monday\s*)?(\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{4})?)/i,

  /\bweek\s*(?:beginning|commencing)\s*[:\-]?\s*(\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{2,4})?)/i
];

for (const pattern of datePatterns) {
  const match = cleanText.match(pattern);

  if (match) {
    week = match[1].trim();
    break;
  }
}


// -------------------------
// DETECT PLANNING TYPE
// -------------------------

let type = 'Not detected';

const weekdayCount = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
].filter(day =>
  new RegExp('\\b' + day + '\\b', 'i').test(cleanText)
).length;

if (
  weekdayCount >= 2 ||
  week !== 'Not detected' ||
  /\bweeks?\s*[:\-]?\s*\d+(?:\s*[-–&]\s*\d+)?\b/i.test(cleanText)
) {
  type = 'Weekly planning';
} else if (
  /\bterm\s*[:\-]?\s*(?:1|2|3|4|5|6|autumn|spring|summer)\b/i.test(cleanText)
) {
  type = 'Termly planning';
} else if (
  /\b(?:curriculum\s+(?:overview|map)|yearly\s+overview|long[\s-]*term\s+plan)\b/i.test(cleanText)
) {
  type = 'Yearly planning';
}


// -------------------------
// DISPLAY RESULTS
// -------------------------

document.querySelector('#detectedYear').textContent = year;
document.querySelector('#detectedSubject').textContent = subject;
document.querySelector('#detectedType').textContent = type;
document.querySelector('#detectedWeek').textContent = week;

analysis.hidden = false;

// Preview-only timetable matching test. Nothing is written to the planner.
if (subject !== 'Not detected' && typeof window.DP_FIND_SUBJECT_SLOTS === 'function') {
  const slots = window.DP_FIND_SUBJECT_SLOTS(subject);

  if (slots.length) {
    const slotList = slots
      .map(slot => `${slot.day} ${slot.time} — ${slot.subject}`)
      .join('\n');

    alert(
      `${subject} timetable slots found 🌼\n\n${slotList}\n\nPreview only — nothing has been added to Weekly Planning.`
    );
  } else {
    alert(
      `${subject} was recognised, but no matching ${subject} slots were found in your saved timetable.\n\nPreview only — nothing has been changed.`
    );
  }
}
  });
}
})();

// =====================================================
// DAISY & PAWS - FLEXIBLE DEFAULT + WEEKLY TIMETABLE
// =====================================================

(function () {
  const grid = document.getElementById('timetableGrid');
  if (!grid) return;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const defaultTimes = ['8:45', '9:00', '10:00', '10:45', '11:00', '12:00', '13:00', '13:30', '14:30'];
  const timesStorageKey = 'daisyPawsTimetableTimes';
  let times = [];

  // Keep the existing key so nobody loses the timetable they already entered.
  const defaultStorageKey = 'daisyPawsMasterTimetable';
  const weeklyStoragePrefix = 'daisyPawsWeeklyTimetable:';

  function readJSON(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch (error) {
      return {};
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function mondayOf(date) {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }

  function isoDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function weekStorageKey(date) {
    return weeklyStoragePrefix + isoDate(mondayOf(date));
  }

  function weekLabel(date) {
    const start = mondayOf(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 4);
    return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  times = readJSON(timesStorageKey);
  if (!Array.isArray(times) || !times.length) times = [...defaultTimes];

  let mode = 'week';
  let selectedWeek = mondayOf(new Date());
  let defaultTimetable = readJSON(defaultStorageKey);
  let timetable = {};

  // Add controls without requiring any HTML changes.
  const controls = document.createElement('div');
  controls.className = 'ttControls';
  controls.style.display = 'flex';
  controls.style.flexWrap = 'wrap';
  controls.style.gap = '8px';
  controls.style.alignItems = 'center';
  controls.style.marginBottom = '14px';

  const defaultBtn = document.createElement('button');
  defaultBtn.type = 'button';
  defaultBtn.textContent = 'Default timetable';

  const weekBtn = document.createElement('button');
  weekBtn.type = 'button';
  weekBtn.textContent = 'This week';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.textContent = '← Previous week';

  const label = document.createElement('strong');
  label.style.minWidth = '150px';
  label.style.textAlign = 'center';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.textContent = 'Next week →';

  const copyDefaultBtn = document.createElement('button');
  copyDefaultBtn.type = 'button';
  copyDefaultBtn.textContent = 'Copy default to this week';

  const copyPreviousBtn = document.createElement('button');
  copyPreviousBtn.type = 'button';
  copyPreviousBtn.textContent = 'Copy previous week';

  const editTimesBtn = document.createElement('button');
  editTimesBtn.type = 'button';
  editTimesBtn.textContent = 'Edit times';

  controls.append(defaultBtn, weekBtn, prevBtn, label, nextBtn, copyDefaultBtn, copyPreviousBtn, editTimesBtn);
  grid.parentNode.insertBefore(controls, grid);

  function normaliseTime(value) {
    const match = String(value || '').trim().match(/^([0-1]?\d|2[0-3])[:.]([0-5]\d)$/);
    if (!match) return null;
    return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
  }

  function editTimetableTimes() {
    document.getElementById('dpTimesEditor')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'dpTimesEditor';
    overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;`;

    const panel = document.createElement('div');
    panel.style.cssText = `width:min(520px,100%);height:min(680px,88vh);display:flex;flex-direction:column;overflow:hidden;background:#fffdf8;border:1px solid #ded5c8;border-radius:24px;padding:24px;box-shadow:0 18px 55px rgba(0,0,0,.2);font-family:inherit;box-sizing:border-box;`;
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:8px;">
        <h2 style="margin:0;font-size:1.45rem;">Edit timetable times 🌼</h2>
        <button type="button" id="dpTimesClose" aria-label="Close" style="border:0;background:#f3f1ed;border-radius:999px;padding:9px 13px;cursor:pointer;font-size:1rem;">×</button>
      </div>
      <p style="margin:0 0 18px;color:#666;line-height:1.45;">Set the row times used by your timetable. Add or remove rows, then save when you are happy.</p>
      <div id="dpTimesRows" style="display:grid;gap:10px;overflow-y:auto;min-height:0;padding-right:4px;"></div>
      <button type="button" id="dpAddTime" style="flex:0 0 auto;margin-top:14px;border:1px solid #d8cfc2;background:#fff;border-radius:999px;padding:10px 16px;cursor:pointer;font:inherit;">+ Add time</button>
      <div style="flex:0 0 auto;display:flex;justify-content:flex-end;gap:10px;margin-top:18px;padding-top:14px;border-top:1px solid #eee7dd;">
        <button type="button" id="dpCancelTimes" style="border:1px solid #d8cfc2;background:#fff;border-radius:999px;padding:11px 18px;cursor:pointer;font:inherit;">Cancel</button>
        <button type="button" id="dpSaveTimes" style="border:0;background:#b7c4a5;color:white;border-radius:999px;padding:11px 20px;cursor:pointer;font:inherit;font-weight:700;">Save times 🌼</button>
      </div>`;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const rows = panel.querySelector('#dpTimesRows');

    function addRow(value = '') {
      const row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;';

      const input = document.createElement('input');
      input.type = 'time';
      input.value = normaliseTime(value) || '';
      input.setAttribute('aria-label', 'Timetable row time');
      input.style.cssText = 'width:100%;box-sizing:border-box;border:1px solid #d8cfc2;border-radius:12px;padding:11px 12px;font:inherit;background:white;';

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.style.cssText = 'border:1px solid #d8cfc2;background:#fff;border-radius:999px;padding:9px 13px;cursor:pointer;font:inherit;';
      remove.addEventListener('click', () => row.remove());

      row.append(input, remove);
      rows.appendChild(row);
    }

    times.forEach(addRow);

    const close = () => overlay.remove();
    panel.querySelector('#dpTimesClose').addEventListener('click', close);
    panel.querySelector('#dpCancelTimes').addEventListener('click', close);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) close();
    });
    panel.querySelector('#dpAddTime').addEventListener('click', () => addRow(''));

    panel.querySelector('#dpSaveTimes').addEventListener('click', () => {
      const nextTimes = [...rows.querySelectorAll('input[type="time"]')]
        .map(input => normaliseTime(input.value))
        .filter(Boolean);
      const uniqueTimes = [...new Set(nextTimes)];

      if (!uniqueTimes.length) {
        alert('Please keep at least one timetable time.');
        return;
      }

      // Preserve lesson content when a time is changed by remapping rows by position.
      const oldTimes = [...times];
      const stores = [
        { key: defaultStorageKey, value: readJSON(defaultStorageKey) },
        { key: weekStorageKey(selectedWeek), value: readJSON(weekStorageKey(selectedWeek)) }
      ];

      stores.forEach(store => {
        const source = store.value;
        const remapped = { ...source };
        days.forEach(day => {
          oldTimes.forEach(oldTime => delete remapped[day + '-' + oldTime]);
          uniqueTimes.forEach((newTime, index) => {
            const oldTime = oldTimes[index];
            if (!oldTime) return;
            const value = source[day + '-' + oldTime];
            if (value !== undefined && value !== '') remapped[day + '-' + newTime] = value;
          });
        });
        writeJSON(store.key, remapped);
      });

      times = uniqueTimes;
      writeJSON(timesStorageKey, times);
      defaultTimetable = readJSON(defaultStorageKey);
      if (mode === 'default') timetable = { ...defaultTimetable };
      else loadSelectedWeek();
      close();
      renderTimetable();
    });
  }

  function loadSelectedWeek() {
    timetable = readJSON(weekStorageKey(selectedWeek));
  }

  function saveTimetable() {
    if (mode === 'default') {
      defaultTimetable = timetable;
      writeJSON(defaultStorageKey, timetable);
    } else {
      writeJSON(weekStorageKey(selectedWeek), timetable);
    }
  }

  function updateControls() {
    const isDefault = mode === 'default';
    label.textContent = isDefault ? 'Default timetable' : weekLabel(selectedWeek);
    prevBtn.hidden = isDefault;
    nextBtn.hidden = isDefault;
    copyDefaultBtn.hidden = isDefault;
    copyPreviousBtn.hidden = isDefault;
    defaultBtn.disabled = isDefault;
    weekBtn.disabled = !isDefault;
  }

  function renderTimetable() {
    updateControls();
    grid.innerHTML = '';

    const corner = document.createElement('div');
    corner.className = 'ttHeader ttTimeHeader';
    corner.textContent = 'Time';
    grid.appendChild(corner);

    days.forEach(day => {
      const header = document.createElement('div');
      header.className = 'ttHeader';
      header.textContent = day;
      grid.appendChild(header);
    });

    times.forEach(time => {
      const timeBox = document.createElement('div');
      timeBox.className = 'ttTime';
      timeBox.textContent = time;
      grid.appendChild(timeBox);

      days.forEach(day => {
        const cell = document.createElement('textarea');
        cell.className = 'ttCell';
        cell.placeholder = 'Subject / lesson';

        const key = day + '-' + time;
        cell.value = timetable[key] || '';

        cell.addEventListener('input', () => {
          timetable[key] = cell.value;
          saveTimetable();
        });

        grid.appendChild(cell);
      });
    });
  }
// Receive a timetable imported from Daisy & Paws Word timetable reader.
// Uses recognised times where possible and falls back safely to lesson order.
window.addEventListener('dp-import-timetable', event => {
    const payload = event.detail;
    const imported = payload && payload.byDay ? payload.byDay : payload;
    const importMeta = payload && payload.meta ? payload.meta : {};

    if (!imported || typeof imported !== 'object') return;
    // The uploaded timetable is the authority for its week. If its document contains
    // an actual week-beginning/date, move the timetable editor to that week before saving.
    if (importMeta.weekBeginning) {
      const parsed = new Date(importMeta.weekBeginning + 'T12:00:00');
      if (!Number.isNaN(parsed.getTime())) selectedWeek = mondayOf(parsed);
    }

    const slotTimes = [...times];

    const importedTimetable = {};

    // Convert a time such as 9:30 or 9.30 into minutes after midnight.
    function timeToMinutes(value) {
        if (!value) return null;

        const match = String(value).match(
            /\b([0-1]?\d|2[0-3])\s*[:.]\s*([0-5]\d)\b/
        );

        if (!match) return null;

        return (Number(match[1]) * 60) + Number(match[2]);
    }

    // Find the Daisy & Paws timetable row nearest to a recognised time.
    function nearestSlot(timeText) {
        const minutes = timeToMinutes(timeText);
        if (minutes === null) return null;

        let bestSlot = null;
        let smallestDifference = Infinity;

        slotTimes.forEach(slot => {
            const slotMinutes = timeToMinutes(slot);
            const difference = Math.abs(slotMinutes - minutes);

            if (difference < smallestDifference) {
                smallestDifference = difference;
                bestSlot = slot;
            }
        });

        return bestSlot;
    }

    // Tidy common artefacts from imported Word tables.
    function cleanImportedText(value) {
        return String(value || '')
            .replace(/\s*\|\s*/g, ' | ')
            .replace(/^\s*\|\s*/, '')
            .replace(/\s*\|\s*$/, '')
            .replace(/\bEnglis\s+h\b/gi, 'English')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    days.forEach(day => {
        const entries = Array.isArray(imported[day])
            ? imported[day]
            : [];

        const usedSlots = new Set();

        entries.forEach((entry, index) => {
            let text =
                typeof entry === 'string'
                    ? entry
                    : (entry.text || entry.title || entry.subject || '');

            text = cleanImportedText(text);

            if (!text) return;

            // First preference: use an explicit time from the imported entry.
            let chosenSlot = nearestSlot(text);

            // If that slot is already occupied, find the next free slot.
            if (chosenSlot && usedSlots.has(chosenSlot)) {
                const startIndex = slotTimes.indexOf(chosenSlot);

                chosenSlot =
                    slotTimes
                        .slice(startIndex + 1)
                        .find(slot => !usedSlots.has(slot)) || null;
            }

            // No recognised time: use the next available timetable row.
            if (!chosenSlot) {
                chosenSlot =
                    slotTimes.find(slot => !usedSlots.has(slot)) || null;
            }

            // More imported entries than available timetable rows.
            if (!chosenSlot) return;

            const key = day + '-' + chosenSlot;

            importedTimetable[key] = text;
            usedSlots.add(chosenSlot);
        });
    });

    timetable = importedTimetable;

    saveTimetable();
    writeJSON('dp3:last-imported-timetable-context', {weekBeginning:isoDate(selectedWeek),meta:importMeta,importedAt:new Date().toISOString()});
    renderTimetable();

    alert('Your timetable has been added 🌼');
});
  defaultBtn.addEventListener('click', () => {
    mode = 'default';
    timetable = { ...defaultTimetable };
    renderTimetable();
  });

  weekBtn.addEventListener('click', () => {
    mode = 'week';
    loadSelectedWeek();
    renderTimetable();
  });

  prevBtn.addEventListener('click', () => {
    selectedWeek.setDate(selectedWeek.getDate() - 7);
    loadSelectedWeek();
    renderTimetable();
  });

  nextBtn.addEventListener('click', () => {
    selectedWeek.setDate(selectedWeek.getDate() + 7);
    loadSelectedWeek();
    renderTimetable();
  });

  copyDefaultBtn.addEventListener('click', () => {
    timetable = { ...defaultTimetable };
    saveTimetable();
    renderTimetable();
  });

  editTimesBtn.addEventListener('click', editTimetableTimes);

  copyPreviousBtn.addEventListener('click', () => {
    const previous = new Date(selectedWeek);
    previous.setDate(previous.getDate() - 7);
    timetable = { ...readJSON(weekStorageKey(previous)) };
    saveTimetable();
    renderTimetable();
  });

  // Start on this calendar week's timetable. Existing master timetable remains
  // safely available under "Default timetable" and can be copied into any week.
  loadSelectedWeek();
  renderTimetable();

  // ========================================
  // DAISY & PAWS — TIMETABLE → PLANNING API
  // ========================================

  function getTimetableForWeek(date) {
    return readJSON(weekStorageKey(date));
  }

  function getTimetableLessonsForDay(day, sourceTimetable) {
    const lessons = [];
    const source = sourceTimetable || timetable;
    if (!day || !source || typeof source !== 'object') return lessons;

    Object.keys(source).forEach(key => {
      if (!key.startsWith(day + '-')) return;
      const lesson = String(source[key] || '').trim();
      if (!lesson) return;
      const time = key.substring((day + '-').length);
      lessons.push({ day, time, subject: lesson });
    });

    lessons.sort((a, b) => a.time.localeCompare(b.time));
    return lessons;
  }

  function getWeeklyTimetableMap(date) {
    const source = date ? getTimetableForWeek(date) : timetable;
    const weekMap = {};
    days.forEach(day => {
      weekMap[day] = getTimetableLessonsForDay(day, source);
    });
    return weekMap;
  }

  function findSubjectSlots(subject, date) {
    const wanted = String(subject || '').trim().toLowerCase();
    if (!wanted) return [];

    const aliases = {
      maths: ['maths', 'mathematics'],
      english: ['english', 'literacy', 'writing'],
      pe: ['pe', 'physical education'],
      dt: ['dt', 'design technology', 'design & technology'],
      computing: ['computing', 'ict'],
      pshe: ['pshe', 'personal social health education']
    };

    const terms = aliases[wanted] || [wanted];
    const weekMap = getWeeklyTimetableMap(date);
    const matches = [];

    Object.values(weekMap).forEach(dayLessons => {
      dayLessons.forEach(slot => {
        const cellText = String(slot.subject || '').trim().toLowerCase();
        if (terms.some(term => cellText === term || cellText.includes(term))) {
          matches.push(slot);
        }
      });
    });

    return matches;
  }

  window.DP_GET_WEEKLY_TIMETABLE = getWeeklyTimetableMap;
  window.DP_FIND_SUBJECT_SLOTS = findSubjectSlots;
  window.DP_GET_TIMETABLE_FOR_WEEK = getTimetableForWeek;
  window.DP_TIMETABLE_SELECTED_WEEK = () => isoDate(selectedWeek);
})();

// ============================================================
// DAISY & PAWS — SAFE TIMETABLE IMPORTER (PREVIEW ONLY)
// Standalone module: errors here do not stop the main planner.
// Requires JSZip to be loaded in index.html.
// ============================================================
(() => {
  'use strict';

  const DAY_ALIASES = {
    MON: 'Monday', MONDAY: 'Monday',
    TUE: 'Tuesday', TUES: 'Tuesday', TUESDAY: 'Tuesday',
    WED: 'Wednesday', WEDS: 'Wednesday', WEDNESDAY: 'Wednesday',
    THU: 'Thursday', THUR: 'Thursday', THURS: 'Thursday', THURSDAY: 'Thursday',
    FRI: 'Friday', FRIDAY: 'Friday'
  };

  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();

  function dayFromText(value) {
    const key = clean(value).toUpperCase().replace(/[.:]/g, '');
    return DAY_ALIASES[key] || null;
  }

  function textOf(element) {
    return clean([...element.getElementsByTagNameNS('*', 't')]
      .map(n => n.textContent || '').join(' '));
  }

  function parseMeta(fullText) {
    const classMatch = fullText.match(/\bClass\s*[:\-]?\s*([A-Za-z0-9.]+)/i);
    const termMatch = fullText.match(/\bTerm\s*[:\-]?\s*(\d+)/i);
    const weekMatch = fullText.match(/\bWeek\s*[:\-]?\s*(\d+)/i);
    const months={jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,sept:8,september:8,oct:9,october:9,nov:10,november:10,dec:11,december:11};
    let weekBeginning='';
    const explicit=fullText.match(/\b(?:week beginning|week commencing|w\/?b)\s*[:\-]?\s*(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:\s+(20\d{2}))?/i)
      || fullText.match(/\b(Monday)\s+(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:\s+(20\d{2}))?/i);
    if(explicit){
      const mondayForm=explicit[1]&&/^Monday$/i.test(explicit[1]);
      const day=Number(explicit[mondayForm?2:1]), mon=months[String(explicit[mondayForm?3:2]||'').toLowerCase()];
      const yr=Number(explicit[mondayForm?4:3]||new Date().getFullYear());
      if(Number.isFinite(day)&&mon!=null){const d=new Date(yr,mon,day,12);d.setDate(d.getDate()-((d.getDay()+6)%7));weekBeginning=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
    }
    // Some school timetables use only Term 1 / Week N. For the 2026–27 school year,
    // use the first full Monday in September as Week 1. Explicit dates always win.
    if(!weekBeginning && termMatch && weekMatch && Number(termMatch[1])===1){
      const yr=new Date().getFullYear(); let first=new Date(yr,8,1,12); while(first.getDay()!==1)first.setDate(first.getDate()+1);
      const w=Math.max(1,Number(weekMatch[1])); first.setDate(first.getDate()+(w-1)*7);
      weekBeginning=first.getFullYear()+'-'+String(first.getMonth()+1).padStart(2,'0')+'-'+String(first.getDate()).padStart(2,'0');
    }
    return {className:classMatch?classMatch[1]:'',term:termMatch?termMatch[1]:'',week:weekMatch?weekMatch[1]:'',weekBeginning};
  }

  function parseDaySections(xml) {
    const paragraphs = [...xml.getElementsByTagNameNS('*', 'p')]
      .map(textOf).filter(Boolean);
    const byDay = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
    let currentDay = null;

    paragraphs.forEach(text => {
      const day = dayFromText(text);
      if (day) {
        currentDay = day;
        return;
      }
      if (currentDay) byDay[currentDay].push(text);
    });

    return byDay;
  }

  function parseTableColumns(xml) {
    const byDay = { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
    const rows = [...xml.getElementsByTagNameNS('*', 'tr')];
    let dayColumns = null;
    let headerIndex = -1;

    rows.forEach((row, ri) => {
      const cells = [...row.getElementsByTagNameNS('*', 'tc')].map(textOf);
      const found = {};
      cells.forEach((cell, ci) => {
        const day = dayFromText(cell);
        if (day) found[day] = ci;
      });
      if (!dayColumns || Object.keys(found).length > Object.keys(dayColumns).length) {
        if (Object.keys(found).length >= 3) {
          dayColumns = found;
          headerIndex = ri;
        }
      }
    });

    if (!dayColumns) return byDay;

    rows.slice(headerIndex + 1).forEach(row => {
      const cells = [...row.getElementsByTagNameNS('*', 'tc')].map(textOf);
      Object.entries(dayColumns).forEach(([day, ci]) => {
        const value = clean(cells[ci]);
        if (value && !dayFromText(value)) byDay[day].push(value);
      });
    });
    return byDay;
  }

  function score(byDay) {
    return Object.values(byDay).reduce((n, arr) => n + arr.length, 0);
  }

  function makeModal(result) {
    document.getElementById('dpTimetableImportModal')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'dpTimetableImportModal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.38);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';

    const card = document.createElement('div');
    card.style.cssText = 'background:white;border-radius:18px;max-width:900px;width:100%;max-height:86vh;overflow:auto;padding:24px;box-shadow:0 18px 60px rgba(0,0,0,.25);font-family:inherit';

    const meta = [
      result.meta.className && `Class ${result.meta.className}`,
      result.meta.term && `Term ${result.meta.term}`,
      result.meta.week && `Week ${result.meta.week}`
    ].filter(Boolean).join(' · ');

    const title = document.createElement('h2');
    title.textContent = 'Timetable recognised 🌼';
    title.style.marginTop = '0';
    card.appendChild(title);

    if (meta) {
      const p = document.createElement('p');
      p.textContent = meta;
      p.style.fontWeight = '700';
      card.appendChild(p);
    }

    const note = document.createElement('p');
    note.textContent = 'Preview only — nothing has been added to your timetable. Check what Daisy & Paws has recognised.';
    card.appendChild(note);

    Object.entries(result.byDay).forEach(([day, items]) => {
      if (!items.length) return;
      const h = document.createElement('h3');
      h.textContent = day;
      h.style.marginBottom = '6px';
      card.appendChild(h);
      const ul = document.createElement('ul');
      ul.style.marginTop = '0';
      items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
      card.appendChild(ul);
    });

    const buttons = document.createElement('div');
    buttons.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;position:sticky;bottom:0;background:white;padding-top:14px';
    const add = document.createElement('button');
    add.type = 'button';
    add.textContent = 'Add to my timetable 🌼';
    add.style.cssText = 'border:0;border-radius:999px;padding:14px 24px;background:#b7c4a5;color:white;font-weight:700;font-size:1rem;cursor:pointer';
    add.onclick = () => {
      window.dispatchEvent(new CustomEvent('dp-import-timetable', { detail: { byDay: result.byDay, meta: result.meta } }));
      overlay.remove();
    };

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close preview';
    close.onclick = () => overlay.remove();
    buttons.append(add, close);
    card.appendChild(buttons);
    overlay.appendChild(card);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  async function analyse(file) {
    if (typeof JSZip === 'undefined') {
      alert('The Word document reader is not available. Nothing has been changed.');
      return;
    }
    try {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const entry = zip.file('word/document.xml');
      if (!entry) throw new Error('No Word document XML found');
      const xmlText = await entry.async('string');
      const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
      const fullText = clean([...xml.getElementsByTagNameNS('*', 't')].map(n => n.textContent || '').join(' '));
      const meta = parseMeta(fullText);

      const sectionStyle = parseDaySections(xml);
      const columnStyle = parseTableColumns(xml);
      const byDay = score(sectionStyle) >= score(columnStyle) ? sectionStyle : columnStyle;

      if (score(byDay) === 0) {
        alert('Daisy & Paws opened the Word file but could not identify weekday sections. Nothing has been changed.');
        return;
      }

      const result = { fileName: file.name, meta, byDay };
      window.DP_LAST_TIMETABLE_IMPORT_PREVIEW = result;
      makeModal(result);
    } catch (error) {
      console.error('Daisy & Paws timetable preview error:', error);
      alert('Daisy & Paws could not read that timetable. Nothing has been changed.');
    }
  }

  function install() {
    const grid = document.getElementById('timetableGrid');
    if (!grid) return;

    // Reuse the page's existing Upload timetable button when there is one.
    // This prevents Daisy & Paws from showing a duplicate upload button.
    let button = document.getElementById('dpTimetableUploadBtn');
    if (!button) {
      button = [...document.querySelectorAll('button')].find(btn =>
        btn.textContent.toLowerCase().includes('upload timetable')
      );
    }

    let wrap = null;
    if (!button) {
      wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;gap:8px;align-items:center;margin:0 0 14px;flex-wrap:wrap';
      button = document.createElement('button');
      button.type = 'button';
      button.textContent = '🌼 Upload timetable';
      wrap.appendChild(button);
      const controls = grid.previousElementSibling;
      if (controls && controls.classList.contains('ttControls')) controls.after(wrap);
      else grid.parentNode.insertBefore(wrap, grid);
    }

    button.id = 'dpTimetableUploadBtn';
    if (button.dataset.dpTimetableImporterReady === '1') return;
    button.dataset.dpTimetableImporterReady = '1';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx';
    input.hidden = true;
    input.id = 'dpTimetableUploadInput';
    (wrap || button.parentNode || document.body).appendChild(input);

    button.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      input.value = '';
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.docx')) {
        alert('Please choose a Word (.docx) timetable.');
        return;
      }
      await analyse(file);
    });
  }

  try {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
    else install();
  } catch (error) {
    console.error('Daisy & Paws timetable importer did not start:', error);
  }
})();

// ============================================================
// DAISY & PAWS — PLANNING LIBRARY V1
// Flexible storage for termly overviews, weekly plans and units.
// This module is deliberately additive: it does not replace the
// existing timetable or planning import code above.
// ============================================================
(() => {
  const STORE_KEY = 'dp3:planningLibrary:v1';

  function readLibrary() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
    catch (_) { return []; }
  }

  function writeLibrary(items) {
    localStorage.setItem(STORE_KEY, JSON.stringify(items));
  }

  function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  function analyse(text, fileName) {
    const source = String(text || '');
    const lower = source.toLowerCase();
    let year = '';
    const ym = source.match(/\byear\s*(?:group\s*)?(?:[:\-]\s*)?(one|two|three|four|five|six|[1-6])\b/i);
    if (ym) {
      const words = {one:1,two:2,three:3,four:4,five:5,six:6};
      year = 'Year ' + (words[ym[1].toLowerCase()] || ym[1]);
    }

    const subjectDefs = [
      ['Maths', /\b(?:maths|mathematics|white rose)\b/i],
      ['English', /\b(?:english|writing|guided reading|phonics)\b/i],
      ['Science', /\bscience\b|\bworking scientifically\b/i],
      ['Geography', /\bgeography\b/i], ['History', /\bhistory\b/i],
      ['RE', /\b(?:re|religious education)\b/i], ['PSHE', /\bpshe\b/i],
      ['Computing', /\bcomputing\b/i], ['Music', /\bmusic\b/i],
      ['PE', /\b(?:physical education|pe)\b/i], ['Art', /\bart\b/i],
      ['DT', /\b(?:design technology|design & technology|dt)\b/i]
    ];
    let subject = '';
    for (const [name, re] of subjectDefs) if (re.test(source)) { subject = name; break; }

    let type = 'Other planning';
    const weekdayHits = ['monday','tuesday','wednesday','thursday','friday'].filter(d => lower.includes(d)).length;
    if (/\b(?:termly overview|term overview|curriculum overview|long[ -]?term plan)\b/i.test(source) || (/\bwk\s*1\b/i.test(source) && /\bwk\s*[5-9]\b/i.test(source))) type = 'Termly overview';
    else if (/\bunit\s*:/i.test(source) || /\blesson\s*1\b/i.test(source) && /\blesson\s*[3-9]\b/i.test(source)) type = 'Unit / subject planning';
    else if (/\b(?:week beginning|week commencing|w\/?b)\b/i.test(source) || weekdayHits >= 3) type = 'Weekly planning';
    else if (/\blesson\s*(?:plan|objective|focus)\b/i.test(source)) type = 'Individual lesson plan';

    let week = '';
    const wm = source.match(/\b(?:week beginning|week commencing|w\/?b)\s*:?\s*([^\n|]{3,40})/i) || source.match(/\bWk\s*(\d+)\b/i);
    if (wm) week = clean(wm[1]);

    let title = clean(fileName || 'Planning document').replace(/\.(docx|doc|txt)$/i, '');
    const unit = source.match(/\bUnit\s*:\s*([^\n|]{3,80})/i);
    if (unit) title = clean(unit[1]);

    return { year, subject, type, week, title };
  }

  function extractDays(text) {
    const src = String(text || '').replace(/\r/g, '\n');
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const out = {};
    days.forEach((day, i) => {
      const next = days[i + 1];
      const re = next
        ? new RegExp('\\b' + day + '\\b\\s*:?\\s*([\\s\\S]*?)(?=\\b' + next + '\\b)', 'i')
        : new RegExp('\\b' + day + '\\b\\s*:?\\s*([\\s\\S]*)$', 'i');
      const m = src.match(re);
      if (m && m[1]) out[day] = m[1].trim();
    });
    return out;
  }

  function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function mount() {
    const preview = document.querySelector('#planningPreview');
    const fileInput = document.querySelector('#planningFile');
    if (!preview || !fileInput || document.querySelector('#dpPlanningLibrary')) return;

    const host = document.createElement('section');
    host.id = 'dpPlanningLibrary';
    host.style.cssText = 'margin-top:22px;padding:20px;border:1px solid #ded4c5;border-radius:22px;background:#fffdf9;';
    host.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
        <div><h2 style="margin:0 0 5px;font-size:1.35rem;">Planning Library 🌼</h2>
        <div style="color:#6d6861;">Keep different schools' planning formats together without forcing one template.</div></div>
        <button type="button" id="dpSavePlanning" style="border:0;border-radius:999px;padding:12px 18px;background:#b7c4a5;color:white;font-weight:700;cursor:pointer;">Save this planning 🌼</button>
      </div>
      <div id="dpPlanningLibraryList" style="margin-top:16px;"></div>`;
    preview.insertAdjacentElement('afterend', host);

    const render = () => {
      const list = host.querySelector('#dpPlanningLibraryList');
      const items = readLibrary();
      if (!items.length) {
        list.innerHTML = '<div style="padding:14px;border-radius:16px;background:#f7f3ec;color:#6d6861;">No saved planning yet. Upload a document above, check the preview, then choose <b>Save this planning</b>.</div>';
        return;
      }
      list.innerHTML = items.map((item, index) => `
        <div style="padding:14px 0;${index ? 'border-top:1px solid #ece4d9;' : ''}">
          <div style="display:flex;gap:12px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;">
            <div style="min-width:220px;flex:1;">
              <div style="font-weight:800;">${esc(item.title)}</div>
              <div style="margin-top:4px;color:#6d6861;font-size:.93rem;">${esc([item.type,item.subject,item.year,item.week].filter(Boolean).join(' · '))}</div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button type="button" data-dp-open="${item.id}" style="border:1px solid #ded4c5;background:white;border-radius:999px;padding:8px 12px;cursor:pointer;">Open</button>
              ${item.type === 'Weekly planning' ? `<button type="button" data-dp-week="${item.id}" style="border:0;background:#b7c4a5;color:white;border-radius:999px;padding:8px 12px;font-weight:700;cursor:pointer;">Use for this week</button>` : ''}
              <button type="button" data-dp-delete="${item.id}" style="border:1px solid #ded4c5;background:white;border-radius:999px;padding:8px 12px;cursor:pointer;">Remove</button>
            </div>
          </div>
        </div>`).join('');
    };

    host.querySelector('#dpSavePlanning').addEventListener('click', () => {
      const text = preview.value.trim();
      if (!text) { alert('Choose a planning document first.'); return; }
      const meta = analyse(text, fileInput.files?.[0]?.name || 'Planning document');
      const items = readLibrary();
      items.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2,7), ...meta, fileName:fileInput.files?.[0]?.name || '', text, savedAt:new Date().toISOString() });
      writeLibrary(items.slice(0, 80));
      render();
      alert('Planning saved to your Planning Library 🌼');
    });

    host.addEventListener('click', e => {
      const open = e.target.closest('[data-dp-open]');
      const del = e.target.closest('[data-dp-delete]');
      const use = e.target.closest('[data-dp-week]');
      const items = readLibrary();
      if (open) {
        const item = items.find(x => x.id === open.dataset.dpOpen);
        if (item) { preview.value = item.text; preview.scrollIntoView({behavior:'smooth',block:'center'}); }
      }
      if (del) {
        const item = items.find(x => x.id === del.dataset.dpDelete);
        if (item && confirm('Remove “' + item.title + '” from the Planning Library?')) {
          writeLibrary(items.filter(x => x.id !== item.id)); render();
        }
      }
      if (use) {
        const item = items.find(x => x.id === use.dataset.dpWeek);
        if (!item) return;
        const byDay = extractDays(item.text);
        const boxes = Array.from(document.querySelectorAll('#weekGrid textarea[data-w]'));
        const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
        const found = days.filter(d => byDay[d]).length;
        if (!found) { alert('This plan is saved, but Daisy & Paws could not safely find Monday–Friday sections to place into Daily Planning. Nothing has been changed.'); return; }
        if (!confirm('Daisy & Paws found ' + found + ' day sections. Add them to the currently displayed week?')) return;
        days.forEach((day, i) => {
          if (!boxes[i] || !byDay[day]) return;
          boxes[i].value = byDay[day];
          save(boxes[i].dataset.w, byDay[day]);
        });
        alert('The recognised day sections have been added to this week 🌼');
      }
    });

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();

// ============================================================
// DAISY & PAWS — INTELLIGENT PLANNING IMPORTER V2.7 — STRUCTURED LESSON RECORDS
// Adds confirmation, flexible school formats, PDF/XLSX reading,
// richer library metadata and timetable-aware weekly placement.
// ============================================================
(() => {
  'use strict';
  const KEY='dp3:planningLibrary:v2';
  const LEGACY='dp3:planningLibrary:v1';
  const q=s=>document.querySelector(s);
  const clean=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||'null');if(Array.isArray(a))return a;const b=JSON.parse(localStorage.getItem(LEGACY)||'[]');return Array.isArray(b)?b:[]}catch{return[]}};
  const write=a=>localStorage.setItem(KEY,JSON.stringify(a.slice(0,120)));
  let dpLastStructuredPlan={lessons:[],sections:[]};

  function analyse(text,name='Planning document'){
    const s=clean(text), l=s.toLowerCase();
    const words={one:1,two:2,three:3,four:4,five:5,six:6};
    const ym=s.match(/\byear\s*(?:group\s*)?[:\-]?\s*(one|two|three|four|five|six|[1-6])\b/i);
    const year=ym?'Year '+(words[ym[1].toLowerCase()]||ym[1]):'';
    // Weighted subject recognition: strong curriculum/topic clues beat incidental words.
    const defs=[
      ['Science',[[/\bscience\b|working scientifically/i,10],[/\bliving things?\b|\bhabitats?\b|\bmicrohabitats?\b/i,9],[/\banimals?\b|\bplants?\b|\bhumans?\b|\boffspring\b/i,5],[/\bfish\b|\bamphibians?\b|\breptiles?\b|\bbirds?\b|\bmammals?\b/i,6],[/\bmaterials?\b|\bforces?\b|\bfood chains?\b|\benvironment\b/i,4]]],
      ['Maths',[[/\b(?:maths|mathematics|white rose)\b/i,10],[/\bnumber\b|\bplace value\b|\baddition\b|\bsubtraction\b|\bmultiplication\b|\bdivision\b/i,3]]],
      ['English',[[/\b(?:english|literacy)\b/i,10],[/\b(?:phonics|grammar|genre|class book)\b/i,5],[/\b(?:writing|reading)\b/i,2]]],
      ['Geography',[[/\bgeography\b/i,10]]],['History',[[/\bhistory\b/i,10]]],['RE',[[/\b(?:religious education|r\.?e\.?)\b/i,10]]],['PSHE',[[/\bpshe\b/i,10]]],['Computing',[[/\b(?:computing|ict)\b/i,10]]],['Music',[[/\bmusic\b/i,10]]],['PE',[[/\b(?:physical education|p\.?e\.?)\b/i,10]]],['Art',[[/\bart\b/i,10]]],['DT',[[/\b(?:design (?:&|and)? ?technology|d\.?t\.?)\b/i,10]]]
    ];
    let subject='', best=0;
    for(const [n,clues] of defs){let score=0;for(const [r,w] of clues)if(r.test(s))score+=w;if(score>best){best=score;subject=n}}
    const weekdays=['monday','tuesday','wednesday','thursday','friday'].filter(d=>l.includes(d)).length;
    let type='Other planning';
    if(/\b(?:termly overview|term overview|curriculum overview|medium[ -]?term|long[ -]?term)\b/i.test(s)||(/\bweek\s*1\b/i.test(s)&&/\bweek\s*[4-9]\b/i.test(s))) type='Termly overview';
    else if(/\b(?:week beginning|week commencing|w\/?b)\b/i.test(s)||weekdays>=3) type='Weekly planning';
    else if(/\bunit\b/i.test(s)&&/\blesson\s*[1-9]\b/i.test(s)) type='Unit / subject planning';
    else if(/\blesson\s*(?:plan|objective|focus)\b/i.test(s)) type='Individual lesson plan';
    const termM=s.match(/\b(autumn|spring|summer)\s*(1|2)?\b/i)||s.match(/\bterm\s*[:\-]?\s*([1-6])\b/i);
    const term=termM?clean(termM.slice(1).filter(Boolean).join(' ')):'';
    const weekM=s.match(/\b(?:week beginning|week commencing|w\/?b)\s*[:\-]?\s*([^\n|]{3,45})/i)||s.match(/\bweek\s*[:\-]?\s*(\d{1,2})\b/i);
    const week=weekM?clean(weekM[1]):'';
    let title=String(name).replace(/\.(docx?|pdf|xlsx?|csv|txt|json)$/i,'');
    const unit=s.match(/\b(?:unit|topic)\s*[:\-]\s*([^\n|]{3,80})/i); if(unit)title=clean(unit[1]);
    const lessonCount=(s.match(/\blesson\s*\d+\b/gi)||[]).length;
    const weekNums=[...s.matchAll(/\b(?:week|wk)\s*(\d{1,2})\b/gi)].map(m=>+m[1]);
    return {title,year,subject,type,term,week,lessonCount,weeksDetected:[...new Set(weekNums)].sort((a,b)=>a-b)};
  }

  function days(text){
    const src=String(text||'').replace(/\r/g,'\n'), names=['Monday','Tuesday','Wednesday','Thursday','Friday'], out={};
    names.forEach((d,i)=>{const next=names[i+1];const re=next?new RegExp('(?:^|\\n|\\|)\\s*'+d+'\\s*(?:\\||:|-)?\\s*([\\s\\S]*?)(?=(?:^|\\n|\\|)\\s*'+next+'\\b)','im'):new RegExp('(?:^|\\n|\\|)\\s*'+d+'\\s*(?:\\||:|-)?\\s*([\\s\\S]*)$','im');const m=src.match(re);if(m&&clean(m[1]))out[d]=clean(m[1])});
    return out;
  }

  function loadScript(src,test){return new Promise((res,rej)=>{if(test())return res();const x=document.createElement('script');x.src=src;x.onload=res;x.onerror=rej;document.head.appendChild(x)})}
  function dpFixPlanningSpacing(value){
    let s=String(value||'').replace(/\r/g,'\n');
    s=s.replace(/([.!?])(?=[A-Z])/g,'$1 ');
    s=s.replace(/([a-z])(?=(?:pattern\s+seeking|observing\s+closely|asking\s+questions|classifying|sorting\s+and\s+grouping)\b)/gi,'$1 ');
    s=s.replace(/\bcloselypattern\b/gi,'closely; pattern');
    s=s.replace(/\blitter\.Recap\b/gi,'litter. Recap');
    s=s.replace(/\bsheets\.Activity\b/gi,'sheets. Activity');
    s=s.replace(/\banimalsRussell\b/gi,'animals. Russell');
    s=s.replace(/[ \t]+\n/g,'\n').replace(/\n[ \t]+/g,'\n');
    return clean(s);
  }

  function dpCleanLessonTitle(value, number){
    let s=dpFixPlanningSpacing(value);
    if(number!=null)s=s.replace(new RegExp('^(?:L|Lesson)\\s*'+number+'\\s*[:|\\-–—]?\\s*','i'),'');
    // In this school format the title is followed by Mind map/Recap etc. Other schools simply keep their full short title.
    s=s.split(/\b(?:Mind\s*map|Recap|Big\s+question|Activity|Provision)\s*:/i)[0];
    return clean(s).replace(/[|:;,.\-–—]+$/,'').trim();
  }

  async function readFile(file){
    const n=file.name.toLowerCase();
    if(n.endsWith('.docx')){
      if(!window.mammoth)throw Error('Word reader is not available.');
      const r=await mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()});
      const d=document.createElement('div'); d.innerHTML=r.value;
      const structured={lessons:[],sections:[],weeklyDays:{}};
      const norm=s=>dpFixPlanningSpacing(String(s||'').replace(/([a-z])([A-Z])/g,'$1 $2'));
      d.querySelectorAll('table').forEach(table=>{
        const rows=[...table.querySelectorAll('tr')];
        // Preserve day rows from weekly subject planning (Maths/English formats vary by school).
        rows.forEach(row=>{
          const cells=[...row.children].filter(x=>/^(TD|TH)$/.test(x.tagName)).map(c=>norm(c.textContent)).filter(Boolean);
          if(!cells.length)return;
          const first=cells[0]||'';
          const dm=first.match(/\b(Monday|Mon|Tuesday|Tue|Tues|Wednesday|Wed|Weds|Thursday|Thu|Thurs|Friday|Fri)\b/i);
          if(!dm)return;
          const aliases={mon:'Monday',monday:'Monday',tue:'Tuesday',tues:'Tuesday',tuesday:'Tuesday',wed:'Wednesday',weds:'Wednesday',wednesday:'Wednesday',thu:'Thursday',thurs:'Thursday',thursday:'Thursday',fri:'Friday',friday:'Friday'};
          const day=aliases[dm[1].toLowerCase()];
          const parts=cells.slice(1).map(dpFixPlanningSpacing).filter(Boolean);
          if(parts.length)structured.weeklyDays[day]={day,cells:parts,text:parts.join('\n')};
        });
        let headers=[]; let current=null;
        const finish=()=>{if(current){
          Object.keys(current.sections).forEach(k=>current.sections[k]=dpFixPlanningSpacing(current.sections[k]));
          current.title=dpCleanLessonTitle(current.title,current.number);
          current.raw=dpFixPlanningSpacing(Object.entries(current.sections).map(([k,v])=>v?k+': '+v:'').filter(Boolean).join('\n'));
          structured.lessons.push(current); current=null;
        }};
        rows.forEach(row=>{
          const cells=[...row.children].filter(x=>/^(TD|TH)$/.test(x.tagName)).map(c=>norm(c.textContent));
          if(!cells.some(Boolean))return;
          const headerish=cells.filter(Boolean).some(x=>/^(objectives?|teaching(?: notes?)?|resources?|equipment|activity|assessment|vocabulary|success criteria|learning objective)$/i.test(x));
          if(headerish){headers=cells.map((x,i)=>x||('Section '+(i+1))); return;}
          const joined=cells.join(' | ');
          const lm=joined.match(/\b(?:Lesson|L)\s*(\d{1,2})\b/i);
          if(lm){finish(); current={number:Number(lm[1]),title:'',sections:{}};}
          if(!current)return;
          cells.forEach((val,i)=>{
            if(!val)return;
            const label=norm(headers[i]||('Section '+(i+1)));
            let v=val.replace(new RegExp('^\\s*(?:Lesson|L)\\s*'+current.number+'\\s*(?:\\([^)]*\\))?\\s*','i'),'').trim();
            if(!v && /lesson/i.test(val))return;
            current.sections[label]=(current.sections[label]?current.sections[label]+'\n':'')+v;
            const titleMatch=val.match(new RegExp('(?:^|\\s)L'+current.number+'\\s+([^\\n|]{3,100})','i'));
            if(titleMatch&&!current.title)current.title=dpCleanLessonTitle(titleMatch[1],current.number);
          });
        }); finish();
        const summary=structured.lessons.map(L=>{
          const parts=['=== Lesson '+L.number+' ==='];
          Object.entries(L.sections).forEach(([k,v])=>{if(v)parts.push(k+': '+v)});
          return parts.join('\n');
        }).join('\n\n');
        if(summary)table.replaceWith(document.createTextNode('\n'+summary+'\n'));
      });
      // Fallback for Word files that are not table based.
      if(!structured.lessons.length){
        const plain=clean(d.textContent);
        const hits=[...plain.matchAll(/\b(?:Lesson|L)\s*(\d{1,2})\b/gi)];
        hits.forEach((m,i)=>structured.lessons.push({number:Number(m[1]),title:'',sections:{Content:clean(plain.slice(m.index,i+1<hits.length?hits[i+1].index:plain.length))}}));
      }
      dpLastStructuredPlan=structured;
      return clean(d.textContent);
    }
    if(n.endsWith('.pdf')){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',()=>!!window.pdfjsLib);pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;let out='';for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p), c=await page.getTextContent();out+='\n'+c.items.map(x=>x.str).join(' ')}return clean(out)}
    if(/\.xlsx?$/.test(n)){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',()=>!!window.XLSX);const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});return clean(wb.SheetNames.map(sn=>'\n['+sn+']\n'+XLSX.utils.sheet_to_csv(wb.Sheets[sn])).join('\n'))}
    return clean(await file.text());
  }

  function modal(meta,text,fileName,onSave){
    q('#dpSmartPlanModal')?.remove(); const ov=document.createElement('div');ov.id='dpSmartPlanModal';ov.style.cssText='position:fixed;inset:0;background:#0006;z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px;';
    ov.innerHTML=`<div style="width:min(760px,96vw);max-height:90vh;overflow:auto;background:#fffdf9;border:1px solid #ded4c5;border-radius:28px;padding:26px;font-family:inherit;color:#332f2b"><div style="display:flex;justify-content:space-between;gap:15px"><div><div style="font-size:.78rem;letter-spacing:.16em;font-weight:800;color:#777">PLANNING CHECK</div><h2 style="margin:6px 0 4px;font-size:2rem">Daisy & Paws recognised… 🌼</h2><p style="margin:0;color:#6d6861">Check these details before saving. Nothing is added to planning until you confirm.</p></div><button data-x style="border:0;border-radius:50%;width:46px;height:46px;font-size:22px">×</button></div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:22px"><label>Title<input data-m="title" value="${esc(meta.title)}"></label><label>Year group<input data-m="year" value="${esc(meta.year)}" placeholder="e.g. Year 2"></label><label>Subject<input data-m="subject" value="${esc(meta.subject)}" placeholder="e.g. Science"></label><label>Planning type<select data-m="type"><option>Termly overview</option><option>Weekly planning</option><option>Unit / subject planning</option><option>Individual lesson plan</option><option>Other planning</option></select></label><label>Term<input data-m="term" value="${esc(meta.term)}" placeholder="e.g. Autumn 1"></label><label>Week / week beginning<input data-m="week" value="${esc(meta.week)}" placeholder="e.g. Week 5"></label></div><div style="margin-top:16px;padding:14px;border-radius:16px;background:#f7f3ec;color:#6d6861">${meta.weeksDetected.length?'<b>Weeks detected:</b> '+meta.weeksDetected.join(', ')+' &nbsp; ':''}${meta.lessonCount?'<b>Lesson labels detected:</b> '+meta.lessonCount:''}</div><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:22px"><button data-x style="padding:11px 18px;border:1px solid #ded4c5;background:white;border-radius:999px">Cancel</button><button data-save style="padding:11px 18px;border:0;background:#b7c4a5;color:white;font-weight:800;border-radius:999px">Save to Planning Library 🌼</button></div></div>`;
    document.body.appendChild(ov); q('[data-m="type"]',ov); ov.querySelector('[data-m="type"]').value=meta.type; ov.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>ov.remove()); ov.onclick=e=>{if(e.target===ov)ov.remove()}; ov.querySelector('[data-save]').onclick=()=>{const m={...meta};ov.querySelectorAll('[data-m]').forEach(x=>m[x.dataset.m]=clean(x.value));onSave(m);ov.remove()};
  }

  const MAP_KEY='dp3:planningSubjectMappings:v1';
  const readMappings=()=>{try{return JSON.parse(localStorage.getItem(MAP_KEY)||'{}')||{}}catch{return{}}};
  const writeMappings=m=>localStorage.setItem(MAP_KEY,JSON.stringify(m));

  function allTimetableSlots(){
    if(typeof window.DP_GET_WEEKLY_TIMETABLE!=='function') return [];
    const map=window.DP_GET_WEEKLY_TIMETABLE()||{};
    const order=['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const out=[];
    order.forEach(day=>(map[day]||[]).forEach(slot=>out.push({day:slot.day||day,time:slot.time||'',label:slot.subject||''})));
    return out;
  }

  function mappingModal(item){
    q('#dpSubjectMapModal')?.remove();
    const subject=clean(item.subject)||'This subject';
    const slots=allTimetableSlots();
    if(!slots.length){alert('Daisy & Paws cannot see any lessons in the currently displayed timetable yet. Add or copy your timetable first, then try again. Nothing has been changed.');return}
    const mappings=readMappings();
    const saved=Array.isArray(mappings[subject])?mappings[subject]:[];
    const savedKeys=new Set(saved.map(x=>x.day+'|'+x.time));
    const exact=typeof window.DP_FIND_SUBJECT_SLOTS==='function'?window.DP_FIND_SUBJECT_SLOTS(subject):[];
    const suggested=new Set((exact||[]).map(x=>x.day+'|'+x.time));
    const ov=document.createElement('div');ov.id='dpSubjectMapModal';ov.style.cssText='position:fixed;inset:0;background:#0006;z-index:100000;display:flex;align-items:center;justify-content:center;padding:18px;';
    ov.innerHTML=`<div style="width:min(820px,96vw);max-height:90vh;overflow:auto;background:#fffdf9;border:1px solid #ded4c5;border-radius:28px;padding:26px;font-family:inherit;color:#332f2b"><div style="display:flex;justify-content:space-between;gap:16px"><div><div style="font-size:.78rem;letter-spacing:.16em;font-weight:800;color:#777">TIMETABLE LINK</div><h2 style="margin:6px 0 4px;font-size:2rem">Where is ${esc(subject)} taught? 🌼</h2><p style="margin:0;color:#6d6861">Choose every timetable slot that can be used for ${esc(subject)}. Daisy & Paws will remember this for future planning. Nothing is added to Daily Planning yet.</p></div><button data-x style="border:0;border-radius:50%;width:46px;height:46px;font-size:22px;flex:0 0 auto">×</button></div><div style="margin-top:20px;display:grid;gap:9px">${slots.map((slot,i)=>{const k=slot.day+'|'+slot.time;const checked=savedKeys.has(k)||(!saved.length&&suggested.has(k));return `<label style="display:grid;grid-template-columns:auto 110px 90px 1fr;gap:12px;align-items:center;padding:12px 14px;border:1px solid #e5dccf;border-radius:16px;background:white"><input type="checkbox" data-slot="${i}" ${checked?'checked':''}><b>${esc(slot.day)}</b><span>${esc(slot.time)}</span><span>${esc(slot.label)}</span></label>`}).join('')}</div><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:22px;flex-wrap:wrap"><button data-clear style="padding:11px 18px;border:1px solid #ded4c5;background:white;border-radius:999px">Clear mapping</button><div style="display:flex;gap:10px"><button data-x style="padding:11px 18px;border:1px solid #ded4c5;background:white;border-radius:999px">Cancel</button><button data-save-map style="padding:11px 18px;border:0;background:#b7c4a5;color:white;font-weight:800;border-radius:999px">Save timetable link 🌼</button></div></div></div>`;
    document.body.appendChild(ov);
    ov.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>ov.remove());
    ov.onclick=e=>{if(e.target===ov)ov.remove()};
    ov.querySelector('[data-clear]').onclick=()=>ov.querySelectorAll('[data-slot]').forEach(c=>c.checked=false);
    ov.querySelector('[data-save-map]').onclick=()=>{
      const chosen=[...ov.querySelectorAll('[data-slot]:checked')].map(c=>slots[+c.dataset.slot]);
      if(!chosen.length&&!confirm('Save with no '+subject+' timetable slots selected?'))return;
      const next=readMappings();next[subject]=chosen;writeMappings(next);ov.remove();
      alert(chosen.length?subject+' is now linked to '+chosen.length+' timetable slot'+(chosen.length===1?'':'s')+' 🌼\n\nDaisy & Paws will remember this mapping. No Daily Plan has been overwritten.':subject+' timetable mapping has been cleared.');
      window.dispatchEvent(new Event('dp-planning-library-changed'));
    };
  }

  function lessonNumberFromLabel(label){
    const m=String(label||'').match(/(?:^|\b)L(?:esson)?\s*(\d{1,2})\b/i) || String(label||'').match(/\bLesson\s*(\d{1,2})\b/i);
    return m ? Number(m[1]) : null;
  }

  function lessonTitleFromLabel(label, subject){
    let x=clean(label).replace(new RegExp('^'+String(subject||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*[|:\\-]?\\s*','i'),'');
    x=x.replace(/^L(?:esson)?\s*\d{1,2}\s*[|:\-]?\s*/i,'');
    return clean(x);
  }

  function extractLessonChunks(text){
    const src=String(text||'').replace(/\r/g,'\n');
    // New structured Word reader emits === Lesson N === markers. Keep support for older saved plans too.
    let hits=[...src.matchAll(/(?:^|\n)\s*===\s*Lesson\s*(\d{1,2})\s*===\s*/gim)];
    if(!hits.length)hits=[...src.matchAll(/(?:^|\n|\|)\s*(?:lesson|l)\s*(\d{1,2})\s*(?:[|:\-–—]\s*)?([^\n|]{0,100})/gim)];
    if(!hits.length)return [];
    return hits.map((m,i)=>{
      const raw=clean(src.slice(m.index+(m[0].startsWith('\n')?1:0),i+1<hits.length?hits[i+1].index:src.length));
      const fields=parseLessonFields(raw);
      return {number:Number(m[1]),title:fields.title||clean(m[2]||''),text:raw,fields};
    });
  }

  function parseLessonFields(text){
    const src=dpFixPlanningSpacing(String(text||'').replace(/\r/g,'\n'));
    const lines=src.split('\n').map(dpFixPlanningSpacing).filter(Boolean).filter(x=>!/^===\s*Lesson/i.test(x));
    const fields={title:'',objective:'',teaching:'',resources:'',assessment:'',vocab:'',other:[]};
    const add=(key,val)=>{val=clean(val);if(!val)return;fields[key]=fields[key]?fields[key]+'\n'+val:val};
    lines.forEach(line=>{
      const m=line.match(/^([^:]{2,45}):\s*(.*)$/);
      if(!m){fields.other.push(line);return}
      const label=m[1].toLowerCase(), val=m[2];
      if(/objective|scientific|skill/.test(label))add('objective',val);
      else if(/teaching|activity|lesson content|notes/.test(label))add('teaching',val);
      else if(/resource|equipment/.test(label))add('resources',val);
      else if(/assessment|plenary|next step/.test(label))add('assessment',val);
      else if(/vocab|key words?/.test(label))add('vocab',val);
      else fields.other.push(line);
    });
    // Lesson title is usually the first short L4/Lesson 4 line in teaching notes.
    const candidates=(fields.teaching+'\n'+fields.other.join('\n')).split('\n').map(clean).filter(Boolean);
    const titleLine=candidates.find(x=>/^(?:L|Lesson)\s*\d+\b/i.test(x));
    if(titleLine){ const nm=(titleLine.match(/^(?:L|Lesson)\s*(\d+)/i)||[])[1]; fields.title=dpCleanLessonTitle(titleLine,nm?Number(nm):null); }
    return fields;
  }

  function scoreChunk(chunk, slot, subject){
    let score=0; const n=lessonNumberFromLabel(slot.label); if(n&&chunk.number===n)score+=100;
    const wanted=lessonTitleFromLabel(slot.label,subject).toLowerCase();
    if(wanted){const words=wanted.split(/[^a-z0-9]+/).filter(w=>w.length>3);const hay=(chunk.title+' '+chunk.text).toLowerCase();words.forEach(w=>{if(hay.includes(w))score+=12});if(chunk.title&&wanted.includes(chunk.title.toLowerCase()))score+=20}
    return score;
  }

  function structuredLesson(text, fallbackTitle){
    const f=parseLessonFields(text);
    return {title:dpCleanLessonTitle(f.title||fallbackTitle||'',null),objective:dpFixPlanningSpacing(f.objective||f.title||fallbackTitle||''),success:'',vocab:dpFixPlanningSpacing(f.vocab),resources:dpFixPlanningSpacing(f.resources),next:dpFixPlanningSpacing(f.assessment),teaching:dpFixPlanningSpacing(f.teaching||f.other.join('\n'))};
  }

  function lessonPreviewHtml(chunk){
    const f=chunk.fields||parseLessonFields(chunk.text);
    const rows=[];
    if(f.title)rows.push('<div><b>Lesson focus:</b> '+esc(f.title)+'</div>');
    if(f.objective)rows.push('<div><b>Objective / scientific skill:</b><div style="white-space:pre-wrap;margin-top:4px">'+esc(f.objective)+'</div></div>');
    if(f.teaching)rows.push('<div><b>Teaching notes:</b><div style="white-space:pre-wrap;margin-top:4px">'+esc(f.teaching)+'</div></div>');
    if(f.resources)rows.push('<div><b>Resources:</b><div style="white-space:pre-wrap;margin-top:4px">'+esc(f.resources)+'</div></div>');
    if(f.assessment)rows.push('<div><b>Assessment / next step:</b><div style="white-space:pre-wrap;margin-top:4px">'+esc(f.assessment)+'</div></div>');
    if(!rows.length)rows.push('<div style="white-space:pre-wrap">'+esc(chunk.text.slice(0,2200))+'</div>');
    return rows.join('<div style="height:10px"></div>');
  }

  function dateForMappedSlot(slot){
    let base=typeof window.DP_TIMETABLE_SELECTED_WEEK==='function'?window.DP_TIMETABLE_SELECTED_WEEK():'';
    try{
      const prefix='dp3:'+((window.DP_USER&&window.DP_USER.id)||'guest')+':';
      const ctx=JSON.parse(localStorage.getItem(prefix+'dp3:last-imported-timetable-context')||'null');
      if(ctx&&ctx.weekBeginning)base=ctx.weekBeginning;
    }catch(e){}
    if(!base)return '';
    const d=new Date(base+'T12:00:00'); const idx=['Monday','Tuesday','Wednesday','Thursday','Friday'].indexOf(slot.day); if(idx>=0)d.setDate(d.getDate()+idx);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }

  function chunksForItem(item){
    if(Array.isArray(item.lessons)&&item.lessons.length){
      return item.lessons.map(L=>{
        const fields={title:dpCleanLessonTitle(L.title||'',L.number),objective:'',teaching:'',resources:'',assessment:'',vocab:'',other:[]};
        Object.entries(L.sections||{}).forEach(([label,val])=>{
          const k=label.toLowerCase(), v=dpFixPlanningSpacing(val); if(!v)return;
          if(/objective|scientific|skill/.test(k))fields.objective+=(fields.objective?'\n':'')+v;
          else if(/teaching|activity|lesson content|notes/.test(k))fields.teaching+=(fields.teaching?'\n':'')+v;
          else if(/resource|equipment/.test(k))fields.resources+=(fields.resources?'\n':'')+v;
          else if(/assessment|plenary|next step/.test(k))fields.assessment+=(fields.assessment?'\n':'')+v;
          else if(/vocab|key words?/.test(k))fields.vocab+=(fields.vocab?'\n':'')+v;
          else fields.other.push(label+': '+v);
        });
        if(!fields.title){const hay=(fields.teaching+'\n'+fields.other.join('\n'));const m=hay.match(new RegExp('(?:^|\\n)\\s*L'+L.number+'\\s+([^\\n]{3,100})','i'));if(m)fields.title=dpCleanLessonTitle(m[1],L.number);}
        const text=clean(Object.entries(L.sections||{}).map(([k,v])=>k+': '+v).join('\n'));
        return {number:Number(L.number),title:fields.title,text,fields};
      });
    }
    return extractLessonChunks(item.text);
  }


  function weeklySubjectPlanningModal(item){
    const subject=clean(item.subject)||'Subject';
    const wd=item.weeklyDays&&typeof item.weeklyDays==='object'?item.weeklyDays:{};
    const names=['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const available=names.filter(d=>wd[d]&&clean(wd[d].text));
    if(!available.length){ lessonPreviewModal(item); return; }
    const all=allTimetableSlots();
    const aliases={maths:['maths','mathematics'],english:['english','writing','literacy']};
    const terms=aliases[subject.toLowerCase()]||[subject.toLowerCase()];
    const rows=available.map(day=>{
      const slot=all.find(s=>s.day===day&&terms.some(t=>clean(s.label).toLowerCase().includes(t)))||null;
      const parts=Array.isArray(wd[day].cells)?wd[day].cells:[];
      let title=clean(parts[1]||parts[0]||subject);
      title=title.replace(/\b(?:LONG|SHORT)\b.*$/i,'').replace(/\bStem\s*:.*$/i,'').trim();
      if(title.length>95)title=title.slice(0,95).replace(/\s+\S*$/,'');
      const text=dpFixPlanningSpacing(wd[day].text||'');
      const rm=text.match(/\bResources?\s*:\s*([^\n]{1,500})/i);
      return {day,slot,title:title||subject,text,resources:rm?clean(rm[1]):''};
    });
    q('#dpWeeklySubjectModal')?.remove();
    const ov=document.createElement('div');ov.id='dpWeeklySubjectModal';ov.style.cssText='position:fixed;inset:0;background:#0006;z-index:100002;display:flex;align-items:center;justify-content:center;padding:18px';
    ov.innerHTML=`<div style="width:min(920px,96vw);max-height:92vh;overflow:auto;background:#fffdf9;border:1px solid #ded4c5;border-radius:28px;padding:26px;font-family:inherit;color:#332f2b"><div style="display:flex;justify-content:space-between;gap:16px"><div><div style="font-size:.78rem;letter-spacing:.16em;font-weight:800;color:#777">WEEKLY SUBJECT PLANNING</div><h2 style="margin:6px 0 4px;font-size:2rem">${esc(subject)} planning match 🌼</h2><p style="margin:0;color:#6d6861">Each recognised day will be kept as its own linked lesson. Daisy & Paws will only add days that have a matching ${esc(subject)} timetable slot.</p></div><button data-x style="border:0;border-radius:50%;width:46px;height:46px;font-size:22px">×</button></div><div style="display:grid;gap:12px;margin-top:20px">${rows.map((r,i)=>`<div style="border:1px solid #e5dccf;border-radius:18px;padding:16px;background:white"><div style="font-weight:800">${esc(r.day)}${r.slot?' · '+esc(r.slot.time):' · No matching timetable slot'}</div><div style="margin-top:6px"><b>${esc(r.title)}</b></div><div style="margin-top:8px;color:#6d6861;max-height:120px;overflow:auto">${esc(r.text.slice(0,700))}</div>${r.slot?`<label style="display:block;margin-top:10px"><input type="checkbox" data-weekly-pick="${i}" checked> Add this ${esc(subject)} lesson</label>`:'<div style="margin-top:10px;color:#9a6b55">Not selected — timetable does not contain a matching subject slot.</div>'}</div>`).join('')}</div><div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px"><button data-x style="padding:11px 18px;border:1px solid #ded4c5;background:white;border-radius:999px">Cancel</button><button data-add-week style="padding:11px 18px;border:0;background:#b7c4a5;color:white;font-weight:800;border-radius:999px">Add selected lessons to Weekly Planning 🌼</button></div></div>`;
    document.body.appendChild(ov);ov.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>ov.remove());ov.onclick=e=>{if(e.target===ov)ov.remove()};
    ov.querySelector('[data-add-week]').onclick=()=>{
      const picked=[...ov.querySelectorAll('[data-weekly-pick]:checked')].map(x=>rows[Number(x.dataset.weeklyPick)]).filter(r=>r&&r.slot);
      if(!picked.length){alert('No lessons selected. Nothing has been changed.');return;}
      const prefix='dp3:'+((window.DP_USER&&window.DP_USER.id)||'guest')+':';
      const rt=(k,d='')=>{const v=localStorage.getItem(prefix+k);return v===null?d:v};
      const rj=(k,d)=>{try{return JSON.parse(rt(k,''))??d}catch{return d}};
      const wr=(k,v)=>localStorage.setItem(prefix+k,typeof v==='string'?v:JSON.stringify(v));
      const isoL=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      let firstDate='';
      picked.forEach(r=>{
        const target=dateForMappedSlot(r.slot);if(!target)return;if(!firstDate)firstDate=target;
        const d=new Date(target+'T12:00:00'), idx=(d.getDay()+6)%7, mon=new Date(d);mon.setDate(d.getDate()-idx);mon.setHours(12,0,0,0);
        const wk='week:'+isoL(mon)+':'+idx;
        const heading=[r.slot.time,subject,r.title].filter(Boolean).join(' – ');
        const existing=rt(wk,'');
        const kept=String(existing||'').split('\n').filter(line=>{
          const l=line.toLowerCase();return !(l.includes(subject.toLowerCase())&&/^\s*\d{1,2}:\d{2}/.test(line));
        });
        kept.push(heading);wr(wk,kept.filter(Boolean).join('\n'));
        const data={id:'linked-'+target+'-'+clean(subject)+'-'+r.slot.time,date:target,day:r.day,time:r.slot.time,subject,timetableLabel:r.slot.label||subject,title:r.title,objective:'',success:'',vocab:'',resources:r.resources,next:'',teaching:r.text,sourceTitle:item.title||'',sourceId:item.id||'',approvedAt:new Date().toISOString()};
        let linked=rj('linked-lessons:'+target,[]);if(!Array.isArray(linked))linked=[];linked=linked.filter(x=>x.id!==data.id);linked.push(data);linked.sort((a,b)=>String(a.time).localeCompare(String(b.time)));wr('linked-lessons:'+target,linked);wr('daily-linked:'+target,linked);
      });
      ov.remove();if(firstDate&&typeof window.DP_OPEN_WEEK==='function')window.DP_OPEN_WEEK(firstDate);if(typeof window.DP_REFRESH_HOME==='function')window.DP_REFRESH_HOME();
      alert(picked.length+' '+subject+' lesson'+(picked.length===1?'':'s')+' added to Weekly Planning 🌼\n\nEach day has been kept separate and linked to its own planning.');
    };
  }

  function lessonPreviewModal(item){
    q('#dpLessonPreviewModal')?.remove();
    const subject=clean(item.subject)||'Subject', mappings=readMappings(), mapped=Array.isArray(mappings[subject])?mappings[subject]:[];
    if(!mapped.length){mappingModal(item);return}
    const current=allTimetableSlots();
    const slots=mapped.map(m=>current.find(s=>s.day===m.day&&s.time===m.time)||m);
    const chunks=chunksForItem(item);
    const matches=slots.map(slot=>{let best=null,bestScore=-1;chunks.forEach(c=>{const sc=scoreChunk(c,slot,subject);if(sc>bestScore){best=c;bestScore=sc}});return {slot,chunk:bestScore>0?best:null,score:bestScore}});
    const ov=document.createElement('div');ov.id='dpLessonPreviewModal';ov.style.cssText='position:fixed;inset:0;background:#0006;z-index:100001;display:flex;align-items:center;justify-content:center;padding:18px';
    ov.innerHTML=`<div style="width:min(900px,96vw);height:min(860px,92vh);overflow:hidden;display:flex;flex-direction:column;background:#fffdf9;border:1px solid #ded4c5;border-radius:28px;padding:26px;font-family:inherit;color:#332f2b"><div style="display:flex;justify-content:space-between;gap:16px"><div><div style="font-size:.78rem;letter-spacing:.16em;font-weight:800;color:#777">PLANNING PREVIEW</div><h2 style="margin:6px 0 4px;font-size:2rem">${esc(subject)} planning match 🌼</h2><p style="margin:0;color:#6d6861">Daisy & Paws has compared your timetable with the saved planning. Check the match before adding it to Weekly Planning.</p></div><button data-x style="border:0;border-radius:50%;width:46px;height:46px;font-size:22px">×</button></div><div style="display:grid;gap:12px;margin-top:20px;overflow:auto;padding-right:4px;min-height:0">${matches.map((m,i)=>`<div style="border:1px solid #e5dccf;border-radius:18px;padding:16px;background:white"><div style="font-weight:800">${esc(m.slot.day)} · ${esc(m.slot.time)} · ${esc(m.slot.label||subject)}</div>${m.chunk?`<div style="margin-top:8px;color:#5f5a54"><b>Matched planning:</b> Lesson ${m.chunk.number}${m.chunk.title?' · '+esc(m.chunk.title):''}</div><div style="margin-top:10px;padding:14px;border-radius:12px;background:#f7f3ec;max-height:430px;overflow:auto;line-height:1.55">${lessonPreviewHtml(m.chunk)}</div><button data-add-daily="${i}" style="margin-top:12px;border:0;border-radius:999px;padding:10px 15px;background:#b7c4a5;color:white;font-weight:800">Add this lesson to Daily Plan 🌼</button>`:`<div style="margin-top:8px;color:#8a6b54">No confident lesson match yet. Nothing will be added automatically.</div>`}</div>`).join('')}</div><div style="display:flex;justify-content:flex-end;margin-top:20px"><button data-x style="padding:11px 18px;border:1px solid #ded4c5;background:white;border-radius:999px">Close</button></div></div>`;
    document.body.appendChild(ov); ov.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>ov.remove()); ov.onclick=e=>{if(e.target===ov)ov.remove()};
    // V2.9.2: approved imported lessons go to Weekly Planning first.
    // Use one delegated click handler on the modal so the action remains reliable
    // even when lesson cards are generated dynamically.
    ov.querySelectorAll('[data-add-daily]').forEach(b=>{
      b.type='button';
      b.textContent='Add this lesson to Weekly Planning 🌼';
    });
    ov.addEventListener('click',e=>{
      const b=e.target.closest('[data-add-daily]');
      if(!b||!ov.contains(b))return;
      e.preventDefault();
      e.stopPropagation();
      try{
        const m=matches[Number(b.dataset.addDaily)];
        if(!m||!m.chunk){alert('Daisy & Paws could not find the matched lesson. Nothing has been changed.');return;}
        const f=m.chunk.fields||parseLessonFields(m.chunk.text);
        const target=dateForMappedSlot(m.slot);
        if(!target){alert('Daisy & Paws could not work out the week for this lesson yet. Nothing has been changed.');return;}

        const data={
          id:'linked-'+target+'-'+clean(subject)+'-'+m.slot.time,
          date:target,day:m.slot.day,time:m.slot.time,subject,
          timetableLabel:m.slot.label||subject,
          lessonNumber:m.chunk.number||'',
          title:f.title||lessonTitleFromLabel(m.slot.label,subject)||m.chunk.title||subject,
          objective:f.objective||'', success:'', vocab:f.vocab||'', resources:f.resources||'',
          next:f.assessment||'', teaching:f.teaching||((f.other||[]).join('\n'))||'',
          sourceTitle:item.title||'', sourceId:item.id||'', approvedAt:new Date().toISOString()
        };

        // V2.9.2: this importer runs in its own module, so write through the
        // planner's real localStorage namespace instead of calling functions
        // that belong to the main app module.
        const prefix='dp3:'+((window.DP_USER&&window.DP_USER.id)||'guest')+':';
        const readText=(k,d='')=>{const v=localStorage.getItem(prefix+k);return v===null?d:v;};
        const readJson=(k,d)=>{try{const v=JSON.parse(readText(k,''));return v??d;}catch{return d;}};
        const write=(k,v)=>localStorage.setItem(prefix+k,typeof v==='string'?v:JSON.stringify(v));
        const isoLocal=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');

        const d=new Date(target+'T12:00:00');
        const dayIndex=(d.getDay()+6)%7;
        const mon=new Date(d);mon.setDate(d.getDate()-dayIndex);mon.setHours(12,0,0,0);
        const weeklyKey='week:'+isoLocal(mon)+':'+dayIndex;
        const heading=[data.time,data.subject,data.title].filter(Boolean).join(' – ');
        const existing=readText(weeklyKey,'');
        const lines=String(existing||'').split('\n').map(x=>x.trim()).filter(Boolean);
        const newWeekly=lines.some(x=>x.toLowerCase()===heading.toLowerCase())
          ? existing
          : (existing?String(existing).replace(/\s+$/,'')+'\n':'')+heading;
        write(weeklyKey,newWeekly);

        let linked=readJson('linked-lessons:'+target,[]);
        if(!Array.isArray(linked))linked=[];
        linked=linked.filter(x=>x.id!==data.id);
        linked.push(data);
        linked.sort((a,b)=>String(a.time).localeCompare(String(b.time)));
        write('linked-lessons:'+target,linked);
        write('daily-linked:'+target,linked);

        // Open the exact week the lesson was saved into, then refresh its boxes.
        // This avoids saving correctly into one week while leaving another week visible.
        if(typeof window.DP_OPEN_WEEK==='function')window.DP_OPEN_WEEK(target);
        else{const weekNav=document.querySelector('[data-go="week"]');if(weekNav)weekNav.click();}
        const box=document.querySelector('#weekGrid textarea[data-w="'+weeklyKey+'"]');
        if(box)box.value=newWeekly;
        if(typeof window.DP_REFRESH_HOME==='function')window.DP_REFRESH_HOME();
        ov.remove();

        alert('Lesson added to Weekly Planning 🌼\n\n'+m.slot.day+' '+m.slot.time+' – '+data.subject+' – '+data.title+'\n\nDaisy & Paws has opened the week it was added to so you can see it straight away. Nothing else has been overwritten.');
      }catch(err){
        console.error('Daisy & Paws weekly lesson add failed:',err);
        alert('Daisy & Paws could not add this lesson yet. Nothing has been overwritten.\n\nTechnical detail: '+(err&&err.message?err.message:'Unknown error'));
      }
    });
  }

  function install(){
    const input=q('#planningFile'), preview=q('#planningPreview'), host=q('#dpPlanningLibrary'); if(!input||!preview)return;
    input.addEventListener('change',async()=>{const f=input.files?.[0];if(!f)return;try{preview.value='Reading '+f.name+'…';dpLastStructuredPlan={lessons:[],sections:[]};preview.value=await readFile(f);input.dataset.dpSmartReady='1'}catch(e){console.error(e);preview.value='Daisy & Paws could not read this file. For PDF/Excel imports, an internet connection is needed the first time the reader loads.'}},true);
    const analyseBtn=q('#analysePlanningBtn'); if(analyseBtn) analyseBtn.addEventListener('click',()=>{const t=clean(preview.value);if(!t)return;const m=analyse(t,input.files?.[0]?.name);setTimeout(()=>modal(m,t,input.files?.[0]?.name,saveConfirmed),0)},true);
    function saveConfirmed(meta){const items=read();items.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),...meta,fileName:input.files?.[0]?.name||'',text:clean(preview.value),lessons:Array.isArray(dpLastStructuredPlan.lessons)?dpLastStructuredPlan.lessons:[],weeklyDays:(dpLastStructuredPlan.weeklyDays&&typeof dpLastStructuredPlan.weeklyDays==='object')?dpLastStructuredPlan.weeklyDays:{},savedAt:new Date().toISOString()});write(items);window.dispatchEvent(new Event('dp-planning-library-changed'));alert('Planning saved to your Planning Library 🌼')}
    // Replace V1 save action with confirmation workflow.
    setTimeout(()=>{const b=q('#dpSavePlanning');if(b)b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const t=clean(preview.value);if(!t){alert('Choose a planning document first.');return}modal(analyse(t,input.files?.[0]?.name),t,input.files?.[0]?.name,saveConfirmed)},true)},50);

    // Add a compact smart-library view below the existing one.
    if(host&&!q('#dpSmartLibrary')){const box=document.createElement('div');box.id='dpSmartLibrary';box.style.cssText='margin-top:18px;border-top:1px solid #ece4d9;padding-top:16px';host.appendChild(box);const render=()=>{const a=read();box.innerHTML=a.length?'<div style="font-weight:800;margin-bottom:10px">Intelligent planning records</div>'+a.slice(0,20).map(x=>`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 0;border-top:1px solid #f0e9df"><div><b>${esc(x.title)}</b><div style="font-size:.9rem;color:#6d6861">${esc([x.type,x.subject,x.year,x.term,x.week].filter(Boolean).join(' · '))}</div></div><button data-smart-use="${x.id}" style="border:0;border-radius:999px;padding:8px 12px;background:#b7c4a5;color:white;font-weight:700">Use in planning</button></div>`).join(''):'<div style="color:#6d6861">No intelligently analysed plans saved yet.</div>';};render();window.addEventListener('dp-planning-library-changed',render);box.onclick=e=>{const b=e.target.closest('[data-smart-use]');if(!b)return;const item=read().find(x=>x.id===b.dataset.smartUse);if(!item)return;if(item.type==='Weekly planning'&&item.subject){weeklySubjectPlanningModal(item)}else if(item.type==='Weekly planning'){const by=days(item.text), names=['Monday','Tuesday','Wednesday','Thursday','Friday'];const boxes=[...document.querySelectorAll('#weekGrid textarea[data-w]')];const found=names.filter(d=>by[d]).length;if(!found){alert('This weekly plan is saved, but Daisy & Paws could not safely identify Monday–Friday sections. Nothing has been changed.');return}if(confirm('Add the '+found+' recognised day sections to the currently displayed week?')){names.forEach((d,i)=>{if(boxes[i]&&by[d]){boxes[i].value=by[d];boxes[i].dispatchEvent(new Event('input',{bubbles:true}))}});alert('Weekly planning added 🌼')}}else{const maps=readMappings();const linked=Array.isArray(maps[clean(item.subject)])&&maps[clean(item.subject)].length;if(linked)lessonPreviewModal(item);else mappingModal(item)}}}
  }

  // V2.9 connected Home dashboard. Home is a view of approved planning, not another copy.
  function refreshConnectedHome(){
    const panel=document.querySelector('#home .dashPanel .miniRows'); if(!panel)return;
    const today=new Date();
    const key=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
    const prefix='dp3:'+((window.DP_USER&&window.DP_USER.id)||'guest')+':';
    let linked=[];
    try{ linked=JSON.parse(localStorage.getItem(prefix+'linked-lessons:'+key)||'[]')||[]; }catch(e){ linked=[]; }
    const dayName=today.toLocaleDateString('en-GB',{weekday:'long'});
    let slots=[];
    try{ slots=allTimetableSlots().filter(s=>s.day===dayName); }catch(e){}
    const bySlot=new Map(linked.map(x=>[x.time+'|'+clean(x.subject),x]));
    const rows=[];
    slots.forEach(s=>{
      const subj=clean((s.label||'').split('|')[0])||clean(s.label)||'Lesson';
      let plan=linked.find(x=>x.time===s.time && (clean(x.subject)===subj || clean(s.label).includes(clean(x.subject))));
      const label=plan ? (plan.subject+' – '+plan.title) : (s.label||subj);
      rows.push({time:s.time,label,planned:!!plan});
    });
    linked.forEach(x=>{if(!rows.some(r=>r.time===x.time&&r.label.includes(x.title)))rows.push({time:x.time,label:x.subject+' – '+x.title,planned:true})});
    rows.sort((a,b)=>a.time.localeCompare(b.time));
    if(!rows.length){panel.innerHTML='<div class="miniRow"><span class="timeTag">—</span><span>No lessons linked for today</span><button data-go="week">→</button></div>';}
    else panel.innerHTML=rows.slice(0,8).map(r=>'<div class="miniRow"><span class="timeTag">'+esc(r.time)+'</span><span>'+esc(r.label)+(r.planned?' 🌼':'')+'</span><button data-go="'+(r.planned?'today':'timetable')+'">→</button></div>').join('');
    panel.querySelectorAll('[data-go]').forEach(btn=>btn.onclick=()=>{
      const dest=btn.dataset.go;
      const nav=document.querySelector('nav [data-go="'+dest+'"], aside [data-go="'+dest+'"], .sidebar [data-go="'+dest+'"]');
      if(nav && nav!==btn) nav.click();
      else {
        const page=document.getElementById(dest);
        if(page){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));page.classList.add('active');}
      }
    });
  }
  window.DP_REFRESH_HOME=refreshConnectedHome;
  setTimeout(refreshConnectedHome,80);
  document.querySelectorAll('[data-go="home"]').forEach(b=>b.addEventListener('click',()=>setTimeout(refreshConnectedHome,0)));

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
