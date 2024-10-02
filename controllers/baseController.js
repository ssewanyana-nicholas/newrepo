const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  try {
    const nav = await utilities.getNav(); // Fetch navigation items
    res.render("index", { title: "Home", nav }); // Pass nav to the view
  } catch (error) {
    console.error("Error fetching navigation:", error);
    res.render("index", { title: "Home", nav: "<ul><li>Oh no! There was a crash. Maybe try a different route?</li></ul>" }); // Handle error gracefully
  }
}

module.exports = baseController;
