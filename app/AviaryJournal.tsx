"use client";

import { useEffect, useMemo, useState } from "react";
import "./journal.css";

type Bird = { name:string; scientific:string; encounters:number; first:string; latest:string; regions:string[]; blurb:string };
const birds: Bird[] = [
  {name:"Eurasian Tree Sparrow",scientific:"Passer montanus",encounters:8,first:"2026-06-20",latest:"2026-07-02",regions:["Guangdong","Hong Kong","Yunnan"],blurb:"A rufous-capped sparrow with a black cheek spot, often moving in noisy flocks."},
  {name:"American Robin",scientific:"Turdus migratorius",encounters:4,first:"2026-04-15",latest:"2026-05-22",regions:["California"],blurb:"A gray-brown thrush with a warm orange belly that runs and pauses across lawns."},
  {name:"House Finch",scientific:"Haemorhous mexicanus",encounters:4,first:"2026-04-16",latest:"2026-05-22",regions:["California"],blurb:"A social, streaky finch; males wear rosy color around the face and breast."},
  {name:"Blyth's Leaf Warbler",scientific:"Phylloscopus reguloides",encounters:3,first:"2026-06-25",latest:"2026-06-25",regions:["Yunnan"],blurb:"A yellow-green forest warbler with a pale crown stripe and alternating wing flicks."},
  {name:"Dark-eyed Junco",scientific:"Junco hyemalis",encounters:3,first:"2026-05-13",latest:"2026-05-27",regions:["California"],blurb:"A ground-feeding sparrow with a pale bill and white outer tail feathers."},
  {name:"White-crowned Sparrow",scientific:"Zonotrichia leucophrys",encounters:3,first:"2026-05-03",latest:"2026-05-27",regions:["California"],blurb:"Bold black-and-white head stripes and a sweet whistled opening make it distinctive."},
  {name:"Anna's Hummingbird",scientific:"Calypte anna",encounters:2,first:"2026-05-03",latest:"2026-08-18",regions:["California"],blurb:"A green-and-gray hummingbird; males flash an iridescent rose-pink crown and throat."},
  {name:"Red-whiskered Bulbul",scientific:"Pycnonotus jocosus",encounters:2,first:"2026-06-25",latest:"2026-06-25",regions:["Yunnan"],blurb:"A tall-crested songbird with red cheek and undertail patches, often seen in pairs."},
  {name:"Ring-billed Gull",scientific:"Larus delawarensis",encounters:2,first:"2026-04-12",latest:"2026-04-12",regions:["New York","Ontario"],blurb:"A sociable, medium-sized gull named for the black band around its yellow bill."},
  {name:"Song Sparrow",scientific:"Melospiza melodia",encounters:2,first:"2024-03-27",latest:"2026-05-03",regions:["California"],blurb:"A heavily streaked sparrow of brushy edges, with songs that vary across its range."},
  {name:"Allen's Hummingbird",scientific:"Selasphorus sasin",encounters:1,first:"2026-05-03",latest:"2026-05-03",regions:["California"],blurb:"A compact coppery-and-green hummingbird of coastal scrub, with narrow outer tail feathers."},
  {name:"Barn Swallow",scientific:"Hirundo rustica",encounters:1,first:"2026-06-20",latest:"2026-06-20",regions:["Guangdong"],blurb:"A blue-backed aerial hunter with an orange throat and a deeply forked tail."},
  {name:"Bewick's Wren",scientific:"Thryomanes bewickii",encounters:1,first:"2026-05-13",latest:"2026-05-13",regions:["California"],blurb:"A lively brown wren with a bold white eyebrow and a long, often upright tail."},
  {name:"Black Phoebe",scientific:"Sayornis nigricans",encounters:1,first:"2026-05-22",latest:"2026-05-22",regions:["California"],blurb:"A sooty flycatcher with a white belly that pumps its tail from low waterside perches."},
  {name:"Black-capped Chickadee",scientific:"Poecile atricapillus",encounters:1,first:"2026-04-12",latest:"2026-04-12",regions:["New York"],blurb:"A tiny acrobat with a black cap and bib, white cheeks, and familiar chick-a-dee calls."},
  {name:"House Sparrow",scientific:"Passer domesticus",encounters:1,first:"2026-04-13",latest:"2026-04-13",regions:["Ontario"],blurb:"A chunky, stout-billed sparrow closely tied to buildings, streets, and human activity."},
  {name:"Lesser Goldfinch",scientific:"Spinus psaltria",encounters:1,first:"2026-05-03",latest:"2026-05-03",regions:["California"],blurb:"A tiny seed-eating finch; males are yellow with a black cap and white wing patch."},
  {name:"Little Grebe",scientific:"Tachybaptus ruficollis",encounters:1,first:"2026-06-24",latest:"2026-06-24",regions:["Yunnan"],blurb:"A compact diving bird of reed-edged wetlands, with rusty neck sides in breeding plumage."},
  {name:"Orange-crowned Warbler",scientific:"Leiothlypis celata",encounters:1,first:"2026-04-15",latest:"2026-04-15",regions:["California"],blurb:"A plain olive warbler whose namesake orange crown is usually hidden from view."},
  {name:"Pacific Wren",scientific:"Troglodytes pacificus",encounters:1,first:"2026-05-13",latest:"2026-05-13",regions:["California"],blurb:"A tiny barred-brown wren that moves mouse-like through mossy forest understory."},
  {name:"Purple Finch",scientific:"Haemorhous purpureus",encounters:1,first:"2024-03-27",latest:"2024-03-27",regions:["California"],blurb:"A chunky forest finch; males carry a raspberry wash across the head and breast."},
  {name:"Red-masked Parakeet",scientific:"Psittacara erythrogenys",encounters:1,first:"2024-03-27",latest:"2024-03-27",regions:["California"],blurb:"A long-tailed green parakeet with a red face, usually announced by loud screeches."},
  {name:"Red-shouldered Hawk",scientific:"Buteo lineatus",encounters:1,first:"2026-04-15",latest:"2026-04-15",regions:["California"],blurb:"A richly barred woodland hawk with checkered wings and a rising, whistled call."},
  {name:"Spotted Towhee",scientific:"Pipilo maculatus",encounters:1,first:"2026-05-13",latest:"2026-05-13",regions:["California"],blurb:"A black, white, and rufous sparrow that scratches noisily through leaf litter."},
  {name:"Steller's Jay",scientific:"Cyanocitta stelleri",encounters:1,first:"2026-04-22",latest:"2026-04-22",regions:["California"],blurb:"A dark-crested blue jay of evergreen forests, known for bold curiosity and varied calls."},
  {name:"Swinhoe's White-eye",scientific:"Zosterops simplex",encounters:1,first:"2026-06-20",latest:"2026-06-20",regions:["Guangdong"],blurb:"A small olive-yellow bird with a bright white eyering, active from understory to canopy."},
  {name:"Western Bluebird",scientific:"Sialia mexicana",encounters:1,first:"2026-08-18",latest:"2026-08-18",regions:["California"],blurb:"A blue-and-rust thrush that drops from low perches to catch insects on the ground."},
  {name:"Wilson's Warbler",scientific:"Cardellina pusilla",encounters:1,first:"2026-04-15",latest:"2026-04-15",regions:["California"],blurb:"A bright yellow, restless warbler; males wear a small black cap."}
];
const journeys=[
  {name:"California",count:31,tone:"clay",x:17,y:34},
  {name:"Ontario",count:2,tone:"sage",x:27,y:22},
  {name:"New York",count:2,tone:"blue",x:30,y:29},
  {name:"Yunnan",count:10,tone:"moss",x:77,y:35},
  {name:"Guangdong",count:5,tone:"gold",x:81,y:41},
  {name:"Hong Kong",count:1,tone:"rose",x:84,y:43}
];
const fmt=(date:string)=>new Date(`${date}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const assetBase=process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const imageFor=(bird:Bird)=>`${assetBase}/birds/${bird.name.toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}.jpg`;

export default function AviaryJournal(){
  const [query,setQuery]=useState(""); const [region,setRegion]=useState("All"); const [mapPlace,setMapPlace]=useState<string|null>(null); const [sort,setSort]=useState<"recent"|"name"|"encounters">("recent"); const [selected,setSelected]=useState<Bird|null>(null);
  useEffect(()=>{
    const chapters=Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle("is-focused",entry.isIntersecting)),{threshold:.16,rootMargin:"-10% 0px -12%"});
    chapters.forEach(chapter=>observer.observe(chapter));
    return ()=>observer.disconnect();
  },[]);
  const filtered=useMemo(()=>birds.filter(b=>{const placeMatch=region==="All"||b.regions.includes(region);return placeMatch&&(b.name+" "+b.scientific).toLowerCase().includes(query.toLowerCase())}).sort((a,b)=>sort==="name"?a.name.localeCompare(b.name):sort==="encounters"?b.encounters-a.encounters:b.latest.localeCompare(a.latest)),[query,region,sort]);
  const mapBirds=useMemo(()=>mapPlace?birds.filter(b=>b.regions.includes(mapPlace)):[],[mapPlace]);
  const mapStats=useMemo(()=>{
    if(!mapPlace) return {species:0,encounters:0};
    return {species:mapBirds.length,encounters:journeys.find(place=>place.name===mapPlace)?.count??0};
  },[mapPlace,mapBirds]);
  return <main className="journal" id="top">
    <nav className="jnav"><a href="#top" className="jbrand"><i>✦</i> THE AVIARY</a><div><a href="#journeys">Map</a><a href="#field-guide">Birds</a></div></nav>
    <header className="jhero scrollChapter is-focused" data-chapter><div className="heroCopy"><h1>Birds I’ve met<br/><em>along the way.</em></h1></div><div className="heroHabitat" aria-hidden="true"><div className="orb"/><div className="flightBird bigBird"><i/></div><div className="flightBird smallBird"><i/></div><div className="reed r1"/><div className="reed r2"/><div className="reed r3"/></div><div className="stats"><span><b>28</b><small>species</small></span><span><b>51</b><small>encounters</small></span><span><b>6</b><small>regions</small></span><span><b>2024—26</b><small>years</small></span></div></header>
    <section className="places scrollChapter" id="journeys" data-chapter><div className="placesHead"><h2>Where I heard them.</h2></div><div className="mapShell"><div className="encounterMap" aria-label="World map showing broad regions where birds were encountered"><img className="worldMap" src={`${assetBase}/world-map.png`} alt=""/>{journeys.map(place=><button key={place.name} className={`mapPin ${place.tone} ${mapPlace===place.name?"active":""}`} style={{left:`${place.x}%`,top:`${place.y}%`}} onClick={()=>setMapPlace(place.name)} aria-pressed={mapPlace===place.name}><i/><span>{place.name}</span></button>)}{mapPlace&&<aside className="mapPopup" aria-live="polite" role="dialog" aria-label={`Birds heard in ${mapPlace}`}><button className="mapPopupClose" onClick={()=>setMapPlace(null)} aria-label="Close">×</button><p className="kicker">{mapPlace}</p><div className="mapPopupStats"><b>{mapStats.species} species</b><span>{mapStats.encounters} encounters</span></div><ul>{mapBirds.map(bird=><li key={bird.name}><button className="mapBirdLink" onClick={()=>setSelected(bird)}>{bird.name}<span aria-hidden="true">↗</span></button></li>)}</ul></aside>}</div></div></section>
    <section className="journeys scrollChapter" data-chapter><div className="journeyIntro"><p className="kicker">THE RHYTHM OF RETURN</p><h2>Three species.<br/><em>A quiet year.</em><br/>Then, 25 more.</h2><div className="yearTrail"><span><b>2024</b><small>3</small></span><span className="quiet"><b>2025</b><small>—</small></span><span><b>2026</b><small>25</small></span></div></div><div className="journeyList"><p className="journeyMeasure">Encounters by region</p>{journeys.map((j,i)=><button className={`journeyRow ${j.tone}`} key={j.name} onClick={()=>{setMapPlace(j.name);document.getElementById("journeys")?.scrollIntoView({behavior:"smooth"})}}><span>{String(i+1).padStart(2,"0")}</span><b>{j.name}</b><div className="bar"><i style={{width:`${Math.max(8,j.count/31*100)}%`}}/></div><strong>{j.count}</strong></button>)}</div></section>
    <section className="guide scrollChapter" id="field-guide" data-chapter><div className="sectionTop"><div><h2>Field guide</h2></div></div><div className="toolbar"><select className="birdPicker" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Choose a bird"><option value="">Search the canopy</option>{[...birds].sort((a,b)=>a.name.localeCompare(b.name)).map(bird=><option value={bird.name} key={bird.name}>{bird.name}</option>)}</select><select className="regionPicker" value={region} onChange={e=>setRegion(e.target.value)} aria-label="Choose a region"><option value="All">All regions</option>{journeys.map(place=><option value={place.name} key={place.name}>{place.name}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value as typeof sort)} aria-label="Sort birds"><option value="recent">Recent</option><option value="encounters">Most seen</option><option value="name">A–Z</option></select></div><p className="resultCount">{filtered.length} species{region!=="All"&&<> in {region}</>}</p><div className="speciesGrid">{filtered.map(b=><button className="speciesCard" key={b.name} onClick={()=>setSelected(b)}><div className={`speciesArt hue${(birds.indexOf(b)%6)+1}`}><img src={imageFor(b)} alt="" loading="lazy"/></div><div className="speciesCopy"><h3>{b.name}</h3><em>{b.scientific}</em></div></button>)}</div>{filtered.length===0&&<div className="empty">No matches.</div>}</section>
    <footer><a href="#top" className="jbrand"><i>✦</i> THE AVIARY</a><p>Encounters from my Merlin life list · Bird notes from <a href="https://www.allaboutbirds.org/" target="_blank" rel="noreferrer">Cornell Lab</a> and <a href="https://ebird.org/explore" target="_blank" rel="noreferrer">eBird</a> · Updated August 18, 2026</p></footer>
    {selected&&<div className="detailShade" onMouseDown={()=>setSelected(null)}><aside className="detail" onMouseDown={e=>e.stopPropagation()} aria-modal="true" role="dialog"><button className="detailClose" onClick={()=>setSelected(null)} aria-label="Close">×</button><div className={`detailArt hue${(birds.indexOf(selected)%6)+1}`}><img src={imageFor(selected)} alt={`Illustration of ${selected.name}`}/></div><div className="detailBody"><p className="kicker">{selected.encounters} {selected.encounters===1?"ENCOUNTER":"ENCOUNTERS"}</p><h2>{selected.name}</h2><em>{selected.scientific}</em><p className="detailBlurb">{selected.blurb}</p><dl><div><dt>First seen</dt><dd>{fmt(selected.first)}</dd></div><div><dt>Latest</dt><dd>{fmt(selected.latest)}</dd></div><div><dt>Regions</dt><dd>{selected.regions.join(", ")}</dd></div></dl></div></aside></div>}
  </main>
}
