const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');

// Middleware for flash messages
const flashMiddleware = (req, res, next) => {
    res.locals.flashMessage = req.flash('messages');
    next();
};

// Apply flash middleware to all routes in inventoryRoute.js
router.use(flashMiddleware);

// Vehicle Routes

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// ** New route to handle vehicle detail requests by invId **
router.get("/detail/:invId", invController.getVehicleDetails);
router.get('/trigger-error', invController.triggerServerError); // Route to trigger a server error

router.get('/add-vehicle', utilities.handleErrors(invController.renderAddVehicleForm));// GET route for rendering the add vehicle form


router.post('/add-vehicle', //process the vehicle data
    regValidate.vehicleRules(),
    regValidate.checkVehicleData,
    utilities.handleErrors(invController.addVehicle));  // POST route for adding a vehicle


router.post('/add-vehicle', utilities.handleErrors(invController.addVehicle));


router.get('/', utilities.handleErrors(invController.managementView));  // Route to render inventory management view
router.get('/add-classification', async (req, res) => {
    // Fetch or build the navigation
    const nav = await utilities.getNav(req, res); // Pass req and res if needed
    res.render('inventory/add-classification', {
        nav,
        title: 'Add Classification',
    });
});

// Export the router
module.exports = router;
