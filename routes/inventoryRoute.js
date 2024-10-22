const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');
const validate = require("../utilities/account-validation");

// Middleware for flash messages
const flashMiddleware = (req, res, next) => {
    res.locals.flashMessage = req.flash('messages');
    next();
};

// Apply flash middleware to all routes in inventoryRoute.js
router.use(flashMiddleware);

// Vehicle Routes

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:invId", utilities.handleErrors(invController.getVehicleDetails));
router.get('/trigger-error', invController.triggerServerError); // Route to trigger a server error

router.get('/add-vehicle',
    utilities.checkJWTToken,
    utilities.checkLogin,
    invController.verifyEmployeeOrAdmin,
    utilities.handleErrors(invController.renderAddVehicleForm)
); // GET route for rendering the add vehicle form

router.post("/add-vehicle",
    utilities.checkJWTToken,
    utilities.checkLogin,
    invController.verifyEmployeeOrAdmin,
    regValidate.vehicleRules(), // Validation rules
    validate.checkVehicleData, // Handle validation results
    utilities.handleErrors(invController.addVehicle) // Add vehicle
); // POST route for adding a vehicle

router.get('/',
    utilities.checkJWTToken,
    utilities.checkLogin,
    invController.verifyEmployeeOrAdmin,
    utilities.handleErrors(invController.managementView)
); // Route to render inventory management view

router.get('/add-classification',
    utilities.checkJWTToken,
    utilities.checkLogin,
    invController.verifyEmployeeOrAdmin,
    async (req, res) => {
        try {
            const nav = await utilities.getNav(req, res);
            res.render('inventory/add-classification', {
                nav,
                title: 'Add Classification',
            });
        } catch (error) {
            console.error('Error fetching navigation:', error);
            req.flash('notice', 'Failed to load navigation. Please try again.');
            res.redirect('/');
        }
    }
);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

router.get('/edit/:invId',
    utilities.checkJWTToken,
    utilities.checkLogin,
    invController.verifyEmployeeOrAdmin,
    utilities.handleErrors(invController.editInventoryView)
);

router.post("/update/",
    utilities.checkJWTToken,
    utilities.checkLogin,
    invController.verifyEmployeeOrAdmin,
    regValidate.vehicleRules(),
    validate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);

router.get('/delete/:invId',
    utilities.checkJWTToken,
    utilities.checkLogin,
    invController.verifyEmployeeOrAdmin,
    utilities.handleErrors(invController.deleteConfirmationView)
);

router.post('/delete/',
    utilities.checkJWTToken,
    utilities.checkLogin,
    invController.verifyEmployeeOrAdmin,
    utilities.handleErrors(invController.deleteInventory)
);

// Export the router
module.exports = router;
