const pool = require('../mysql').pool;

function query(sql, values = []) {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, resultado) => {
            if (error) {
                return reject(error);
            }

            resolve(resultado);
        });
    });
}

module.exports = { query };
