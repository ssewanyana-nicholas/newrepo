const express = require("express");
const router = express.Router();
const accountsController = require('../controllers/accountsController');
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');

// Route to deliver login view
router.get("/login", utilities.handleErrors(accountsController.buildLogin)); // Accessed via /account/login
router.get('/logout', accountsController.logout);

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

// Process the login route
router.post(
    "/login",
    regValidate.loginRules(),          // Validate login data
    regValidate.checkLoginData,        // Check for validation errors
    utilities.handleErrors(accountsController.accountLogin)     // Handle login logic
);

router.get('/',
    utilities.checkLogin,
    accountsController.accountManagementView);

// GET route to deliver the account update view
router.get('/update/:account_id',
    utilities.handleErrors(accountsController.getAccountUpdateView));

// POST route to process account updates
router.post('/update/:account_id',
    regValidate.validateUpdate,
    utilities.handleErrors(accountsController.processAccountUpdate));

// POST route to process password updates
router.post('/update-password',
    regValidate.validatePassword,
    utilities.handleErrors(accountsController.processPasswordUpdate));


// Route to show the account deletion confirmation page
router.get('/delete/:account_id', utilities.handleErrors(accountsController.getAccountDeleteView));

// Route to handle account deletion
router.post('/delete/:account_id', utilities.handleErrors(accountsController.processAccountDeletion,
    accountsController.logout
));



module.exports = router;

