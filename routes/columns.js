const express = require('express');
const router = express.Router();
const controller = require('./../controllers/columns');

router.get('/tasks/:id', controller.getAllTasksOfColumn);
router.get('/:id', controller.getColumnById);
router.get('/', controller.getListOfColumns);
router.post('/move', controller.moveColumn);
router.post('/', controller.createColumn);
router.put('/:id', controller.updateColumn);
router.delete('/:id', controller.deleteColumn);

module.exports = router;
