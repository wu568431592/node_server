var mysql  = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 50,
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'forever',
    multipleStatements : true  //是否允许执行多条sql语句
});

module.exports = {
    pool
}