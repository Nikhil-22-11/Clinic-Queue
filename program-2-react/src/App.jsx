import React, {useEffect, useMemo, useState} from "react";
import {NavLink, Route, Routes, useNavigate} from "react-router-dom";

const initial = [
  {id:1,name:"Aarav Shah",age:28,reason:"General consultation",priority:"Normal"},
  {id:2,name:"Mira Patel",age:54,reason:"Follow-up visit",priority:"Urgent"}
];

function QueuePage({patients,setPatients}) {
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");
  const filtered = useMemo(() => patients.filter(p =>
    (filter === "All" || p.priority === filter) &&
    `${p.name} ${p.reason}`.toLowerCase().includes(search.toLowerCase())
  ),[patients,search,filter]);
  const remove = id => setPatients(current => current.filter(p=>p.id!==id));
  return <section className="card">
    <div className="heading"><div><small>LIVE OVERVIEW</small><h2>Patient queue</h2></div><b>{patients.length} waiting</b></div>
    <div className="controls"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or reason"/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Normal</option><option>Urgent</option></select></div>
    {filtered.map(p=><article className="patient" key={p.id}><div><b>{p.name}</b><p>{p.reason} · Age {p.age}</p></div><span className={p.priority==="Urgent"?"urgent":"normal"}>{p.priority}</span><button onClick={()=>remove(p.id)}>Remove</button></article>)}
    {!filtered.length && <p className="muted">No matching patients.</p>}
  </section>;
}
function AddPage({setPatients}) {
  const navigate=useNavigate();
  const [form,setForm]=useState({name:"",age:"",reason:"",priority:"Normal"});
  const [error,setError]=useState("");
  const change=e=>setForm({...form,[e.target.name]:e.target.value});
  function submit(e){
    e.preventDefault();
    const age=Number(form.age);
    if(form.name.trim().length<2 || !Number.isInteger(age) || age<0 || age>120 || !form.reason.trim()){
      setError("Enter a valid name, age between 0 and 120, and visit reason."); return;
    }
    setPatients(current=>[{...form,age,id:Date.now()},...current]); navigate("/");
  }
  return <section className="card"><small>NEW REGISTRATION</small><h2>Add patient</h2><form className="form" onSubmit={submit}>
    <label>Name<input name="name" value={form.name} onChange={change} required/></label>
    <label>Age<input name="age" type="number" min="0" max="120" value={form.age} onChange={change} required/></label>
    <label>Visit reason<input name="reason" value={form.reason} onChange={change} required/></label>
    <label>Priority<select name="priority" value={form.priority} onChange={change}><option>Normal</option><option>Urgent</option></select></label>
    <p className="error">{error}</p><button type="submit">Save patient</button>
  </form></section>;
}
export default function App(){
  const [patients,setPatients]=useState(()=>JSON.parse(localStorage.getItem("react-clinic-queue")||"null")||initial);
  useEffect(()=>localStorage.setItem("react-clinic-queue",JSON.stringify(patients)),[patients]);
  return <div className="app"><header><div><small>CLINIC OPERATIONS</small><h1>Queue Manager</h1></div><nav><NavLink to="/">Queue</NavLink><NavLink to="/add">Add patient</NavLink></nav></header>
    <main><Routes><Route path="/" element={<QueuePage patients={patients} setPatients={setPatients}/>}/><Route path="/add" element={<AddPage setPatients={setPatients}/>}/><Route path="*" element={<section className="card"><h2>Page not found</h2><NavLink to="/">Return to queue</NavLink></section>}/></Routes></main>
    <footer>React practical · Component-based clinic queue</footer></div>;
}
