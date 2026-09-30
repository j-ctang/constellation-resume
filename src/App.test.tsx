import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
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
})
