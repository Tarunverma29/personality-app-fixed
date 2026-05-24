import { useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

const TRAITS = [
  { letter: 'O', name: 'Openness', color: '#b69fff' },
  { letter: 'C', name: 'Conscientiousness', color: '#4ecdc4' },
  { letter: 'E', name: 'Extraversion', color: '#ff6b8a' },
  { letter: 'A', name: 'Agreeableness', color: '#73d089' },
  { letter: 'N', name: 'Neuroticism', color: '#e8c97a' },
]

export default function LandingPage() {
  const nav = useNavigate()
  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        {/* Decorative letters */}
        <div className={styles.deco} aria-hidden>
          {['I','N','F','J','E','S','T','P'].map((l, i) => (
            <span key={i} className={styles.decoLetter} style={{ animationDelay: `${i * 0.15}s` }}>{l}</span>
          ))}
        </div>

        <div className={styles.hero}>
          <p className={styles.eyebrow}>Personality Intelligence</p>
          <h1 className={styles.title}>
            <span className={styles.titleLine1}>Know</span>
            <span className={styles.titleLine2}>Your<em>self</em></span>
          </h1>
          <p className={styles.subtitle}>
            A dual-lens personality assessment combining <strong>MBTI cognitive types</strong> and
            the scientifically validated <strong>Big Five model</strong>.
            Understand the architecture of your mind.
          </p>

          <div className={styles.pills}>
            {TRAITS.map(t => (
              <span key={t.letter} className={styles.pill} style={{ '--c': t.color }}>
                <span className={styles.pillLetter}>{t.letter}</span>
                <span className={styles.pillName}>{t.name}</span>
              </span>
            ))}
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>60</span>
              <span className={styles.statLabel}>Questions</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>~10</span>
              <span className={styles.statLabel}>Minutes</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>16</span>
              <span className={styles.statLabel}>MBTI Types</span>
            </div>
          </div>

          <button className={styles.cta} onClick={() => nav('/onboarding')}>
            Begin your assessment
            <span className={styles.ctaArrow}>→</span>
          </button>
        </div>

        <div className={styles.visual}>
          <div className={styles.orb} />
          <div className={styles.mbtiGrid}>
            {['INTJ','INTP','INFJ','INFP','ENTJ','ENTP','ENFJ','ENFP',
              'ISTJ','ISTP','ISFJ','ISFP','ESTJ','ESTP','ESFJ','ESFP'].map((t, i) => (
              <div key={t} className={styles.typeChip} style={{ animationDelay: `${i * 0.05}s` }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>Based on Big Five (OCEAN) validated research & MBTI cognitive function theory</p>
      </footer>
    </div>
  )
}
