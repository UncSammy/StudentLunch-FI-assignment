import { Link, Outlet } from 'react-router';

const Layout = () => {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>

          <li>
            <Link to="/login">Login</Link>
          </li>

          <li>
            <Link to="/profile">Profile</Link>
          </li>

          <li>
            <Link to="/logout">Logout</Link>
          </li>
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;