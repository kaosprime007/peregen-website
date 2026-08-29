import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, Menu, Volume2, VolumeX, X } from 'lucide-react'
import { siteContent } from './siteContent'

const logo = '/peregen-orbital-logo.png'

const fadeUp = (reduce, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: reduce ? 0 : 0.7, delay },
})

function LogoMotion({ reduce }) {
  return (
    <div className="logo-stage" aria-label="Animated Peregen AI orbital logo">
      <div className="logo-halo logo-halo--one" />
      <div className="logo-halo logo-halo--two" />
      <motion.video
        className="logo-video"
        src="/animate_logo.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={logo}
        aria-label="Peregen AI orbital logo animation"
        animate={reduce ? undefined : { y: [0, -8, 0], rotate: [-1, 1, -1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="logo-caption">A system for becoming more capable.</span>
    </div>
  )
}

function OrbitalCursor({ reduce }) {
  const [cursor, setCursor] = useState({ x: -100, y: -100 })
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const particles = []
    const cometImage = new Image()
    cometImage.src = siteContent.interactions.cometAsset
    const cometBuffer = document.createElement('canvas')
    cometBuffer.width = 220
    cometBuffer.height = 220
    const cometBufferContext = cometBuffer.getContext('2d', { willReadFrequently: true })
    let cometDirection = 0
    let pointerPosition = { x: -100, y: -100 }
    let lastPointer = null
    let frame
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * pixelRatio
      canvas.height = window.innerHeight * pixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }
    const handleMove = (event) => {
      setCursor({ x: event.clientX, y: event.clientY })
      pointerPosition = { x: event.clientX, y: event.clientY }
      if (!lastPointer) { lastPointer = { x: event.clientX, y: event.clientY }; return }
      const dx = event.clientX - lastPointer.x
      const dy = event.clientY - lastPointer.y
      const distance = Math.hypot(dx, dy)
      if (distance < 1) return
      const direction = Math.atan2(dy, dx)
      cometDirection = direction
      const perpendicular = direction + Math.PI / 2
      const count = reduce ? 4 : 17
      for (let index = 0; index < count; index += 1) {
        const tailDistance = Math.random() * Math.min(220, 36 + distance * 6)
        const spread = (Math.random() - 0.5) * Math.min(42, 4 + tailDistance * 0.34)
        const x = event.clientX - Math.cos(direction) * tailDistance + Math.cos(perpendicular) * spread
        const y = event.clientY - Math.sin(direction) * tailDistance + Math.sin(perpendicular) * spread
        const drift = (Math.random() - 0.5) * 0.75
        const speed = 0.18 + Math.random() * 0.9
        const hues = [190, 198, 210, 224, 244]
        particles.push({ x, y, vx: -Math.cos(direction) * speed + Math.cos(perpendicular) * drift, vy: -Math.sin(direction) * speed + Math.sin(perpendicular) * drift, life: 1, size: 0.45 + Math.random() * 1.65, hue: hues[Math.floor(Math.random() * hues.length)] })
      }
      lastPointer = { x: event.clientX, y: event.clientY }
    }

    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      if (cometImage.complete) {
        const cometSize = reduce ? 105 : 185
        cometBufferContext.clearRect(0, 0, cometBuffer.width, cometBuffer.height)
        cometBufferContext.drawImage(cometImage, 0, 0, cometBuffer.width, cometBuffer.height)
        const cometPixels = cometBufferContext.getImageData(0, 0, cometBuffer.width, cometBuffer.height)
        for (let pixel = 0; pixel < cometPixels.data.length; pixel += 4) {
          const brightness = Math.max(cometPixels.data[pixel], cometPixels.data[pixel + 1], cometPixels.data[pixel + 2])
          cometPixels.data[pixel + 3] = brightness < 18 ? 0 : Math.min(255, Math.round((brightness - 18) * 1.8))
        }
        cometBufferContext.putImageData(cometPixels, 0, 0)
        context.save()
        context.globalCompositeOperation = 'screen'
        context.globalAlpha = reduce ? 0.55 : 0.82
        context.translate(pointerPosition.x, pointerPosition.y)
        context.rotate(cometDirection + Math.PI + 0.42)
        context.drawImage(cometBuffer, -cometSize / 2, -cometSize / 2, cometSize, cometSize)
        context.restore()
      }
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index]
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.985
        particle.vy += 0.012
        particle.life -= reduce ? 0.03 : 0.015
        if (particle.life <= 0) { particles.splice(index, 1); continue }
        context.save()
        context.globalAlpha = particle.life * 0.82
        context.strokeStyle = `hsla(${particle.hue}, 100%, 78%, ${particle.life})`
        context.shadowColor = `hsla(${particle.hue}, 100%, 70%, .9)`
        context.shadowBlur = 8
        context.lineWidth = particle.size * 0.8
        context.beginPath()
        context.moveTo(particle.x, particle.y)
        context.lineTo(particle.x - particle.vx * 5, particle.y - particle.vy * 5)
        context.stroke()
        context.fillStyle = `hsla(${particle.hue}, 100%, 82%, ${particle.life})`
        context.beginPath()
        context.arc(particle.x, particle.y, particle.size * 0.8, 0, Math.PI * 2)
        context.fill()
        context.restore()
      }
      frame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handleMove)
    frame = requestAnimationFrame(draw)
    return () => { window.removeEventListener('resize', resize); window.removeEventListener('pointermove', handleMove); cancelAnimationFrame(frame) }
  }, [reduce])

  return (
    <div className="cursor-system" aria-label={siteContent.interactions.cursorLabel} aria-hidden="true">
      <canvas ref={canvasRef} className="cursor-canvas" aria-label={siteContent.interactions.cursorTrail} />
      <span className="cursor-orbit" style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }}><img src={logo} alt="" /></span>
    </div>
  )
}

function SocialLinks() {
  return (
    <nav className="social-links" aria-label="Social media">
      <a href={siteContent.social.facebook} target="_blank" rel="noreferrer" aria-label="Peregen AI on Facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3c-3.3 0-5 1.9-5 5v3H6v4h3v8h4v-8h3.3l.7-4H13V9c0-.7.3-1 1-1Z" fill="currentColor" /></svg>
      </a>
      <a href={siteContent.social.linkedin} target="_blank" rel="noreferrer" aria-label="Peregen AI on LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 7.1A2.1 2.1 0 1 0 5.2 3a2.1 2.1 0 0 0 0 4.1ZM3.4 21h3.6V9H3.4v12ZM9.2 9v12h3.6v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2 1.9 2 3.4V21h3.6v-6.9c0-3.4-.7-6-4.7-6-1.9 0-3.2 1-3.7 1.9h-.1V9H9.2Z" fill="currentColor" /></svg>
      </a>
    </nav>
  )
}

function BrandText({ children }) {
  return String(children).split(/(Peregen ?AI)/g).map((part, index) => part.match(/^Peregen ?AI$/) ? <span key={index}>Peregen <span className="brand-name-ai">AI</span></span> : part)
}

function PortfolioTrace() {
  return (
    <span className="portfolio-trace" aria-hidden="true">
      <i className="portfolio-trace-edge portfolio-trace-edge--t" />
      <i className="portfolio-trace-edge portfolio-trace-edge--r" />
      <i className="portfolio-trace-edge portfolio-trace-edge--b" />
      <i className="portfolio-trace-edge portfolio-trace-edge--l" />
    </span>
  )
}

function PortfolioOrbit() {
  return (
    <div className="portfolio-orbit" aria-hidden="true">
      <i className="portfolio-orbit-dot portfolio-orbit-dot--main" />
      <span className="portfolio-orbit-ring portfolio-orbit-ring--a"><i className="portfolio-orbit-dot" /></span>
      <span className="portfolio-orbit-ring portfolio-orbit-ring--b"><i className="portfolio-orbit-dot" /></span>
      <span className="portfolio-orbit-ring portfolio-orbit-ring--c"><i className="portfolio-orbit-dot" /></span>
    </div>
  )
}

function App() {
  const reduce = useReducedMotion()
  const [menuOpen, setMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [honey, setHoney] = useState('')
  const [signupStatus, setSignupStatus] = useState('idle')
  const [soundOn, setSoundOn] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('joined') !== '1') return
    setSignupStatus('sent')
    document.getElementById('contact')?.scrollIntoView()
  }, [])

  const toggleSound = () => {
    const nextSoundState = !soundOn
    document.querySelectorAll('video').forEach((video) => { video.muted = !nextSoundState })
    setSoundOn(nextSoundState)
  }

  const submitEmail = (event) => {
    if (honey || signupStatus === 'sent') {
      event.preventDefault()
    }
  }

  return (
    <main className="site-shell">
      <div className="grain" aria-hidden="true" />
      <OrbitalCursor reduce={reduce} />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Peregen AI home"><video className="brand-video" src="/animate_logo.mp4" autoPlay muted loop playsInline aria-hidden="true" /><span>Peregen <span className="brand-name-ai">AI</span></span></a>
        <nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`}>
          <a href="#why" onClick={() => setMenuOpen(false)}>Why <BrandText>Peregen AI</BrandText></a>
          <a href="#principles" onClick={() => setMenuOpen(false)}>Principles</a>
          <a href="#portfolio" onClick={() => setMenuOpen(false)}>Portfolio</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <button className={`sound-toggle ${soundOn ? 'sound-toggle--active' : ''}`} type="button" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? siteContent.interactions.soundOff : siteContent.interactions.soundOn}><span className="sound-dot" />{soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}<span className="sound-label">{soundOn ? 'Sound on' : 'Sound off'}</span></button>
        <a className="header-cta" href="#contact">Start a conversation <ArrowUpRight size={15} /></a>
        <button className="menu-toggle" type="button" aria-label="Toggle menu" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <motion.p className="eyebrow" {...fadeUp(reduce)}>{siteContent.hero.eyebrow}</motion.p>
          <motion.h1 {...fadeUp(reduce, 0.08)}>{siteContent.hero.title}</motion.h1>
          <motion.p className="hero-description" {...fadeUp(reduce, 0.16)}><BrandText>{siteContent.hero.description}</BrandText></motion.p>
          <motion.div className="hero-actions" {...fadeUp(reduce, 0.24)}><a className="button button--dark" href="#contact">Explore <BrandText>Peregen AI</BrandText> <ArrowUpRight size={17} /></a><a className="text-link" href="#why">Scroll to discover <ArrowDownRight size={16} /></a></motion.div>
        </div>
        <motion.div className="hero-visual" {...fadeUp(reduce, 0.18)}><LogoMotion reduce={reduce} /><div className="hero-index">01 <span>/</span> 05</div></motion.div>
        <div className="hero-footer"><span>Built for the space between human instinct and machine scale.</span><span className="scroll-note">Scroll for more ↓</span></div>
      </section>

      <section className="manifesto section-pad" id="why">
        <motion.div className="section-kicker" {...fadeUp(reduce)}>01 / The premise</motion.div>
        <div className="manifesto-grid"><motion.p className="manifesto-label" {...fadeUp(reduce, 0.08)}><BrandText>Peregen AI is not here to replace the human point of view.</BrandText></motion.p><motion.h2 {...fadeUp(reduce, 0.14)}>{siteContent.manifesto}</motion.h2></div>
      </section>

      <section className="principles section-pad" id="principles">
        <motion.div className="section-heading" {...fadeUp(reduce)}><div className="section-kicker">02 / The approach</div><h2>Intelligence with a point of view.</h2></motion.div>
        <div className="principle-list">{siteContent.principles.map((principle, index) => <motion.article className={`principle-card principle-card--${principle.accent}`} key={principle.title} {...fadeUp(reduce, index * 0.08)}><span className="principle-number">{principle.number}</span><PortfolioOrbit /><div className="principle-copy"><h3>{principle.title}</h3><p><BrandText>{principle.description}</BrandText></p></div><ArrowUpRight className="principle-arrow" size={22} /></motion.article>)}</div>
      </section>

      <section className="capabilities section-pad"><motion.div className="capabilities-intro" {...fadeUp(reduce)}><div className="section-kicker">03 / The work</div><h2>Bring the hard thing.</h2><p>From the first question to the final decision, <BrandText>Peregen AI</BrandText> helps you make meaningful progress.</p></motion.div><div className="capability-list">{siteContent.capabilities.map(([number, title, description]) => <motion.a href="#contact" className="capability-row" key={number} {...fadeUp(reduce)}><span>{number}</span><h3>{title}</h3><p>{description}</p><ArrowUpRight size={19} /></motion.a>)}</div></section>

      <section className="portfolio section-pad" id="portfolio">
        <motion.div className="section-heading" {...fadeUp(reduce)}>
          <div className="section-kicker">04 / The portfolio</div>
          <h2>Out in the world.</h2>
        </motion.div>
        <div className="portfolio-list">
          {siteContent.portfolio.map((project, index) => (
            <motion.a
              className={`portfolio-card portfolio-card--${project.accent}`}
              href={project.href}
              key={project.name}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${project.name}`}
              {...fadeUp(reduce, index * 0.08)}
            >
              <PortfolioTrace />
              <span className="portfolio-number">{project.number}</span>
              <PortfolioOrbit />
              <div className="portfolio-copy">
                <p className="portfolio-role">{project.role}</p>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
              <span className="portfolio-visit">Visit site <ArrowUpRight size={16} /></span>
            </motion.a>
          ))}
        </div>
      </section>

      <section className="contact section-pad" id="contact"><motion.div {...fadeUp(reduce)}><div className="section-kicker">05 / Begin</div><h2>Make room for<br /><em>better thinking.</em></h2><p className="contact-lede">Early access is opening soon. Join the first circle.</p><form className="signup-form" action={`https://formsubmit.co/${siteContent.contact.email}`} method="POST" acceptCharset="UTF-8" onSubmit={submitEmail}><input type="hidden" name="_subject" value={siteContent.contact.signupSubject} /><input type="hidden" name="_template" value="table" /><input type="hidden" name="_captcha" value="false" /><input type="hidden" name="_next" value="https://peregenai.com/?joined=1#contact" /><input type="hidden" name="source" value="peregenai.com" /><label className="sr-only" htmlFor="email">Email address</label><input id="email" name="email" type="email" placeholder="Your email address" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" disabled={signupStatus === 'sent'} required /><label className="sr-only" htmlFor="company">Company</label><input className="signup-honey" id="company" name="_honey" type="text" tabIndex={-1} autoComplete="off" value={honey} onChange={(event) => setHoney(event.target.value)} /><button className="button button--light" type="submit" disabled={signupStatus === 'sent'}>{signupStatus === 'sent' ? 'You’re on the list' : 'Get early access'} <ArrowUpRight size={17} /></button></form>{signupStatus === 'sent' ? <p className="signup-status" role="status">You’re on the list. We’ll reach you at the address you sent.</p> : null}<div className="contact-details"><a href={`mailto:${siteContent.contact.email}`}>{siteContent.contact.email}</a><address>{siteContent.contact.address}</address></div></motion.div></section>

      <footer className="site-footer"><div className="brand"><video className="brand-video" src="/animate_logo.mp4" autoPlay muted loop playsInline aria-hidden="true" /><span><BrandText>Peregen AI</BrandText></span></div><span>Adaptive intelligence for human work.</span><SocialLinks /><span>© 2026 <BrandText>Peregen AI</BrandText></span></footer>
    </main>
  )
}

export default App
