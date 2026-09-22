import { createContext, useState } from 'react';
import { useAuthentication, useUser } from '../hooks/apiHooks';
import { useLocation, useNavigate } from 'react-router';

const UserContext = createContext(null);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const { postLogin } = useAuthentication();
  const { getUserByToken } = useUser();

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (credentials) => {
    try {
      const loginResult = await postLogin(credentials);

      localStorage.setItem('token', loginResult.token);

      setUser(loginResult.user);

      navigate('/');
    } catch (e) {
      console.log(e.message);
      throw e;
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/');
    } catch (e) {
      console.log(e.message);
    }
  };

  const handleAutoLogin = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token) {
        const userResult = await getUserByToken(token);

        setUser(userResult.user);

        console.log('location', location);

        navigate(location.pathname);
      }
    } catch (e) {
      console.log(e.message);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        handleLogin,
        handleLogout,
        handleAutoLogin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };