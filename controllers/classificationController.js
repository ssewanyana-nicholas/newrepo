const Classification = require("../models/classification-model");

const classificationController = {
    async getClassifications(req, res) {
        try {
            const classifications = await Classification.findAllClassifications();
            res.render("your-view-file", { classifications });
        } catch (error) {
            res.status(500).send("Error fetching classifications");
        }
    },

    async addClassification(req, res) {
        const classificationName = req.body.classification_name.trim(); // Trim to remove spaces

        try {
            const newClassification = await Classification.addClassification(classificationName);
            // Set flash message for successful addition
            req.flash('message', 'Classification added successfully!');
            // Redirect to the add vehicle form
            res.redirect('/inv/add-vehicle'); // Adjust the path based on your routing setup
        } catch (error) {
            console.error("Error adding classification: ", error);
            req.flash('message', 'Error adding classification. Please try again.');
            // Redirect back to the add classification page or wherever appropriate
            res.redirect('/classification/add');
        }
    }
};

module.exports = classificationController;