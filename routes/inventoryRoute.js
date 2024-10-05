// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// ** New route to handle vehicle detail requests by invId **
router.get("/detail/:invId", invController.getVehicleDetails);

router.get('/trigger-error', invController.triggerServerError);

module.exports = router;
