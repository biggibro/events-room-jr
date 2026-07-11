import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LoginPage } from '@/pages/auth/LoginPage'

describe('LoginPage', () => {
  it('submits login form', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByText('С возвращением')).toBeInTheDocument()
  })
})
