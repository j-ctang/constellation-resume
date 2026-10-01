import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { SkyEntry } from '../sky.config'
import EntryCard from './EntryCard'

const full: SkyEntry = {
  id: 'x', region: 'guild', poeticName: 'The Test', lore: 'Some lore.', title: 'Intern', org: 'Acme', dates: '2026',
  fields: [{ label: 'Stack', value: 'TS' }], bullets: ['Did a thing', 'Did another'],
}

describe('EntryCard', () => {
  it('focuses its heading without scrolling the page', () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    render(<EntryCard entry={full} onBack={() => {}} />)
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    focus.mockRestore()
  })

  it('shows the entry link at the bottom when present', () => {
    render(<EntryCard entry={{ ...full, link: { label: 'View repository', href: 'https://example.com/r' } }} onBack={() => {}} />)
    expect(screen.getByRole('link', { name: /view repository/i })).toHaveAttribute('href', 'https://example.com/r')
  })

  it('links the organisation name when it has a URL', () => {
    render(<EntryCard entry={{ ...full, orgUrl: 'https://acme.test' }} onBack={() => {}} />)
    expect(screen.getByRole('link', { name: 'Acme' })).toHaveAttribute('href', 'https://acme.test')
  })

  it('renders no link when absent', () => {
    render(<EntryCard entry={full} onBack={() => {}} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('shows poetic name, real title, fields, lore, bullets', () => {
    render(<EntryCard entry={full} onBack={() => {}} />)
    expect(screen.getByRole('heading', { name: 'The Test' })).toBeInTheDocument()
    expect(document.querySelector('.card-real')).toHaveTextContent('Intern · Acme · 2026')
    expect(screen.getByText('Stack')).toBeInTheDocument()
    expect(screen.getByText('Some lore.')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('omits empty fields and bullets without leftovers', () => {
    const { container } = render(<EntryCard entry={{ ...full, org: undefined, dates: undefined, fields: [], bullets: [] }} onBack={() => {}} />)
    expect(screen.getByText('Intern')).toBeInTheDocument()
    expect(container.querySelector('dl')).toBeNull()
    expect(container.querySelector('ul')).toBeNull()
  })

  it('calls onBack', () => {
    const onBack = vi.fn()
    render(<EntryCard entry={full} onBack={onBack} />)
    screen.getByRole('button', { name: /return to catalogue/i }).click()
    expect(onBack).toHaveBeenCalled()
  })
})
