-- CREATING shop_details  table ..........................

CREATE TABLE shop_details (
_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
shop_name VARCHAR(100) NOT NULL,
address TEXT,
mobile VARCHAR(10) NOT NULL,
email VARCHAR(100) NOT NULL
);



-- CREATING items  table ...................................

CREATE TABLE items (
_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
item_name VARCHAR(100) NOT NULL UNIQUE,
price DECIMAL(10,3) NOT NULL,
discount DECIMAL(10,3) DEFAULT 0.0,
gst DECIMAL(10,3) DEFAULT 0.0
);


-- creating invoice table .......................................
-- use DECIMAL instead of FLOAT for value comparisions

CREATE TABLE invoices (
_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
buyer_name VARCHAR(100) NOT NULL,
mobile VARCHAR(10) NOT NULL,
shop_id INT NOT NULL,
date_time DATETIME,
total DECIMAL(10,3) DEFAULT 0,
paid BOOLEAN DEFAULT FALSE,
FOREIGN KEY(shop_id) REFERENCES shop_details(_id) ON DELETE CASCADE
);


-- creating junction table item_invoice ............................

CREATE TABLE item_invoice (
_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
item_id INT NOT NULL,
invoice_id INT NOT NULL,
quantity INT DEFAULT 0,
FOREIGN KEY(item_id) REFERENCES items(_id) ON DELETE CASCADE,
FOREIGN KEY(invoice_id) REFERENCES invoices(_id) ON DELETE CASCADE
);



-- getting total grouped by invoices 

select
item_invoice.invoice_id,
round(sum((item_invoice.quantity*items.price*(1+items.gst - items.discount))),2)
AS total
FROM (item_invoice JOIN items 
ON item_invoice.item_id = items._id)
GROUP BY item_invoice.invoice_id



-- storedProcedure addShop
CREATE DEFINER=`root`@`localhost` PROCEDURE `shopAdd`(
IN _shop_name VARCHAR(100),
IN _address TEXT,
IN _mobile VARCHAR(10),
IN _email VARCHAR(100)
)
BEGIN
	INSERT INTO shop_details(shop_name,address,mobile,email)
    VALUES (_shop_name,_address,_mobile,_email);
    select last_insert_id() AS id;
END