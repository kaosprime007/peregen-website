import test from 'node:test'
import assert from 'node:assert/strict'
import { siteContent } from '../src/siteContent.js'

test('Peregen AI landing page keeps its core positioning and story sections', () => {
  assert.equal(siteContent.hero.eyebrow, 'Adaptive Intelligence. Human-Centric Precision.')
  assert.match(siteContent.hero.title, /meets you halfway/i)
  assert.equal(siteContent.manifesto, 'To architect resilient, emotionally intelligent AI ecosystems that evolve with every interaction—bridging the gap between cold logic and human connection to drive performance, security, and genuine impact.')
  assert.deepEqual(siteContent.principles.map((principle) => principle.title), ['Understand', 'Adapt', 'Collaborate'])
  assert.deepEqual(siteContent.portfolio.map((project) => [project.name, project.href]), [
    ['AIPlaymate.io', 'https://aiplaymate.io'],
    ['AIPlayWorld.io', 'https://aiplayworld.io'],
  ])
  assert.deepEqual(siteContent.interactions, { soundOn: 'Sound on', soundOff: 'Sound off', cursorLabel: 'Peregen AI orbital cursor', cursorTrail: 'Orbital spark trail', cometAsset: '/shooting-star-galaxy.gif' })
  assert.deepEqual(siteContent.contact, { email: 'support@peregenai.com', address: '5900 Balcones Drive Suite 100, Austin, TX 78731', signupSubject: 'Peregen AI early access request' })
  assert.deepEqual(siteContent.social, { facebook: 'https://www.facebook.com/peregenai', linkedin: 'https://www.linkedin.com/company/peregen-ai' })
})
