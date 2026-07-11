import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/Button/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(
      screen.getByRole('button', { name: /click me/i }),
    ).toBeInTheDocument()
  })

  it('calls onClick', async () => {
    const user = userEvent.setup()
    const fn = vi.fn()
    render(<Button onClick={fn}>Go</Button>)
    await user.click(screen.getByRole('button', { name: /go/i }))
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
