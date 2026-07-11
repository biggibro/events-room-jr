import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout/MainLayout'
import { AdminPage } from '@/pages/admin/AdminPage'
import { HomePage } from '@/pages/home/HomePage'
import { EventsPage } from '@/pages/events/EventsPage'
import { EventDetailsPage } from '@/pages/event-details/EventDetailsPage'
import { EditEventPage } from '@/pages/edit-event/EditEventPage'
import { CreateEventPage } from '@/pages/create-event/CreateEventPage'
import { CreateLocationPage } from '@/pages/create-location/CreateLocationPage'
import { EditLocationPage } from '@/pages/edit-location/EditLocationPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { GuestRoute } from '@/routes/GuestRoute'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'events', element: <EventsPage /> },
      {
        path: 'events/new',
        element: (
          <ProtectedRoute roles={['admin', 'superadmin']}>
            <CreateEventPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'events/:eventId',
        element: (
          <ProtectedRoute>
            <EventDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'events/:eventId/edit',
        element: (
          <ProtectedRoute roles={['admin', 'superadmin']}>
            <EditEventPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/:userId',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute roles={['admin', 'superadmin']}>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/locations/new',
        element: (
          <ProtectedRoute roles={['admin', 'superadmin']}>
            <CreateLocationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/locations/:locationId/edit',
        element: (
          <ProtectedRoute roles={['admin', 'superadmin']}>
            <EditLocationPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
