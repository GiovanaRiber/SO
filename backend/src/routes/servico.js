const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');

router.get('/', servicoController.getAll);
router.get('/:id', servicoController.getById);
router.post('/', servicoController.create);
router.put('/:id', servicoController.update);
router.delete('/:id', servicoController.remove);

module.exports = router;