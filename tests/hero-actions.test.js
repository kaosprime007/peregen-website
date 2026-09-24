import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

test('Hero actions CSS includes responsive mobile and tablet rules', () => {
  const css = fs.readFileSync(path.resolve('src/index.css'), 'utf-8')

  // Icons should not squish inside buttons/links
  assert.match(css, /\.button svg,\s*\.text-link svg\s*\{\s*flex-shrink:\s*0;\s*\}/)

  // Mobile layout in @media (max-width: 800px)
  assert.match(css, /@media\s*\(max-width:\s*800px\)\s*\{/)
  assert.match(css, /\.hero-actions\s*\{\s*display:\s*flex;\s*flex-direction:\s*column;\s*align-items:\s*flex-start;/)
  assert.match(css, /\.hero-actions \.button\s*\{\s*width:\s*100%;\s*max-width:\s*320px;\s*min-height:\s*48px;/)
  assert.match(css, /\.hero-actions \.text-link\s*\{\s*min-height:\s*44px;\s*display:\s*inline-flex;/)

  // Tablet layout in @media (min-width: 580px) and (max-width: 800px)
  assert.match(css, /@media\s*\(min-width:\s*580px\)\s*and\s*\(max-width:\s*800px\)\s*\{/)
  assert.match(css, /\.hero-actions\s*\{\s*flex-direction:\s*row;\s*align-items:\s*center;/)
})
