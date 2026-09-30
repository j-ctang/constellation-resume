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

  it('lists constellations grouped by region, hiding empty regions', () => {
    render(<App />)
    const nav = index()
    expect(within(nav).getByText('The Guild Reaches')).toBeInTheDocument()
    expect(within(nav).queryByText('The Forge')).toBeNull()
    expect(within(nav).getByRole('button', { name: /the patient hand/i })).toBeInTheDocument()
  })

  it('opens the entry panel from the index and returns', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(index()).getByRole('button', { name: /the patient hand/i }))
    expect(screen.getByText('Software Engineer Intern · MakerMods · Jul 2026 – Sep 2026')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /return to catalogue/i }))
    expect(index()).toBeInTheDocument()
  })

  it('renders a focusable hotspot per constellation that opens the panel', async () => {
    const user = userEvent.setup()
    render(<App />)
    const sky = screen.getByRole('group', { name: 'Constellations' })
    const spots = within(sky).getAllByRole('button')
    expect(spots).toHaveLength(5)
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

  it('grip toggles the sheet to show the index', async () => {
    mockMobile()
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(screen.getByRole('button', { name: /toggle catalogue/i }))
    expect(container.querySelector('aside.sheet')).toHaveClass('open')
  })
})
