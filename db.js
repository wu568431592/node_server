var { pool }  = require('./mysql_config');

function login (phone){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            const sql = 'SELECT * FROM userList WHERE phone=' + phone
            connection.query( sql , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve(res);
            });
        });
    })
}

function insertMemorialDay(payload){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            const sql = 'INSERT INTO memorialDayList (user_phone, memorial_day_name, memorial_day_time) VALUES (?,?,?)'
            const sqlparams = [payload.phone,payload.name,payload.time]
            connection.query( sql,sqlparams, function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    connection.rollback();
                    return;
                }
                resolve(res);
            });
        });
    })
}

function updateMemorialDay(payload){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            const sql = 'UPDATE memorialDayList SET memorial_day_time=?,memorial_day_name=? WHERE id=?'
            const sqlparams = [payload.time,payload.name,payload.id]
            connection.query( sql, sqlparams, function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    connection.rollback();
                    return;
                }
                resolve(res);
            });
        });
    })
}

function getMemorialDay(phone){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            const sql = 'SELECT * FROM memorialDayList WHERE user_phone =' + phone
            connection.query( sql , function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    return;
                }
                resolve(res);
            });
        });
    })
}

function deleteMemorialDay(payload){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            const sql = 'DELETE FROM memorialDayList WHERE id=?'
            const sqlparams = [payload.id]
            connection.query( sql,sqlparams, function(error,res){
                connection.release();
                if(error){
                    reject(error);
                    connection.rollback();
                    return;
                }
                resolve(res);
            });
        });
    })
}

module.exports = {
    login,
    insertMemorialDay,
    updateMemorialDay,
    getMemorialDay,
    deleteMemorialDay,
}