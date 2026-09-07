import express from 'express';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/v1/cats', (req, res) => {
  const cat = {
    cat_id: 1,
    name: 'Milo',
    birthdate: '2020-05-15',
    weight: 4.5,
    owner: 'Khalid',
    image: 'https://loremflickr.com/320/240/cat',
  };

  res.json(cat);
});

app.use('/public', express.static('public'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});