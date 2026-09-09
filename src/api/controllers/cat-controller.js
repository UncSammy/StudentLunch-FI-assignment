import catItems from '../models/cat-model.js';


const getCats = (req, res) => {
  res.json(catItems);
};


const getCatById = (req, res) => {
  const id = Number(req.params.id);

  const cat = catItems.find((item) => item.cat_id === id);

  if (!cat) {
    return res.status(404).json({
      message: 'Cat not found.',
    });
  }

  res.json(cat);
};


const createCat = (req, res) => {
  console.log('Body:', req.body);
console.log('File:', req.file);
const newCat = {
  cat_id: catItems.length + 1,
  ...req.body,
  image: req.file.filename,
};

  catItems.push(newCat);

  res.status(201).json(newCat);
};


const updateCat = (req, res) => {
  res.json({
    message: 'Cat item updated.',
  });
};


const deleteCat = (req, res) => {
  res.json({
    message: 'Cat item deleted.',
  });
};

export {
  getCats,
  getCatById,
  createCat,
  updateCat,
  deleteCat,
};