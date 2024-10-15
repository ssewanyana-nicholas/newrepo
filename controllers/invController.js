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
    console.log("Management view accessed");
    try {
        const inventoryData = await invModel.getAllInventory(); // Fetch inventory data
        const classifications = await Classification.findAllClassifications; // Fetch classifications
        const nav = await utilities.getNav(); // Fetch navigation links
        const messages = req.flash('notice'); // Retrieve flash message

        // Render the management view template
        res.render('inventory/management', {
            title: "Inventory Management",
            inventoryData, // Pass inventory data to the view
            classifications, // Pass classification data to the view
            nav, // Pass navigation bar data to the view
            messages // Pass flash message to the view
        });
    } catch (error) {
        next(error); // Pass error to the error handler
    }
};
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

        // Validate required fields
        if (!inv_make || !inv_model || !inv_year || !inv_price || !inv_miles || !inv_color || !classificationId) {
            req.flash('message', 'Please fill in all required fields.');
            return res.redirect('/inv/add-vehicle');
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
        res.redirect('/inv/add-vehicle');
    } catch (error) {
        console.error(error);
        req.flash('error_notice', 'Failed to add vehicle.');
        res.redirect('/inv/add-vehicle');
    }
};
module.exports = invCont;
