"use client";

import { useMemo, useState } from "react";
import "./journal.css";

type Bird = { name:string; scientific:string; encounters:number; first:string; latest:string; regions:string[] };
const birds: Bird[] = [
  {name:"Eurasian Tree Sparrow",scientific:"Passer montanus",encounters:8,first:"2026-06-20",latest:"2026-07-02",regions:["Guangdong","Hong Kong","Yunnan"]},
  {name:"American Robin",scientific:"Turdus migratorius",encounters:4,first:"2026-04-15",latest:"2026-05-22",regions:["California"]},
  {name:"House Finch",scientific:"Haemorhous mexicanus",encounters:4,first:"2026-04-16",latest:"2026-05-22",regions:["California"]},
  {name:"Blyth's Leaf Warbler",scientific:"Phylloscopus reguloides",encounters:3,first:"2026-06-25",latest:"2026-06-25",regions:["Yunnan"]},
  {name:"Dark-eyed Junco",scientific:"Junco hyemalis",encounters:3,first:"2026-05-13",latest:"2026-05-27",regions:["California"]},
  {name:"White-crowned Sparrow",scientific:"Zonotrichia leucophrys",encounters:3,first:"2026-05-03",latest:"2026-05-27",regions:["California"]},
  {name:"Anna's Hummingbird",scientific:"Calypte anna",encounters:2,first:"2026-05-03",latest:"2026-08-18",regions:["California"]},
  {name:"Red-whiskered Bulbul",scientific:"Pycnonotus jocosus",encounters:2,first:"2026-06-25",latest:"2026-06-25",regions:["Yunnan"]},
  {name:"Ring-billed Gull",scientific:"Larus delawarensis",encounters:2,first:"2026-04-12",latest:"2026-04-12",regions:["New York","Ontario"]},
  {name:"Song Sparrow",scientific:"Melospiza melodia",encounters:2,first:"2024-03-27",latest:"2026-05-03",regions:["California"]},
  {name:"Allen's Hummingbird",scientific:"Selasphorus sasin",encounters:1,first:"2026-05-03",latest:"2026-05-03",regions:["California"]},
  {name:"Barn Swallow",scientific:"Hirundo rustica",encounters:1,first:"2026-06-20",latest:"2026-06-20",regions:["Guangdong"]},
  {name:"Bewick's Wren",scientific:"Thryomanes bewickii",encounters:1,first:"2026-05-13",latest:"2026-05-13",regions:["California"]},
  {name:"Black Phoebe",scientific:"Sayornis nigricans",encounters:1,first:"2026-05-22",latest:"2026-05-22",regions:["California"]},
  {name:"Black-capped Chickadee",scientific:"Poecile atricapillus",encounters:1,first:"2026-04-12",latest:"2026-04-12",regions:["New York"]},
  {name:"House Sparrow",scientific:"Passer domesticus",encounters:1,first:"2026-04-13",latest:"2026-04-13",regions:["Ontario"]},
  {name:"Lesser Goldfinch",scientific:"Spinus psaltria",encounters:1,first:"2026-05-03",latest:"2026-05-03",regions:["California"]},
  {name:"Little Grebe",scientific:"Tachybaptus ruficollis",encounters:1,first:"2026-06-24",latest:"2026-06-24",regions:["Yunnan"]},
  {name:"Orange-crowned Warbler",scientific:"Leiothlypis celata",encounters:1,first:"2026-04-15",latest:"2026-04-15",regions:["California"]},
  {name:"Pacific Wren",scientific:"Troglodytes pacificus",encounters:1,first:"2026-05-13",latest:"2026-05-13",regions:["California"]},
  {name:"Purple Finch",scientific:"Haemorhous purpureus",encounters:1,first:"2024-03-27",latest:"2024-03-27",regions:["California"]},
  {name:"Red-masked Parakeet",scientific:"Psittacara erythrogenys",encounters:1,first:"2024-03-27",latest:"2024-03-27",regions:["California"]},
  {name:"Red-shouldered Hawk",scientific:"Buteo lineatus",encounters:1,first:"2026-04-15",latest:"2026-04-15",regions:["California"]},
  {name:"Spotted Towhee",scientific:"Pipilo maculatus",encounters:1,first:"2026-05-13",latest:"2026-05-13",regions:["California"]},
  {name:"Steller's Jay",scientific:"Cyanocitta stelleri",encounters:1,first:"2026-04-22",latest:"2026-04-22",regions:["California"]},
  {name:"Swinhoe's White-eye",scientific:"Zosterops simplex",encounters:1,first:"2026-06-20",latest:"2026-06-20",regions:["Guangdong"]},
  {name:"Western Bluebird",scientific:"Sialia mexicana",encounters:1,first:"2026-08-18",latest:"2026-08-18",regions:["California"]},
  {name:"Wilson's Warbler",scientific:"Cardellina pusilla",encounters:1,first:"2026-04-15",latest:"2026-04-15",regions:["California"]}
];
const journeys=[{name:"California",count:31,tone:"clay"},{name:"Yunnan",count:10,tone:"moss"},{name:"Guangdong",count:5,tone:"gold"},{name:"New York",count:2,tone:"blue"},{name:"Ontario",count:2,tone:"sage"},{name:"Hong Kong",count:1,tone:"rose"}];
const fmt=(date:string)=>new Date(`${date}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const imageFor=(bird:Bird)=>`/birds/${bird.name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}.jpg`;

export default function AviaryJournal(){
  const [query,setQuery]=useState(""); const [region,setRegion]=useState("All"); const [sort,setSort]=useState<"recent"|"name"|"encounters">("recent"); const [selected,setSelected]=useState<Bird|null>(null);
  const filtered=useMemo(()=>birds.filter(b=>{const placeMatch=region==="All"||(region==="China"?b.regions.some(r=>["Yunnan","Guangdong","Hong Kong"].includes(r)):region==="Elsewhere"?b.regions.some(r=>["New York","Ontario"].includes(r)):b.regions.includes(region));return placeMatch&&(b.name+" "+b.scientific).toLowerCase().includes(query.toLowerCase())}).sort((a,b)=>sort==="name"?a.name.localeCompare(b.name):sort==="encounters"?b.encounters-a.encounters:b.latest.localeCompare(a.latest)),[query,region,sort]);
  return <main className="journal" id="top">
    <nav className="jnav"><a href="#top" className="jbrand"><i>✦</i> THE AVIARY</a><div><a href="#field-guide">Field guide</a><a href="#journeys">Journeys</a></div></nav>
    <header className="jhero"><div className="heroCopy"><h1>Birds I’ve met<br/><em>along the way.</em></h1><p className="lede">A living field journal grown through listening, wandering, and paying attention.</p></div><div className="heroHabitat" aria-hidden="true"><div className="orb"/><div className="flightBird bigBird"><i/></div><div className="flightBird smallBird"><i/></div><div className="reed r1"/><div className="reed r2"/><div className="reed r3"/></div><div className="stats"><span><b>28</b><small>species</small></span><span><b>51</b><small>encounters</small></span><span><b>6</b><small>regions</small></span><span><b>2024—26</b><small>years</small></span></div></header>
    <section className="guide" id="field-guide"><div className="sectionTop"><div><h2>Field guide</h2></div></div><div className="toolbar"><label className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the canopy" aria-label="Search birds"/></label><div className="regionFilters">{["All","California","China","Elsewhere"].map(r=><button key={r} className={region===r?"active":""} onClick={()=>setRegion(r)}>{r}</button>)}</div><select value={sort} onChange={e=>setSort(e.target.value as typeof sort)} aria-label="Sort birds"><option value="recent">Recent</option><option value="encounters">Most seen</option><option value="name">A–Z</option></select></div><p className="resultCount">{filtered.length} {filtered.length===1?"bird":"birds"}</p><div className="speciesGrid">{filtered.map(b=><button className="speciesCard" key={b.name} onClick={()=>setSelected(b)}><div className={`speciesArt hue${(birds.indexOf(b)%6)+1}`}><img src={imageFor(b)} alt="" loading="lazy"/></div><div className="speciesCopy"><small>{b.encounters}×</small><h3>{b.name}</h3><em>{b.scientific}</em><p>{b.regions.join(" · ")}</p></div></button>)}</div>{filtered.length===0&&<div className="empty">No matches.</div>}</section>
    <section className="journeys" id="journeys"><div className="journeyIntro"><p className="kicker">THE RHYTHM OF RETURN</p><h2>Three species.<br/><em>A quiet year.</em><br/>Then, 25 more.</h2><div className="yearTrail"><span><b>2024</b><small>3</small></span><span className="quiet"><b>2025</b><small>—</small></span><span><b>2026</b><small>25</small></span></div></div><div className="journeyList"><p className="journeyMeasure">Encounters by region</p>{journeys.map((j,i)=><div className={`journeyRow ${j.tone}`} key={j.name}><span>{String(i+1).padStart(2,"0")}</span><b>{j.name}</b><div className="bar"><i style={{width:`${Math.max(8,j.count/31*100)}%`}}/></div><strong>{j.count}</strong></div>)}</div></section>
    <footer><a href="#top" className="jbrand"><i>✦</i> THE AVIARY</a><p>From my Merlin life list · Updated August 18, 2026</p></footer>
    {selected&&<div className="detailShade" onMouseDown={()=>setSelected(null)}><aside className="detail" onMouseDown={e=>e.stopPropagation()} aria-modal="true" role="dialog"><button className="detailClose" onClick={()=>setSelected(null)} aria-label="Close">×</button><div className={`detailArt hue${(birds.indexOf(selected)%6)+1}`}><img src={imageFor(selected)} alt={`Illustration of ${selected.name}`}/></div><div className="detailBody"><p className="kicker">{selected.encounters} {selected.encounters===1?"ENCOUNTER":"ENCOUNTERS"}</p><h2>{selected.name}</h2><em>{selected.scientific}</em><dl><div><dt>First seen</dt><dd>{fmt(selected.first)}</dd></div><div><dt>Latest</dt><dd>{fmt(selected.latest)}</dd></div><div><dt>Regions</dt><dd>{selected.regions.join(", ")}</dd></div></dl></div></aside></div>}
  </main>
}
