import useForm from '../hooks/formHooks';
import { useAuthentication } from '../hooks/apiHooks';

const RegisterForm = () => {
  const initValues = {
    username: '',
    email: '',
    password: '',
  };

  const { postUser } = useAuthentication();

  const doRegister = async () => {
    try {
      const result = await postUser(inputs);

      console.log(result);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const { inputs, handleInputChange, handleSubmit } = useForm(
    doRegister,
    initValues
  );

  console.log(inputs);

  return (
    <>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="registeruser">Username</label>
          <input
            name="username"
            type="text"
            id="registeruser"
            onChange={handleInputChange}
            autoComplete="username"
          />
        </div>

        <div>
          <label htmlFor="registeremail">Email</label>
          <input
            name="email"
            type="email"
            id="registeremail"
            onChange={handleInputChange}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="registerpassword">Password</label>
          <input
            name="password"
            type="password"
            id="registerpassword"
            onChange={handleInputChange}
            autoComplete="new-password"
          />
        </div>

        <button type="submit">Register</button>
      </form>
    </>
  );
};

export default RegisterForm;