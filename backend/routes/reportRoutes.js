const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { exportExcel, exportPDF, getStats } = require('../controllers/reportController');

router.use(protect);
router.use(authorize('admin'));

router.get('/excel', exportExcel);
router.get('/pdf',   exportPDF);
router.get('/stats', getStats);

module.exports = router;