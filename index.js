
const express = require('express');
const bodyParser = require('body-parser');
const invoiceRouter = require('./routes/invoiceRoutes');


const app = express();
app.use(bodyParser.json());

app.use('/',invoiceRouter);


app.listen(3000, ()=>console.log('express server is running at port 3000'));



