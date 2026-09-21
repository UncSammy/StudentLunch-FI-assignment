import { HashRouter, Route, Routes } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './views/Login';
import Logout from './views/Logout';
import Profile from './views/Profile';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;