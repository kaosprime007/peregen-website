import test from 'node:test'
import assert from 'node:assert/strict'
import { createSectionAudio, currentSection } from '../src/sectionAudio.js'

function fixture() {
  let scroll = 0
  const sections = ['top', 'why', 'principles', 'work', 'portfolio'].map((id, index) => ({
    id, getBoundingClientRect: () => ({ top: index * 1000 - scroll, bottom: (index + 1) * 1000 - scroll }),
  }))
  const events = new Map()
  const timers = new Map()
  let timerId = 0
  const env = {
    innerHeight: 1000,
    addEventListener: (name, handler) => events.set(name, handler),
    removeEventListener: (name) => events.delete(name),
    setTimeout: (fn) => { timers.set(++timerId, fn); return timerId },
    clearTimeout: (id) => timers.delete(id),
    requestAnimationFrame: (fn) => { fn(); return 1 },
    cancelAnimationFrame() {},
    document: {
      hidden: false,
      addEventListener: (name, handler) => events.set(name, handler),
      removeEventListener: (name) => events.delete(name),
    },
  }
  const calls = []
  const audio = {
    paused: true, dataset: {}, src: '',
    pause() { this.paused = true; calls.push(['pause', this.src]) },
    play() { this.paused = false; calls.push(['play', this.src]); return Promise.resolve() },
  }
  const controller = createSectionAudio(audio, sections, env)
  return { audio, controller, events, env, calls, sections,
    scrollTo(value) { scroll = value; events.get('scroll')() },
    flush() { const pending = [...timers.values()]; timers.clear(); pending.forEach((fn) => fn()) },
  }
}

test('midpoint selects one section including sections with no soundtrack', () => {
  const f = fixture()
  assert.equal(currentSection(f.sections, 1000), 'top')
  f.scrollTo(500)
  assert.equal(currentSection(f.sections, 1000), 'why')
  f.scrollTo(4000)
  assert.equal(currentSection(f.sections, 1000), 'portfolio')
})

test('audio starts only after opt-in and stops the prior track before changing', () => {
  const f = fixture()
  f.scrollTo(0)
  assert.equal(f.audio.paused, true)
  f.controller.setEnabled(true)
  assert.equal(f.audio.dataset.section, 'top')
  f.scrollTo(1000)
  f.flush()
  assert.deepEqual(f.calls.slice(-2), [['pause', '/hero-audio.m4a'], ['play', '/premise-audio.m4a']])
  f.scrollTo(4000)
  f.flush()
  assert.equal(f.audio.paused, true)
  assert.equal(f.audio.dataset.section, undefined)
})

test('rapid scrolling cancels stale handoffs; mute cancels pending playback', () => {
  const f = fixture()
  f.controller.setEnabled(true)
  f.scrollTo(1000)
  f.scrollTo(2000)
  f.scrollTo(3000)
  f.flush()
  assert.deepEqual(f.calls.filter(([action]) => action === 'play').map(([, src]) => src), ['/hero-audio.m4a', '/work-audio.m4a'])
  f.scrollTo(1000)
  f.controller.setEnabled(false)
  f.flush()
  assert.equal(f.audio.paused, true)
  f.scrollTo(0)
  assert.equal(f.audio.paused, true)
})

test('hidden tabs stop audio, returning resumes current section, disposal removes listeners', () => {
  const f = fixture()
  f.controller.setEnabled(true)
  f.env.document.hidden = true
  f.events.get('visibilitychange')()
  assert.equal(f.audio.paused, true)
  f.scrollTo(2000)
  f.env.document.hidden = false
  f.events.get('visibilitychange')()
  assert.equal(f.audio.dataset.section, 'principles')
  f.controller.dispose()
  f.flush()
  assert.equal(f.audio.paused, true)
  assert.equal(f.events.size, 0)
})
