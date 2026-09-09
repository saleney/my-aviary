"use client";

import { useEffect, useMemo, useState } from "react";
import { aviaryStats, birds, journeys, yearlyNewSpecies, type Bird } from "./aviary-data";
import "./journal.css";

const fmt=(date:string)=>new Date(`${date}T12:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const numberWord=(value:number)=>["zero","one","two","three","four","five","six","seven","eight","nine","ten"][value]??String(value);
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
  const firstYear=yearlyNewSpecies[0];
  const lastYear=yearlyNewSpecies.at(-1);
  const laterSpecies=Math.max(0,aviaryStats.species-(firstYear?.species??0));
  const hasQuietYear=yearlyNewSpecies.some(year=>year.species===0);
  const yearRange=firstYear&&lastYear?`${firstYear.year}—${String(lastYear.year).slice(-2)}`:"";
  const maxRegionEncounters=Math.max(...journeys.map(place=>place.count));

  return <main className="journal" id="top">
    <nav className="jnav"><a href="#top" className="jbrand"><i>✦</i> THE AVIARY</a><div><a className="playgroundLink" href="https://saleney.github.io/">← Back to Salene’s Playground</a><a href="#journeys">Map</a><a href="#field-guide">Birds</a></div></nav>
    <header className="jhero scrollChapter is-focused" data-chapter><div className="heroCopy"><h1>Birds I’ve met<br/><em>along the way.</em></h1></div><div className="heroHabitat" aria-hidden="true"><div className="orb"/><div className="flightBird bigBird"><i/></div><div className="flightBird smallBird"><i/></div><div className="reed r1"/><div className="reed r2"/><div className="reed r3"/></div><div className="stats"><span><b>{aviaryStats.species}</b><small>species</small></span><span><b>{aviaryStats.encounters}</b><small>encounters</small></span><span><b>{aviaryStats.regions}</b><small>regions</small></span><span><b>{yearRange}</b><small>years</small></span></div></header>
    <section className="places scrollChapter" id="journeys" data-chapter><div className="placesHead"><h2>Where I heard them.</h2></div><div className="mapShell"><div className="encounterMap" aria-label="World map showing broad regions where birds were encountered"><img className="worldMap" src={`${assetBase}/world-map.png`} alt=""/>{journeys.map(place=><button key={place.name} className={`mapPin ${place.tone} ${mapPlace===place.name?"active":""}`} style={{left:`${place.x}%`,top:`${place.y}%`}} onClick={()=>setMapPlace(place.name)} aria-pressed={mapPlace===place.name}><i/><span>{place.name}</span></button>)}{mapPlace&&<aside className="mapPopup" aria-live="polite" role="dialog" aria-label={`Birds heard in ${mapPlace}`}><button className="mapPopupClose" onClick={()=>setMapPlace(null)} aria-label="Close">×</button><p className="kicker">{mapPlace}</p><div className="mapPopupStats"><b>{mapStats.species} species</b><span>{mapStats.encounters} encounters</span></div><ul>{mapBirds.map(bird=><li key={bird.name}><button className="mapBirdLink" onClick={()=>setSelected(bird)}>{bird.name}<span aria-hidden="true">↗</span></button></li>)}</ul></aside>}</div></div></section>
    <section className="journeys scrollChapter" data-chapter><div className="journeyIntro"><p className="kicker">THE RHYTHM OF RETURN</p><h2>{numberWord(firstYear?.species??0).replace(/^./,letter=>letter.toUpperCase())} species.<br/>{hasQuietYear&&<><em>A quiet year.</em><br/></>}Then, {laterSpecies} more.</h2><div className="yearTrail">{yearlyNewSpecies.map(year=><span className={year.species===0?"quiet":undefined} key={year.year}><b>{year.year}</b><small>{year.species||"—"}</small></span>)}</div></div><div className="journeyList"><p className="journeyMeasure">Encounters by region</p>{journeys.map((j,i)=><button className={`journeyRow ${j.tone}`} key={j.name} onClick={()=>{setMapPlace(j.name);document.getElementById("journeys")?.scrollIntoView({behavior:"smooth"})}}><span>{String(i+1).padStart(2,"0")}</span><b>{j.name}</b><div className="bar"><i style={{width:`${Math.max(8,j.count/maxRegionEncounters*100)}%`}}/></div><strong>{j.count}</strong></button>)}</div></section>
    <section className="guide scrollChapter" id="field-guide" data-chapter><div className="sectionTop"><div><h2>Field guide</h2></div></div><div className="toolbar"><select className="birdPicker" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Choose a bird"><option value="">Search the canopy</option>{[...birds].sort((a,b)=>a.name.localeCompare(b.name)).map(bird=><option value={bird.name} key={bird.name}>{bird.name}</option>)}</select><select className="regionPicker" value={region} onChange={e=>setRegion(e.target.value)} aria-label="Choose a region"><option value="All">All regions</option>{journeys.map(place=><option value={place.name} key={place.name}>{place.name}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value as typeof sort)} aria-label="Sort birds"><option value="recent">Recent</option><option value="encounters">Most seen</option><option value="name">A–Z</option></select></div><p className="resultCount">{filtered.length} species{region!=="All"&&<> in {region}</>}</p><div className="speciesGrid">{filtered.map(b=><button className="speciesCard" key={b.name} onClick={()=>setSelected(b)}><div className={`speciesArt hue${(birds.indexOf(b)%6)+1}`}><img src={imageFor(b)} alt="" loading="lazy"/></div><div className="speciesCopy"><h3>{b.name}</h3><em>{b.scientific}</em></div></button>)}</div>{filtered.length===0&&<div className="empty">No matches.</div>}</section>
    <footer><a href="#top" className="jbrand"><i>✦</i> THE AVIARY</a><p>Encounters from my Merlin life list · Bird notes from <a href="https://www.allaboutbirds.org/" target="_blank" rel="noreferrer">Cornell Lab</a> and <a href="https://ebird.org/explore" target="_blank" rel="noreferrer">eBird</a> · Updated {fmt(aviaryStats.latestDate)}</p></footer>
    {selected&&<div className="detailShade"><button className="detailBackdrop" onClick={()=>setSelected(null)} aria-label="Close bird details"/><aside className="detail" aria-modal="true" role="dialog"><button className="detailClose" onClick={()=>setSelected(null)} aria-label="Close">×</button><div className={`detailArt hue${(birds.indexOf(selected)%6)+1}`}><img src={imageFor(selected)} alt={`Illustration of ${selected.name}`}/></div><div className="detailBody"><p className="kicker">{selected.encounters} {selected.encounters===1?"ENCOUNTER":"ENCOUNTERS"}</p><h2>{selected.name}</h2><em>{selected.scientific}</em><p className="detailBlurb">{selected.blurb}</p><dl><div><dt>First seen</dt><dd>{fmt(selected.first)}</dd></div><div><dt>Latest</dt><dd>{fmt(selected.latest)}</dd></div><div><dt>Regions</dt><dd>{selected.regions.join(", ")}</dd></div></dl></div></aside></div>}
  </main>
}
