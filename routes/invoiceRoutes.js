
const express = require('express');
const router = new express.Router();
const controller = require('../routeControllers/invoiceRouteController');


router.post('/shop',controller.addShop);
router.post('/invoice',controller.addInvoice);
router.put('/invoice/:id/:paid',controller.updatePaid);
router.get('/total/:shop_id/:item_name',controller.totalSell);


module.exports = router;



