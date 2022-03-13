const {mysqlConnection} = require('../configDB');
const queryPromise = require('../utils');

// one way of inserting data, CALL storedProcedure shopAdd is defined in mysql database
const addShop = async (req,res)=>{
    let shop = req.body;
    let sql = "SET @shop_name = ?; SET @address = ?; SET @mobile = ?; SET @email = ?; \
    CALL shopAdd(@shop_name,@address,@mobile,@email);";
     mysqlConnection.query(sql,[shop.shop_name, shop.address, shop.mobile, shop.email],(err,rows,fields)=>{
        if(!err)
            rows.forEach(element=>{
                if(element.constructor == Array)
                  res.send('last added shop_details id  '+element[0].id);
            })
        else 
            return res.status(400).send(err);
    }) 
}





//  inserting invoice
const addInvoice = async (req,res)=>{

    let invoice = req.body;
    let itemIds = [];
    let invoice_id,result, total =0.0;
    
    try{
        // check if shop exists
        let checkShop = `SELECT count(_id) AS count FROM shop_details where _id = ${invoice.shop_id};`;
        result = await queryPromise(checkShop);
        if(result[0].count == 0)
            return res.status(400).send(`no shop with shop id ${invoice.shop_id} exists`);
            

        // check if each item exists , if exsits add to invoice 
       
        for(let i=0; i<invoice.items.length; i++){
            let item = invoice.items[i];
            exist = 1;
            let findId = `SELECT _id  FROM items WHERE item_name = '${item.item_name}';`
            result = await queryPromise(findId);
            
            // if item doesn't exist insert it
            if(!result[0]){
                let insertItem = `INSERT INTO items(item_name,price,discount,gst) VALUES('${item.item_name}',${item.price},${item.discount/100},${item.gst/100}); SELECT last_insert_id() AS _id; ` ;
                let idresult = await queryPromise(insertItem);
                itemIds.push({_id:idresult[1][0]._id, quantity: item.quantity});

            }else{
                let checkSame = `SELECT * FROM items WHERE item_name='${item.item_name}' AND price=${item.price} AND discount=${item.discount/100} AND gst=${item.gst/100}; ` ;
                let isSame = await queryPromise(checkSame);
                // if item name exists check whether already stored item same as current item (discount,gst might have changed )
                if(!isSame[0])
                    return res.status(400).send({error:'item name already exists , try a difference item_name specific to its properties',item});
                else
                    itemIds.push({_id: isSame[0]._id, quantity: item.quantity});
             }                
            
             total = total + item.quantity*item.price*(1 + item.gst/100 - item.discount/100);
        }
      

        // add invoices
        let insertInvoice = `INSERT INTO invoices(buyer_name,shop_id,mobile,date_time,paid,total) VALUES('${invoice.buyer_name}', ${invoice.shop_id}, '${invoice.mobile}', '${invoice.datetime}',${invoice.paid}, ${total}); SELECT last_insert_id() AS _id  ; `;
        let invoiceResult = await queryPromise(insertInvoice);
        invoice_id = invoiceResult[1][0]._id;
       
        // update the junction table item_invoice for each of the item
        itemIds.forEach(item =>{
            let item_invoice = `INSERT INTO item_invoice(item_id,invoice_id,quantity) VALUES (${item._id},${invoice_id},${item.quantity});`;
            queryPromise(item_invoice);
        })

        return res.send('invoice added successfully with id '+invoice_id);

    }catch(e){
        console.log(e);
        return res.status(400).send(e);
    }

    
}




// update status of invoice  whether paid
const updatePaid = async (req,res)=>{
    let sql = `UPDATE invoices SET paid=${req.params.paid} WHERE _id = ${req.params.id};`;
    
    mysqlConnection.query(sql,(err,rows,fields)=>{
        if(!err)
            res.send('updated successfully');
        else 
            res.status(400).send(err);
    }) 
}




// total sell of item for a shop 
const totalSell = async(req,res)=>{
    let total= `SELECT sum(total) AS total
    FROM (invoices
       JOIN item_invoice
    ON invoices._id = item_invoice.invoice_id)
       JOIN items
    ON item_invoice.item_id= items._id
    WHERE invoices.shop_id = ${req.params.shop_id} AND items.item_name = '${req.params.item_name}';`

    try{
        let result = await queryPromise(total);
        if(result[0].total)
            res.send({item:req.params.item_name, total:result[0].total});
        else 
            res.send({item:req.params.item_name, total:0});
            
    }catch(e){
        res.status(400).send(e);
    }
    
}







module.exports = {
    addShop,
    addInvoice,
    updatePaid,
    totalSell

}