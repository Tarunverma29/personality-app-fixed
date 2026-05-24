import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './TestPage.module.css'

// ── TYPE GRID ────────────────────────────────────────────────────────────────
const GRID = {
  SJ: { "In-Charge":"ESTJ", "Starter":"ESFJ", "See-it-thru":"ISTJ", "Behind-Scenes":"ISFJ" },
  SP: { "In-Charge":"ESTP", "Starter":"ESFP", "See-it-thru":"ISTP", "Behind-Scenes":"ISFP" },
  NT: { "In-Charge":"ENTJ", "Starter":"ENTP", "See-it-thru":"INTJ", "Behind-Scenes":"INTP" },
  NF: { "In-Charge":"ENFJ", "Starter":"ENFP", "See-it-thru":"INFJ", "Behind-Scenes":"INFP" },
}

const QUESTIONS = [
  { id:1, tag:"A", emoji:"🧭", text:"When you need to make a big decision, what do you lean on most?",
    sub:"Not what sounds smart — what actually happens in your head.",
    answers:[
      { text:"What has worked before, what the proven approach is, what I'm supposed to do", scores:{SJ:3} },
      { text:"What I want right now, what feels right in this moment, what experience I'll get", scores:{SP:3} },
      { text:"What makes the most logical sense, what the most efficient system is", scores:{NT:3} },
      { text:"What's best for the people involved, what aligns with my values", scores:{NF:3} },
    ]},
  { id:2, tag:"A", emoji:"📅", text:"Your week is wide open — no obligations. How does it actually go?",
    sub:null,
    answers:[
      { text:"I make a loose plan. Knowing what's happening when makes me feel settled and in control.", scores:{SJ:3} },
      { text:"I wake up and react to the day. Plans feel like a cage — I do what I'm drawn to in the moment.", scores:{SP:3} },
      { text:"I deep-dive into a problem, project, or idea I've been chewing on.", scores:{NT:3} },
      { text:"I reconnect with people or spend time thinking about relationships and how I can show up for them.", scores:{NF:3} },
    ]},
  { id:3, tag:"A", emoji:"🔥", text:"What actually bothers you most in daily life?",
    sub:"The one that gives you that quiet (or not-so-quiet) irritation.",
    answers:[
      { text:"When people ignore protocol, skip steps, or disrespect traditions that exist for good reasons", scores:{SJ:3} },
      { text:"When I'm stuck, constrained, or forced to follow a rigid process instead of figuring it out my way", scores:{SP:3} },
      { text:"When things are done inefficiently or people refuse to think logically about a problem", scores:{NT:3} },
      { text:"When people are unkind, dismissive, or oblivious to how their behavior affects others", scores:{NF:3} },
    ]},
  { id:4, tag:"A", emoji:"🪞", text:"Which sentence sounds most like an inner voice you actually have?",
    sub:null,
    answers:[
      { text:"\"This is how it's done. There's a right way and a wrong way, and I know which is which.\"", scores:{SJ:3} },
      { text:"\"I'll figure it out as I go. Give me freedom and I'll make it work.\"", scores:{SP:3} },
      { text:"\"There has to be a better system here. Why isn't anyone thinking about this properly?\"", scores:{NT:3} },
      { text:"\"I just want people to actually be okay. Why is that so hard to prioritize?\"", scores:{NF:3} },
    ]},
  { id:5, tag:"B", emoji:"💬", text:"You have something important to tell a friend. How does it come out?",
    sub:"Think of an actual recent time you had to share something real.",
    answers:[
      { text:"Short and direct — I get to the point. I say what I mean without much preamble.", scores:{direct:3} },
      { text:"I build up to it — context, explanation, background. I want them to understand the full picture.", scores:{informative:3} },
    ]},
  { id:6, tag:"B", emoji:"🎉", text:"You show up at a party where you only know the host. They get pulled away immediately. What happens?",
    sub:null,
    answers:[
      { text:"I scan the room, pick someone interesting, and introduce myself. I'm fine starting conversations.", scores:{initiating:3} },
      { text:"I find a comfortable spot, get a drink, and wait. I'm happy when people come to me.", scores:{responding:3} },
    ]},
  { id:7, tag:"B", emoji:"🚗", text:"You're in gridlock. GPS says stay on the highway — it's 3 minutes faster, but you'll sit still. What do you do?",
    sub:null,
    answers:[
      { text:"Stay on the highway. Trust the data, be patient, get home efficiently.", scores:{control:3} },
      { text:"Take the exit. Moving on a longer route beats sitting completely still.", scores:{movement:3} },
    ]},
  { id:8, tag:"B", emoji:"🏁", text:"You're given a big project with total freedom on how to do it. What's your natural pattern?",
    sub:null,
    answers:[
      { text:"I attack it fast with high energy. Starting is easy — I lose steam toward the end.", scores:{initiating:2,movement:1} },
      { text:"I take my time up front, plan it carefully, and execute it step by step to completion.", scores:{control:2,responding:1} },
      { text:"I wait until I feel ready, then pour everything into finishing it completely.", scores:{responding:2,movement:1} },
      { text:"I start immediately, but at my own controlled pace — no rushing, but no stalling.", scores:{control:1,initiating:2} },
    ]},
  { id:9, tag:"C", emoji:"🧠", text:"When someone tells you something totally new and unexpected, what's your first instinct?",
    sub:"This reveals how you process information — past-based or possibility-based.",
    answers:[
      { text:"I compare it to what I already know from experience. Does it hold up to what I've seen before?", scores:{SJ:2,NT:1} },
      { text:"I think about what's happening right now, in front of me. Abstract ideas feel distant or unreal.", scores:{SP:2} },
      { text:"My mind immediately goes to: what does this mean? What could happen? What are all the possibilities?", scores:{NT:2,NF:1} },
      { text:"I wonder how this affects people — what does it mean for everyone involved?", scores:{NF:2,SJ:1} },
    ]},
  { id:10, tag:"C", emoji:"⚖️", text:"You find out a close friend did something wrong — something that hurt another person. What matters most?",
    sub:"There's no right answer. This is about your natural pull.",
    answers:[
      { text:"Whether what they did was actually right or wrong by a clear logical standard — facts, not feelings", scores:{NT:2,SP:1} },
      { text:"Whether they followed the rules and norms that hold relationships and communities together", scores:{SJ:2} },
      { text:"How everyone involved actually feels, and how to make it right between them", scores:{NF:2} },
      { text:"Whether their intentions were good — context and motive matter more than the act itself", scores:{NF:1,SP:1,NT:1} },
    ]},
]

const TYPES = {
  ESTJ:{ title:"The Overseer", emoji:"⚖️", col:"#0D9488", tagline:"You enforce the standard so others don't have to guess it.", desc:"Rational, disciplined, and built for execution. You hold everyone — including yourself — to a high standard, remember everything, and have no patience for sloppiness.", functions:"Te · Si · Ne · Fi" },
  ESFJ:{ title:"The Caregiver", emoji:"🤝", col:"#2563EB", tagline:"You make people feel like they belong — and you remember everything.", desc:"Warm, loyal, and socially intelligent. You're constantly reading the emotional temperature of a room and adjusting. You remember who likes what, who's struggling, who needs to feel included.", functions:"Fe · Si · Ne · Ti" },
  ISTJ:{ title:"The Inspector", emoji:"📋", col:"#4338CA", tagline:"You are a living library of how things should be done.", desc:"Methodical, reliable, and deeply memory-driven. You catalogue every experience and use it as your compass. You don't make mistakes twice.", functions:"Si · Te · Fi · Ne" },
  ISFJ:{ title:"The Protector", emoji:"🛡️", col:"#0369A1", tagline:"You quietly remember everything about everyone — and use it to care for them.", desc:"The silent force behind the people you love. You notice the details nobody else catches and show love through remembering.", functions:"Si · Fe · Ti · Ne" },
  ESTP:{ title:"The Dynamo", emoji:"⚡", col:"#DC2626", tagline:"You are the ultimate realist — alive in the moment, built for impact.", desc:"Quick, tactical, and impossible to rattle. You're reading what's happening right now and responding with full force.", functions:"Se · Ti · Fe · Ni" },
  ESFP:{ title:"The Performer", emoji:"🎭", col:"#C026D3", tagline:"You turn every moment into an experience worth remembering.", desc:"Spontaneous, warm, and electrically present. You read every room instantly and know exactly how to make people feel alive in the moment.", functions:"Se · Fi · Te · Ni" },
  ISTP:{ title:"The Craftsman", emoji:"🔧", col:"#78716C", tagline:"You figure out how everything works — then make it work better.", desc:"Cool-headed, logical, and a person of extreme competence. You run everything through a relentless internal true/false engine.", functions:"Ti · Se · Ni · Fe" },
  ISFP:{ title:"The Artist", emoji:"🎨", col:"#BE185D", tagline:"You live by your values, express your truth through what you make.", desc:"Deeply independent and internally driven. Your personal moral compass is your entire operating system.", functions:"Fi · Se · Ni · Te" },
  ENTJ:{ title:"The Strategist", emoji:"♟️", col:"#7C3AED", tagline:"You see the inefficiency, design the system, and take charge — immediately.", desc:"Visionary and commanding. You lead with collective logic at scale, redesigning entire structures rather than just solving problems.", functions:"Te · Ni · Se · Fi" },
  ENTP:{ title:"The Innovator", emoji:"💡", col:"#0EA5E9", tagline:"You see every possible path forward — and you love testing which ones hold up.", desc:"Relentlessly curious and intellectually combative in the best way. You test ideas to destruction — including your own.", functions:"Ne · Ti · Fe · Si" },
  INTJ:{ title:"The Mastermind", emoji:"🧠", col:"#334155", tagline:"You already know where this is going — and you're already three steps ahead.", desc:"Laser-focused and frighteningly independent. You have a singular, clear path forward and pursue it with sniper-rifle precision.", functions:"Ni · Te · Fi · Se" },
  INTP:{ title:"The Architect", emoji:"🔬", col:"#1D4ED8", tagline:"You build mental models of everything and live inside your own head — happily.", desc:"Endlessly analytical and deeply internal. You build complex mental models and genuinely enjoy doing it.", functions:"Ti · Ne · Si · Fe" },
  ENFJ:{ title:"The Mentor", emoji:"🌟", col:"#EA580C", tagline:"You see what people could become — and pour yourself into helping them get there.", desc:"Charismatic, deeply empathic, and built for social transformation. You feel what others feel and invest in their potential.", functions:"Fe · Ni · Se · Ti" },
  ENFP:{ title:"The Advocate", emoji:"🌈", col:"#16A34A", tagline:"You see a better world and you need everyone to see it too.", desc:"Passionately imaginative and people-driven. You see infinite possible futures and champion ideas others overlook.", functions:"Ne · Fi · Te · Si" },
  INFJ:{ title:"The Oracle", emoji:"🔮", col:"#6D28D9", tagline:"You see patterns in people no one else notices.", desc:"Privately intense and quietly relentless. You read people with frightening accuracy and commit wholly to what you believe in.", functions:"Ni · Fe · Ti · Se" },
  INFP:{ title:"The Dreamer", emoji:"🌙", col:"#7E22CE", tagline:"Your values are your entire operating system — and you need the world to mean something.", desc:"Deeply personal and guided by your inner moral world. Your values are non-negotiable — no external pressure can move you from what you know is right.", functions:"Fi · Ne · Si · Te" },
}

const TEMP_DESC = {
  SJ:"Guardian · Duty-driven · Safety-oriented",
  SP:"Artisan · Freedom-driven · Experience-oriented",
  NT:"Intellectual · Logic-driven · System-oriented",
  NF:"Idealist · Values-driven · People-focused",
}

function classifyInteraction(s) {
  const isDirect     = (s.direct     || 0) >= (s.informative || 0)
  const isInitiating = (s.initiating || 0) >= (s.responding  || 0)
  const isControl    = (s.control    || 0) >= (s.movement    || 0)
  if ( isDirect &&  isInitiating &&  isControl) return "In-Charge"
  if (!isDirect &&  isInitiating && !isControl) return "Starter"
  if ( isDirect && !isInitiating && !isControl) return "See-it-thru"
  if (!isDirect && !isInitiating &&  isControl) return "Behind-Scenes"
  const rank = {
    "In-Charge":     (+isDirect)+(+isInitiating)+(+isControl),
    "Starter":       (+!isDirect)+(+isInitiating)+(+!isControl),
    "See-it-thru":   (+isDirect)+(+!isInitiating)+(+!isControl),
    "Behind-Scenes": (+!isDirect)+(+!isInitiating)+(+isControl),
  }
  return Object.entries(rank).sort((a,b)=>b[1]-a[1])[0][0]
}

export default function MBTITest({ user, onComplete }) {
  const nav = useNavigate()
  const [phase, setPhase] = useState('intro')
  const [qIdx, setQIdx] = useState(0)
  const [scores, setScores] = useState({})
  const [sel, setSel] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('profile')

  const q = QUESTIONS[qIdx]
  const last = qIdx === QUESTIONS.length - 1
  const pct = Math.round((qIdx / QUESTIONS.length) * 100)
  const blockLabel = q?.tag === 'A' ? 'What drives you' : q?.tag === 'B' ? 'How you engage' : 'How you think'

  function advance() {
    if (sel === null || leaving) return
    setLeaving(true)
    const ns = { ...scores }
    Object.entries(QUESTIONS[qIdx].answers[sel].scores).forEach(([k, v]) => {
      ns[k] = (ns[k] || 0) + v
    })
    setTimeout(() => {
      setLeaving(false)
      setSel(null)
      if (last) {
        const temp = Object.entries({ SJ: ns.SJ||0, SP: ns.SP||0, NT: ns.NT||0, NF: ns.NF||0 })
          .sort((a,b) => b[1]-a[1])[0][0]
        const intr = classifyInteraction(ns)
        const r = { type: GRID[temp][intr], temp, intr, scores: ns }
        setResult(r)
        setPhase('result')
      } else {
        setQIdx(i => i + 1)
        setScores(ns)
      }
    }, 260)
  }

  const info = result ? TYPES[result.type] : null

  return (
    <div className={styles.root}>
      <div className={styles.container}>

        {phase === 'intro' && (
          <div className={`${styles.card} ${styles.fadeUp}`}>
            <div className={styles.testBadge} style={{ '--tc': '#b69fff' }}>
              <span>🧬</span> MBTI Assessment · Part 1 of 2
            </div>
            <h1 className={styles.testTitle}>
              Find your <em>cognitive type</em>
            </h1>
            <p className={styles.testDesc}>
              10 scenario-based questions built from cognitive function theory, temperaments, and interaction styles. Designed for accuracy, not speed.
            </p>
            <div className={styles.blockList}>
              {[
                ['🧭', 'Questions 1–4', 'What fundamentally drives you (temperament)'],
                ['💬', 'Questions 5–8', 'How you engage with the world (interaction style)'],
                ['🔬', 'Questions 9–10', 'How you process information (cognitive functions)'],
              ].map(([e, l, d]) => (
                <div key={l} className={styles.blockItem}>
                  <span>{e}</span>
                  <div>
                    <p className={styles.blockLabel}>{l}</p>
                    <p className={styles.blockDesc}>{d}</p>
                  </div>
                </div>
              ))}
              <p className={styles.blockNote}>✦ Pick what's most natural — not your ideal self · ~3 minutes</p>
            </div>
            <button className={styles.primaryBtn} onClick={() => setPhase('quiz')}>
              Begin MBTI Test →
            </button>
          </div>
        )}

        {phase === 'quiz' && (
          <div className={`${styles.card} ${leaving ? styles.leaving : styles.entering}`}>
            {/* Progress */}
            <div className={styles.progressWrap}>
              <div className={styles.progressMeta}>
                <span className={styles.blockTag}>{blockLabel}</span>
                <span className={styles.qCount}>{qIdx + 1} / {QUESTIONS.length}</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent2), var(--accent))' }} />
              </div>
            </div>

            {/* Question */}
            <div className={styles.questionCard}>
              <div className={styles.questionEmoji}>{q.emoji}</div>
              <p className={styles.questionText}>{q.text}</p>
              {q.sub && <p className={styles.questionSub}>{q.sub}</p>}
            </div>

            {/* Answers */}
            <div className={styles.answers}>
              {q.answers.map((ans, i) => (
                <button key={i} className={`${styles.answer} ${sel === i ? styles.answerSelected : ''}`}
                  onClick={() => setSel(i)}>
                  <span className={styles.answerRadio}>
                    {sel === i && <span className={styles.answerDot} />}
                  </span>
                  {ans.text}
                </button>
              ))}
            </div>

            <button className={styles.primaryBtn} disabled={sel === null} onClick={advance}>
              {last ? 'Reveal my type →' : 'Next →'}
            </button>
          </div>
        )}

        {phase === 'result' && info && (
          <div className={`${styles.card} ${styles.fadeUp}`}>
            {/* Hero */}
            <div className={styles.typeHero} style={{ background: `linear-gradient(145deg, #111, ${info.col}33)`, borderColor: `${info.col}33` }}>
              <div className={styles.typeEmoji}>{info.emoji}</div>
              <p className={styles.typeLabel}>Your MBTI Type</p>
              <h2 className={styles.typeName} style={{ color: info.col }}>{result.type}</h2>
              <h3 className={styles.typeTitle}>{info.title}</h3>
              <p className={styles.typeTagline} style={{ color: info.col }}>"{info.tagline}"</p>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              {[['profile','Profile'], ['breakdown','Breakdown']].map(([k,l]) => (
                <button key={k} className={`${styles.tab} ${tab === k ? styles.tabActive : ''}`}
                  style={tab === k ? { background: info.col } : {}}
                  onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>

            {tab === 'profile' && (
              <div className={styles.tabContent}>
                <p className={styles.typeDesc}>{info.desc}</p>
                <div className={styles.functionsRow}>
                  {info.functions.split(' · ').map((fn, i) => (
                    <span key={fn} className={styles.fnChip} style={{ opacity: 1 - i * 0.2, borderColor: i === 0 ? info.col : undefined, color: i === 0 ? info.col : undefined }}>
                      {fn}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {tab === 'breakdown' && (
              <div className={styles.tabContent}>
                <div className={styles.breakdownGrid}>
                  <div className={styles.breakdownCard}>
                    <p className={styles.breakdownLabel}>Temperament</p>
                    <p className={styles.breakdownValue}>{result.temp}</p>
                    <p className={styles.breakdownSub}>{TEMP_DESC[result.temp]}</p>
                  </div>
                  <div className={styles.breakdownCard}>
                    <p className={styles.breakdownLabel}>Style</p>
                    <p className={styles.breakdownValue}>{result.intr}</p>
                  </div>
                </div>
                {Object.entries({ SJ:result.scores.SJ||0, SP:result.scores.SP||0, NT:result.scores.NT||0, NF:result.scores.NF||0 })
                  .sort((a,b) => b[1]-a[1]).map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{k}</span>
                      <span style={{ color: 'var(--text3)' }}>{TEMP_DESC[k].split(' · ')[0]}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3 }}>
                      <div style={{ height:'100%', width:`${Math.min(100,(v/14)*100)}%`, background: k === result.temp ? info.col : 'var(--border2)', borderRadius: 3, transition:'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className={styles.primaryBtn} style={{ background: `linear-gradient(135deg, ${info.col}aa, ${info.col})` }}
              onClick={() => { const r = { ...result, typeInfo: info }; onComplete(r); nav('/test/big5') }}>
              Continue to Big Five Test →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
