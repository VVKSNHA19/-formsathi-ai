import {useState} from "react";

const sample=`DEMO ONLY — COMMUNITY ASSISTANCE REQUEST
Applicant Full Name: __________
Date of Birth: __________
Residential Address: __________
Mobile Number: __________
Government ID Type and Last 4 Digits: __________
Household Annual Income: __________
Reason for Assistance: __________
Documents to attach: proof of identity, proof of residence, income certificate, one passport-size photograph.
Declaration: I declare that the information supplied is true.
Submission: Submit the completed form and photocopies to the local assistance desk. The office will verify documents and decide eligibility.`;

export default function Home(){
 const [text,setText]=useState(""); const [lang,setLang]=useState("English"); const [file,setFile]=useState(null);
 const [out,setOut]=useState(null); const [busy,setBusy]=useState(false); const [err,setErr]=useState("");
 async function analyze(){
   if(!text.trim()&&!file){setErr("Paste form text or upload a dummy file first.");return}
   setBusy(true);setErr("");setOut(null);
   try{
     let fileData=null;
     if(file){
       if(file.size>4*1024*1024) throw new Error("For this demo, keep the file under 4 MB.");
       fileData=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve({name:file.name,mimeType:file.type||"text/plain",base64:String(r.result).split(",")[1]});r.onerror=reject;r.readAsDataURL(file)});
     }
     const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text,language:lang,file:fileData})});
     const data=await res.json(); if(!res.ok) throw new Error(data.error||"AI analysis failed");
     setOut(data);
   }catch(e){setErr(e.message)}finally{setBusy(false)}
 }
 function copy(){navigator.clipboard.writeText(JSON.stringify(out,null,2))}
 function download(){const b=new Blob([JSON.stringify(out,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="FormSathi_AI_result.json";a.click()}
 return <><header><div className="wrap"><h1>FormSathi AI</h1><div className="sub">Multilingual AI Form Explainer • Powered by Gemini • Build for Good</div></div></header>
 <main className="wrap">
 <div className="notice"><b>Privacy & human-in-the-loop:</b> Demo with dummy data only. FormSathi explains and suggests; the relevant office/professional makes every final eligibility, legal, financial or health decision.</div>
 <div className="grid">
  <section className={"card "+(busy?"loading":"")}><span className="badge">INPUT</span>
   <label>Paste form text</label><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste difficult form text here..." />
   <label>Or upload a dummy document/image</label><input type="file" accept=".txt,.pdf,image/png,image/jpeg,image/webp" onChange={e=>setFile(e.target.files?.[0]||null)}/>
   <div className="row"><div><label>Explain in</label><select value={lang} onChange={e=>setLang(e.target.value)}><option>English</option><option>Hindi</option><option>Marathi</option></select></div></div>
   <div className="row" style={{marginTop:14}}><button className="sample" onClick={()=>{setText(sample);setFile(null)}}>Load dummy sample</button><button className="primary" onClick={analyze}>{busy?"Gemini is reading…":"✨ Explain with Gemini"}</button></div>
   <p className="small">Accepted for the demo: pasted text, TXT, PDF, PNG, JPG or WEBP. Keep uploads under 4 MB.</p>{err&&<div className="error">{err}</div>}
  </section>
  <section className="card result"><span className="badge">AI OUTPUT</span>
   {!out?<div className="empty">Gemini’s explanation will appear here.</div>:<>
    <h3>{out.title}</h3><p>{out.purpose}</p>
    <h3>Fields to fill</h3><ul>{out.fields?.map((x,i)=><li key={i}>{x}</li>)}</ul>
    <h3>Documents mentioned</h3><ul>{out.documents?.map((x,i)=><li key={i}>{x}</li>)}</ul>
    <h3>Step-by-step</h3><ol>{out.steps?.map((x,i)=><li key={i}>{x}</li>)}</ol>
    <h3>Important cautions</h3><ul>{out.cautions?.map((x,i)=><li key={i}>{x}</li>)}</ul>
    <p className="small"><b>AI note:</b> {out.disclaimer}</p>
    <div className="row"><button className="secondary" onClick={copy}>Copy result</button><button className="secondary" onClick={download}>Download JSON</button></div>
   </>}
  </section>
 </div><div className="footer">FormSathi AI prototype • Gemini interprets unstructured input; humans retain final authority.</div></main></>
}