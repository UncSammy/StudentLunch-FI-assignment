import { useEffect, useState } from 'react';
import MediaRow from './MediaRow';
import fetchData from '../utils/fetchData';

const Home = () => {
  const [mediaArray, setMediaArray] = useState([]);
console.log(import.meta.env.VITE_MEDIA_API);
  useEffect(() => {
    const getMedia = async () => {
      try {
       const json = await fetchData(import.meta.env.VITE_MEDIA_API + '/media');

const newArray = await Promise.all(
  json.map(async (item) => {
    const result = await fetchData(
      import.meta.env.VITE_AUTH_API + '/users/' + item.user_id
    );

    return { ...item, username: result.username };
  })
);

setMediaArray(newArray);
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };

    getMedia();
  }, []);
console.log(mediaArray);
  return (
    <>
      <h2>Media</h2>

      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th>Created</th>
            <th>Filesize</th>
            <th>Media type</th>
            <th>Username</th>
          </tr>
        </thead>

        <tbody>
          {mediaArray.map((item) => (
            <MediaRow key={item.media_id} item={item} />
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Home;