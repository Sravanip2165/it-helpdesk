const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createIncident,
  getAllIncidents,
  getMyIncidents,
  getAssignedIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
  addComment,
  assignEngineer,
} = require('../controllers/incidentController');

router.use(protect);

router.post('/',                    authorize('employee'),                      createIncident);
router.get('/',                     authorize('admin'),                         getAllIncidents);
router.get('/my',                   authorize('employee'),                      getMyIncidents);
router.get('/assigned',             authorize('engineer'),                      getAssignedIncidents);
router.get('/:id',                  authorize('employee', 'engineer', 'admin'), getIncidentById);
router.put('/:id',                  authorize('engineer', 'admin'),             updateIncident);
router.delete('/:id',               authorize('admin'),                         deleteIncident);
router.post('/:id/comments',        authorize('employee', 'engineer', 'admin'), addComment);
router.patch('/:id/assign',         authorize('admin'),                         assignEngineer);

module.exports = router;