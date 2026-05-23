const express = require('express');
const { getClients, createClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getClients)
  .post(protect, createClient);

router.route('/:id')
  .put(protect, updateClient)
  .delete(protect, deleteClient);

module.exports = router;