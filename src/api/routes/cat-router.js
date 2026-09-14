import express from 'express';
import multer from 'multer';
import {
  getCats,
  getCatById,
  createCat,
  updateCat,
  deleteCat,
} from '../controllers/cat-controller.js';

const catRouter = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });
catRouter.route('/')
  .get(getCats)
  .post(upload.single('cat'), createCat);

catRouter.route('/:id')
  .get(getCatById)
  .put(updateCat)
  .delete(deleteCat);

export default catRouter;