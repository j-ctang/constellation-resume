// Prints the "Read as scroll" view to public/resume.pdf using its print styles.
// Usage: npm run pdf  (builds first, then serves dist with vite preview)
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const PORT = 4179
const out = fileURLToPath(new URL('../public/resume.pdf', import.meta.url))
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] })
await new Promise((resolve, reject) => {
  server.stdout.on('data', d => { if (String(d).includes('Local')) resolve() })
  server.on('exit', code => reject(new Error(`vite preview exited with ${code}`)))
})

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.goto(`http://localhost:${PORT}/constellation-resume/`)
  await page.getByRole('button', { name: 'Read as scroll' }).click()
  await page.locator('.scroll').waitFor()
  await page.emulateMedia({ media: 'print' })
  await page.pdf({ path: out, format: 'Letter', preferCSSPageSize: true, printBackground: true })
  console.log(`Wrote ${out}`)
} finally {
  await browser.close()
  server.kill()
}
