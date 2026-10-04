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
    return `${Number(match[1])}:${match[2]}`;
  }

  function editTimetableTimes() {
    document.getElementById('dpTimesEditor')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'dpTimesEditor';
    overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;`;

    const panel = document.createElement('div');
    panel.style.cssText = `width:min(520px,100%);max-height:85vh;overflow:auto;background:#fffdf8;border:1px solid #ded5c8;border-radius:24px;padding:24px;box-shadow:0 18px 55px rgba(0,0,0,.2);font-family:inherit;`;
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:8px;">
        <h2 style="margin:0;font-size:1.45rem;">Edit timetable times 🌼</h2>
        <button type="button" id="dpTimesClose" aria-label="Close" style="border:0;background:#f3f1ed;border-radius:999px;padding:9px 13px;cursor:pointer;font-size:1rem;">×</button>
      </div>
      <p style="margin:0 0 18px;color:#666;line-height:1.45;">Set the row times used by your timetable. Add or remove rows, then save when you are happy.</p>
      <div id="dpTimesRows" style="display:grid;gap:10px;"></div>
      <button type="button" id="dpAddTime" style="margin-top:14px;border:1px solid #d8cfc2;background:#fff;border-radius:999px;padding:10px 16px;cursor:pointer;font:inherit;">+ Add time</button>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:22px;">
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
    const imported = event.detail;

    if (!imported || typeof imported !== 'object') return;

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
    return {
      className: classMatch ? classMatch[1] : '',
      term: termMatch ? termMatch[1] : '',
      week: weekMatch ? weekMatch[1] : ''
    };
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
      window.dispatchEvent(new CustomEvent('dp-import-timetable', { detail: result.byDay }));
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
