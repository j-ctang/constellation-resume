import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ENTRIES } from '../sky.config'
import ScrollView from './ScrollView'

describe('ScrollView', () => {
  it('renders semantic sections with real titles first', () => {
    render(<ScrollView entries={ENTRIES} onBack={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Justin Tang' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /experience/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /projects/i })).toBeInTheDocument()
    const job = screen.getByRole('article', { name: /software engineer intern/i })
    expect(within(job).getAllByRole('listitem')).toHaveLength(4)
    expect(within(job).getByText(/the patient hand/i)).toBeInTheDocument()
  })

  it('omits empty bullet lists', () => {
    render(<ScrollView entries={ENTRIES} onBack={() => {}} />)
    const edu = screen.getByRole('article', { name: /b\.s\. computer science/i })
    expect(within(edu).queryByRole('list')).toBeNull()
  })

  it('links project repositories and credits the design', () => {
    render(<ScrollView entries={ENTRIES} onBack={() => {}} />)
    const job = screen.getByRole('article', { name: /software engineer intern/i })
    expect(within(job).getByRole('link', { name: /repository/i })).toHaveAttribute('href', 'https://github.com/makermods-robotics/makermodslab')
    expect(screen.getByRole('link', { name: /asterism/i })).toHaveAttribute('href', expect.stringContaining('MiaAI-Lab'))
  })

  it('links the PDF', () => {
    render(<ScrollView entries={ENTRIES} onBack={() => {}} />)
    expect(screen.getByRole('link', { name: /download pdf/i })).toHaveAttribute('href', expect.stringMatching(/resume\.pdf$/))
  })
})
