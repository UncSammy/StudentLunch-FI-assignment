import MediaRow from '../components/MediaRow';
import { useMedia } from '../hooks/apiHooks';

const Home = () => {
  const { mediaArray } = useMedia();

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