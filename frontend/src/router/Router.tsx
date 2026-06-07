import { Routes, Route } from 'react-router-dom'

import MainLayout from '../layout/MainLayout'
import EventsPages from '../pages/EventsPages/EventsPages'
import ProfilePages from '../pages/ProfilePages/ProfilePages'

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
          <Route path="events" element={<EventsPages />} />
          <Route path="profile" element={<ProfilePages />} />
      </Route>
    </Routes>
  )
}

export default Router
