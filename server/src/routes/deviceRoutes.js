import express from 'express';
import {
  getDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
  addRepair,
  updateRepair,
  deleteRepair,
  getDashboardInsights,
  getCostInsights
} from '../controllers/deviceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/insights/dashboard', getDashboardInsights);
router.get('/insights/cost/:id', getCostInsights);

router.route('/')
  .get(getDevices)
  .post(createDevice);

router.route('/:id')
  .get(getDevice)
  .put(updateDevice)
  .delete(deleteDevice);

router.route('/:id/repairs')
  .post(addRepair);

router.route('/:id/repairs/:repairId')
  .put(updateRepair)
  .delete(deleteRepair);

export default router;