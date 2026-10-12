import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Upload, FileText, Plus, Trash2, Pencil, Check, AlertTriangle, TrendingUp, TrendingDown, Bookmark, BookmarkCheck, ExternalLink, Lightbulb, Target, Play, CalendarPlus, Users, Radio, Loader2, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { PageHeading, Tag, Progress } from './shared';
import { useDemo } from './app-shell';
import { subjects, topicsBySubject, parseCsv, sampleCsv } from '@/data/academics';
import {
  getAcademicRecords, createAcademicRecord, updateAcademicRecord, deleteAcademicRecord,
  getTopicStats, getSubjectStats, getResources, getQuestions, ApiError,
  type PerfRecord, type TopicStat, type SubjectStat, type Resource, type Question,
} from '@/api';
import { toast } from 'sonner';

type Attempt = {id:number;subject:string;topic:string;score:number;total:number;date:string};
type LoadStatus = 'loading'|'ready'|'error';
type Ctx = {
 records:PerfRecord[];stats:TopicStat[];subjectStats:SubjectStat[];resources:Resource[];
 status:LoadStatus;error:string|null;retry:()=>void;
 createRecord:(data:Omit<PerfRecord,'id'>)=>Promise<void>;
 createManyRecords:(items:Omit<PerfRecord,'id'>[])=>Promise<void>;
 editRecord:(id:number,data:Omit<PerfRecord,'id'>)=>Promise<void>;
 removeRecord:(id:number)=>Promise<void>;
 attempts:Attempt[];addAttempt:(a:Attempt)=>void;bookmarks:number[];toggleBookmark:(id:number)=>void;
};
const AcademicsContext = createContext<Ctx|null>(null);
export function useAcademics(){const c=useContext(AcademicsContext);if(!c)throw new Error('Academics context missing');return c;}

export function AcademicsProvider({children}:{children:ReactNode}){
 const [records,setRecords]=useState<PerfRecord[]>([]);
 const [stats,setStats]=useState<TopicStat[]>([]);
 const [subjectStats,setSubjectStats]=useState<SubjectStat[]>([]);
 const [resources,setResources]=useState<Resource[]>([]);
 const [status,setStatus]=useState<LoadStatus>('loading');
 const [error,setError]=useState<string|null>(null);
 const [attempts,setAttempts]=useState<Attempt[]>([{id:1,subject:'DSA',topic:'Arrays',score:2,total:2,date:'2026-10-01'}]);
 const [bookmarks,setBookmarks]=useState<number[]>([]);

 const load=useCallback(async()=>{
  setStatus('loading');
  try{
   const [recRes,topicRes,subjRes,resRes]=await Promise.all([getAcademicRecords(),getTopicStats(),getSubjectStats(),getResources()]);
   setRecords(recRes.data);setStats(topicRes.data);setSubjectStats(subjRes.data);setResources(resRes.data);
   setStatus('ready');setError(null);
  }catch(e){
   setError(e instanceof ApiError?e.message:'Could not load your performance data.');
   setStatus('error');
  }
 },[]);
 useEffect(()=>{load();},[load]);

 // After any mutation, re-fetch records + stats from the server — it's the
 // source of truth for gap analysis, not something we recompute locally.
 const reloadRecordsAndStats=useCallback(async()=>{
  const [recRes,topicRes,subjRes]=await Promise.all([getAcademicRecords(),getTopicStats(),getSubjectStats()]);
  setRecords(recRes.data);setStats(topicRes.data);setSubjectStats(subjRes.data);
 },[]);

 const createRecord=async(data:Omit<PerfRecord,'id'>)=>{await createAcademicRecord(data);await reloadRecordsAndStats();};
 const createManyRecords=async(items:Omit<PerfRecord,'id'>[])=>{for(const item of items){await createAcademicRecord(item);}await reloadRecordsAndStats();};
 const editRecord=async(id:number,data:Omit<PerfRecord,'id'>)=>{await updateAcademicRecord(id,data);await reloadRecordsAndStats();};
 const removeRecord=async(id:number)=>{await deleteAcademicRecord(id);await reloadRecordsAndStats();};

 return <AcademicsContext.Provider value={{
  records,stats,subjectStats,resources,status,error,retry:load,
  createRecord,createManyRecords,editRecord,removeRecord,
  attempts,addAttempt:a=>setAttempts(x=>[a,...x]),
  bookmarks,toggleBookmark:id=>setBookmarks(b=>b.includes(id)?b.filter(v=>v!==id):[...b,id]),
 }}>{children}</AcademicsContext.Provider>;
}

const TABS = ['Performance data','Learning gaps','Materials','Practice','Progress','Focus next'] as const;
type TabName = typeof TABS[number];
const chartColors = { primary:'#7563A9', lavender:'#D8CCFA', coral:'#F3B4B8', mint:'#B9EBD9', peach:'#F9D9B7' };
const statusColor = (s:string)=>s==='Weak'?'amber':s==='Revise'?'cyan':'emerald';

export function Academics(){
 const {status,error,retry}=useAcademics();
 const [tab,setTab]=useState<TabName>('Focus next');
 const [practiceTopic,setPracticeTopic]=useState<{subject:string;topic:string}|null>(null);
 const startPractice=(subject:string,topic:string)=>{setPracticeTopic({subject,topic});setTab('Practice');};

 if(status==='loading')return <>
  <PageHeading title="Performance Lab." description="Enter your marks, spot learning gaps, and practise exactly what needs work."/>
  <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground"><Loader2 className="animate-spin" size={20}/><span>Loading your performance data…</span></div>
 </>;
 if(status==='error')return <>
  <PageHeading title="Performance Lab." description="Enter your marks, spot learning gaps, and practise exactly what needs work."/>
  <div className="panel p-8 max-w-md mx-auto mt-8 text-center">
   <AlertTriangle className="mx-auto text-amber-500 mb-3" size={32}/>
   <h3 className="text-lg font-semibold mb-2">Could not load your data</h3>
   <p className="text-muted-foreground text-sm mb-5">{error}</p>
   <Button onClick={retry}><RefreshCw size={14}/>Try again</Button>
  </div>
 </>;

 return <>
  <PageHeading title="Performance Lab." description="Enter your marks, spot learning gaps, and practise exactly what needs work."><Tag color="emerald">SAVED ON THIS DEVICE</Tag></PageHeading>
  <div className="pill-tabs" role="tablist" aria-label="Performance Lab sections">{TABS.map(t=><button key={t} role="tab" aria-selected={tab===t} className={tab===t?'chosen':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
  {tab==='Performance data'&&<DataEntry/>}
  {tab==='Learning gaps'&&<Gaps onPractice={startPractice}/>}
  {tab==='Materials'&&<Materials/>}
  {tab==='Practice'&&<Practice key={practiceTopic?practiceTopic.subject+practiceTopic.topic:'none'} initial={practiceTopic}/>}
  {tab==='Progress'&&<ProgressView/>}
  {tab==='Focus next'&&<FocusNext onPractice={startPractice}/>}
 </>;
}

function DataEntry(){
 const {records,createRecord,editRecord,removeRecord,createManyRecords}=useAcademics();
 const blank={subject:'DSA',topic:'Arrays',score:'',max:'20',date:new Date().toISOString().slice(0,10),type:'Quiz',mistakes:''};
 const [form,setForm]=useState(blank); const [editing,setEditing]=useState<number|null>(null); const [error,setError]=useState('');
 const [csvState,setCsvState]=useState<{name:string;rows:PerfRecord[];errors:string[]}|null>(null);
 const [busy,setBusy]=useState(false);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();const score=Number(form.score),max=Number(form.max);
  if(form.score===''||isNaN(score)||isNaN(max)||max<=0){setError('Enter a score and a maximum greater than 0.');return;}
  if(score<0||score>max){setError(`Score must be between 0 and ${max}.`);return;}
  setError('');
  const data={subject:form.subject,topic:form.topic,score,max,date:form.date,type:form.type as PerfRecord['type'],mistakes:form.mistakes};
  setBusy(true);
  try{
   if(editing){await editRecord(editing,data);toast.success('Record updated');}
   else{await createRecord(data);toast.success('Record added');}
   setEditing(null);setForm(blank);
  }catch{toast.error('Could not save this record — try again.');}
  finally{setBusy(false);}
 };
 const onFile=(file?:File)=>{if(!file)return;if(!file.name.endsWith('.csv')){setCsvState({name:file.name,rows:[],errors:['Please choose a .csv file.']});return;}file.text().then(t=>setCsvState({name:file.name,...parseCsv(t)}));};
 const importCsv=async()=>{
  if(!csvState||!csvState.rows.length)return;
  setBusy(true);
  try{await createManyRecords(csvState.rows.map(({id:_id,...rest})=>rest));toast.success(`Imported ${csvState.rows.length} records`);setCsvState(null);}
  catch{toast.error('Could not import these records — try again.');}
  finally{setBusy(false);}
 };
 const remove=async(id:number)=>{
  setBusy(true);
  try{await removeRecord(id);}catch{toast.error('Could not delete this record — try again.');}
  finally{setBusy(false);}
 };
 const topics=topicsBySubject[form.subject]||[];
 return <div className="lab-grid">
  <section className="panel p-5"><h3 className="lab-title"><Plus size={16}/>{editing?'Edit record':'Add marks'}</h3>
   <form className="form-stack" onSubmit={submit}>
    <div className="form-grid"><label>Subject<select value={form.subject} onChange={e=>setForm({...form,subject:e.target.value,topic:topicsBySubject[e.target.value]?.[0]??''})}>{subjects.map(s=><option key={s}>{s}</option>)}</select></label>
    <label>Topic<select value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}>{topics.map(t=><option key={t}>{t}</option>)}</select></label>
    <label>Score<input inputMode="decimal" value={form.score} onChange={e=>setForm({...form,score:e.target.value})} placeholder="e.g. 14" aria-invalid={!!error}/></label>
    <label>Out of<input inputMode="decimal" value={form.max} onChange={e=>setForm({...form,max:e.target.value})}/></label>
    <label>Type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{['Quiz','Exam','Assignment','Practice'].map(t=><option key={t}>{t}</option>)}</select></label>
    <label>Date<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label></div>
    <label>Mistakes noticed (optional)<input value={form.mistakes} onChange={e=>setForm({...form,mistakes:e.target.value})} placeholder="e.g. Pointer updates"/></label>
    {error&&<p className="form-error" role="alert"><AlertTriangle size={14}/>{error}</p>}
    <div className="flex gap-2"><Button type="submit" disabled={busy}><Check/>{editing?'Save changes':'Add record'}</Button>{editing&&<Button type="button" variant="ghost" onClick={()=>{setEditing(null);setForm(blank);}}>Cancel</Button>}</div>
   </form>
  </section>
  <section className="panel p-5"><h3 className="lab-title"><Upload size={16}/>Import a CSV</h3>
   <label className="drop-zone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();onFile(e.dataTransfer.files[0]);}}><FileText/><strong>{csvState?.name||'Choose or drop a CSV file'}</strong><small>Columns: subject, topic, score, max, date, type, mistakes</small><input type="file" accept=".csv" className="sr-only" onChange={e=>onFile(e.target.files?.[0])}/></label>
   <Button variant="outline" size="sm" className="mt-3" onClick={()=>setCsvState({name:'sample-marks.csv',...parseCsv(sampleCsv)})}>Load sample CSV</Button>
   {csvState&&<div className="mt-4">{csvState.errors.map(e=><p key={e} className="form-error"><AlertTriangle size={14}/>{e}</p>)}{csvState.rows.length>0&&<><p className="text-success text-xs mb-2"><Check size={14} className="inline"/> {csvState.rows.length} valid rows ready</p><Button size="sm" disabled={busy} onClick={importCsv}>Import records</Button></>}</div>}
  </section>
  <section className="panel lab-span"><div className="panel-header"><h3>Your records <Tag color="neutral">{records.length}</Tag></h3></div>
   <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Date</th><th>Subject</th><th>Topic</th><th>Type</th><th>Score</th><th>Mistakes</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{[...records].sort((a,b)=>b.date.localeCompare(a.date)).map(r=>{const p=Math.round(r.score/r.max*100);return <tr key={r.id}><td>{r.date}</td><td>{r.subject}</td><td>{r.topic}</td><td>{r.type}</td><td><Tag color={p<60?'amber':p<75?'cyan':'emerald'}>{r.score}/{r.max} · {p}%</Tag></td><td className="text-muted-foreground">{r.mistakes||'—'}</td><td className="whitespace-nowrap"><Button variant="ghost" size="icon" aria-label="Edit record" onClick={()=>{setEditing(r.id);setForm({subject:r.subject,topic:r.topic,score:String(r.score),max:String(r.max),date:r.date,type:r.type,mistakes:r.mistakes});}}><Pencil/></Button><Button variant="ghost" size="icon" aria-label="Delete record" disabled={busy} onClick={()=>remove(r.id)}><Trash2/></Button></td></tr>;})}</tbody></table></div>
  </section>
 </div>;
}

function Gaps({onPractice}:{onPractice:(s:string,t:string)=>void}){
 const {stats,subjectStats:subj}=useAcademics();
 const [sel,setSel]=useState<TopicStat|null>(stats[0]||null);
 const current=sel&&stats.find(s=>s.topic===sel.topic&&s.subject===sel.subject)||stats[0];
 return <div className="lab-grid">
  <section className="panel p-5"><h3 className="lab-title">Subject performance</h3><div className="chart-box"><ResponsiveContainer><BarChart data={subj}><CartesianGrid vertical={false}/><XAxis dataKey="subject" tick={{fontSize:10}}/><YAxis domain={[0,100]} tick={{fontSize:10}}/><Tooltip/><Bar dataKey="pct" name="Average %" radius={[10,10,10,10]}>{subj.map((s,i)=><Cell key={s.subject} fill={[chartColors.lavender,chartColors.mint,chartColors.peach,chartColors.coral][i%4]}/>)}</Bar></BarChart></ResponsiveContainer></div></section>
  <section className="panel p-5"><h3 className="lab-title">Learning-gap map</h3><p className="text-muted-foreground text-xs mb-3">Select a topic to see why it needs attention.</p>
   <div className="gap-map">{stats.map(s=><button key={s.subject+s.topic} className={`gap-cell ${s.status.toLowerCase()} ${current===s?'chosen':''}`} onClick={()=>setSel(s)}><strong>{s.topic}</strong><small>{s.subject} · {s.pct}%</small></button>)}</div>
   <div className="legend mt-3"><span className="dot weak"/>Weak &lt;60% <span className="dot revise"/>Revise 60–74% <span className="dot strong"/>Strong 75%+</div>
  </section>
  {current&&<section className="panel p-5 lab-span"><div className="flex flex-wrap items-start justify-between gap-3"><div><Tag color={statusColor(current.status)}>{current.status.toUpperCase()}</Tag><h3 className="text-xl mt-2">{current.topic} <span className="text-muted-foreground text-sm">· {current.subject}</span></h3></div><Button onClick={()=>onPractice(current.subject,current.topic)}><Play/>Practise this topic</Button></div>
   <div className="form-grid mt-4"><div><small className="text-muted-foreground">Mastery</small><div className="text-2xl my-1">{current.pct}%</div><Progress value={current.pct}/></div><div><small className="text-muted-foreground">Trend over {current.attempts} attempts</small><div className="text-2xl my-1 flex items-center gap-2">{current.trend>=0?<TrendingUp className="text-success"/>:<TrendingDown className="text-destructive"/>}{current.trend>0?'+':''}{current.trend}%</div></div></div>
   <h4 className="mt-4 mb-2 text-sm">Recurring mistakes</h4>{current.mistakes.length?<ul className="flex flex-wrap gap-2">{current.mistakes.map(m=><li key={m}><Tag color="amber">{m}</Tag></li>)}</ul>:<p className="text-muted-foreground text-xs">No mistakes noted.</p>}
  </section>}
 </div>;
}

function ResourceCard({r}:{r:Resource}){const {bookmarks,toggleBookmark}=useAcademics();const saved=bookmarks.includes(r.id);return <article className="resource-card"><div className="flex justify-between items-start gap-2"><Tag color="neutral">{r.kind}</Tag><Button variant="ghost" size="icon" aria-label={saved?'Remove bookmark':'Bookmark'} aria-pressed={saved} onClick={()=>{toggleBookmark(r.id);toast(saved?'Bookmark removed':'Saved to bookmarks');}}>{saved?<BookmarkCheck className="text-primary"/>:<Bookmark/>}</Button></div><h4>{r.title}</h4><p>{r.description}</p><div className="flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{r.subject} · {r.topic}</span><span>·</span><span>{r.difficulty}</span><span>·</span><span>{r.minutes} min</span></div><a href={r.url} target="_blank" rel="noreferrer" className="panel-link mt-3">Open resource<ExternalLink size={12}/></a></article>;}

function Materials(){
 const {stats,bookmarks,resources}=useAcademics();
 const [subject,setSubject]=useState('All');const [kind,setKind]=useState('All');const [diff,setDiff]=useState('All');const [onlyGaps,setOnlyGaps]=useState(true);const [onlySaved,setOnlySaved]=useState(false);
 const weak=new Set(stats.filter(s=>s.status!=='Strong').map(s=>s.topic));
 const list=resources.filter(r=>(subject==='All'||r.subject===subject)&&(kind==='All'||r.kind===kind)&&(diff==='All'||r.difficulty===diff)&&(!onlyGaps||weak.has(r.topic))&&(!onlySaved||bookmarks.includes(r.id)));
 return <>
  <div className="filter-row"><select aria-label="Subject" value={subject} onChange={e=>setSubject(e.target.value)}><option>All</option>{subjects.map(s=><option key={s}>{s}</option>)}</select><select aria-label="Type" value={kind} onChange={e=>setKind(e.target.value)}>{['All','Video','Notes','Docs','Tutorial','Practice'].map(k=><option key={k}>{k}</option>)}</select><select aria-label="Difficulty" value={diff} onChange={e=>setDiff(e.target.value)}>{['All','Easy','Medium','Hard'].map(k=><option key={k}>{k}</option>)}</select><label className="flex items-center gap-2"><input type="checkbox" checked={onlyGaps} onChange={e=>setOnlyGaps(e.target.checked)}/>For my gaps</label><label className="flex items-center gap-2"><input type="checkbox" checked={onlySaved} onChange={e=>setOnlySaved(e.target.checked)}/>Bookmarked ({bookmarks.length})</label></div>
  {list.length?<div className="item-grid">{list.map(r=><ResourceCard key={r.id} r={r}/>)}</div>:<p className="empty-state">No materials match these filters.</p>}
 </>;
}

function Practice({initial}:{initial:{subject:string;topic:string}|null}){
 const {createManyRecords,addAttempt,stats}=useAcademics();const {addPlanTask}=useDemo();
 const [subject,setSubject]=useState(initial?.subject||'DSA');const [topic,setTopic]=useState(initial?.topic||'Any');const [difficulty,setDifficulty]=useState('Mixed');const [count,setCount]=useState(3);
 const [qs,setQs]=useState<Question[]|null>(null);const [answers,setAnswers]=useState<Record<string,number>>({});const [hints,setHints]=useState<string[]>([]);const [done,setDone]=useState(false);const [loading,setLoading]=useState(false);
 const generate=async()=>{
  setLoading(true);
  try{
   const res=await getQuestions({subject,topic,difficulty,count});
   if(!res.data.length){toast.error('No questions for this topic yet');return;}
   setQs(res.data);setAnswers({});setHints([]);setDone(false);
  }catch{toast.error('Could not load questions — try again.');}
  finally{setLoading(false);}
 };
 const score=qs?qs.filter(q=>answers[q.id]===q.answer).length:0;
 const submit=async()=>{
  if(!qs)return;setDone(true);const today=new Date().toISOString().slice(0,10);
  const byTopic=new Map<string,{s:number;t:number;subject:string}>();
  qs.forEach(q=>{const k=q.topic;const v=byTopic.get(k)||{s:0,t:0,subject:q.subject};v.t++;if(answers[q.id]===q.answer)v.s++;byTopic.set(k,v);});
  try{
   await createManyRecords([...byTopic.entries()].map(([t,v])=>({subject:v.subject,topic:t,score:v.s,max:v.t,date:today,type:'Practice' as const,mistakes:v.s<v.t?'Practice errors':''})));
   addAttempt({id:Date.now(),subject,topic,score:qs.filter(q=>answers[q.id]===q.answer).length,total:qs.length,date:today});
   toast.success('Practice saved — gaps and recommendations updated');
  }catch{toast.error('Saved your answers, but could not record the result — try again.');}
 };
 const weakest=stats[0];
 return <div className="lab-grid">
  <section className="panel p-5"><h3 className="lab-title"><Target size={16}/>Build a practice set</h3>
   <div className="form-stack"><label>Subject<select value={subject} onChange={e=>{setSubject(e.target.value);setTopic('Any');}}>{subjects.map(s=><option key={s}>{s}</option>)}</select></label>
   <label>Topic<select value={topic} onChange={e=>setTopic(e.target.value)}><option>Any</option>{(topicsBySubject[subject]??[]).map(t=><option key={t}>{t}</option>)}</select></label>
   <label>Difficulty<select value={difficulty} onChange={e=>setDifficulty(e.target.value)}>{['Mixed','Easy','Medium','Hard'].map(d=><option key={d}>{d}</option>)}</select></label>
   <label>Number of questions: {count}<input type="range" min={1} max={5} value={count} onChange={e=>setCount(Number(e.target.value))}/></label>
   <Button onClick={generate} disabled={loading}><Play/>{loading?'Loading…':'Generate questions'}</Button>
   {weakest&&<Button variant="outline" onClick={()=>{setSubject(weakest.subject);setTopic(weakest.topic);}}>Use my weakest topic: {weakest.topic}</Button>}</div>
  </section>
  <section className="panel p-5">{!qs?<p className="empty-state">Choose your settings and generate a practice set. Questions come from the backend question bank.</p>:<div className="form-stack">
   {qs.map((q,i)=><div key={q.id} className="question-card"><div className="flex justify-between gap-2 mb-2"><small className="text-muted-foreground">Q{i+1} · {q.topic} · {q.difficulty}</small>{!done&&<button className="panel-link" onClick={()=>setHints(h=>[...h,q.id])}><Lightbulb size={12}/>Hint</button>}</div><p className="mb-3">{q.q}</p>
    <div className="grid gap-2">{q.options.map((o,oi)=>{const chosen=answers[q.id]===oi;const cls=done?(oi===q.answer?'correct':chosen?'wrong':''):chosen?'chosen':'';return <button key={o} disabled={done} className={`option-btn ${cls}`} aria-pressed={chosen} onClick={()=>setAnswers(a=>({...a,[q.id]:oi}))}>{o}</button>;})}</div>
    {hints.includes(q.id)&&!done&&<p className="hint"><Lightbulb size={12}/>{q.hint}</p>}{done&&<p className="hint">{q.explanation}</p>}</div>)}
   {!done?<Button disabled={Object.keys(answers).length<qs.length} onClick={submit}>Submit answers ({Object.keys(answers).length}/{qs.length})</Button>:<div className="result-card"><div className="text-3xl">{score}/{qs.length}</div><p>{score===qs.length?'Excellent — this topic is getting stronger.':'Keep going — your plan now focuses on what you missed.'}</p><div className="flex flex-wrap gap-2 mt-3"><Button size="sm" onClick={generate}>Try another set</Button><Button size="sm" variant="outline" onClick={()=>{addPlanTask(`Revise ${topic==='Any'?subject:topic} — practice set`,subject==='DSA'?'DSA & Coding':'GATE 2027',30);toast.success('Added to your planner');}}><CalendarPlus/>Add revision to planner</Button></div></div>}
  </div>}</section>
 </div>;
}

function ProgressView(){
 const {records,attempts,stats,subjectStats:subj}=useAcademics();
 const weekly=useMemo(()=>{const m=new Map<string,number[]>();records.forEach(r=>{const d=new Date(r.date);const wk=`${d.toLocaleString('en',{month:'short'})} W${Math.ceil(d.getDate()/7)}`;m.set(wk,[...(m.get(wk)||[]),r.score/r.max*100]);});return [...records].sort((a,b)=>a.date.localeCompare(b.date)).map(r=>{const d=new Date(r.date);return `${d.toLocaleString('en',{month:'short'})} W${Math.ceil(d.getDate()/7)}`;}).filter((v,i,a)=>a.indexOf(v)===i).map(w=>({week:w,avg:Math.round(m.get(w)!.reduce((a,b)=>a+b,0)/m.get(w)!.length),count:m.get(w)!.length}));},[records]);
 const overall=records.length?Math.round(records.reduce((a,r)=>a+r.score/r.max,0)/records.length*100):0;
 const strong=stats.filter(s=>s.status==='Strong').length;
 const quizAvg=(()=>{const q=records.filter(r=>r.type==='Quiz');return q.length?Math.round(q.reduce((a,r)=>a+r.score/r.max,0)/q.length*100):0;})();
 const change=weekly.length>1?weekly[weekly.length-1]!.avg-weekly[0]!.avg:0;
 return <>
  <div className="stats-grid">
   <div className="stat-card"><div className="stat-top">Overall score</div><div className="stat-value">{overall}<small>%</small></div></div>
   <div className="stat-card"><div className="stat-top">Quiz average</div><div className="stat-value">{quizAvg}<small>%</small></div></div>
   <div className="stat-card"><div className="stat-top">Assessments done</div><div className="stat-value">{records.length}</div><div className="stat-bottom">{attempts.length} practice sets</div></div>
   <div className="stat-card"><div className="stat-top">Topics mastered</div><div className="stat-value">{strong}<small>/ {stats.length}</small></div><div className="stat-bottom">{change>=0?'+':''}{change}% since first week</div></div>
  </div>
  <div className="lab-grid">
   <section className="panel p-5"><h3 className="lab-title">Improvement trend</h3><div className="chart-box"><ResponsiveContainer><LineChart data={weekly}><CartesianGrid vertical={false}/><XAxis dataKey="week" tick={{fontSize:10}}/><YAxis domain={[0,100]} tick={{fontSize:10}}/><Tooltip/><Line dataKey="avg" name="Weekly average %" stroke={chartColors.primary} strokeWidth={3} dot={{r:4}}/></LineChart></ResponsiveContainer></div></section>
   <section className="panel p-5"><h3 className="lab-title">Subject mastery</h3><div className="form-stack">{subj.map(s=><div key={s.subject}><div className="flex justify-between text-xs mb-1"><span>{s.subject}</span><span>{s.pct}%</span></div><Progress value={s.pct}/></div>)}</div>
    <h4 className="text-sm mt-5 mb-2">Topic progress</h4><div className="flex flex-wrap gap-2">{stats.map(s=><Tag key={s.subject+s.topic} color={statusColor(s.status)}>{s.topic} {s.pct}%</Tag>)}</div></section>
   <section className="panel lab-span"><div className="panel-header"><h3>Weekly summary & assessment history</h3><Link to="/reports" className="panel-link">Progress Reports</Link></div>
    <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Week</th><th>Assessments</th><th>Average</th></tr></thead><tbody>{[...weekly].reverse().map(w=><tr key={w.week}><td>{w.week}</td><td>{w.count}</td><td>{w.avg}%</td></tr>)}</tbody></table></div>
    {attempts.length>0&&<div className="p-5"><h4 className="text-sm mb-2">Practice sets</h4><div className="flex flex-wrap gap-2">{attempts.map(a=><Tag key={a.id} color="neutral">{a.date} · {a.topic==='Any'?a.subject:a.topic} · {a.score}/{a.total}</Tag>)}</div></div>}</section>
  </div>
 </>;
}

export function FocusNext({onPractice,compact=false}:{onPractice?:(s:string,t:string)=>void;compact?:boolean}){
 const {stats,resources,status}=useAcademics();const {addPlanTask}=useDemo();
 if(status==='loading')return <p className="empty-state">Loading your focus areas…</p>;
 if(status==='error')return <p className="empty-state">Could not load your focus areas.</p>;
 const focus=stats.filter(s=>s.status!=='Strong').slice(0,compact?2:4);
 if(!focus.length)return <p className="empty-state">Every topic is strong right now. Add new marks to keep growing.</p>;
 return <div className="focus-grid">{focus.map((s,i)=>{const mats=resources.filter(r=>r.topic===s.topic).slice(0,2);const priority=s.pct<50?'High':s.pct<65?'Medium':'Low';
  return <article key={s.subject+s.topic} className="focus-card">
   <div className="flex justify-between items-start gap-2"><Tag color={priority==='High'?'amber':priority==='Medium'?'cyan':'emerald'}>{priority.toUpperCase()} PRIORITY</Tag>{i===0&&<Tag>NEXT UP</Tag>}</div>
   <h3>{s.topic}</h3><small className="text-muted-foreground">{s.subject} · {s.pct}% mastery · {s.attempts} attempts</small>
   <p className="mt-2">{s.pct<60?`Below 60% on average`:`Between 60–74% — worth revising`}{s.trend<0?`, and scores dropped ${Math.abs(s.trend)}%`:s.trend>0?`, improving by ${s.trend}%`:''}.{s.mistakes[0]?` Common mistake: ${s.mistakes[0].toLowerCase()}.`:''}</p>
   {!compact&&<><h4 className="text-xs mt-3 mb-1">Suggested materials</h4><ul className="text-xs space-y-1">{mats.map(m=><li key={m.id}><a className="panel-link" href={m.url} target="_blank" rel="noreferrer">{m.kind}: {m.title}</a></li>)}{!mats.length&&<li className="text-muted-foreground">No materials yet</li>}</ul><p className="text-xs text-muted-foreground mt-2">Targeted practice questions ready</p></>}
   <div className="flex flex-wrap gap-2 mt-3">{onPractice?<Button size="sm" onClick={()=>onPractice(s.subject,s.topic)}><Play/>Start practising</Button>:<Button size="sm" asChild><Link to="/academics">Open Performance Lab</Link></Button>}<Button size="sm" variant="outline" onClick={()=>{addPlanTask(`Practise ${s.topic} (${s.subject})`,s.subject==='DSA'?'DSA & Coding':'GATE 2027',45);toast.success('Added to your planner');}}><CalendarPlus/>Add to planner</Button></div>
   {!compact&&<div className="flex gap-3 mt-3 text-xs"><Link to="/rooms" className="panel-link"><Radio size={12}/>Find a study room</Link><Link to="/campus" className="panel-link"><Users size={12}/>Find a study partner</Link></div>}
  </article>;})}</div>;
}
