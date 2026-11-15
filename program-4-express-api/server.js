import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
dotenv.config();

const app=express();
app.use(cors({origin:process.env.CLIENT_ORIGIN||"http://localhost:5173"}));
app.use(express.json({limit:"20kb"}));

const userSchema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true},passwordHash:{type:String,required:true}});
const patientSchema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,minlength:2,maxlength:60},
  age:{type:Number,required:true,min:0,max:120},
  reason:{type:String,required:true,trim:true,maxlength:120},
  priority:{type:String,enum:["Normal","Urgent"],default:"Normal"},
  createdAt:{type:Date,default:Date.now}
},{timestamps:true});
const User=mongoose.model("User",userSchema);
const Patient=mongoose.model("Patient",patientSchema);

function asyncRoute(fn){return (req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);}
function authenticate(req,res,next){
  const token=req.headers.authorization?.startsWith("Bearer ")?req.headers.authorization.slice(7):null;
  if(!token) return res.status(401).json({message:"Authentication token required"});
  try{req.user=jwt.verify(token,process.env.JWT_SECRET);next();}
  catch{return res.status(401).json({message:"Invalid or expired token"});}
}
app.get("/api/health",(req,res)=>res.json({status:"ok",service:"clinic-queue-api"}));

app.post("/api/auth/register",asyncRoute(async(req,res)=>{
  const {name,email,password}=req.body;
  if(!name||!email||!password||password.length<8) return res.status(400).json({message:"Name, valid email and password (8+ characters) are required"});
  const exists=await User.findOne({email});
  if(exists) return res.status(409).json({message:"Email already registered"});
  const passwordHash=await bcrypt.hash(password,12);
  const user=await User.create({name,email,passwordHash});
  res.status(201).json({id:user._id,name:user.name,email:user.email});
}));
app.post("/api/auth/login",asyncRoute(async(req,res)=>{
  const {email,password}=req.body;
  const user=await User.findOne({email});
  if(!user||!(await bcrypt.compare(password||"",user.passwordHash))) return res.status(401).json({message:"Invalid email or password"});
  const token=jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:"2h"});
  res.json({token,tokenType:"Bearer",expiresIn:"2h"});
}));

app.get("/api/patients",authenticate,asyncRoute(async(req,res)=>{
  const patients=await Patient.find().sort({createdAt:-1});
  res.json(patients);
}));
app.post("/api/patients",authenticate,asyncRoute(async(req,res)=>{
  const patient=await Patient.create(req.body);
  res.status(201).json(patient);
}));
app.put("/api/patients/:id",authenticate,asyncRoute(async(req,res)=>{
  const patient=await Patient.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
  if(!patient) return res.status(404).json({message:"Patient not found"});
  res.json(patient);
}));
app.delete("/api/patients/:id",authenticate,asyncRoute(async(req,res)=>{
  const patient=await Patient.findByIdAndDelete(req.params.id);
  if(!patient) return res.status(404).json({message:"Patient not found"});
  res.status(204).end();
}));

app.use((req,res)=>res.status(404).json({message:"API route not found"}));
app.use((err,req,res,next)=>{
  console.error(err);
  if(err.name==="ValidationError") return res.status(400).json({message:err.message});
  if(err.name==="CastError") return res.status(400).json({message:"Invalid record id"});
  if(err.code===11000) return res.status(409).json({message:"A record with this value already exists"});
  res.status(500).json({message:"Internal server error"});
});

const port=process.env.PORT||5000;
mongoose.connect(process.env.MONGO_URI)
  .then(()=>app.listen(port,()=>console.log(`API listening on http://localhost:${port}`)))
  .catch(error=>{console.error("MongoDB connection failed:",error.message);process.exit(1);});
