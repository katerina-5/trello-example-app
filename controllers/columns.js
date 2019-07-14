const pool = require('./../config/postgresql').pool;

module.exports = {
    getListOfColumns,
    getColumnById,
    createColumn,
    updateColumn,
    deleteColumn,
    moveColumn,
    getAllTasksOfColumn
}

async function getListOfColumns(req, res, next) {
    console.log('List of columns');

    try {
        const results = await pool.query('SELECT * FROM columns ORDER BY order_number');

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function getColumnById(req, res, next) {
    console.log('Detail of column');

    const id_column = req.params.id;

    try {
        const results = await pool.query('SELECT * FROM columns WHERE id_column = $1', [id_column]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function createColumn(req, res, next) {
    console.log('Create column');

    const name = req.body.name;

    try {
        let order_number = 0;
        const checkOrderNumber = await pool.query('SELECT MAX(order_number) FROM columns');
        if (checkOrderNumber.rows[0].max === null) {
            console.log('Maximum order_number is null');
            order_number = 1;
        } else {
            order_number = parseInt(checkOrderNumber.rows[0].max) + 1;
        }
        const results = await pool.query('INSERT INTO columns(name, order_number) VALUES($1, $2)', [name, order_number]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function updateColumn(req, res, next) {
    console.log('Update column');

    const id_column = req.params.id;
    const name = req.body.name;

    try {
        console.log(id_column + " - " + name);
        const results = await pool.query('UPDATE columns SET name = $2 WHERE id_column = $1', [id_column, name]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function deleteColumn(req, res, next) {
    console.log('Delete column');

    const id_column = req.params.id;

    try {
        const results = await pool.query('DELETE FROM columns WHERE id_column = $1', [id_column]);

        res.status(200).json(results.rows);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function moveColumn(req, res, next) {
    console.log('Move column (change order_number)');

    const id_column = req.body.id_column;
    const new_position = req.body.order_number;

    try {
        const checkPosition = await pool.query('SELECT order_number FROM columns WHERE id_column = $1', [id_column]);
        const current_position = checkPosition.rows[0].order_number;

        const checkMaxOrderNumber = await pool.query('SELECT MAX(order_number) FROM columns');
        const max_order_number = checkMaxOrderNumber.rows[0].max;

        if (current_position === new_position) {
            res.status(200).json({ message: "Column already has this position!" });
        } else if (new_position > max_order_number) {
            res.status(200).json({ message: "New position is bigger than maximum order_number!" });
        } else {
            if (current_position > new_position) {
                // all columns between new_p and curr_p - 1 -> order_number += 1
                const columnsBetween = await pool.query('select * from columns where order_number between $1 and ($2 - 1)',
                    [new_position, current_position]);

                await asyncForEach(columnsBetween.rows, async (row) => {
                    const updateColumns = await pool.query('update columns set order_number = $2 where id_column = $1',
                        [row.id_column, row.order_number + 1]);
                });
            } else if (current_position < new_position) {
                // all columns between curr_p + 1 and new_p -> order_number -= 1
                const columnsBetween = await pool.query('select * from columns where order_number between ($1 + 1) and $2',
                    [current_position, new_position]);

                await asyncForEach(columnsBetween.rows, async (row) => {
                    const updateColumns = await pool.query('update columns set order_number = $2 where id_column = $1',
                        [row.id_column, row.order_number - 1]);
                });
            }

            const results = await pool.query('UPDATE columns SET order_number = $2 WHERE id_column = $1', [id_column, new_position]);
            res.status(200).json(results.rows);
        }
    } catch (error) {
        console.log(error.message);
        next(error);
    }
}

async function getAllTasksOfColumn(req, res, next) {
    console.log('List of all tasks of column');

    const id_column = req.params.id;

    try {
        const results = await pool.query('SELECT * FROM tasks WHERE id_column = $1', [id_column]);

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
