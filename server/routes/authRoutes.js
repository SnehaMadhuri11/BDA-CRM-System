const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getEmployees, 
  createEmployee,
  deleteEmployee 
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);  // Anyone can register (first becomes admin)
router.post('/login', loginUser);

// Protected admin routes
router.get('/employees', protect, adminOnly, getEmployees);
router.post('/employees', protect, adminOnly, createEmployee);
router.delete('/employees/:id', protect, adminOnly, deleteEmployee);

module.exports = router;