import test from 'node:test'
import assert from 'node:assert/strict'
import { siteContent } from '../src/siteContent.js'

test('Peregen AI landing page keeps its core positioning and story sections', () => {
  assert.equal(siteContent.hero.eyebrow, 'Long-Term Memory AI · Living Personas · Embodied Horizons')
  assert.match(siteContent.hero.title, /remembers/i)
  assert.equal(siteContent.hero.backgroundVideo, '/hero-background.mp4')
  assert.equal(siteContent.hero.backgroundVideoMobile, '/hero-background-mobile.mp4')
  assert.equal(siteContent.hero.logoVideo, '/animate_logo.mp4')
  assert.equal(siteContent.hero.logoVideoMobile, '/animate_logo-mobile.mp4')
  assert.equal(siteContent.hero.logoPoster, '/peregen-orbital-logo.webp')
  assert.match(siteContent.manifesto, /episodic memory and living personas/i)
  assert.deepEqual(siteContent.principles.map((principle) => principle.title), ['Deep Memory Systems', 'Living Persona Engines', 'The Robotics Horizon'])
  assert.deepEqual(siteContent.portfolio.map((project) => [project.name, project.href]), [
    ['AIPlaymate.io', 'https://aiplaymate.io'],
    ['AIPlayWorld.io', 'https://aiplayworld.io'],
  ])
  assert.deepEqual(siteContent.interactions, { soundOn: 'Sound on', soundOff: 'Sound off', cursorLabel: 'Peregen AI orbital cursor', cursorTrail: 'Orbital spark trail', cometAsset: '/shooting-star-galaxy.gif' })
  assert.deepEqual(siteContent.contact, { email: 'support@peregenai.com', address: '5900 Balcones Drive Suite 100, Austin, TX 78731', signupSubject: 'Peregen AI early access request' })
  assert.deepEqual(siteContent.social, { facebook: 'https://www.facebook.com/peregenai', linkedin: 'https://www.linkedin.com/company/peregen-ai' })
})
