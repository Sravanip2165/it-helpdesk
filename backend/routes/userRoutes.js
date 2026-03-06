const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers, createUser, updateUser, deleteUser
} = require('../controllers/userController');

router.use(protect);
router.use(authorize('admin'));

router.get('/',     getAllUsers);
router.post('/',    createUser);
router.put('/:id',  updateUser);
router.delete('/:id', deleteUser);

module.exports = router;