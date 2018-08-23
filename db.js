var { pool }  = require('./mysql_config');

function login (phone){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err,connection){
            if(err){
                reject(err);
                return;
            }
            let sql = 'SELECT * FROM userList WHERE phone='+phone
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
module.exports = {
    login
}