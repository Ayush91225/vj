import { useState, useEffect, useRef } from "react";

/* ══════════════════════════════════════════ ICONS ══════════════════════════════════════════ */
const IC = ({ ch, size=18 }) => <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,flexShrink:0}}>{ch}</span>;
const HomeIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const TTSIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const VisionIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const STTIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const TransIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>;
const AgentsIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const VideoDubIcon= () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>;
const APIIcon     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const UsageIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const BillingIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const PricingIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const DocsIcon    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const CollapseIcon= () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const MenuIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const XIcon       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const ChevUp      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;
const ChevDown    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const UserIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const PlusIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const HeartIcon   = ({filled}) => <svg width="17" height="17" viewBox="0 0 24 24" fill={filled?"#ef4444":"none"} stroke={filled?"#ef4444":"currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const GiftIcon    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const InfoIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const SpeedIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
const PlayTriangle= () => <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const PauseIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;

/* ══════════════════════════════════════════ DATA ══════════════════════════════════════════ */
const SIDEBAR_WIDE = 232;
const SIDEBAR_SLIM = 58;

const VOICES = [
  { name:"Shubh",  gender:"Male",   seed:"shubh-voice",   desc:"Friendly default voice for IVR and support" },
  { name:"Ritu",   gender:"Female", seed:"ritu-voice",    desc:"Soft, approachable voice for customer interactions" },
  { name:"Amit",   gender:"Male",   seed:"amit-voice",    desc:"Formal voice for business communications" },
  { name:"Sumit",  gender:"Male",   seed:"sumit-voice",   desc:"Balanced warmth with professionalism" },
  { name:"Pooja",  gender:"Female", seed:"pooja-voice",   desc:"Encouraging voice for assistance flows" },
  { name:"Manan",  gender:"Male",   seed:"manan-voice",   desc:"Consistent voice for automated systems" },
  { name:"Simran", gender:"Female", seed:"simran-voice",  desc:"Expressive voice for storytelling" },
  { name:"Ananya", gender:"Female", seed:"ananya-voice",  desc:"Warm tone for conversational assistants" },
  { name:"Arjun",  gender:"Male",   seed:"arjun-voice",   desc:"Deep authoritative voice for presentations" },
];

const VOICE_TABS = ["Conversational","Audiobooks","Entertainment","Sales","News"];
const LANGUAGES  = ["Hindi","English","Bengali","Tamil","Telugu","Marathi","Gujarati","Kannada"];
const MODELS     = ["Bulbul V3","Bulbul V2","Bulbul V1"];
const QUALITIES  = ["Standard (22.05 kHz)","High (44.1 kHz)"];

const NAV_GROUPS = [
  { label:null, items:[{ id:"home",    label:"Home",                 icon:<HomeIcon /> }] },
  { label:"Playground", items:[
    { id:"tts",    label:"Text to Speech",       icon:<TTSIcon /> },
    { id:"vision", label:"Vision",               icon:<VisionIcon /> },
    { id:"stt",    label:"Speech to Text",       icon:<STTIcon /> },
    { id:"trans",  label:"Translate",            icon:<TransIcon /> },
  ]},
  { label:"Products", items:[
    { id:"agents", label:"Conversational Agents",icon:<AgentsIcon /> },
    { id:"video",  label:"Video Dubbing",         icon:<VideoDubIcon /> },
  ]},
  { label:"Developers", collapsible:true, items:[
    { id:"api",     label:"API Keys", icon:<APIIcon /> },
    { id:"usage",   label:"Usage",    icon:<UsageIcon /> },
    { id:"billing", label:"Billing",  icon:<BillingIcon /> },
    { id:"pricing", label:"Pricing",  icon:<PricingIcon /> },
  ]},
  { label:null, items:[{ id:"docs", label:"Documentation", icon:<DocsIcon /> }] },
];

/* ══════════════════════════════════════════ TOOLTIP ══════════════════════════════════════════ */
function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{position:"relative",display:"flex"}} onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      {show && (
        <div style={{position:"absolute",left:"calc(100% + 10px)",top:"50%",transform:"translateY(-50%)",background:"#1a1a1a",color:"#fff",fontSize:12,fontWeight:500,padding:"5px 10px",borderRadius:6,whiteSpace:"nowrap",zIndex:9999,pointerEvents:"none",boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>
          {label}
          <div style={{position:"absolute",right:"100%",top:"50%",transform:"translateY(-50%)",borderWidth:"5px 6px 5px 0",borderStyle:"solid",borderColor:"transparent #1a1a1a transparent transparent"}}/>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════ SELECT ══════════════════════════════════════════ */
function Select({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",border:"1px solid #e4e4e4",borderRadius:10,background:"#fff",fontSize:13.5,color:"#222",cursor:"pointer",fontFamily:"inherit",gap:8}}>
        <span style={{display:"flex",alignItems:"center",gap:8}}>
          {value==="Bulbul V3"&&<span style={{width:10,height:10,borderRadius:"50%",background:"linear-gradient(135deg,#4ade80,#22d3ee)",display:"inline-block",flexShrink:0}}/>}
          {value}
        </span>
        <ChevDown/>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100%+4px)",left:0,right:0,background:"#fff",border:"1px solid #e4e4e4",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.1)",zIndex:200,overflow:"hidden"}}>
          {options.map(o=>(
            <div key={o} onClick={()=>{onChange(o);setOpen(false);}} style={{padding:"10px 14px",fontSize:13.5,cursor:"pointer",color:o===value?"#4f46e5":"#333",background:o===value?"#f5f5ff":"transparent"}}
              onMouseEnter={e=>{if(o!==value)e.currentTarget.style.background="#f8f8f8";}}
              onMouseLeave={e=>{if(o!==value)e.currentTarget.style.background="transparent";}}
            >{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════ TTS PAGE ══════════════════════════════════════════ */
function TTSPage() {
  const DEFAULT_TEXT = `नमस्ते! Sarvam AI में आपका स्वागत है।\n\nहम भारतीय भाषाओं के लिए अत्याधुनिक voice technology बनाते हैं। हमारे text-to-speech models प्राकृतिक और इंसान जैसी आवाज़ें produce करते हैं, जो बेहद realistic लगती हैं।\n\nआप अपना text type कर सकते हैं या different voices को try करने के लिए किसी भी voice card पर play button पर click कर सकते हैं। तो चलिए, अपनी भाषा में AI की ताकत experience करें!`;
  const [text, setText]     = useState(DEFAULT_TEXT);
  const [lang, setLang]     = useState("Hindi");
  const [model, setModel]   = useState("Bulbul V3");
  const [quality, setQual]  = useState("Standard (22.05 kHz)");
  const [speed, setSpeed]   = useState(1.1);
  const [voiceTab, setVTab] = useState("Conversational");
  const [favorites, setFavs]= useState({});
  const [playing, setPlay]  = useState(null);

  const gc = g => g==="Female" ? {bg:"#fce7f3",color:"#be185d"} : {bg:"#eff6ff",color:"#1d4ed8"};

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden",flexWrap:"wrap"}}>

      {/* ── Left Panel ── */}
      <div style={{flex:"0 0 auto",width:"clamp(280px,50%,600px)",borderRight:"1px solid #f0f0f0",overflowY:"auto",padding:"24px 26px",display:"flex",flexDirection:"column",gap:18}}>

        {/* Textarea card */}
        <div style={{border:"1px solid #e4e4e4",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.04)"}}>
          <textarea
            value={text} onChange={e=>setText(e.target.value)}
            placeholder="Type or paste text here…"
            style={{width:"100%",minHeight:220,padding:"18px 20px",fontSize:14,lineHeight:1.85,border:"none",outline:"none",resize:"none",fontFamily:"inherit",color:"#1a1a1a",background:"transparent",boxSizing:"border-box"}}
          />
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderTop:"1px solid #f0f0f0",background:"#fafafa",gap:10,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:120}}>
              <Select value={lang} options={LANGUAGES} onChange={setLang}/>
            </div>
            <button onClick={()=>setText("")} style={{padding:"8px 20px",border:"1px solid #e0e0e0",borderRadius:999,background:"#fff",fontSize:13,cursor:"pointer",fontWeight:500,color:"#555",fontFamily:"inherit",flexShrink:0}}>Clear</button>
          </div>
        </div>

        {/* Model */}
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#333",marginBottom:7}}>Model</div>
          <Select value={model} options={MODELS} onChange={setModel}/>
        </div>

        {/* Audio Quality */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:600,color:"#333",marginBottom:7}}>
            Audio Quality <InfoIcon/>
          </div>
          <Select value={quality} options={QUALITIES} onChange={setQual}/>
        </div>

        {/* Speed */}
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#333",marginBottom:10}}>Speed</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <SpeedIcon/>
            <input type="range" min={0.5} max={2} step={0.05} value={speed} onChange={e=>setSpeed(parseFloat(e.target.value))} style={{flex:1,accentColor:"#4f46e5",cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:"#444",minWidth:38,textAlign:"right"}}>{speed.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{flex:1,minWidth:280,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Voice category tabs */}
        <div style={{padding:"16px 20px 0",borderBottom:"1px solid #f0f0f0",display:"flex",gap:4,flexWrap:"wrap",flexShrink:0}}>
          {VOICE_TABS.map(t=>(
            <button key={t} onClick={()=>setVTab(t)} style={{
              padding:"7px 15px",borderRadius:999,marginBottom:10,
              border: t===voiceTab ? "1.5px solid #d1d5db" : "1.5px solid transparent",
              background: t===voiceTab ? "#fff" : "transparent",
              fontSize:13, fontWeight: t===voiceTab ? 500 : 400,
              color: t===voiceTab ? "#111" : "#777",
              cursor:"pointer", fontFamily:"inherit",
              boxShadow: t===voiceTab ? "0 1px 4px rgba(0,0,0,0.07)" : "none",
              transition:"all 0.15s",
            }}>{t}</button>
          ))}
        </div>

        {/* Voice list */}
        <div style={{flex:1,overflowY:"auto"}}>
          {VOICES.map(v=>{
            const isPlay = playing===v.name;
            const badge = gc(v.gender);
            return (
              <div key={v.name}
                style={{display:"flex",alignItems:"center",gap:14,padding:"13px 20px",borderBottom:"1px solid #f5f5f5",transition:"background 0.12s",cursor:"default"}}
                onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                {/* Avatar */}
                <div style={{position:"relative",flexShrink:0,width:54,height:54,cursor:"pointer"}} onClick={()=>setPlay(p=>p===v.name?null:v.name)}>
                  <div style={{width:54,height:54,borderRadius:"50%",overflow:"hidden",boxShadow:isPlay?"0 0 0 2.5px #4f46e5, 0 0 12px rgba(79,70,229,0.3)":"0 2px 8px rgba(0,0,0,0.13)",transition:"box-shadow 0.2s"}}>
                    <img
                      src={`https://api.dicebear.com/9.x/glass/svg?seed=${v.seed}`}
                      alt={v.name}
                      style={{width:"100%",height:"100%",display:"block"}}
                    />
                  </div>
                  {/* Overlay */}
                  <div style={{position:"absolute",inset:0,borderRadius:"50%",background:isPlay?"rgba(79,70,229,0.52)":"rgba(0,0,0,0.25)",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"}}>
                    {isPlay ? (
                      <div style={{display:"flex",gap:2.5,alignItems:"flex-end",height:16}}>
                        {[0,1,2].map(i=>(
                          <div key={i} style={{width:3,borderRadius:2,backgroundColor:"#fff",animation:`vbar 0.7s ease-in-out ${i*0.15}s infinite alternate`}}/>
                        ))}
                      </div>
                    ) : <PlayTriangle/>}
                  </div>
                </div>

                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontSize:14.5,fontWeight:600,color:"#111"}}>{v.name}</span>
                    <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:999,background:badge.bg,color:badge.color,letterSpacing:"0.02em"}}>{v.gender}</span>
                  </div>
                  <div style={{fontSize:12.5,color:"#999",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.desc}</div>
                </div>

                {/* Favourite */}
                <button onClick={()=>setFavs(f=>({...f,[v.name]:!f[v.name]}))}
                  style={{background:"none",border:"none",cursor:"pointer",padding:6,color:favorites[v.name]?"#ef4444":"#d0d0d0",flexShrink:0,transition:"color 0.15s,transform 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                >
                  <HeartIcon filled={favorites[v.name]}/>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ BILLING PAGE ══════════════════════════════════════════ */
function BillingPage() {
  return (
    <div style={{padding:"32px 40px",flex:1,overflowY:"auto"}}>
      <div style={{border:"1px solid #e8e8e8",borderRadius:14,padding:"24px 28px",maxWidth:420,marginBottom:36,width:"100%"}}>
        <div style={{fontSize:38,fontWeight:700,color:"#111",letterSpacing:"-1px",marginBottom:3}}>987.43</div>
        <div style={{fontSize:13,color:"#888",marginBottom:22,fontWeight:400}}>Credits Left</div>
        <div style={{background:"#ebebeb",borderRadius:999,height:6,marginBottom:13,overflow:"hidden"}}>
          <div style={{width:"1.257%",height:"100%",background:"#4f46e5",borderRadius:999}}/>
        </div>
        <div style={{fontSize:13,color:"#888"}}>12.57 of 1000 Used</div>
      </div>
      <div style={{borderBottom:"1px solid #e8e8e8",marginBottom:52}}>
        <div style={{display:"inline-block",fontSize:14,fontWeight:500,color:"#111",paddingBottom:12,borderBottom:"2px solid #4f46e5",marginBottom:-1,cursor:"pointer"}}>
          Payment History
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:20,paddingBottom:40}}>
        <img src="https://dashboard.sarvam.ai/assets/empty-table.webp" alt="No payment history" style={{width:160,height:"auto",opacity:0.9}}/>
        <div style={{fontSize:17,fontWeight:600,color:"#111",marginTop:28,marginBottom:10,textAlign:"center"}}>No Payment History</div>
        <div style={{fontSize:13.5,color:"#888",textAlign:"center",maxWidth:360,lineHeight:1.6}}>Your payment transactions will appear here once you add credits to your account.</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════ COMING SOON ══════════════════════════════════════════ */
function ComingSoon({ label }) {
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,color:"#bbb",padding:40}}>
      <div style={{fontSize:48}}>🚧</div>
      <div style={{fontSize:16,fontWeight:600,color:"#999"}}>{label}</div>
      <div style={{fontSize:13,color:"#bbb"}}>This page is under construction</div>
    </div>
  );
}

/* ══════════════════════════════════════════ APP ══════════════════════════════════════════ */
export default function VajraOpz() {
  const [collapsed, setCollapsed]   = useState(false);
  const [devOpen, setDevOpen]       = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const [activePage, setPage]       = useState("tts");

  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      if (m) setCollapsed(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const slim = !isMobile && collapsed;
  const sbW  = slim ? SIDEBAR_SLIM : SIDEBAR_WIDE;

  /* Nav item component */
  const NavItem = ({ item, forceExpanded=false }) => {
    const showLabel = forceExpanded || !slim;
    const isActive  = item.id === activePage;
    const inner = (
      <div
        onClick={()=>{ setPage(item.id); if(isMobile) setMobileOpen(false); }}
        style={{display:"flex",alignItems:"center",gap:showLabel?10:0,padding:slim?"9px 0":"7px 12px",justifyContent:slim?"center":"flex-start",fontSize:13.5,fontWeight:isActive?500:400,color:isActive?"#111":"#555",background:isActive?"#f0f0f0":"transparent",borderRadius:8,margin:slim?"2px 6px":"1px 8px",cursor:"pointer",userSelect:"none",transition:"background 0.13s",whiteSpace:"nowrap",overflow:"hidden"}}
        onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background="#f7f7f7"; }}
        onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background=isActive?"#f0f0f0":"transparent"; }}
      >
        <span style={{display:"inline-flex",flexShrink:0}}>{item.icon}</span>
        {showLabel&&<span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{item.label}</span>}
      </div>
    );
    return slim ? <Tooltip label={item.label}>{inner}</Tooltip> : inner;
  };

  /* Sidebar content */
  const SidebarContent = ({ forceExpanded=false }) => {
    const showLabel = forceExpanded || !slim;
    return (
      <>
        {/* Logo row */}
        <div style={{padding:slim?"18px 0 14px":"18px 16px 14px",display:"flex",alignItems:"center",justifyContent:slim?"center":"space-between",flexShrink:0}}>
          {showLabel && <span style={{fontSize:18,fontWeight:800,color:"#0f0f0f",letterSpacing:"-0.5px"}}>VajraOpz</span>}
          <div style={{display:"flex",gap:4}}>
            {!isMobile&&(
              <button onClick={()=>setCollapsed(c=>!c)} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",display:"flex",padding:4,borderRadius:6}} title="Toggle sidebar">
                <CollapseIcon/>
              </button>
            )}
            {isMobile&&forceExpanded&&(
              <button onClick={()=>setMobileOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#888",display:"flex",padding:4}}>
                <XIcon/>
              </button>
            )}
          </div>
        </div>

        {/* Nav groups */}
        <div style={{flex:1,overflowY:"auto",overflowX:"hidden",paddingBottom:8}}>
          {NAV_GROUPS.map((group,gi)=>(
            <div key={gi} style={{padding:gi===0?"4px 0":"10px 0 4px"}}>
              {group.label&&showLabel&&(
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 20px 5px",fontSize:10.5,fontWeight:700,color:"#c0c0c0",letterSpacing:"0.06em",textTransform:"uppercase",cursor:group.collapsible?"pointer":"default"}}
                  onClick={group.collapsible?()=>setDevOpen(o=>!o):undefined}>
                  <span>{group.label}</span>
                  {group.collapsible&&<span style={{transform:devOpen?"rotate(0)":"rotate(180deg)",transition:"transform 0.2s"}}><ChevUp/></span>}
                </div>
              )}
              {group.label&&slim&&<div style={{height:1,background:"#f0f0f0",margin:"6px 10px"}}/>}
              {(!group.collapsible||devOpen||slim)&&group.items.map(item=>(
                <NavItem key={item.id} item={item} forceExpanded={forceExpanded}/>
              ))}
            </div>
          ))}
        </div>

        {/* User footer */}
        <div style={{borderTop:"1px solid #f0f0f0",padding:slim?"12px 0":"12px 16px",display:"flex",alignItems:"center",justifyContent:slim?"center":"flex-start",gap:10,flexShrink:0}}>
          {slim?(
            <Tooltip label="NineOne152">
              <div style={{width:30,height:30,borderRadius:"50%",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}><UserIcon/></div>
            </Tooltip>
          ):(
            <>
              <div style={{width:30,height:30,borderRadius:"50%",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff"}}><UserIcon/></div>
              {showLabel&&<span style={{fontSize:13.5,color:"#333",fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>NineOne152</span>}
            </>
          )}
        </div>
      </>
    );
  };

  /* Page meta */
  const pageMeta = {
    tts:    { title:"Text to Speech",         sub:"Convert text to natural speech in Indian languages" },
    billing:{ title:"Billing",                sub:"Manage your credits and payment history" },
    home:   { title:"Home",                   sub:"" },
    vision: { title:"Vision",                 sub:"" },
    stt:    { title:"Speech to Text",         sub:"" },
    trans:  { title:"Translate",              sub:"" },
    agents: { title:"Conversational Agents",  sub:"" },
    video:  { title:"Video Dubbing",          sub:"" },
    api:    { title:"API Keys",               sub:"" },
    usage:  { title:"Usage",                  sub:"" },
    pricing:{ title:"Pricing",                sub:"" },
    docs:   { title:"Documentation",          sub:"" },
  };
  const { title, sub } = pageMeta[activePage] || { title:"", sub:"" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:#e0e0e0;border-radius:2px;}
        input[type=range]{-webkit-appearance:none;appearance:none;height:4px;background:#e4e4e4;border-radius:2px;outline:none;width:100%;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid #4f46e5;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.15);}
        @keyframes vbar{0%{height:5px;}100%{height:15px;}}
        @media(max-width:600px){
          .page-header{padding:14px 16px!important;}
          .billing-inner{padding:24px 16px!important;}
        }
      `}</style>

      <div style={{display:"flex",height:"100vh",background:"#fff",fontFamily:"'DM Sans',sans-serif",overflow:"hidden"}}>

        {/* Mobile overlay */}
        {isMobile&&mobileOpen&&(
          <div onClick={()=>setMobileOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.28)",zIndex:40,backdropFilter:"blur(2px)"}}/>
        )}

        {/* Mobile drawer */}
        {isMobile&&(
          <div style={{position:"fixed",top:0,left:0,bottom:0,width:SIDEBAR_WIDE,background:"#fff",borderRight:"1px solid #f0f0f0",display:"flex",flexDirection:"column",zIndex:50,transform:mobileOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.25s cubic-bezier(0.4,0,0.2,1)",boxShadow:mobileOpen?"4px 0 24px rgba(0,0,0,0.1)":"none"}}>
            <SidebarContent forceExpanded/>
          </div>
        )}

        {/* Desktop sidebar */}
        {!isMobile&&(
          <div style={{width:sbW,minWidth:sbW,background:"#fff",borderRight:"1px solid #f0f0f0",display:"flex",flexDirection:"column",height:"100vh",flexShrink:0,overflowX:"hidden",transition:"width 0.22s cubic-bezier(0.4,0,0.2,1),min-width 0.22s cubic-bezier(0.4,0,0.2,1)"}}>
            <SidebarContent/>
          </div>
        )}

        {/* Main area */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>

          {/* Mobile topbar */}
          {isMobile&&(
            <div style={{padding:"13px 16px",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",gap:12,background:"#fff",flexShrink:0,zIndex:10}}>
              <button onClick={()=>setMobileOpen(true)} style={{background:"none",border:"none",cursor:"pointer",color:"#333",display:"flex",padding:4}}><MenuIcon/></button>
              <span style={{fontSize:17,fontWeight:800,color:"#111",letterSpacing:"-0.3px"}}>VajraOpz</span>
            </div>
          )}

          {/* Page header bar */}
          <div className="page-header" style={{padding:"20px 30px 16px",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,flexShrink:0}}>
            <div>
              <h1 style={{fontSize:20,fontWeight:600,color:"#111",letterSpacing:"-0.3px",margin:0}}>{title}</h1>
              {sub&&<p style={{fontSize:12.5,color:"#999",marginTop:3,fontWeight:400}}>{sub}</p>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              {activePage==="tts"&&(
                <button style={{display:"flex",alignItems:"center",gap:7,background:"none",border:"none",cursor:"pointer",color:"#555",fontSize:13.5,fontFamily:"inherit",gap:6}}>
                  <GiftIcon/> Get Code
                </button>
              )}
              {activePage==="billing"&&(
                <button style={{display:"flex",alignItems:"center",gap:7,background:"#111",color:"#fff",border:"none",borderRadius:999,padding:"9px 20px",fontSize:13.5,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                  <PlusIcon/> Add Credits
                </button>
              )}
            </div>
          </div>

          {/* Page body */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:0}}>
            {activePage==="tts"    ? <TTSPage/>            :
             activePage==="billing"? <BillingPage/>        :
             <ComingSoon label={title}/>}
          </div>
        </div>
      </div>
    </>
  );
}