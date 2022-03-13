const mysql = require('mysql');

let mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Kanha@2001',
    database: 'upbringo',
    multipleStatements: true,
    insecureAuth:true

});

mysqlConnection.connect((err)=>{
    if(!err)
        console.log('connected');
    else 
        console.log('connection failed ! ');
})

module.exports = {
    mysqlConnection
}