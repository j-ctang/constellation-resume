import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ENTRIES } from '../sky.config'
import ScrollView from './ScrollView'

describe('ScrollView', () => {
  it('renders semantic sections with real titles first', () => {
    render(<ScrollView entries={ENTRIES} onBack={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Justin Tang' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /experience/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: /projects/i })).toBeNull()
    const job = screen.getByRole('article', { name: /software engineer intern/i })
    expect(within(job).getAllByRole('listitem')).toHaveLength(4)
    expect(within(job).getByText(/the patient hand/i)).toBeInTheDocument()
  })

  it('omits empty bullet lists', () => {
    render(<ScrollView entries={ENTRIES} onBack={() => {}} />)
    const edu = screen.getByRole('article', { name: /b\.s\. computer science/i })
    expect(within(edu).queryByRole('list')).toBeNull()
  })

  it('links the PDF', () => {
    render(<ScrollView entries={ENTRIES} onBack={() => {}} />)
    expect(screen.getByRole('link', { name: /download pdf/i })).toHaveAttribute('href', expect.stringMatching(/resume\.pdf$/))
  })
})
