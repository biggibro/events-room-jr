import { RouterProvider } from 'react-router-dom'
import { appRouter } from '@/routes/AppRouter'

export function App() {
  return <RouterProvider router={appRouter} />
}
