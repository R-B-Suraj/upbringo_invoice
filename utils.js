const {mysqlConnection} = require('./configDB');
// defining query promise to do mysql queries synchronously wherever needed
let queryPromise = (q) =>{
    return new Promise((resolve, reject)=>{
        mysqlConnection.query(q,  (error, rows)=>{
            if(error){
                return reject(error);
            }
            return resolve(rows);
        });
    });
};

module.exports =  queryPromise;