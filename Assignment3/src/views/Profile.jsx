import { useState } from 'react';
import useAuthentication from '../apiHooks';

const Profile = () => {
  const { postLogin } = useAuthentication();

  const [inputs, setInputs] = useState({
    username: '',
    password: '',
  });

  const doLogin = async (event) => {
    event.preventDefault();

    try {
      await postLogin(inputs);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={doLogin}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={inputs.username}
          onChange={(event) =>
            setInputs({ ...inputs, username: event.target.value })
          }
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={inputs.password}
          onChange={(event) =>
            setInputs({ ...inputs, password: event.target.value })
          }
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Profile;