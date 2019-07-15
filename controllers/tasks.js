const pool = require('./../config/postgresql').pool;

module.exports = {
    getListOfTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    reorderTask,
    moveTask
}

async function getListOfTasks(req, res, next) {
    console.log('List of tasks');

    try {
        const results = await pool.query('SELECT * FROM tasks');

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function getTaskById(req, res, next) {
    console.log('Detail of task');

    const id_task = req.params.id;

    try {
        const results = await pool.query('SELECT * FROM tasks WHERE id_task = $1', [id_task]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function createTask(req, res, next) {
    console.log('Create task');

    const { id_column, name, description } = req.body;
    const date_of_creation = (new Date).getTime(); // timestamp ?
    console.log(date_of_creation);

    try {
        let order_number = 0;
        const checkOrderNumber = await pool.query('SELECT MAX(order_number) FROM tasks WHERE id_column = $1', [id_column]);
        if (checkOrderNumber.rows[0].max === null) {
            console.log('Maximum order_number is null');
            order_number = 1;
        } else {
            order_number = parseInt(checkOrderNumber.rows[0].max) + 1;
        }
        const results = await pool.query('INSERT INTO tasks(name, description, id_column, date_of_creation, order_number) VALUES($1, $2, $3, $4, $5)',
            [name, description, id_column, date_of_creation, order_number]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function updateTask(req, res, next) {
    console.log('Update task');

    const id_task = req.params.id;
    const { name, description } = req.body;
    // change date_of_creation ?????

    try {
        const results = await pool.query('UPDATE tasks SET name = $2, description = $3 WHERE id_task = $1', [id_task, name, description]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function deleteTask(req, res, next) {
    console.log('Delete task');

    const id_task = req.params.id;

    try {
        const results = await pool.query('DELETE FROM tasks WHERE id_task = $1', [id_task]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function reorderTask(req, res, next) {
    console.log('Reoder of task (change order_number)');

    const { id_task, id_column } = req.body;
    const new_position = req.body.order_number;

    try {
        const checkPosition = await pool.query('SELECT order_number FROM tasks WHERE id_task = $1', [id_task]);
        const current_position = checkPosition.rows[0].order_number;

        const checkMaxOrderNumber = await pool.query('SELECT MAX(order_number) FROM tasks WHERE id_column = $1', [id_column]);
        const max_order_number = checkMaxOrderNumber.rows[0].max;

        if (current_position === new_position) {
            res.status(200).json({ message: "Task already has this position!" });
        } else if (new_position > max_order_number) {
            res.status(200).json({ message: "New position is bigger than maximum order_number!" });
        } else {
            if (current_position > new_position) {
                // all tasks between new_p and curr_p - 1 -> order_number += 1
                const tasksBetween = await pool.query('select * from tasks where id_column = $3 AND order_number between $1 and ($2 - 1)',
                    [new_position, current_position, id_column]);

                await asyncForEach(tasksBetween.rows, async (row) => {
                    const updateTasks = await pool.query('update tasks set order_number = $2 where id_task = $1',
                        [row.id_task, row.order_number + 1]);
                });
            } else if (current_position < new_position) {
                // all tasks between curr_p + 1 and new_p -> order_number -= 1
                const tasksBetween = await pool.query('select * from tasks where id_column = $3 AND order_number between ($1 + 1) and $2',
                    [current_position, new_position, id_column]);

                await asyncForEach(tasksBetween.rows, async (row) => {
                    const updateTasks = await pool.query('update tasks set order_number = $2 where id_task = $1',
                        [row.id_task, row.order_number - 1]);
                });
            }

            const results = await pool.query('UPDATE tasks SET order_number = $2 WHERE id_task = $1', [id_task, new_position]);
            res.status(200).json(results.rows);
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function moveTask(req, res, next) {
    console.log('Move task into another column');

    const { id_task, id_column } = req.body;
    // id_column - new column

    try {
        const checkMaxOrderNumber = await pool.query('select max(order_number) from tasks where id_column = $1 group by id_column', [id_column]);
        let max = 0;
        if (checkMaxOrderNumber.rowCount !== 0) {
            max = parseInt(checkMaxOrderNumber.rows[0].max);
        }

        const results = await pool.query('UPDATE tasks SET id_column = $2, order_number = $3 WHERE id_task = $1', [id_task, id_column, max + 1]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
