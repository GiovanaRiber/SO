const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');

router.get('/', petController.getAll);
router.get('/:id', petController.getById);
router.post('/', petController.create);
router.put('/:id', petController.update);
router.delete('/:id', petController.remove);

module.exports = router;