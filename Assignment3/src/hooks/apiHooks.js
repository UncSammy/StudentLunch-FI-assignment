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

  return { mediaArray };
};

export { useMedia };