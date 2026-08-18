import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '@nutriai/shared/i18n'
import { cn } from '@nutriai/shared/lib/cn'
import { LandingHeader } from './landing-header'
import { LandingCalculators } from './landing-calculators'
import { CALCS, CALC_CATEGORY_COLOR, CALC_CATEGORY_TINT } from '@/entities/calculator/lib/calculators'
import {
  BmiFloatIcon,
  BodyFatFloatIcon,
  FeatureCamIcon,
  FeatureChartIcon,
  FeatureGlobeIcon,
  FeatureOrbIcon,
  ProteinFloatIcon,
  StepsFloatIcon,
} from './landing-icons'

const WEEK = [1980, 2140, 1870, 2020, 1760, 2310, 2180]
const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const RING_R = 92
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R

export function LandingPage() {
  const { t, lang } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [kcal, setKcal] = useState(0)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    const t0 = performance.now()
    const step = () => {
      const p = Math.min(1, (performance.now() - t0) / 1200)
      setKcal(Math.round(2180 * (1 - Math.pow(1 - p, 3))))
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const kcalDisplay = lang === 'EN' ? kcal.toLocaleString('en-US') : kcal.toLocaleString('ru-RU').replace(/,/g, ' ')

  const ticks = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2 - Math.PI / 2
    const on = i / 48 <= 0.71
    const r1 = 108
    const r2 = on ? 116 : 113
    return {
      x1: (120 + Math.cos(a) * r1).toFixed(1),
      y1: (120 + Math.sin(a) * r1).toFixed(1),
      x2: (120 + Math.cos(a) * r2).toFixed(1),
      y2: (120 + Math.sin(a) * r2).toFixed(1),
      on,
    }
  })

  const macroRows = [
    { label: t.landing.hero.protein, col: 'var(--pro)', val: `145 ${t.landing.hero.g}`, w: mounted ? '78%' : '0%' },
    { label: t.landing.hero.carbs, col: 'var(--carb)', val: `230 ${t.landing.hero.g}`, w: mounted ? '88%' : '0%' },
    { label: t.landing.hero.fat, col: 'var(--fat)', val: `72 ${t.landing.hero.g}`, w: mounted ? '64%' : '0%' },
  ]

  const faqs = [1, 2, 3, 4, 5].map((n, ix) => ({
    q: t.landing.faq[`q${n}` as 'q1'],
    a: t.landing.faq[`a${n}` as 'a1'],
    open: faqOpen === ix,
  }))

  const features = [
    { title: t.landing.features.ft1, body: t.landing.features.ft1b, Icon: FeatureOrbIcon, cat: 'health' as const },
    { title: t.landing.features.ft2, body: t.landing.features.ft2b, Icon: FeatureCamIcon, cat: 'nutrition' as const },
    { title: t.landing.features.ft3, body: t.landing.features.ft3b, Icon: FeatureChartIcon, cat: 'fitness' as const },
    { title: t.landing.features.ft4, body: t.landing.features.ft4b, Icon: FeatureGlobeIcon, cat: 'health' as const },
  ]

  const steps = [1, 2, 3, 4].map((n, ix) => ({
    n: `0${n}`,
    title: t.landing.how[`st${n}` as 'st1'],
    body: t.landing.how[`st${n}b` as 'st1b'],
    isFirst: ix === 0,
    isLast: ix === 3,
  }))

  const funnel = [1, 2, 3, 4].map((n, ix) => ({
    n: `0${n}`,
    label: t.landing.cta[`fn${n}` as 'fn1'],
    meta: t.landing.cta[`fnM${n}` as 'fnM1'],
    accent: ix < 2,
  }))

  return (
    <div className="min-h-screen bg-bg">
      <LandingHeader />

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(76% 62% at 26% 6%, var(--accT), transparent 62%)' }}
          />
          <div
            className="pointer-events-none absolute inset-x-[-10%] top-[-30%] h-[150%] opacity-55"
            style={{
              background: 'repeating-radial-gradient(circle at 22% 20%, transparent 0 26px, var(--line) 26px 27px)',
              maskImage: 'linear-gradient(112deg, #000, transparent 68%)',
              WebkitMaskImage: 'linear-gradient(112deg, #000, transparent 68%)',
            }}
          />

          <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-[52px] px-[26px] pb-[74px] pt-16 lg:grid-cols-[1.02fr_.98fr]">
            <div className="animate-fu min-w-0">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-line2 bg-accT py-[7px] pl-2.5 pr-[14px]">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-acc" style={{ boxShadow: '0 0 8px var(--accG)' }} />
                <span className="text-[12px] font-medium text-acc">{t.landing.hero.badge}</span>
              </div>
              <h1 className="mt-[22px] text-[34px] font-medium leading-[1.06] tracking-[-.035em] text-balance sm:text-[42px] lg:text-[52px]">
                {t.landing.hero.h1a}
                <br />
                <span className="font-serif font-normal tracking-[-.01em]">{t.landing.hero.h1b}</span>
                <br />
                {t.landing.hero.h1c}
              </h1>
              <p className="mt-[22px] max-w-[47ch] text-[15.5px] leading-[1.6] text-tx2 text-pretty">{t.landing.hero.sub}</p>
              <div className="mt-[30px] flex flex-wrap gap-[11px]">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2.5 rounded-[13px] bg-acc px-[22px] py-[14px] text-[14px] font-semibold text-[#04120e] shadow-[0_12px_30px_-12px_var(--accG)] transition-[filter] hover:brightness-[1.08]"
                >
                  {t.landing.hero.ctaPrimary}
                  <span className="font-mono">→</span>
                </Link>
                <a
                  href="#calculators"
                  className="inline-flex items-center rounded-[13px] border border-line2 px-[22px] py-[14px] text-[14px] font-medium text-tx hover:bg-surf"
                >
                  {t.landing.hero.ctaSecondary}
                </a>
              </div>
              <div className="mt-[34px] flex flex-wrap gap-[34px] border-t border-line pt-[26px]">
                <div>
                  <div className="text-[22px] font-medium tracking-[-.03em]">14</div>
                  <div className="mt-[3px] max-w-[16ch] text-[12px] text-tx3">{t.landing.hero.stat1}</div>
                </div>
                <div>
                  <div className="text-[22px] font-medium tracking-[-.03em]">12 400+</div>
                  <div className="mt-[3px] max-w-[16ch] text-[12px] text-tx3">{t.landing.hero.stat2}</div>
                </div>
                <div>
                  <div className="text-[22px] font-medium tracking-[-.03em]">3</div>
                  <div className="mt-[3px] max-w-[16ch] text-[12px] text-tx3">{t.landing.hero.stat3}</div>
                </div>
              </div>
            </div>

            <div className="relative min-w-0" style={{ animation: 'fu .6s ease .1s both' }}>
              <div className="relative overflow-hidden rounded-[24px] border border-line2 bg-surf shadow-card">
                <div className="flex items-center gap-2.5 border-b border-line bg-bg2 px-[15px] py-3">
                  <span className="h-2 w-2 rounded-full bg-line2" />
                  <span className="h-2 w-2 rounded-full bg-line2" />
                  <span className="h-2 w-2 rounded-full bg-line2" />
                  <span className="flex-1" />
                  <span className="font-mono text-[9.5px] tracking-[.14em] text-tx3">{t.landing.hero.dashLabel}</span>
                </div>
                <div className="relative overflow-hidden px-[22px] pb-6 pt-[26px]">
                  <div
                    className="animate-drift pointer-events-none absolute right-0 top-[-40%] h-[280px] w-[280px] opacity-70 blur-[32px]"
                    style={{ background: 'radial-gradient(circle, var(--accG), transparent 66%)' }}
                  />
                  <div className="relative flex flex-wrap items-center justify-center gap-6">
                    <div className="relative h-[186px] w-[186px] flex-none">
                      <div className="animate-halo absolute inset-[14%] rounded-full blur-[20px]" style={{ background: 'radial-gradient(circle, var(--accG), transparent 68%)' }} />
                      <svg viewBox="0 0 240 240" className="relative block h-full w-full" role="img" aria-label={t.landing.hero.a11yRing}>
                        <defs>
                          <linearGradient id="heroRing" x1="0" y1="1" x2="1" y2="0">
                            <stop offset="0" stopColor="var(--accD)" />
                            <stop offset=".6" stopColor="var(--acc)" />
                            <stop offset="1" stopColor="var(--acc)" />
                          </linearGradient>
                        </defs>
                        {ticks.map((k, i) => (
                          <line key={i} x1={k.x1} y1={k.y1} x2={k.x2} y2={k.y2} stroke={k.on ? 'var(--acc)' : 'var(--line2)'} strokeWidth="1.5" strokeLinecap="round" />
                        ))}
                        <circle cx="120" cy="120" r={RING_R} fill="none" stroke="var(--line2)" strokeWidth="12" opacity=".55" />
                        <circle
                          cx="120"
                          cy="120"
                          r={RING_R}
                          fill="none"
                          stroke="url(#heroRing)"
                          strokeWidth="12"
                          strokeLinecap="round"
                          transform="rotate(-90 120 120)"
                          strokeDasharray={RING_CIRCUMFERENCE.toFixed(2)}
                          strokeDashoffset={mounted ? 167.6 : RING_CIRCUMFERENCE}
                          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.16,.84,.24,1)', filter: 'drop-shadow(0 0 9px var(--accG))' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div className="font-mono text-[9px] tracking-[.2em] text-tx3">{t.landing.hero.today}</div>
                        <div className="text-[36px] font-medium leading-[1.08] tracking-[-.035em] [font-variant-numeric:tabular-nums]">{kcalDisplay}</div>
                        <div className="text-[10.5px] text-tx2">{t.landing.hero.kcalEaten}</div>
                        <div className="my-[7px] h-px w-10 bg-line2" />
                        <div className="font-mono text-[10.5px] text-tx2">2 180 {t.landing.hero.kcal}</div>
                      </div>
                    </div>
                    <div className="flex min-w-[140px] flex-[1_1_150px] flex-col gap-[9px]">
                      {macroRows.map((r) => (
                        <div key={r.label}>
                          <div className="mb-1.5 flex items-baseline gap-2">
                            <span className="h-[7px] w-[7px] flex-none rounded-sm" style={{ background: r.col }} />
                            <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-tx2">{r.label}</span>
                            <span className="font-mono text-[11.5px] [font-variant-numeric:tabular-nums]">{r.val}</span>
                          </div>
                          <div className="h-[5px] overflow-hidden rounded-full bg-line">
                            <div className="h-full rounded-full transition-[width] duration-[1300ms]" style={{ background: r.col, width: r.w, transitionTimingFunction: 'cubic-bezier(.16,.84,.24,1)' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative mt-[22px] flex h-[74px] items-end gap-2 border-t border-line pt-[18px]">
                    {WEEK.map((v, i) => (
                      <div key={i} className="flex h-full flex-1 flex-col justify-end gap-1.5">
                        <div className="relative flex flex-1 items-end">
                          <div
                            className="w-full rounded-t-[5px] rounded-b-[3px] transition-[height] duration-[1100ms]"
                            style={{ background: i === 6 ? 'var(--acc)' : 'var(--line2)', height: mounted ? `${((v / 2600) * 100).toFixed(1)}%` : '0%', transitionTimingFunction: 'cubic-bezier(.16,.84,.24,1)' }}
                          />
                        </div>
                        <div className="text-center font-mono text-[9px]" style={{ color: i === 6 ? 'var(--acc)' : 'var(--tx3)' }}>
                          {WEEK_DAYS[i]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute right-[-6px] top-[-14px] hidden lg:block" style={{ animation: 'float1 6.5s ease-in-out infinite' }}>
                <FloatBadge icon={<BmiFloatIcon />} tint="var(--accT)" label="BMI" value="23,4" />
              </div>
              <div className="absolute left-[-30px] top-[38%] hidden lg:block" style={{ animation: 'float3 8s ease-in-out infinite' }}>
                <FloatBadge icon={<ProteinFloatIcon />} tint="var(--proT)" label={t.landing.hero.protein} value={`145 ${t.landing.hero.g}`} />
              </div>
              <div className="absolute bottom-11 right-[-26px] hidden lg:block" style={{ animation: 'float2 7.4s ease-in-out infinite' }}>
                <FloatBadge icon={<BodyFatFloatIcon />} tint="var(--fatT)" label={t.landing.hero.bodyFat} value="18,7%" />
              </div>
              <div className="absolute bottom-[-16px] left-4 hidden lg:block" style={{ animation: 'float1 7.9s ease-in-out .6s infinite' }}>
                <FloatBadge icon={<StepsFloatIcon />} tint="var(--carbT)" label={t.landing.hero.steps} value="8 420" />
              </div>
            </div>
          </div>
        </section>

        <LandingCalculators />

        {/* Features */}
        <section id="features" className="mx-auto max-w-[1280px] px-[26px] py-[52px]">
          <div className="font-mono text-[9.5px] tracking-[.18em] text-tx3">{t.landing.features.kicker}</div>
          <h2 className="mt-3 max-w-[22ch] text-[25px] font-medium leading-[1.12] tracking-[-.028em] text-balance lg:text-[33px]">
            {t.landing.features.title}
          </h2>
          <p className="mt-2.5 max-w-[52ch] text-[14.5px] text-tx2 text-pretty">{t.landing.features.sub}</p>

          <div className="mt-[30px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="relative overflow-hidden rounded-[20px] border border-line bg-surf p-[22px] transition-all hover:-translate-y-[3px] hover:border-line2"
              >
                <span
                  className="pointer-events-none absolute inset-0"
                  style={{ background: `radial-gradient(80% 90% at 100% 0, ${CALC_CATEGORY_TINT[f.cat]}, transparent 60%)` }}
                />
                <div
                  className="relative grid h-[38px] w-[38px] place-items-center rounded-[13px]"
                  style={{ background: CALC_CATEGORY_TINT[f.cat], color: CALC_CATEGORY_COLOR[f.cat] }}
                >
                  <f.Icon />
                </div>
                <h3 className="relative mt-4 text-[15.5px] font-semibold leading-none tracking-[-.015em] text-balance">{f.title}</h3>
                <p className="relative mt-[9px] text-[13px] leading-[1.55] text-tx2 text-pretty">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-[1280px] px-[26px] py-[52px]">
          <div className="grid grid-cols-1 items-start gap-11 lg:grid-cols-[.85fr_1.15fr]">
            <div className="min-w-0">
              <div className="font-mono text-[9.5px] tracking-[.18em] text-tx3">{t.landing.how.kicker}</div>
              <h2 className="mt-3 text-[25px] font-medium leading-[1.12] tracking-[-.028em] text-balance lg:text-[33px]">{t.landing.how.title}</h2>
              <p className="mt-2.5 max-w-[38ch] text-[14.5px] text-tx2 text-pretty">{t.landing.how.sub}</p>
              <Link
                to="/login"
                className="mt-[22px] inline-flex items-center gap-2.5 rounded-xl bg-acc px-5 py-[13px] text-[13.5px] font-semibold text-[#04120e] shadow-[0_10px_26px_-12px_var(--accG)] hover:brightness-[1.08]"
              >
                {t.landing.hero.ctaPrimary}
                <span className="font-mono">→</span>
              </Link>
            </div>
            <div className="min-w-0">
              {steps.map((s) => (
                <div key={s.n} className="relative flex gap-[18px] pb-[26px]">
                  <div className="relative flex w-8 flex-none justify-center">
                    {!s.isLast && <div className="absolute bottom-[-18px] top-[34px] w-px bg-line2" />}
                    <div
                      className={cn(
                        'relative grid h-8 w-8 place-items-center rounded-[11px] border border-line2 font-mono text-[11.5px]',
                        s.isFirst ? 'bg-accT text-acc' : 'bg-surf text-tx2',
                      )}
                    >
                      {s.n}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="text-[15px] font-semibold leading-none tracking-[-.015em] text-balance">{s.title}</div>
                    <p className="mt-[7px] text-[13px] leading-[1.55] text-tx2 text-pretty">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="mx-auto max-w-[1280px] px-[26px] pb-[52px] pt-8">
          <div className="relative overflow-hidden rounded-[28px] p-px" style={{ background: 'linear-gradient(150deg, var(--accG), var(--line) 44%, var(--line))' }}>
            <div className="relative overflow-hidden rounded-[27px] bg-surf p-[26px] sm:p-9">
              <div
                className="animate-drift pointer-events-none absolute right-0 top-[-40%] h-[420px] w-[420px] opacity-75 blur-[44px]"
                style={{ background: 'radial-gradient(circle, var(--accG), transparent 66%)' }}
              />
              <div className="relative grid grid-cols-1 items-center gap-[38px] lg:grid-cols-[1.15fr_.85fr]">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="relative h-[38px] w-[38px] flex-none">
                      <div className="animate-halo absolute inset-[-5px] rounded-full blur-[9px]" style={{ background: 'var(--accG)' }} />
                      <div
                        className="relative h-[38px] w-[38px] rounded-full"
                        style={{ background: 'radial-gradient(circle at 32% 28%, var(--acc), var(--accD) 58%, var(--surf2))', boxShadow: 'inset 0 0 9px rgba(255,255,255,.28)' }}
                      />
                    </div>
                    <div className="font-mono text-[9.5px] tracking-[.18em] text-tx3">{t.landing.cta.kicker}</div>
                  </div>
                  <h2 className="mt-5 max-w-[22ch] font-serif text-[27px] font-normal leading-[1.2] tracking-[-.01em] text-balance sm:text-[36px]">
                    {t.landing.cta.title}
                  </h2>
                  <p className="mt-3.5 max-w-[46ch] text-[15px] leading-[1.6] text-tx2 text-pretty">{t.landing.cta.body}</p>
                  <div className="mt-[26px] flex flex-wrap gap-[11px]">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2.5 rounded-[13px] bg-acc px-[22px] py-[14px] text-[14px] font-semibold text-[#04120e] shadow-[0_12px_30px_-12px_var(--accG)] hover:brightness-[1.08]"
                    >
                      {t.landing.cta.btn1}
                      <span className="font-mono">→</span>
                    </Link>
                    <Link to="/login" className="inline-flex items-center rounded-[13px] border border-line2 px-[22px] py-[14px] text-[14px] font-medium text-tx hover:bg-surf2">
                      {t.landing.cta.btn2}
                    </Link>
                  </div>
                  <div className="mt-4 text-[11.5px] text-tx3">{t.landing.cta.note}</div>
                </div>
                <div className="flex min-w-0 flex-col gap-2.5">
                  {funnel.map((fn) => (
                    <div key={fn.n} className="flex items-center gap-[13px] rounded-[15px] border border-line bg-bg2 px-4 py-3.5">
                      <span
                        className="grid h-[26px] w-[26px] flex-none place-items-center rounded-[9px] font-mono text-[10.5px]"
                        style={{ background: fn.accent ? 'var(--accT)' : 'var(--proT)', color: fn.accent ? 'var(--acc)' : 'var(--pro)' }}
                      >
                        {fn.n}
                      </span>
                      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-medium">{fn.label}</span>
                      <span className="flex-none font-mono text-[11px] text-tx3">{fn.meta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-[1280px] px-[26px] pb-[60px] pt-8">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div className="min-w-0">
              <div className="font-mono text-[9.5px] tracking-[.18em] text-tx3">FAQ</div>
              <h2 className="mt-3 max-w-[18ch] text-[22px] font-medium leading-[1.14] tracking-[-.025em] text-balance lg:text-[28px]">
                {t.landing.faq.title}
              </h2>
              <p className="mt-2.5 max-w-[34ch] text-[14px] text-tx2 text-pretty">{t.landing.faq.sub}</p>
            </div>
            <div className="min-w-0 border-t border-line">
              {faqs.map((f, ix) => (
                <div key={ix} className="border-b border-line">
                  <button
                    onClick={() => setFaqOpen(f.open ? null : ix)}
                    aria-expanded={f.open}
                    className="flex w-full items-start gap-4 px-1 py-[17px] text-left hover:text-acc"
                  >
                    <span className="min-w-0 flex-1 text-[14.5px] font-medium leading-tight tracking-[-.01em] text-pretty">{f.q}</span>
                    <span
                      className={cn(
                        'mt-px flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] border border-line2 text-tx3 transition-transform',
                        f.open && 'rotate-180',
                      )}
                    >
                      <svg width="11" height="11" viewBox="0 0 12 12">
                        <path d="M2.4 4.4 6 8l3.6-3.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  {f.open && <p className="animate-fu m-0 px-1 pb-[19px] pr-10 text-[13.5px] leading-[1.62] text-tx2 text-pretty">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-bg2">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-[34px] px-[26px] pb-[34px] pt-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <svg width="24" height="24" viewBox="0 0 26 26">
                <circle cx="13" cy="13" r="9.5" fill="none" stroke="var(--acc)" strokeWidth="1.6" strokeDasharray="45 60" strokeLinecap="round" transform="rotate(-90 13 13)" />
                <circle cx="13" cy="13" r="3.4" fill="var(--acc)" />
              </svg>
              <span className="text-[15px] font-semibold tracking-[-.015em]">
                AI <span className="text-acc">Nutrition</span>
              </span>
            </div>
            <p className="mt-3.5 max-w-[32ch] text-[12.5px] leading-[1.6] text-tx3 text-pretty">{t.landing.footer.blurb}</p>
          </div>
          {(['health', 'nutrition', 'fitness'] as const).map((cat) => (
            <div key={cat} className="min-w-0">
              <div className="mb-3.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-sm" style={{ background: CALC_CATEGORY_COLOR[cat] }} />
                <span className="font-mono text-[9px] tracking-[.16em] text-tx3">
                  {{ health: t.landing.calc.filterHealth, nutrition: t.landing.calc.filterNutrition, fitness: t.landing.calc.filterFitness }[cat]}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {CALCS.filter((c) => c.cat === cat).map((c) => (
                  <Link
                    key={c.id}
                    to={`/calculators/${c.id}`}
                    className="overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] text-tx2 hover:text-acc"
                  >
                    {t.landing.calculators[c.id]?.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-[1280px] px-[26px] pb-[34px]">
          <div className="flex flex-wrap items-center gap-4 border-t border-line pt-[22px]">
            <span className="text-[11.5px] text-tx3">© 2026 AI Nutrition</span>
            <span className="flex-1" />
            <span className="max-w-[64ch] text-[11.5px] text-tx3 text-pretty">{t.landing.footer.disclaimer}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FloatBadge({ icon, tint, label, value }: { icon: React.ReactNode; tint: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-line2 bg-surf2 px-[15px] py-[11px] shadow-card">
      <span className="grid h-[30px] w-[30px] place-items-center rounded-[10px]" style={{ background: tint }}>
        {icon}
      </span>
      <span>
        <span className="block font-mono text-[8.5px] tracking-[.14em] text-tx3">{label}</span>
        <span className="block text-[16px] font-medium leading-none tracking-[-.02em] [font-variant-numeric:tabular-nums]">{value}</span>
      </span>
    </div>
  )
}
