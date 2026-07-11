import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TimePicker } from '@/components/ui/TimePicker/TimePicker'

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

describe('TimePicker', () => {
  beforeEach(() => {
    mockViewport(false)
  })

  it('opens custom picker on desktop and selects time', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<TimePicker label="Время" value="" onChange={onChange} />)

    await user.click(screen.getByLabelText('Время'))
    await user.click(screen.getByRole('button', { name: '19 часов' }))
    await user.click(screen.getByRole('button', { name: '30 минут' }))

    expect(onChange).toHaveBeenCalledWith('19:00')
    expect(onChange).toHaveBeenCalledWith('19:30')
  })

  it('uses native time input on mobile', () => {
    mockViewport(true)

    render(<TimePicker label="Время" value="18:30" onChange={() => {}} />)

    const input = screen.getByLabelText('Время')
    expect(input).toHaveAttribute('type', 'time')
    expect(input).toHaveValue('18:30')
  })
})
