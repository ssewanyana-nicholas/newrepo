const utilities = require("../utilities/");
const accountModel = require('../models/account-model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav(); //
  res.render('account/login', {
    title: 'Login',
    nav,
    errors: null // Pass null errors initially
  });
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav(); // Wait for navigation data
  res.render('account/register', {
    title: 'Register',
    nav,
    errors: null // Pass null errors initially
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash('notice', `Congratulations, you're registered ${account_firstname}. Please log in.`);
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("error_notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
}

// Function to handle account management view
async function accountManagementView(req, res) {
  try {
    // Get navigation links
    let nav = await utilities.getNav();

    // Set default values for errors and flash messages
    const errors = req.errors || [];
    const flash = req.flash('notice');

    // Ensure that account data is available via the JWT middleware
    const accountData = res.locals.accountData;
    const firstName = accountData ? accountData.account_firstname : '';
    const accountType = accountData ? accountData.account_type : '';

    // Set a title for the view
    const title = 'Account Management';

    // Render the account management view with all necessary data
    res.render('account/accountManagement', {
      nav,                // Pass the navigation links
      title,              // Pass the title variable
      flash,              // Pass flash messages
      errors,             // Pass validation errors
      firstName,          // Pass the first name of the account holder
      accountType,        // Pass the account type (Client, Employee, Admin)
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading the account management view.");
  }
}

// Function to deliver the account update view
// accountsController.js
async function getAccountUpdateView(req, res, next) {
  try {
    const account_id = req.params.account_id;  // Extracting the account_id from the URL
    const accountData = await accountModel.getAccountById(account_id);  // Querying account info by ID

    if (!accountData) {
      req.flash('notice', 'Account not found.');
      return res.redirect('/account/');
    }

    // Pass the account data to the view to pre-fill the form
    let nav = await utilities.getNav();

    // Get flash messages
    const flash = req.flash('notice'); // Get flash messages

    res.render('account/updateAccount', {
      title: 'Update Account',
      nav,
      accountData,  // Pass account data to the view
      errors: null,
      account_id,    // Include the account_id for form submission
      flash          // Pass flash messages to the view
    });
  } catch (error) {
    console.error('Error fetching account by ID:', error);
    return next(error);  // Pass the error to the error handler middleware
  }
}

// Function to process account updates
async function processAccountUpdate(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;

  try {
    // Update the account data
    const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

    if (updateResult) {
      req.flash('notice', 'Account information updated successfully.');
      res.redirect('/inv');
    } else {
      throw new Error('Account update failed.');
    }
  } catch (error) {
    req.flash('error_notice', 'An error occurred while updating account information. Please try again.');
    res.redirect('/account/updateAccount');
  }
}

// Function to process password updates
async function processPasswordUpdate(req, res) {
  const { new_password, account_id } = req.body;

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the password in the database
    const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash('notice', 'Password updated successfully.');
      res.redirect('/inventory/manage');
    } else {
      throw new Error('Password update failed.');
    }
  } catch (error) {
    req.flash('error_notice', 'An error occurred while updating the password. Please try again.');
    res.redirect('/account/update');
  }
}


// Logout process
async function logout(req, res) {
  try {
    // Clear the JWT cookie
    res.clearCookie('jwt'); // Assumes the JWT token is stored in a cookie called 'jwt'

    // Flash a success message to inform the user
    req.flash('notice', 'You have been logged out successfully.');

    // Redirect to the home page
    res.redirect('/');
  } catch (error) {
    console.error('Error during logout:', error);

    // Flash an error message in case something goes wrong
    req.flash('error_notice', 'There was a problem logging out. Please try again.');

    // Redirect back to the account management page or home in case of error
    res.redirect('/inventory/manage');
  }
}

async function getAccountDeleteView(req, res, next) { // Added 'next' as parameter
  try {
    const account_id = req.params.account_id; // Extracting the account_id from the URL
    const accountData = await accountModel.getAccountById(account_id); // Querying account info by ID

    if (!accountData) {
      req.flash('notice', 'Account not found.');
      return res.redirect('/account/');
    }

    let nav = await utilities.getNav();
    const flash = req.flash('notice'); // Get flash messages

    res.render('account/accountDelete', {
      title: 'Delete Account',
      nav,
      accountData, // Pass account data to the view for confirmation
      errors: null,
      flash
    });
  } catch (error) {
    console.error('Error fetching account by ID:', error);
    return next(error); // Pass the error to the error handler middleware
  }
}

async function processAccountDeletion(req, res) {
  const account_id = req.params.account_id; // Extracting the account_id from the URL

  try {
    const deleteResult = await accountModel.deleteAccountById(account_id); // Call model function to delete account

    if (deleteResult) {
      req.flash('notice', 'Account deleted successfully.');
      res.redirect('/'); // Redirect to home or appropriate page
    } else {
      throw new Error('Account deletion failed.');
    }
  } catch (error) {
    req.flash('error_notice', 'An error occurred while deleting the account. Please try again.');
    res.redirect(`/account/delete/${account_id}`); // Redirect back to delete confirmation page
  }
}




// Export the controller functions
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount, // Ensure you export the register function
  accountLogin,
  accountManagementView,
  getAccountUpdateView,
  processAccountUpdate,
  processPasswordUpdate,
  logout,
  getAccountDeleteView,
  processAccountDeletion


};