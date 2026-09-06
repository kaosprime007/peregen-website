export const sectionTracks = {
  top: '/hero-audio.m4a',
  why: '/premise-audio.m4a',
  principles: '/principles-audio.m4a',
  work: '/work-audio.m4a',
}

// A single boundary (the viewport midpoint) avoids competing visible sections.
export function currentSection(sections, height) {
  return sections.find((section) => {
    const rect = section.getBoundingClientRect()
    return rect.top <= height / 2 && rect.bottom > height / 2
  })?.id ?? null
}

export function createSectionAudio(audio, sections, env = window) {
  let context
  let gain
  let enabled = false
  let active = null
  let revision = 0
  let timer
  let frame
  let disposed = false

  const ramp = (value, duration) => {
    if (!gain) return
    const now = context.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(value, now + duration)
  }

  const stop = () => {
    revision += 1
    env.clearTimeout(timer)
    ramp(0, 0)
    audio.pause()
    active = null
    delete audio.dataset.section
  }

  const sync = (immediate = false) => {
    if (disposed || !enabled || env.document.hidden) { stop(); return }
    const section = currentSection(sections, env.innerHeight)
    const next = sectionTracks[section] ? section : null
    if (next === active) return
    const token = ++revision
    env.clearTimeout(timer)
    const wasPlaying = !audio.paused
    active = next
    ramp(0, 0.12)
    const switchTrack = () => {
      if (disposed || token !== revision) return
      audio.pause()
      delete audio.dataset.section
      if (!next) return
      audio.src = sectionTracks[next]
      audio.dataset.section = next
      // One media element means the outgoing track is stopped before the next starts.
      audio.play().then(() => {
        if (token === revision && enabled && !disposed) ramp(1, 0.2)
      }).catch(() => {
        if (token === revision) { active = null; delete audio.dataset.section }
      })
    }
    if (immediate || !wasPlaying) switchTrack()
    else timer = env.setTimeout(switchTrack, 120)
  }

  const schedule = () => {
    env.cancelAnimationFrame(frame)
    frame = env.requestAnimationFrame(() => sync())
  }
  const visibility = () => env.document.hidden ? stop() : sync()
  env.addEventListener('scroll', schedule, { passive: true })
  env.addEventListener('resize', schedule)
  env.document.addEventListener('visibilitychange', visibility)
  env.addEventListener('pagehide', stop)
  env.addEventListener('pageshow', schedule)

  return {
    setEnabled(value) {
      enabled = value
      if (!value) { stop(); return }
      // Initialize/resume inside the sound-button gesture, including on iOS.
      if (!context) {
        const AudioContext = env.AudioContext || env.webkitAudioContext
        if (AudioContext) {
          context = new AudioContext()
          gain = context.createGain()
          gain.gain.value = 0
          context.createMediaElementSource(audio).connect(gain)
          gain.connect(context.destination)
        }
      }
      context?.resume().catch(() => {})
      sync(true)
    },
    dispose() {
      disposed = true
      stop()
      env.cancelAnimationFrame(frame)
      env.removeEventListener('scroll', schedule)
      env.removeEventListener('resize', schedule)
      env.document.removeEventListener('visibilitychange', visibility)
      env.removeEventListener('pagehide', stop)
      env.removeEventListener('pageshow', schedule)
      context?.close().catch(() => {})
    },
  }
}
