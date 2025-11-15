const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');

router.get('/', agendamentoController.getAll);
router.get('/:id', agendamentoController.getById);
router.post('/', agendamentoController.create);
router.put('/:id', agendamentoController.update);
router.delete('/:id', agendamentoController.remove);

module.exports = router;