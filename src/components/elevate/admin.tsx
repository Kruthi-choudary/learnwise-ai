import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Shield, Users, AlertTriangle, Megaphone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, Tag } from './shared';
import { useDemo } from './app-shell';
import { campusStudents } from '@/data/demo';
import { toast } from 'sonner';

export function AdminOverview(){
 const {role}=useDemo();
 const [q,setQ]=useState(''); const [dept,setDept]=useState('All');
 const [notice,setNotice]=useState(''); const [notices,setNotices]=useState<string[]>(['Mid-term exams begin Oct 27 — sample announcement.']);
 if(role!=='admin') return <div className="max-w-md mx-auto py-16 text-center"><Shield className="mx-auto text-primary mb-4"/><h2 className="text-2xl mb-3">College admins only</h2><p className="text-muted-foreground mb-6">Sign in with an admin ID to view the student overview.</p><Button asChild><Link to="/signin">Sign in as college admin</Link></Button></div>;
 const list=campusStudents.filter(s=>(dept==='All'||s.dept===dept)&&(s.name+s.roll).toLowerCase().includes(q.toLowerCase()));
 const support=campusStudents.filter(s=>s.status==='Needs support').length;
 const avg=Math.round(campusStudents.reduce((a,s)=>a+s.progress,0)/campusStudents.length);
 return <>
  <PageHeading title="Student overview." description="Track student progress and share campus announcements. Sample data only."/>
  <div className="stats-grid">
   <div className="stat-card"><div className="stat-top"><span className="icon-tile"><Users/></span>Students</div><div className="stat-value">{campusStudents.length}</div></div>
   <div className="stat-card"><div className="stat-top"><span className="icon-tile"><Shield/></span>Average progress</div><div className="stat-value">{avg}<small>%</small></div></div>
   <div className="stat-card"><div className="stat-top"><span className="icon-tile"><AlertTriangle/></span>Need support</div><div className="stat-value">{support}</div></div>
   <div className="stat-card"><div className="stat-top"><span className="icon-tile"><Megaphone/></span>Announcements</div><div className="stat-value">{notices.length}</div></div>
  </div>
  <section className="panel mb-5"><div className="panel-header"><h3><Users/>Students</h3><Tag color="neutral">SAMPLE DATA</Tag></div>
   <div className="flex gap-3 px-5 pb-4 flex-wrap"><label className="flex-1 min-w-[200px]"><span className="sr-only">Search students</span><input className="w-full" placeholder="Search by name or roll number" value={q} onChange={e=>setQ(e.target.value)}/></label><select aria-label="Department" value={dept} onChange={e=>setDept(e.target.value)}>{['All','CSE','ECE','IT','EEE'].map(d=><option key={d}>{d}</option>)}</select></div>
   <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Roll no</th><th>Name</th><th>Dept · Year</th><th>Progress</th><th>Attendance</th><th>Status</th></tr></thead><tbody>{list.map(s=><tr key={s.roll}><td>{s.roll}</td><td>{s.name}</td><td>{s.dept} · Y{s.year}</td><td>{s.progress}%</td><td>{s.attendance}%</td><td><Tag color={s.status==='Needs support'?'amber':'emerald'}>{s.status}</Tag></td></tr>)}{!list.length&&<tr><td colSpan={6} className="text-muted-foreground"><Search size={14} className="inline mr-2"/>No students match.</td></tr>}</tbody></table></div>
  </section>
  <section className="panel"><div className="panel-header"><h3><Megaphone/>Campus announcements</h3></div>
   <form className="flex gap-3 px-5 pb-4" onSubmit={e=>{e.preventDefault();if(!notice.trim())return;setNotices(n=>[notice,...n]);setNotice('');toast.success('Announcement posted (demo only)');}}><input className="flex-1" aria-label="New announcement" placeholder="Share an update or opportunity with students" value={notice} onChange={e=>setNotice(e.target.value)}/><Button type="submit">Post</Button></form>
   <ul className="px-5 pb-5 space-y-2">{notices.map((n,i)=><li key={i} className="setting-row">{n}</li>)}</ul>
  </section>
 </>;
}
