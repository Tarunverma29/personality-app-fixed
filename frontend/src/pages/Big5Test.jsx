import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './TestPage.module.css'

const QUESTIONS = [
  {id:1,text:"I come up with creative solutions that others haven't considered.",trait:"O",reverse:false},
  {id:2,text:"I get absorbed in art, music, or nature in a way that others rarely do.",trait:"O",reverse:false},
  {id:3,text:"I find philosophical or abstract discussions genuinely exciting.",trait:"O",reverse:false},
  {id:4,text:"I prefer sticking to proven methods rather than experimenting with new ones.",trait:"O",reverse:true},
  {id:5,text:"I enjoy exploring unfamiliar places or experiences just for the sake of it.",trait:"O",reverse:false},
  {id:6,text:"I find it hard to get interested in topics outside my usual areas.",trait:"O",reverse:true},
  {id:7,text:"I challenge conventional ideas and question what's generally accepted.",trait:"O",reverse:false},
  {id:8,text:"I notice beauty and detail in everyday things that others walk past.",trait:"O",reverse:false},
  {id:9,text:"I plan my days carefully and stick to my schedule.",trait:"C",reverse:false},
  {id:10,text:"Once I commit to a goal, I work at it consistently until it's done.",trait:"C",reverse:false},
  {id:11,text:"I often leave tasks unfinished or put them off until the last moment.",trait:"C",reverse:true},
  {id:12,text:"I take my responsibilities seriously and rarely let people down.",trait:"C",reverse:false},
  {id:13,text:"My workspace or home tends to be disorganized or messy.",trait:"C",reverse:true},
  {id:14,text:"I set high standards for myself and push hard to meet them.",trait:"C",reverse:false},
  {id:15,text:"I act on impulse and often regret decisions made quickly.",trait:"C",reverse:true},
  {id:16,text:"I track my habits, finances, or health with intention and consistency.",trait:"C",reverse:false},
  {id:17,text:"I feel most alive and energized when I'm around other people.",trait:"E",reverse:false},
  {id:18,text:"I'm the one who keeps a group's energy and conversation going.",trait:"E",reverse:false},
  {id:19,text:"I find small talk draining or awkward and prefer deep one-on-ones.",trait:"E",reverse:true},
  {id:20,text:"I actively seek out social events, parties, or gatherings.",trait:"E",reverse:false},
  {id:21,text:"I often need extended alone time to feel recharged after social activity.",trait:"E",reverse:true},
  {id:22,text:"I speak up confidently in meetings or group settings.",trait:"E",reverse:false},
  {id:23,text:"I prefer quiet evenings at home over busy social plans.",trait:"E",reverse:true},
  {id:24,text:"I enjoy being the center of attention and engaging with a crowd.",trait:"E",reverse:false},
  {id:25,text:"I genuinely care how others around me are feeling.",trait:"A",reverse:false},
  {id:26,text:"I go out of my way to help someone even if it's inconvenient for me.",trait:"A",reverse:false},
  {id:27,text:"I can be blunt or confrontational when I disagree.",trait:"A",reverse:true},
  {id:28,text:"I trust people by default and give them the benefit of the doubt.",trait:"A",reverse:false},
  {id:29,text:"In conflicts, I tend to put the other person's needs ahead of my own.",trait:"A",reverse:false},
  {id:30,text:"I sometimes take advantage of situations or people to get what I want.",trait:"A",reverse:true},
  {id:31,text:"I find it easy to forgive people who have wronged me.",trait:"A",reverse:false},
  {id:32,text:"I'm sensitive to others' emotions and adjust how I act around them.",trait:"A",reverse:false},
  {id:33,text:"I worry about things even when there's nothing I can do about them.",trait:"N",reverse:false},
  {id:34,text:"I experience strong mood swings or emotional highs and lows.",trait:"N",reverse:false},
  {id:35,text:"I stay calm and composed even under pressure or criticism.",trait:"N",reverse:true},
  {id:36,text:"I often feel anxious, even without a specific reason.",trait:"N",reverse:false},
  {id:37,text:"Setbacks or failures tend to hit me hard emotionally.",trait:"N",reverse:false},
  {id:38,text:"I rarely feel overwhelmed by daily stress.",trait:"N",reverse:true},
  {id:39,text:"I tend to dwell on mistakes or embarrassing moments long after they happen.",trait:"N",reverse:false},
  {id:40,text:"I'm generally optimistic and expect things to work out.",trait:"N",reverse:true},
  {id:41,text:"I seek out novel experiences even if they involve some risk.",trait:"O",reverse:false},
  {id:42,text:"I'm detail-oriented and catch errors that others miss.",trait:"C",reverse:false},
  {id:43,text:"I enjoy meeting strangers and rarely feel shy in new social situations.",trait:"E",reverse:false},
  {id:44,text:"I'm quick to apologize and smooth things over after disagreements.",trait:"A",reverse:false},
  {id:45,text:"I feel a wave of dread or unease before big life events.",trait:"N",reverse:false},
  {id:46,text:"I regularly read, learn, or explore topics outside my field.",trait:"O",reverse:false},
  {id:47,text:"I break large projects into steps and execute them methodically.",trait:"C",reverse:false},
  {id:48,text:"I get a genuine energy boost when I know I'll be socializing.",trait:"E",reverse:false},
  {id:49,text:"I find it hard to say no even when I'm stretched thin.",trait:"A",reverse:false},
  {id:50,text:"My emotions can interfere with my ability to think clearly.",trait:"N",reverse:false},
]

const TRAITS = {
  O:{name:"Openness",color:"#b69fff",bg:"rgba(182,159,255,0.1)",
    facets:["Creativity","Curiosity","Imagination","Aesthetic sense","Intellect","Adventurousness"],
    high:"You have a richly active imagination and crave new ideas, experiences, and perspectives. Novelty energizes you.",
    low:"You're practical, grounded, and prefer what's proven. You value tradition, routine, and concrete thinking.",
    mid:"You balance curiosity with practicality. Open to new ideas when they're relevant.",
  },
  C:{name:"Conscientiousness",color:"#73d089",bg:"rgba(115,208,137,0.1)",
    facets:["Organization","Self-discipline","Goal focus","Reliability","Thoroughness","Impulse control"],
    high:"You're the kind of person who has a plan, sticks to it, and follows through. People trust you because you deliver.",
    low:"You live more in the moment and resist rigid structure. Spontaneous and flexible.",
    mid:"You balance structure with flexibility. Organized when it counts.",
  },
  E:{name:"Extraversion",color:"#ff6b8a",bg:"rgba(255,107,138,0.1)",
    facets:["Sociability","Assertiveness","Energy","Warmth","Excitement-seeking","Talkativeness"],
    high:"People energize you. You're naturally warm, talkative, and assertive. Social situations are where you feel most alive.",
    low:"You're introverted — you recharge alone and prefer depth over breadth in relationships.",
    mid:"You're ambivert — comfortable alone or in a crowd depending on context.",
  },
  A:{name:"Agreeableness",color:"#4ecdc4",bg:"rgba(78,205,196,0.1)",
    facets:["Empathy","Trust","Cooperation","Altruism","Compliance","Modesty"],
    high:"You're warm, cooperative, and genuinely care about others. You avoid conflict and go out of your way to help.",
    low:"You're direct, competitive, and skeptical. You prioritize outcomes over harmony.",
    mid:"You can be cooperative or assertive depending on what the situation calls for.",
  },
  N:{name:"Neuroticism",color:"#e8c97a",bg:"rgba(232,201,122,0.1)",
    facets:["Anxiety","Moodiness","Self-consciousness","Vulnerability","Anger","Emotional sensitivity"],
    high:"You feel emotions intensely and are sensitive to stress. Perceptive and empathetic, but worry can be a challenge.",
    low:"You're emotionally stable and resilient. Stress rolls off you relatively easily.",
    mid:"You have normal emotional range — feel stress like everyone does but generally recover well.",
  },
}

function getLevel(s){ return s >= 65 ? 'high' : s <= 40 ? 'low' : 'mid' }

function getArchetype(scores) {
  const {O,C,E,A,N} = scores
  if(O>65&&C>55&&E>55) return "The Visionary Leader"
  if(O>65&&C<45&&E<45) return "The Deep Thinker"
  if(C>70&&A>60&&N<40) return "The Reliable Anchor"
  if(E>70&&A>60&&N<40) return "The Social Connector"
  if(N>65&&O>60&&A>55) return "The Empathic Idealist"
  if(C>65&&N<35&&E<45) return "The Quiet Achiever"
  if(O>60&&E>60&&A>60) return "The Creative Collaborator"
  if(N>65&&C<45) return "The Reactive Dreamer"
  if(A<35&&N<40&&C>60) return "The Determined Strategist"
  if(E<35&&N<35&&C>55) return "The Independent Expert"
  return "The Balanced Individual"
}

export default function Big5Test({ user, mbtiResult, onComplete }) {
  const nav = useNavigate()
  const [phase, setPhase] = useState('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})

  const q = QUESTIONS[currentQ]
  const pct = Math.round((currentQ / QUESTIONS.length) * 100)
  const answered = answers[q?.id]
  const traitColors = { O:'#b69fff', C:'#73d089', E:'#ff6b8a', A:'#4ecdc4', N:'#e8c97a' }
  const SCALE_LABELS = ['Strongly disagree','Disagree','Slightly disagree','Neutral','Slightly agree','Agree','Strongly agree']

  function score() {
    const totals = {O:0,C:0,E:0,A:0,N:0}
    const counts = {O:0,C:0,E:0,A:0,N:0}
    QUESTIONS.forEach(q => {
      if (answers[q.id] !== undefined) {
        let v = answers[q.id]
        if (q.reverse) v = 8 - v
        totals[q.trait] += v
        counts[q.trait]++
      }
    })
    const scores = {}
    ;['O','C','E','A','N'].forEach(t => {
      const max = counts[t] * 7
      scores[t] = counts[t] ? Math.round((totals[t]/max)*100) : 50
    })
    return scores
  }

  function finish() {
    const scores = score()
    const archetype = getArchetype(scores)
    onComplete({ scores, archetype })
    nav('/results', { state: { scores, archetype } })
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {phase === 'intro' && (
          <div className={`${styles.card} ${styles.fadeUp}`}>
            <div className={styles.testBadge} style={{ '--tc': '#73d089' }}>
              <span>🌊</span> Big Five Assessment · Part 2 of 2
            </div>
            <h1 className={styles.testTitle}>The <em>OCEAN</em> model</h1>
            <p className={styles.testDesc}>
              The most scientifically validated personality model in psychology — used in research across 50+ countries. Measures you on a <em>spectrum</em> across five independent dimensions.
            </p>
            <div className={styles.blockList}>
              {Object.entries(TRAITS).map(([k, t]) => (
                <div key={k} className={styles.blockItem}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: t.bg, border: `1px solid ${t.color}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize: 12, fontWeight: 700, color: t.color, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{k}</span>
                  <div>
                    <p className={styles.blockLabel}>{t.name}</p>
                    <p className={styles.blockDesc}>{t.facets.slice(0,3).join(' · ')}</p>
                  </div>
                </div>
              ))}
              <p className={styles.blockNote}>✦ 50 questions · 7-point scale · ~7 minutes · Answer honestly</p>
            </div>
            <button className={styles.primaryBtn} style={{ background: 'linear-gradient(135deg, #2a7a4a, #73d089)' }} onClick={() => setPhase('test')}>
              Begin Big Five Test →
            </button>
          </div>
        )}

        {phase === 'test' && (
          <div className={styles.card}>
            {/* Progress */}
            <div className={styles.progressWrap}>
              <div className={styles.progressMeta}>
                <span className={styles.blockTag} style={{ color: traitColors[q.trait] }}>
                  {TRAITS[q.trait].name}
                </span>
                <span className={styles.qCount}>{currentQ + 1} / {QUESTIONS.length}</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${traitColors[q.trait]}88, ${traitColors[q.trait]})` }} />
              </div>
            </div>

            {/* Question */}
            <div className={styles.questionCard} style={{ borderLeft: `3px solid ${traitColors[q.trait]}`, paddingLeft: 20 }}>
              <p className={styles.questionText}>"{q.text}"</p>
            </div>

            {/* Scale */}
            <div className={styles.scaleWrap}>
              <div className={styles.scaleLabels}>
                <span>Strongly disagree</span>
                <span>Strongly agree</span>
              </div>
              <div className={styles.scaleOptions}>
                {[1,2,3,4,5,6,7].map((v, i) => (
                  <button key={v}
                    className={`${styles.scaleBtn} ${answered === v ? styles.scaleBtnSelected : ''}`}
                    style={answered === v ? { borderColor: traitColors[q.trait], color: traitColors[q.trait] } : {}}
                    onClick={() => setAnswers(a => ({ ...a, [q.id]: v }))}>
                    <div className={styles.scaleDot} style={answered === v ? { background: traitColors[q.trait] } : {}} />
                    <span>{v}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.navRow}>
              <button className={styles.navBtn} disabled={currentQ === 0} onClick={() => setCurrentQ(c => c - 1)}>← Back</button>
              <span className={styles.answeredCount}>{Object.keys(answers).length} answered</span>
              {currentQ === QUESTIONS.length - 1 ? (
                <button className={styles.navBtn} disabled={answered === undefined}
                  style={answered !== undefined ? { background: 'linear-gradient(135deg, #2a7a4a, #73d089)', color: '#fff', border: 'none' } : {}}
                  onClick={finish}>See results →</button>
              ) : (
                <button className={styles.navBtn} disabled={answered === undefined} onClick={() => setCurrentQ(c => c + 1)}>Next →</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
