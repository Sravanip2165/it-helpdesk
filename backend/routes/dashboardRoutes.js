const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminDashboard, getEngineerDashboard, getEmployeeDashboard
} = require('../controllers/dashboardController');

router.use(protect);

router.get('/admin',    authorize('admin'),    getAdminDashboard);
router.get('/engineer', authorize('engineer'), getEngineerDashboard);
router.get('/employee', authorize('employee'), getEmployeeDashboard);

module.exports = router;