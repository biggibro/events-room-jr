import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DatePicker } from '@/components/ui/DatePicker/DatePicker'

function mockViewport(isMobile: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isMobile && query === '(max-width: 767px)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('DatePicker', () => {
  beforeEach(() => {
    mockViewport(false)
  })

  it('opens calendar and selects a date on desktop', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date(2026, 6, 11))

    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<DatePicker label="Дата" value="" onChange={onChange} />)

    await user.click(screen.getByLabelText('Дата'))
    await user.click(screen.getByRole('button', { name: '20 июля 2026 г.' }))

    expect(onChange).toHaveBeenCalledWith('2026-07-20')

    vi.useRealTimers()
  })

  it('shows selected value in trigger on desktop', () => {
    render(<DatePicker label="Дата" value="2026-10-24" onChange={() => {}} />)

    expect(screen.getByRole('button', { name: 'Дата' })).toHaveTextContent('24 окт')
  })

  it('uses native date input on mobile', async () => {
    mockViewport(true)

    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<DatePicker label="Дата" value="" onChange={onChange} />)

    const input = screen.getByLabelText('Дата')
    expect(input).toHaveAttribute('type', 'date')

    await user.type(input, '2026-10-24')

    expect(onChange).toHaveBeenCalledWith('2026-10-24')
  })
})
