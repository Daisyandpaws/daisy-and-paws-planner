(()=>{'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];const P='dp3:'+((window.DP_USER&&window.DP_USER.id)||'guest')+':';let flashTimer;const save=(k,v)=>{localStorage.setItem(P+k,typeof v==='string'?v:JSON.stringify(v));const x=$('#saved');x.classList.add('show');clearTimeout(flashTimer);flashTimer=setTimeout(()=>x.classList.remove('show'),650)};const get=(k,d='')=>{const v=localStorage.getItem(P+k);if(v===null)return d;return v};const json=(k,d)=>{try{return JSON.parse(get(k,''))||d}catch{return d}};const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function go(id){$$('.page').forEach(p=>p.classList.toggle('active',p.id===id));$$('[data-go]').forEach(b=>b.classList.toggle('active',b.dataset.go===id));$('#tabs').classList.remove('open');scrollTo({top:0,behavior:'smooth'})}$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));$('#moreBtn').onclick=()=>$('#tabs').classList.toggle('open');
$$('[data-field]').forEach(el=>{el.value=get(el.dataset.field,'');el.oninput=()=>save(el.dataset.field,el.value);el.onchange=el.oninput});const now=new Date();$('#lessonDate').value=get('lesson-date',iso(now));$('#lessonDate').onchange=()=>save('lesson-date',$('#lessonDate').value);
let month=new Date(2026,8,1),selected='';function renderCal(){const y=month.getFullYear(),m=month.getMonth();$('#monthLabel').textContent=month.toLocaleDateString('en-GB',{month:'long',year:'numeric'});let h=['M','T','W','T','F','S','S'].map(x=>`<div class="dow">${x}</div>`).join('');const blank=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate();h+='<div></div>'.repeat(blank);for(let d=1;d<=days;d++){const k=iso(new Date(y,m,d)),n=get('cal:'+k,'');h+=`<button class="date ${k===iso(now)?'today':''} ${k===selected?'selected':''}" data-date="${k}"><b>${d}</b>${n?`<small>• ${n.slice(0,20)}</small>`:''}</button>`}$('#calendar').innerHTML=h;$$('[data-date]').forEach(b=>b.onclick=()=>selectDate(b.dataset.date))}function selectDate(k){selected=k;$('#selectedDate').value=k;$('#calendarNote').value=get('cal:'+k,'');renderCal()}$('#prevMonth').onclick=()=>{month.setMonth(month.getMonth()-1);renderCal()};$('#nextMonth').onclick=()=>{month.setMonth(month.getMonth()+1);renderCal()};$('#selectedDate').onchange=()=>selectDate($('#selectedDate').value);$('#calendarNote').oninput=()=>{if(selected){save('cal:'+selected,$('#calendarNote').value);renderCal()}};renderCal();
let monday=new Date(now);monday.setHours(12,0,0,0);monday.setDate(monday.getDate()-((monday.getDay()+6)%7));function renderWeek(){const end=new Date(monday);end.setDate(end.getDate()+4);$('#weekLabel').textContent=`${monday.toLocaleDateString('en-GB',{day:'numeric',month:'short'})} – ${end.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`;const names=['Monday','Tuesday','Wednesday','Thursday','Friday'];$('#weekGrid').innerHTML=names.map((n,i)=>{const d=new Date(monday);d.setDate(d.getDate()+i);const k='week:'+iso(monday)+':'+i;return `<div class="day"><h3>${n}<br>${d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</h3><textarea data-w="${k}" placeholder="Lessons, duties, reminders…"></textarea></div>`}).join('');$$('[data-w]').forEach(t=>{t.value=get(t.dataset.w,'');t.oninput=()=>save(t.dataset.w,t.value)})}$('#prevWeek').onclick=()=>{monday.setDate(monday.getDate()-7);renderWeek()};$('#nextWeek').onclick=()=>{monday.setDate(monday.getDate()+7);renderWeek()};renderWeek();
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
    const lastWeek = weekRangeMatch[2];

    const chosenWeek = window.prompt(
      'Daisy & Paws has recognised planning for Weeks ' +
      firstWeek + '–' + lastWeek +
      '.\n\nWhich week would you like to preview?\n\nEnter ' +
      firstWeek + ' or ' + lastWeek + ':'
    );

    if (chosenWeek === null) {
      return;
    }

    const choice = chosenWeek.trim();

    if (choice !== firstWeek && choice !== lastWeek) {
      alert('Please enter ' + firstWeek + ' or ' + lastWeek + '.');
      return;
    }

    // Match only a Week heading on its own line, so phrases such as
    // "Spelling Week 5" are not mistaken for the main week section.
    const escapedWeek = choice.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const weekHeading = new RegExp(
      '^\\s*Week\\s*' + escapedWeek + '\\s*:?\\s*$',
      'im'
    );
    const headingMatch = weekHeading.exec(text);

    if (!headingMatch) {
      alert(
        'Daisy & Paws found Weeks ' + firstWeek + '–' + lastWeek +
        ', but could not find a standalone Week ' + choice + ' heading.'
      );
      return;
    }

    const sectionStart = headingMatch.index + headingMatch[0].length;
    const remainingText = text.slice(sectionStart);
    const nextWeekHeading = /^\s*Week\s*\d+\s*:?\s*$/im.exec(remainingText);
    const sectionEnd = nextWeekHeading ? nextWeekHeading.index : remainingText.length;
    const weekContent = remainingText.slice(0, sectionEnd).trim();

    if (!weekContent) {
      alert('Week ' + choice + ' was found, but there is no planning beneath that heading.');
      return;
    }

    // Preview only. Nothing is written to the planner at this stage.
    alert(
      'Week ' + choice + ' preview\n\n' +
      weekContent.slice(0, 2500) +
      (weekContent.length > 2500 ? '\n\n…preview shortened…' : '') +
      '\n\nNothing has been added to your planner yet.'
    );
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

const subjects = [
  ['English', /\bEnglish\b/i],
  ['Maths', /\b(?:Maths|Mathematics)\b/i],
  ['Science', /\bScience\b/i],
  ['History', /\bHistory\b/i],
  ['Geography', /\bGeography\b/i],
  ['Computing', /\bComputing\b/i],
  ['Art', /\bArt\b/i],
  ['Music', /\bMusic\b/i],
  ['PE', /\b(?:PE|Physical Education)\b/i],
  ['Design Technology', /\b(?:Design Technology|DT)\b/i]
];

for (const [name, pattern] of subjects) {
  if (pattern.test(cleanText)) {
    subject = name;
    break;
  }
}

// Extra check for documents whose subject is obvious
// from common planning terminology
if (
  subject === 'Not detected' &&
  /\b(?:writing|reading|grammar|phonics|genre|class book)\b/i.test(cleanText)
) {
  subject = 'English';
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
  });
}
})();
