const express = require('express');
const router = express.Router();
const controller = require('./../controllers/tasks');

router.get('/:id', controller.getTaskById);
router.get('/', controller.getListOfTasks);
router.post('/reorder', controller.reorderTask);
router.post('/move', controller.moveTask);
router.post('/', controller.createTask);
router.put('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;
