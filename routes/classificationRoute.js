const express = require("express");
const router = express.Router();
const classificationController = require("../controllers/classificationController");
const utilities = require("../utilities/");

// Route to fetch all classifications
router.get("/", async (req, res) => {
    try {
        const classifications = await classificationController.getClassifications(req, res);
        res.render("classification/index", { classifications }); // Render your view file
    } catch (error) {
        res.status(500).send("Error fetching classifications");
    }
});


// POST route to add a new classification
router.post("/add", classificationController.addClassification);


// Route to fetch a specific classification by ID (optional)
router.get("/:classificationId", async (req, res) => {
    const { classificationId } = req.params;
    try {
        const classification = await classificationController.getClassificationById(classificationId);
        res.render("classification/detail", { classification }); // Render detail view
    } catch (error) {
        res.status(500).send("Error fetching classification details");
    }
});

// Export the router
module.exports = router;