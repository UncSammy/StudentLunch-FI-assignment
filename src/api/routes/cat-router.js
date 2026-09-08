import express from 'express';

import {
  getCats,
  getCatById,
  createCat,
  updateCat,
  deleteCat,
} from '../controllers/cat-controller.js';

const catRouter = express.Router();

catRouter.route('/')
  .get(getCats)
  .post(createCat);

catRouter.route('/:id')
  .get(getCatById)
  .put(updateCat)
  .delete(deleteCat);

export default catRouter;