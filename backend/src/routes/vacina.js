const express = require('express');
const router = express.Router();
const vacinaController = require('../controllers/vacinaController');

router.get('/', vacinaController.getAll);
router.get('/:id', vacinaController.getById);
router.post('/', vacinaController.create);
router.put('/:id', vacinaController.update);
router.delete('/:id', vacinaController.remove);

module.exports = router;