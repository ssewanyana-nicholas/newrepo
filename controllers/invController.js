const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

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

module.exports = invCont;
