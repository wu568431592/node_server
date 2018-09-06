var mysql  = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 30,
    host     : 'tvhcm60x.2302.dnstoo.com',
    user     : 'forever1314_f',
    password : '',
    database : 'forever1314',
    port: 5505,
    multipleStatements : true  //是否允许执行多条sql语句
});

module.exports = {
    pool
}