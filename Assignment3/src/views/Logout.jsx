import { useEffect } from 'react';
import { useUserContext } from '../hooks/contextHooks';

const Logout = () => {
  const { handleLogout } = useUserContext();

  useEffect(() => {
    handleLogout();
  }, []);

  return <p>Logging out...</p>;
};

export default Logout;