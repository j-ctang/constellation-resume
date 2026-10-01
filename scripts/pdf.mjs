// Prints the "Read as scroll" view to public/resume.pdf using its print styles.
// Usage: npm run pdf  (builds first, then serves dist with vite preview)
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const PORT = 4179
const out = fileURLToPath(new URL('../public/resume.pdf', import.meta.url))
const URL_ROOT = `http://localhost:${PORT}/constellation-resume/`
const READY_TIMEOUT_MS = 15000

/** Poll until vite preview answers, failing after READY_TIMEOUT_MS or if the server exits. */
async function waitForServer(server) {
  let exited = null
  server.once('exit', code => { exited = code })
  const deadline = Date.now() + READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (exited !== null) throw new Error(`vite preview exited with ${exited}`)
    try { if ((await fetch(URL_ROOT)).ok) return } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 200))
  }
  throw new Error(`vite preview not ready after ${READY_TIMEOUT_MS}ms`)
}

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: ['ignore', 'ignore', 'inherit'] })
let browser
try {
  await waitForServer(server)
  browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(URL_ROOT)
  await page.getByRole('button', { name: 'Read as scroll' }).click()
  await page.locator('.scroll').waitFor()
  await page.emulateMedia({ media: 'print' })
  await page.pdf({ path: out, format: 'Letter', preferCSSPageSize: true, printBackground: true })
  console.log(`Wrote ${out}`)
} finally {
  await browser?.close()
  server.kill()
}
