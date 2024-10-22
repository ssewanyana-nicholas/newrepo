const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const Classification = require('../models/classification-model');

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = req.params.classificationId;
        const data = await invModel.getInventoryByClassificationId(classification_id);
        const grid = await utilities.buildClassificationGrid(data);
        let nav = await utilities.getNav();
        const className = data[0].classification_name;
        res.render("./inventory/classification", {
            title: className + " vehicles",
            nav,
            grid,
        });
    } catch (error) {
        next(error); // Pass error to the error handler
    }
};

/* ***************************
 *  Get vehicle details by inventory ID
 * ************************** */
invCont.getVehicleDetails = async function (req, res, next) {
    try {
        const invId = req.params.invId; // Get the vehicle ID from the request parameters
        const vehicleData = await invModel.getVehicleById(invId); // Fetch vehicle details from the model
        const nav = await utilities.getNav(); // Fetch the navigation links

        if (vehicleData) {
            // Build the HTML for vehicle details (you can add this as a utility method if needed)
            const vehicleDetailHTML = await utilities.buildVehicleDetailView(vehicleData);

            // Render the vehicle detail view, passing in the vehicle data
            res.render("inventory/vehicle-detail", {
                title: `${vehicleData.inv_make} ${vehicleData.inv_model}`, // Set the title
                vehicleDetailHTML,  // Pass the detailed HTML for vehicle
                nav
            });
        } else {
            // If no vehicle data is found, render a 404 error
            res.status(404).render('errors/error', {
                title: "Vehicle Not Found",
                message: "Sorry, that vehicle could not be found.",
                nav
            });
        }
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
};

invCont.triggerServerError = async function (req, res, next) {
    try {
        throw new Error("This is a simulated server error"); // Simulating a server crash
    } catch (error) {
        next(error); // Pass error to the error-handling middleware
    }
};

invCont.managementView = async (req, res, next) => {
    try {
        const inventoryData = await invModel.getAllInventory(); // Fetch inventory data
        const classifications = await Classification.findAllClassifications(); // Fetch classification data
        const classificationSelect = await utilities.buildClassificationList(); // Build the dropdown
        const nav = await utilities.getNav(); // Fetch navigation links

        // Render the management view template
        res.render('inventory/management', {
            title: "Vehicle Management",
            inventoryData, // Pass inventory data to the view
            nav, // Pass navigation bar data to the view
            errors: null, // Pass flash message to the view
            classificationSelect, // Pass dropdown for classifications
            classifications // Pass raw classification data if needed in the view
        });
    } catch (error) {
        next(error); // Handle any potential errors
    }
}
/* ***************************
// Render the add classification form
*************************** */
invCont.renderAddClassificationForm = (req, res, next) => {
    try {

        // Build the add classification form HTML using the utility function
        const view = utilities.buildAddClassificationView();

        res.render('inventory/add-classification', {
            title: "Add Classification",
            view, // Pass the built view to the template
            messages // Pass flash message to the view
        });
    } catch (error) {
        next(error); // Pass error to the error handler
    }
};

/* ***************************
// Handle adding a new classification
*************************** */
invCont.addClassification = async (req, res, next) => {
    const { classification_name } = req.body; // Get classification name from the request body

    // Basic validation
    if (!classification_name || /\s/.test(classification_name) || /[^\w]/.test(classification_name)) {
        req.flash("notice", "Classification name cannot contain spaces or special characters.");
        return res.redirect("/inv/add-classification"); // Redirect if validation fails
    }

    try {
        await invModel.addClassification(classification_name); // Call the model method to add classification
        req.flash("notice", "Classification added successfully!"); // Set success message
        res.redirect("/inv"); // Redirect to inventory management page
    } catch (error) {
        next(error); // Pass error to the error handler
    }
};

// Function to render the add vehicle form
invCont.renderAddVehicleForm = async (req, res, next) => {
    try {
        // Assuming you have a function to get navigation
        const nav = await utilities.getNav();

        // Fetch classifications from the database using the class method
        const classifications = await Classification.findAllClassifications();

        const classificationSelect = await utilities.buildClassificationList();

        // Fetch flash messages (ensure they're arrays)
        const messages = Array.isArray(req.flash('notice')) ? req.flash('notice') : [];
        const errorMessages = Array.isArray(req.flash('error_notice')) ? req.flash('error_notice') : [];

        // Combine all messages into an array
        const allMessages = [...messages, ...errorMessages];
        console.log('Messages:', allMessages); // This will log the combined messages
        // Render the form with classifications, messages, and nav
        res.render("inventory/add-inventory", {
            title: "Add a New Vehicle",
            classifications,
            classificationSelect,
            messages: allMessages,  // Pass the messages as an array
            nav,  // Pass the navigation to the view
        });
    } catch (error) {
        console.error(error);
        req.flash('error_notice', 'Something went wrong. Please try again.');
        res.redirect("/error-page");
    }
};
invCont.addVehicle = async (req, res, next) => {
    try {
        const {
            classificationId, // Ensure this is provided
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        } = req.body;

        // Validate required fields (consider moving this to a separate validation function)
        if (!inv_make || !inv_model || !inv_year || !inv_price || !inv_miles || !inv_color || !classificationId) {
            req.flash('error_notice', 'Please fill in all required fields.');
            return res.redirect('/inv/add-vehicle'); // Redirect back to form
        }

        // Create new vehicle object
        const newVehicle = {
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classificationId, // Include classificationId
        };

        // Call the model function to insert the vehicle
        await invModel.addVehicle(newVehicle);

        req.flash('notice', 'Vehicle added successfully!');
        res.redirect('/inv'); // Redirect to the inventory list or details page after success
    } catch (error) {
        console.error('Error adding vehicle:', error); // More informative logging
        req.flash('error_notice', 'Failed to add vehicle. Please try again.'); // User-friendly error message
        next(error);  // Pass the error to Express for centralized error handling
    }
};


/* ***************************
*  Return Inventory by Classification As JSON
* ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
    const inv_id = parseInt(req.params.invId);
    let nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);

    // If no vehicle is found, handle this case
    if (!itemData) {
        req.flash("error", "Vehicle not found");
        return res.redirect("/inv");
    }

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null, // Pass form validation errors, if any
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
    });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body
    const updateResult = await invModel.updateInventory(
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    )

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("notice", `The ${itemName} was successfully updated.`)
        res.redirect("/inv/")
    } else {
        const classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("notice", "Sorry, the insert failed.")
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
    }
}

/* ***************************
 *  Build delete Confirmation view
 * ************************** */
invCont.deleteConfirmationView = async function (req, res, next) {
    const inv_id = parseInt(req.params.invId);
    let nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);

    // If no vehicle is found, handle this case
    if (!itemData) {
        req.flash("error", "Vehicle not found");
        return res.redirect("/inv");
    }

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null, // Pass form validation errors, if any
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
    });
};

/* ***************************
 *  delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const inv_id = parseInt(req.body.inv_id)
    const deleteResult = await invModel.deleteInventoryItem(inv_id)

    if (deleteResult) {
        req.flash("notice", `The item was successfully deleted.`)
        res.redirect("/inv/")
    } else {
        req.flash("notice", "Sorry, the insert failed.")
        res.redirect("inv/delete/inv_id")
    }

}

const db = require('../database'); // Adjust this to your actual database connection file

invCont.verifyEmployeeOrAdmin = async (req, res, next) => {
    if (res.locals.accountData) {
        const accountId = res.locals.accountData.account_id; // Get the accountId from the token data

        try {
            // Query the database to get the user's role (account_type)
            const result = await db.query('SELECT account_type FROM account WHERE account_id = $1', [accountId]);

            if (result.rows.length > 0) {
                const userRole = result.rows[0].account_type;

                // Check if the user is an Employee or Admin
                if (userRole === "Employee" || userRole === "Admin") {
                    return next(); // User is authorized, proceed to the next middleware or route handler
                } else {
                    // If the user is not an Employee or Admin
                    req.flash('notice', 'You do not have permission to access this page.');
                    return res.redirect('/'); // Redirect to the login page with a message
                }
            } else {
                req.flash('notice', 'Account not found.');
                return res.redirect('/account/login');
            }
        } catch (error) {
            console.error('Error fetching user role from database:', error);
            req.flash('notice', 'An error occurred. Please try again.');
            return res.redirect('/');
        }
    } else {
        // If there's no token data, the user isn't logged in
        req.flash('notice', 'Please log in to access this page.');
        return res.redirect('/account/login');
    }
};



module.exports = invCont;
