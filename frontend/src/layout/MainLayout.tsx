import './MainLayout.css'
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div>
      <header>
        <h1>Jackaroo Hab</h1>
        <nav>
          <Link to="/events">Мероприятия</Link>
          <Link to="/profile">Профиль</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout