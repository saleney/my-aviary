"use client";

import { FormEvent, useState } from "react";

type Bird = { name: string; kind: string; color: string; note: string; age: string };
const starterBirds: Bird[] = [
  { name: "Mango", kind: "Sun conure", color: "#ffb24a", note: "Chief snack inspector", age: "3 years" },
  { name: "Juniper", kind: "Budgerigar", color: "#91c7a4", note: "Sings to the houseplants", age: "2 years" },
  { name: "Pip", kind: "Zebra finch", color: "#ef7d65", note: "Tiny bird, big opinions", age: "1 year" },
];
const care = [
  { time: "8:00", period: "AM", task: "Fresh breakfast", detail: "Seed mix, greens & clean water", icon: "◌" },
  { time: "10:30", period: "AM", task: "Canopy time", detail: "Sunlight and social play", icon: "☀" },
  { time: "4:00", period: "PM", task: "Enrichment", detail: "Foraging toys & training", icon: "✦" },
];

export default function Home() {
  const [birds, setBirds] = useState(starterBirds);
  const [active, setActive] = useState(0);
  const [checked, setChecked] = useState<number[]>([0]);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");

  function toggleCare(index: number) {
    setChecked((list) => list.includes(index) ? list.filter((i) => i !== index) : [...list, index]);
  }

  function addBird(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "New friend");
    const kind = String(data.get("kind") || "Bird");
    setBirds((list) => [...list, { name, kind, color: "#8bb8b0", note: "The newest branch-mate", age: "New arrival" }]);
    setActive(birds.length); setModal(false); setToast(`${name} joined the flock!`);
    setTimeout(() => setToast(""), 2800);
  }

  const bird = birds[active] || birds[0];
  return <main>
    <nav className="nav"><a className="brand" href="#top"><span>✦</span> THE AVIARY</a><div className="navLinks"><a href="#flock">Flock</a><a href="#today">Today</a><button className="roundButton" onClick={() => setModal(true)} aria-label="Add a bird">＋</button></div></nav>
    <section className="hero" id="top"><div className="leaf leafOne"/><div className="leaf leafTwo"/><p className="eyebrow">YOUR LITTLE CORNER OF THE CANOPY</p><h1>Where every bird<br/><em>has a story.</em></h1><p className="intro">Keep your flock happy, healthy, and close—one joyful chirp at a time.</p><a className="primaryButton" href="#flock">Meet the flock <span>→</span></a><div className="perch" aria-hidden="true"><div className="sun"/><div className="bird birdA"><span>●</span></div><div className="bird birdB"><span>●</span></div><div className="branch"/></div></section>

    <section className="flockSection" id="flock"><div className="sectionHeading"><div><p className="eyebrow">FEATHERS & PERSONALITIES</p><h2>Meet the flock</h2></div><p>{birds.length} happy residents</p></div><div className="flockLayout"><div className="birdGrid">{birds.map((item,index)=><button key={`${item.name}-${index}`} className={`birdCard ${active===index?"active":""}`} onClick={()=>setActive(index)}><div className="portrait" style={{background:item.color}}><span>{index%2 ? "◒" : "◉"}</span><i>•</i></div><div><h3>{item.name}</h3><p>{item.kind}</p></div><span className="arrow">↗</span></button>)}</div><aside className="profile"><span className="profileLabel">NOW PERCHED</span><h3>{bird.name}</h3><p className="species">{bird.kind} · {bird.age}</p><blockquote>“{bird.note}”</blockquote><div className="profileFacts"><span><b>Favorite</b><small>Apple slices</small></span><span><b>Mood</b><small>Curious</small></span></div></aside></div></section>

    <section className="todaySection" id="today"><div className="todayIntro"><p className="eyebrow">A GOOD DAY IN THE AVIARY</p><h2>Today’s rhythm</h2><p>Small rituals make for bright feathers and happy hearts.</p><div className="progress"><span style={{width:`${Math.round(checked.length/care.length*100)}%`}}/></div><small>{checked.length} of {care.length} moments complete</small></div><div className="careList">{care.map((item,index)=><button key={item.task} className={`careItem ${checked.includes(index)?"done":""}`} onClick={()=>toggleCare(index)}><span className="careIcon">{item.icon}</span><span className="careTime"><b>{item.time}</b><small>{item.period}</small></span><span className="careCopy"><b>{item.task}</b><small>{item.detail}</small></span><span className="check">{checked.includes(index)?"✓":""}</span></button>)}</div></section>

    <footer><a className="brand" href="#top"><span>✦</span> THE AVIARY</a><p>Made for soft mornings, bright feathers, and very good birds.</p><span>© 2026</span></footer>
    {toast && <div className="toast">✦ {toast}</div>}
    {modal && <div className="modalBackdrop" onMouseDown={()=>setModal(false)}><div className="modal" onMouseDown={(e)=>e.stopPropagation()}><button className="close" onClick={()=>setModal(false)} aria-label="Close">×</button><p className="eyebrow">A NEW BRANCH-MATE</p><h2>Welcome a bird</h2><form onSubmit={addBird}><label>Name<input name="name" placeholder="e.g. Clementine" required autoFocus/></label><label>Species<input name="kind" placeholder="e.g. Cockatiel" required/></label><button className="submit" type="submit">Join the flock <span>→</span></button></form></div></div>}
  </main>;
}
