const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const cardController = require('../controllers/cardController');

const router = express.Router();

router.route('/')
  .get(protect, cardController.getCards)
  .post(protect, cardController.createCard);

router.route('/:id')
  .put(protect, cardController.updateCard)
  .delete(protect, cardController.deleteCard);

module.exports = router;