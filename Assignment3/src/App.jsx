import { HashRouter, Route, Routes } from 'react-router';
import { UserProvider } from './contexts/UserContext';

import Layout from './components/Layout';
import Home from './views/Home';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './views/Login';
import Logout from './views/Logout';
import Profile from './views/Profile';
import Upload from './views/Upload';
const App = () => {
  return (
    <HashRouter>
      <UserProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />

            <Route path="/logout" element={<Logout />} />
<Route path="/upload" element={<Upload />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </UserProvider>
    </HashRouter>
  );
};

export default App;