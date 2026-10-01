import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { defaultMatchMedia } from './test/setup'
import App from './App'

const index = () => screen.getByRole('navigation', { name: /index of constellations/i })

describe('App', () => {
  it('renders the owner name as the page heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /justin tang/i })).toBeInTheDocument()
  })

  it('keeps contact links visible in the masthead while a story is open', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation', { name: /index of constellations/i })).getByRole('button', { name: /the mimic/i }))
    const contact = screen.getByRole('list', { name: /contact/i })
    expect(within(contact).getByRole('link', { name: /email/i })).toHaveAttribute('href', 'mailto:jstn.c.tang@gmail.com')
    expect(within(contact).getByRole('link', { name: /github/i })).toHaveAttribute('href', 'https://github.com/j-ctang')
  })

  it('lists LinkedIn among the contact links', () => {
    render(<App />)
    const contact = screen.getByRole('list', { name: /contact/i })
    expect(within(contact).getByRole('link', { name: /linkedin/i })).toHaveAttribute('href', 'https://www.linkedin.com/in/justin-tang-812831438/')
  })

  it('keeps the story header free of buttons; desktop returns from the footer', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation', { name: /index of constellations/i })).getByRole('button', { name: /the mimic/i }))
    const head = document.querySelector('.card .panel-head') as HTMLElement
    expect(within(head).queryByRole('button')).toBeNull()
    const foot = document.querySelector('.card .panel-foot') as HTMLElement
    expect(within(foot).getByRole('button', { name: /return to catalogue/i })).toBeInTheDocument()
  })

  describe('"More below" cue', () => {
    let restore: () => void = () => {}
    const fakeOverflow = () => {
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => 1000 })
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 300 })
      // jsdom defines these on Element.prototype, so the HTMLElement overrides are deleted afterwards.
      restore = () => {
        delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight
        delete (HTMLElement.prototype as { clientHeight?: number }).clientHeight
      }
    }
    afterEach(() => { restore(); vi.restoreAllMocks() })
    const body = () => screen.getByRole('navigation', { name: /index of constellations/i }).closest('.panel-body') as HTMLElement
    const scrollTo = (top: number) => { body().scrollTop = top; fireEvent.scroll(body()) }

    it('shows while more constellations sit below the fold', () => {
      fakeOverflow()
      render(<App />)
      expect(screen.getByRole('button', { name: /more below/i })).toBeInTheDocument()
    })

    it('stays gone after the reader reaches the bottom once, even after scrolling back up', () => {
      fakeOverflow()
      const { unmount } = render(<App />)
      scrollTo(700)
      expect(screen.queryByRole('button', { name: /more below/i })).toBeNull()
      scrollTo(100)
      expect(screen.queryByRole('button', { name: /more below/i })).toBeNull()
      unmount()
      render(<App />)
      expect(screen.queryByRole('button', { name: /more below/i })).toBeNull()
    })

    it('slowly scrolls to the bottom when pressed, then never shows again', () => {
      fakeOverflow()
      const frames: FrameRequestCallback[] = []
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { frames.push(cb); return frames.length })
      const { unmount } = render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /more below/i }))
      expect(screen.queryByRole('button', { name: /more below/i })).toBeNull()
      let t = 0
      while (frames.length && t < 10000) { t += 16; frames.shift()!(t) }
      expect(body().scrollTop).toBe(700)
      unmount()
      render(<App />)
      expect(screen.queryByRole('button', { name: /more below/i })).toBeNull()
    })

    it('stops the slow scroll as soon as the reader touches, wheels, or presses a key', () => {
      fakeOverflow()
      const frames: FrameRequestCallback[] = []
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => { frames.push(cb); return frames.length })
      render(<App />)
      fireEvent.click(screen.getByRole('button', { name: /more below/i }))
      frames.shift()!(0)
      frames.shift()!(200)
      const stoppedAt = body().scrollTop
      expect(stoppedAt).toBeGreaterThan(0)
      expect(stoppedAt).toBeLessThan(700)
      fireEvent.wheel(body(), { deltaY: -40 })
      while (frames.length) frames.shift()!(5000)
      expect(body().scrollTop).toBe(stoppedAt)
    })
  })

  it('shows no cue when the catalogue fits', () => {
    render(<App />)
    expect(screen.queryByText(/more below/i)).toBeNull()
  })

  it('lists constellations grouped by region', () => {
    render(<App />)
    const nav = index()
    expect(within(nav).getByText('The Guild Reaches')).toBeInTheDocument()
    expect(within(nav).getByText('The Forge')).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: /the patient hand/i })).toBeInTheDocument()
  })

  it('opens the entry panel from the index and returns', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(index()).getByRole('button', { name: /the patient hand/i }))
    expect(document.querySelector('.card-real')).toHaveTextContent('Software Engineer Intern · MakerMods · Jul 2026 – Sep 2026')
    expect(screen.getByRole('link', { name: 'MakerMods' })).toHaveAttribute('href', 'https://www.makermods.ai')
    await user.click(screen.getByRole('button', { name: /return to catalogue/i }))
    expect(index()).toBeInTheDocument()
  })

  it('renders a focusable hotspot per constellation that opens the panel', async () => {
    const user = userEvent.setup()
    render(<App />)
    const sky = screen.getByRole('group', { name: 'Constellations' })
    const spots = within(sky).getAllByRole('button')
    expect(spots).toHaveLength(8)
    await user.click(within(sky).getByRole('button', { name: /the mimic/i }))
    expect(screen.getByRole('heading', { name: 'The Mimic' })).toBeInTheDocument()
    expect(within(sky).getByRole('button', { name: /the mimic/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('supports keyboard: Tab to a hotspot, Enter opens, Escape returns', async () => {
    const user = userEvent.setup()
    render(<App />)
    const sky = screen.getByRole('group', { name: 'Constellations' })
    const first = within(sky).getAllByRole('button')[0]
    first.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: /return to catalogue/i })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('navigation', { name: /index of constellations/i })).toBeInTheDocument()
  })

  it('shows onboarding on first visit and remembers dismissal', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    expect(screen.getByText(/this sky is yours too/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /understood/i }))
    expect(screen.queryByText(/this sky is yours too/i)).toBeNull()
    unmount()
    render(<App />)
    expect(screen.queryByText(/this sky is yours too/i)).toBeNull()
  })

  it('reopens onboarding from the ? button', async () => {
    localStorage.setItem('constellation-resume:onboarded', '1')
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /how to draw/i }))
    expect(screen.getByText(/this sky is yours too/i)).toBeInTheDocument()
  })

  it('dismisses onboarding on the first sky click', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(container.querySelector('canvas.sky')!)
    expect(screen.queryByText(/this sky is yours too/i)).toBeNull()
  })

  it('toggles between sky and scroll views', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /read as scroll/i }))
    expect(screen.getByRole('heading', { level: 2, name: /experience/i })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Constellations' })).toBeNull()
    await user.click(screen.getByRole('button', { name: /return to the sky/i }))
    expect(screen.getByRole('group', { name: 'Constellations' })).toBeInTheDocument()
  })

  it('moves focus into the card and back to the index item', async () => {
    const user = userEvent.setup()
    render(<App />)
    const item = within(screen.getByRole('navigation', { name: /index of constellations/i }))
      .getByRole('button', { name: /the mimic/i })
    await user.click(item)
    expect(screen.getByRole('heading', { name: 'The Mimic' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(within(screen.getByRole('navigation', { name: /index of constellations/i }))
      .getByRole('button', { name: /the mimic/i })).toHaveFocus()
  })

  it('mouse Return leaves no stuck highlight', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(within(index()).getByRole('button', { name: /the mimic/i }))
    await user.click(screen.getByRole('button', { name: /return to catalogue/i }))
    expect(container.querySelectorAll('li.entry.hot')).toHaveLength(0)
  })

  it('Escape dismisses onboarding first and changes nothing else', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(index()).getByRole('button', { name: /the mimic/i }))
    localStorage.removeItem('constellation-resume:onboarded')
    await user.click(screen.getByRole('button', { name: /how to draw/i }))
    expect(screen.getByText(/this sky is yours too/i)).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByText(/this sky is yours too/i)).toBeNull()
    expect(screen.getByRole('button', { name: /return to catalogue/i })).toBeInTheDocument()
  })

  it('focuses scroll heading, then the toggle on return', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /read as scroll/i }))
    expect(screen.getByRole('heading', { level: 1, name: /justin tang/i })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: /return to the sky/i }))
    expect(screen.getByRole('button', { name: /read as scroll/i })).toHaveFocus()
  })

  it('announces the opened constellation', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(screen.getByRole('navigation', { name: /index/i })).getByRole('button', { name: /the mimic/i }))
    expect(screen.getByRole('status')).toHaveTextContent('The Mimic — ML & Robotics')
  })
})

describe('App on mobile', () => {
  const mockMobile = () =>
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query.includes('max-width: 760px'),
      media: query, onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
    }))
  afterEach(() => { vi.mocked(window.matchMedia).mockImplementation(defaultMatchMedia) })

  it('opens the sheet on select and closes it on a sky tap', async () => {
    mockMobile()
    localStorage.setItem('constellation-resume:onboarded', '1')
    const user = userEvent.setup()
    const { container } = render(<App />)
    const sheet = container.querySelector('aside.sheet')!
    expect(sheet).not.toHaveClass('open')
    await user.click(within(screen.getByRole('group', { name: 'Constellations' })).getAllByRole('button')[0])
    expect(sheet).toHaveClass('open')
    fireEvent.click(container.querySelector('canvas.sky')!)
    expect(sheet).not.toHaveClass('open')
    expect(screen.queryByRole('button', { name: /return to catalogue/i })).toBeNull()
  })

  it('makes the closed sheet content inert', async () => {
    mockMobile()
    localStorage.setItem('constellation-resume:onboarded', '1')
    const user = userEvent.setup()
    render(<App />)
    const nav = () => screen.getByRole('navigation', { name: /index of constellations/i, hidden: true })
    expect(nav().closest('[inert]')).not.toBeNull()
    await user.click(screen.getByRole('button', { name: /toggle catalogue/i }))
    expect(nav().closest('[inert]')).toBeNull()
  })

  it('drags the open sheet with the finger and closes it when released low enough', async () => {
    mockMobile()
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(within(screen.getByRole('group', { name: 'Constellations' })).getAllByRole('button')[0])
    const sheet = container.querySelector<HTMLElement>('aside.sheet')!
    const handle = sheet.querySelector('.card .panel-head')!
    fireEvent.pointerDown(handle, { clientY: 400, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientY: 480, pointerId: 1 })
    expect(sheet.style.transform).toBe('translateY(80px)')
    fireEvent.pointerUp(handle, { clientY: 520, pointerId: 1 })
    expect(sheet.style.transform).toBe('')
    expect(sheet).not.toHaveClass('open')
  })

  it('snaps the sheet back open after a short drag', async () => {
    mockMobile()
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(within(screen.getByRole('group', { name: 'Constellations' })).getAllByRole('button')[0])
    const sheet = container.querySelector<HTMLElement>('aside.sheet')!
    const grip = screen.getByRole('button', { name: /toggle catalogue/i })
    fireEvent.pointerDown(grip, { clientY: 400, pointerId: 1 })
    fireEvent.pointerMove(grip, { clientY: 410, pointerId: 1 })
    fireEvent.pointerUp(grip, { clientY: 410, pointerId: 1, timeStamp: 10000 })
    expect(sheet).toHaveClass('open')
  })

  it('dismisses the story when the sheet is closed with the grip', async () => {
    mockMobile()
    const user = userEvent.setup()
    const { container } = render(<App />)
    const sky = screen.getByRole('group', { name: 'Constellations' })
    await user.click(within(sky).getAllByRole('button')[0])
    await user.click(screen.getByRole('button', { name: /toggle catalogue/i }))
    expect(container.querySelector('aside.sheet')).not.toHaveClass('open')
    expect(within(sky).getAllByRole('button')[0]).toHaveAttribute('aria-pressed', 'false')
  })

  it('grip toggles the sheet to show the index', async () => {
    mockMobile()
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(screen.getByRole('button', { name: /toggle catalogue/i }))
    expect(container.querySelector('aside.sheet')).toHaveClass('open')
  })
})
