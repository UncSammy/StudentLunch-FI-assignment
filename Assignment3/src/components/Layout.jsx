import { useEffect } from 'react';
import { Link, Outlet } from 'react-router';
import { useUserContext } from '../hooks/contextHooks';

const Layout = () => {
  const { user, handleAutoLogin } = useUserContext();

  useEffect(() => {
    handleAutoLogin();
  }, []);

  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>

          {!user && (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}

          {user && (
            <>
              <li>
                <Link to="/profile">Profile</Link>
              </li>

              <li>
                <Link to="/logout">Logout</Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;