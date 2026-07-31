import { Router } from 'express';
import {
  getItems,
  getItemById,
  createItem,
  getUserItems,
  deleteItem,
  addReviewToItem,
} from '../controllers/itemController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getItems);
router.get('/user/manage', protect, getUserItems);
router.get('/:id', getItemById);
router.post('/', protect, createItem);
router.delete('/:id', protect, deleteItem);
router.post('/:id/reviews', addReviewToItem);

export default router;
