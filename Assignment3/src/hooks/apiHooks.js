import { useEffect, useState } from 'react';
import fetchData from '../utils/fetchData';

const useMedia = () => {
  const [mediaArray, setMediaArray] = useState([]);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const json = await fetchData(
          import.meta.env.VITE_MEDIA_API + '/media'
        );

        const newArray = await Promise.all(
          json.map(async (item) => {
            const result = await fetchData(
              import.meta.env.VITE_AUTH_API + '/users/' + item.user_id
            );

            return {
              ...item,
              username: result.username,
            };
          })
        );

        setMediaArray(newArray);
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };

    getMedia();
  }, []);

  const postMedia = async (file, inputs, token) => {
  const filename = file.name
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.-]/g, '');

  const mediaData = {
    title: inputs.title,
    description: inputs.description,
    filename: filename,
    filesize: file.size,
    media_type: file.type,
  };

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(mediaData),
  };

  const result = await fetchData(
    import.meta.env.VITE_MEDIA_API + '/media',
    fetchOptions
  );

  return result;
};

  return {
    mediaArray,
    postMedia,
  };
};

const useAuthentication = () => {
  const postLogin = async (inputs) => {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    };

    const loginResult = await fetchData(
      import.meta.env.VITE_AUTH_API + '/auth/login',
      fetchOptions
    );

    console.log(loginResult);

    return loginResult;
  };

  const postUser = async (inputs) => {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    };

    const result = await fetchData(
      import.meta.env.VITE_AUTH_API + '/users',
      fetchOptions
    );

    return result;
  };

  return {
    postLogin,
    postUser,
  };
};

const useUser = () => {
  const getUserByToken = async (token) => {
    const fetchOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const result = await fetchData(
      import.meta.env.VITE_AUTH_API + '/users/token',
      fetchOptions
    );

    return result;
  };

  return {
    getUserByToken,
  };
};

const useFile = () => {
  const postFile = async (file, token) => {
    const formData = new FormData();

    formData.append('file', file);

    const fetchOptions = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };

    const result = await fetchData(
  import.meta.env.VITE_UPLOAD_SERVER + '/upload',
  fetchOptions
);

    return result;
  };

  return {
    postFile,
  };
};

export { useMedia, useAuthentication, useUser, useFile };