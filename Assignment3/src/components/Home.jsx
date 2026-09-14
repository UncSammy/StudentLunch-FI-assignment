import MediaRow from './MediaRow';
const mediaArray = [
  {
    media_id: 1,
    filename: 'https://picsum.photos/200/150',
    title: 'Beautiful Nature',
    description: 'A beautiful nature image.',
    created: '2026-09-01T10:00:00',
    filesize: 204800,
    media_type: 'image',
  },
  {
    media_id: 2,
    filename: 'https://picsum.photos/201/150',
    title: 'City View',
    description: 'A view of a modern city.',
    created: '2026-09-02T14:30:00',
    filesize: 512000,
    media_type: 'image',
  },
  {
    media_id: 3,
    filename: 'https://picsum.photos/202/150',
    title: 'Travel Video',
    description: 'A video from a trip.',
    created: '2026-09-03T18:00:00',
    filesize: 1048576,
    media_type: 'video',
  },
];

const Home = () => {
  return (
    <>
      <h2>My Media</h2>

      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th>Created</th>
            <th>Filesize</th>
            <th>Media Type</th>
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