import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import styles from './ResultsPage.module.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TRAITS = {
  O: { name:'Openness', color:'#b69fff',
    facets:['Creativity','Curiosity','Imagination','Aesthetic Sense','Intellect','Adventurousness'],
    high:"Richly imaginative and drawn to new ideas, experiences, and perspectives. Novelty energizes you. You thrive in roles with variety and autonomy.",
    low:"Practical, grounded, and prefer what's proven. You value tradition and concrete thinking. You build expertise by going deep.",
    mid:"Balance curiosity with practicality. Open to new ideas when relevant, pragmatic enough to execute." },
  C: { name:'Conscientiousness', color:'#73d089',
    facets:['Organization','Self-discipline','Goal Focus','Reliability','Thoroughness','Impulse Control'],
    high:"You have a plan, stick to it, and follow through. Dependable, detail-oriented, high-achieving. People trust you because you deliver.",
    low:"You live in the moment and resist rigid structure. Spontaneous and flexible, sometimes brilliantly creative under pressure.",
    mid:"Balance structure with flexibility. Organized when it counts, won't let perfectionism slow you down." },
  E: { name:'Extraversion', color:'#ff6b8a',
    facets:['Sociability','Assertiveness','Energy','Warmth','Excitement-Seeking','Talkativeness'],
    high:"People energize you. Naturally warm, talkative, and assertive. Social situations are where you feel most alive.",
    low:"Introverted — you recharge alone. Prefer depth over breadth in relationships. Deliberate and reflective before speaking.",
    mid:"Ambivert — comfortable alone or in a crowd depending on context. Toggle social energy as needed." },
  A: { name:'Agreeableness', color:'#4ecdc4',
    facets:['Empathy','Trust','Cooperation','Altruism','Compliance','Modesty'],
    high:"Warm, cooperative, and genuinely care about others. Avoid conflict and go out of your way to help.",
    low:"Direct, competitive, and skeptical. Prioritize outcomes over harmony. Not afraid to challenge or push back.",
    mid:"Cooperative or assertive depending on situation. Neither pushover nor needlessly confrontational." },
  N: { name:'Neuroticism', color:'#e8c97a',
    facets:['Anxiety','Moodiness','Self-Consciousness','Vulnerability','Anger','Sensitivity'],
    high:"Feel emotions intensely and are sensitive to stress. Perceptive and empathetic — but worry and mood swings can be challenges.",
    low:"Emotionally stable and resilient. Stress rolls off you easily. You project calm even in turbulent situations.",
    mid:"Normal emotional range — feel stress like everyone does, but generally recover from setbacks well." },
}

const TYPE_COLORS = {
  INTJ:'#6366f1',INTP:'#1D4ED8',INFJ:'#6D28D9',INFP:'#7E22CE',
  ENTJ:'#7C3AED',ENTP:'#0EA5E9',ENFJ:'#EA580C',ENFP:'#16A34A',
  ISTJ:'#4338CA',ISTP:'#78716C',ISFJ:'#0369A1',ISFP:'#BE185D',
  ESTJ:'#0D9488',ESTP:'#DC2626',ESFJ:'#2563EB',ESFP:'#C026D3',
}

const ARCHETYPES = {
  "The Visionary Leader":     { icon:"🚀", desc:"Creative, driven, and socially magnetic — you inspire others with big ideas and the follow-through to make them real." },
  "The Deep Thinker":         { icon:"🔭", desc:"Richly imaginative and internally focused. You live in ideas, art, and meaning." },
  "The Reliable Anchor":      { icon:"⚓", desc:"Dependable, warm, and emotionally stable. People lean on you because you're always there." },
  "The Social Connector":     { icon:"✨", desc:"You light up rooms and bring people together. Your warmth and energy make you the heart of every group." },
  "The Empathic Idealist":    { icon:"💫", desc:"Deeply feeling and imaginative. You see what could be and hurt when reality falls short." },
  "The Quiet Achiever":       { icon:"🎯", desc:"You work steadily, finish what you start, and don't need applause. Your results speak loudly." },
  "The Creative Collaborator":{ icon:"🎨", desc:"Ideas flow from you, people are drawn to you, and you enjoy making things better for everyone." },
  "The Reactive Dreamer":     { icon:"🌊", desc:"You feel everything intensely and often have brilliant ideas — consistency is your ongoing growth edge." },
  "The Determined Strategist":{ icon:"♟️", desc:"Driven, clear-eyed, and tough. You pursue goals without letting sentiment slow you down." },
  "The Independent Expert":   { icon:"🔬", desc:"Self-sufficient, focused, and steady. You don't need the crowd — you need a good problem to solve." },
  "The Balanced Individual":  { icon:"☯️", desc:"Well-distributed across the Big Five. Adaptable, flexible, effective across many contexts." },
}

function getLevel(s){ return s >= 65 ? 'high' : s <= 40 ? 'low' : 'mid' }
function getLevelLabel(s){ return s >= 65 ? 'High' : s <= 40 ? 'Low' : 'Moderate' }

export default function ResultsPage({ user, mbti, big5 }) {
  const nav = useNavigate()
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [animIn, setAnimIn] = useState(false)

  // Guard: if props somehow missing, try sessionStorage fallback
  const resolvedUser = user || (() => { try { return JSON.parse(sessionStorage.getItem('pm_user')) } catch { return null } })()
  const resolvedMbti = mbti || (() => { try { return JSON.parse(sessionStorage.getItem('pm_mbti')) } catch { return null } })()
  const resolvedBig5 = big5 || (() => { try { return JSON.parse(sessionStorage.getItem('pm_big5')) } catch { return null } })()

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 100)
    if (resolvedUser?.id && resolvedMbti && resolvedBig5) {
      fetch(`${API}/api/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: resolvedUser.id,
          mbti_type: resolvedMbti.type,
          mbti_scores: resolvedMbti.scores || {},
          big5_scores: resolvedBig5.scores,
          big5_archetype: resolvedBig5.archetype,
        })
      })
        .then(r => r.ok ? setSaved(true) : r.json().then(d => setSaveError(d.detail)))
        .catch(() => setSaveError('Could not save results — check your connection'))
    }
  }, [])

  if (!resolvedBig5 || !resolvedMbti || !resolvedUser) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
        <p style={{ color:'var(--text2)' }}>No results found.</p>
        <button onClick={() => nav('/onboarding')} style={{ padding:'10px 24px', background:'var(--accent2)', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' }}>
          Start Over
        </button>
      </div>
    )
  }

  const { scores } = resolvedBig5
  const archetype = ARCHETYPES[resolvedBig5.archetype] || ARCHETYPES["The Balanced Individual"]
  const mbtiColor = TYPE_COLORS[resolvedMbti?.type] || '#b69fff'

  const radarData = ['O','C','E','A','N'].map(k => ({
    trait: TRAITS[k].name.slice(0, 5),
    fullName: TRAITS[k].name,
    value: scores[k],
    color: TRAITS[k].color,
  }))

  const TABS = [
    { id:'overview', label:'Overview' },
    { id:'big5', label:'Big Five' },
    { id:'mbti', label:'MBTI' },
  ]

  return (
    <div className={`${styles.root} ${animIn ? styles.visible : ''}`}>
      <div className={styles.container}>

        {/* ── HEADER ── */}
        <div className={styles.header}>
          <p className={styles.greeting}>Your results, {resolvedUser?.nickname || 'Explorer'}</p>
          <h1 className={styles.headline}>
            <span style={{ color: mbtiColor }}>{resolvedMbti?.type}</span>
            {' '}meets{' '}
            <span style={{ color: '#b69fff' }}>{resolvedBig5.archetype}</span>
          </h1>
          {saved && <span className={styles.savedBadge}>✓ Saved to your profile</span>}
          {saveError && <span className={styles.saveError}>⚠ {saveError}</span>}
        </div>

        {/* ── TABS ── */}
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t.id}
              className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className={styles.fadeIn}>
            <div className={styles.dualHero}>
              <div className={styles.heroCard} style={{ borderColor:`${mbtiColor}44`, background:`linear-gradient(145deg, var(--bg2), ${mbtiColor}11)` }}>
                <p className={styles.heroLabel}>MBTI Type</p>
                <div className={styles.heroType} style={{ color: mbtiColor }}>{resolvedMbti?.type}</div>
                <p className={styles.heroTitle}>{resolvedMbti?.typeInfo?.title}</p>
                <p className={styles.heroTagline} style={{ color: mbtiColor }}>"{resolvedMbti?.typeInfo?.tagline}"</p>
              </div>
              <div className={styles.heroDivider}>
                <span className={styles.plusSign}>+</span>
              </div>
              <div className={styles.heroCard} style={{ borderColor:'rgba(182,159,255,0.3)', background:'linear-gradient(145deg, var(--bg2), rgba(182,159,255,0.08))' }}>
                <p className={styles.heroLabel}>Big Five Archetype</p>
                <div className={styles.heroArchEmoji}>{archetype.icon}</div>
                <p className={styles.heroArchName}>{resolvedBig5.archetype}</p>
                <p className={styles.heroArchDesc}>{archetype.desc}</p>
              </div>
            </div>

            {/* Radar chart */}
            <div className={styles.radarCard}>
              <p className={styles.sectionTitle}>OCEAN Radar Profile</p>
              <div className={styles.radarWrap}>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarData} margin={{ top: 24, right: 40, bottom: 24, left: 40 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis
                      dataKey="trait"
                      tick={({ x, y, payload, index }) => {
                        const d = radarData[index]
                        return (
                          <g>
                            <text x={x} y={y - 4} textAnchor="middle" fill={d.color} fontSize={12} fontFamily="var(--font-mono)" fontWeight="600">
                              {payload.value}
                            </text>
                            <text x={x} y={y + 10} textAnchor="middle" fill={d.color} fontSize={11} fontFamily="var(--font-mono)">
                              {scores[['O','C','E','A','N'][index]]}%
                            </text>
                          </g>
                        )
                      }}
                    />
                    <Radar name="Score" dataKey="value" stroke="#b69fff" fill="#b69fff" fillOpacity={0.18} strokeWidth={2.5}
                      dot={{ fill:'#b69fff', r:5, strokeWidth:0 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0]
                        return (
                          <div style={{ background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:8, padding:'10px 14px' }}>
                            <p style={{ color:'var(--text)', fontSize:13, fontWeight:600 }}>{d.payload.fullName}</p>
                            <p style={{ color:'#b69fff', fontSize:16, fontWeight:700 }}>{d.value}%</p>
                          </div>
                        )
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.scorePills}>
                {['O','C','E','A','N'].map(k => (
                  <div key={k} className={styles.scorePill} style={{ '--c': TRAITS[k].color }}>
                    <span className={styles.scorePillLetter}>{k}</span>
                    <span className={styles.scorePillVal}>{scores[k]}%</span>
                    <span className={styles.scorePillLevel}>{getLevelLabel(scores[k])}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BIG 5 TAB ── */}
        {activeTab === 'big5' && (
          <div className={styles.fadeIn}>
            <div className={styles.miniRadar}>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} margin={{ top:16, right:32, bottom:16, left:32 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="trait" tick={{ fill:'var(--text3)', fontSize:11, fontFamily:'var(--font-mono)' }} />
                  <Radar dataKey="value" stroke="#b69fff" fill="#b69fff" fillOpacity={0.12} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {['O','C','E','A','N'].map(k => {
              const t = TRAITS[k]
              const s = scores[k]
              const lv = getLevel(s)
              return (
                <div key={k} className={styles.traitBlock} style={{ '--c': t.color }}>
                  <div className={styles.traitHeader}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span className={styles.traitKey}>{k}</span>
                      <span className={styles.traitName}>{t.name}</span>
                    </div>
                    <span className={styles.traitBadge} style={{ background:`${t.color}22`, color:t.color }}>
                      {getLevelLabel(s)} · {s}%
                    </span>
                  </div>
                  <div className={styles.traitBarBg}>
                    <div className={styles.traitBarFill} style={{ width:`${s}%`, background:t.color }} />
                  </div>
                  <p className={styles.traitDesc}>{t[lv]}</p>
                  <div className={styles.facets}>
                    {t.facets.map(f => <span key={f} className={styles.facet}>{f}</span>)}
                  </div>
                </div>
              )
            })}

            <div className={styles.researchNote}>
              <span>📖</span>
              <p>Research note: The Big Five is stable across cultures and predicts career success, relationship satisfaction, health behaviors, and mental well-being. Traits can shift gradually with intentional effort (Costa & McCrae, 2006).</p>
            </div>
          </div>
        )}

        {/* ── MBTI TAB ── */}
        {activeTab === 'mbti' && resolvedMbti && (
          <div className={styles.fadeIn}>
            <div className={styles.mbtiCard} style={{ background:`linear-gradient(145deg, var(--bg2), ${mbtiColor}22)`, borderColor:`${mbtiColor}33` }}>
              <div style={{ fontSize:48, marginBottom:10 }}>{resolvedMbti.typeInfo?.emoji}</div>
              <p className={styles.heroLabel}>Your MBTI Type</p>
              <div className={styles.bigType} style={{ color:mbtiColor }}>{resolvedMbti.type}</div>
              <p style={{ fontFamily:'var(--font-display)', fontSize:20, color:'rgba(255,255,255,0.6)', fontStyle:'italic', marginBottom:12 }}>{resolvedMbti.typeInfo?.title}</p>
              <p className={styles.mbtiDesc}>{resolvedMbti.typeInfo?.desc}</p>
            </div>

            <div className={styles.mbtiInfo}>
              <div className={styles.infoCard}>
                <p className={styles.infoLabel}>Temperament</p>
                <p className={styles.infoVal}>{resolvedMbti.temp}</p>
              </div>
              <div className={styles.infoCard}>
                <p className={styles.infoLabel}>Interaction Style</p>
                <p className={styles.infoVal}>{resolvedMbti.intr}</p>
              </div>
            </div>

            {resolvedMbti.typeInfo?.functions && (
              <div className={styles.functionsCard}>
                <p className={styles.sectionTitle} style={{ marginBottom:14 }}>Cognitive Function Stack</p>
                {[
                  ['Hero (1st)', 'Your dominant strength — how you naturally lead'],
                  ['Parent (2nd)', 'Your secondary strength — responsible & reliable'],
                  ['Child (3rd)', 'Playful & innocent — your source of inner joy'],
                  ['Inferior (4th)', 'Your core insecurity & greatest growth edge'],
                ].map(([role, meaning], i) => {
                  const fn = resolvedMbti.typeInfo.functions.split(' · ')[i]
                  return (
                    <div key={role} className={styles.fnRow}
                      style={{ background:i===0?`${mbtiColor}18`:undefined, borderRadius:i===0?10:undefined, padding:i===0?'10px 12px':'6px 4px' }}>
                      <div className={styles.fnBadge} style={{ background:i===0?mbtiColor:'var(--surface2)' }}>{fn}</div>
                      <div>
                        <p className={styles.fnRole} style={{ color:i===0?'#fff':'var(--text2)' }}>{role}</p>
                        <p className={styles.fnMeaning}>{meaning}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className={styles.footer}>
          <button className={styles.retakeBtn} onClick={() => {
            sessionStorage.clear()
            nav('/')
          }}>Take test again</button>
          <p className={styles.footerNote}>Results are saved to your profile</p>
        </div>
      </div>
    </div>
  )
}
