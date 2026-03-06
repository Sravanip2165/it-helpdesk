const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllAssets, createAsset, updateAsset, deleteAsset, assignAsset
} = require('../controllers/assetController');

router.use(protect);
router.use(authorize('admin'));

router.get('/',             getAllAssets);
router.post('/',            createAsset);
router.put('/:id',          updateAsset);
router.delete('/:id',       deleteAsset);
router.patch('/:id/assign', assignAsset);

module.exports = router;