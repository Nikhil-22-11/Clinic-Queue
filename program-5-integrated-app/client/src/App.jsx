import React,{useEffect,useState} from "react";

const API="/api";
export default function App(){
  const [token,setToken]=useState(localStorage.getItem("clinic-token")||"");
  const [patients,setPatients]=useState([]);
  const [form,setForm]=useState({name:"",age:"",reason:"",priority:"Normal"});
  const [auth,setAuth]=useState({name:"Clinic Admin",email:"",password:""});
  const [mode,setMode]=useState("login");
  const [error,setError]=useState("");
  async function request(path,options={}){
    const response=await fetch(API+path,{...options,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})}});
    if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.message||`HTTP ${response.status}`);}
    return response.status===204?null:response.json();
  }
  async function load(){try{setPatients(await request("/patients"));setError("");}catch(e){setError(e.message);}}
  useEffect(()=>{if(token)load();},[token]);
  async function authenticate(e){
    e.preventDefault();setError("");
    try{
      const result=await request(`/auth/${mode==="login"?"login":"register"}`,{method:"POST",body:JSON.stringify(auth)});
      if(mode==="register"){setMode("login");setError("Account created. Please log in.");}
      else{localStorage.setItem("clinic-token",result.token);setToken(result.token);}
    }catch(e){setError(e.message);}
  }
  async function add(e){
    e.preventDefault();
    try{await request("/patients",{method:"POST",body:JSON.stringify({...form,age:Number(form.age)})});setForm({name:"",age:"",reason:"",priority:"Normal"});await load();}
    catch(e){setError(e.message);}
  }
  async function remove(id){try{await request(`/patients/${id}`,{method:"DELETE"});await load();}catch(e){setError(e.message);}}
  function logout(){localStorage.removeItem("clinic-token");setToken("");setPatients([]);}
  if(!token)return <main className="auth"><h1>Clinic Queue</h1><p>Secure staff access</p><form onSubmit={authenticate}>
    {mode==="register"&&<input placeholder="Full name" value={auth.name} onChange={e=>setAuth({...auth,name:e.target.value})} required/>}
    <input type="email" placeholder="Email" value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})} required/>
    <input type="password" placeholder="Password (8+ characters)" value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})} required minLength="8"/>
    <button>{mode==="login"?"Log in":"Create account"}</button></form>
    <button className="link" onClick={()=>setMode(mode==="login"?"register":"login")}>{mode==="login"?"Create an account":"Back to login"}</button><p className="error">{error}</p></main>;
  return <div className="shell"><header><div><small>CLINIC OPERATIONS</small><h1>Queue Manager</h1></div><button className="secondary" onClick={logout}>Log out</button></header>
    <main className="grid"><section className="card"><h2>Register patient</h2><form onSubmit={add}>
      <label>Patient name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required minLength="2"/></label>
      <label>Age<input type="number" min="0" max="120" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} required/></label>
      <label>Reason<input value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} required/></label>
      <label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Normal</option><option>Urgent</option></select></label>
      <button>Add patient</button></form></section>
      <section className="card"><div className="title"><h2>Patient queue</h2><button className="secondary" onClick={load}>Refresh</button></div>
      {patients.map(p=><article className="patient" key={p._id}><div><b>{p.name}</b><p>Age {p.age} · {p.reason}</p></div><span>{p.priority}</span><button className="danger" onClick={()=>remove(p._id)}>Delete</button></article>)}
      {!patients.length&&<p className="muted">No patient records found.</p>}</section></main><p className="error center">{error}</p></div>;
}
