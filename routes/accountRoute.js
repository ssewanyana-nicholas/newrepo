const express = require("express");
const router = express.Router();
const accountsController = require('../controllers/accountsController');
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');

// Route to deliver login view
router.get("/login", utilities.handleErrors(accountsController.buildLogin)); // Accessed via /account/login

// Route to deliver register view
router.get("/register", utilities.handleErrors(accountsController.buildRegister)); // Accessed via /account/register

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountsController.registerAccount)
)

// Route to process the registration form with error handling
router.post('/register', utilities.handleErrors(accountsController.registerAccount));

module.exports = router;

