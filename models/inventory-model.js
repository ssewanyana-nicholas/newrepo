const pool = require("../database/")

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error);
  }
}

/* ***************************
 *  Get vehicle details by invId
 * ************************** */
async function getVehicleById(invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory 
      WHERE inv_id = $1`,
      [invId]
    );
    return data.rows[0]; // Return the single vehicle's data
  } catch (error) {
    console.error("getVehicleById error " + error);
  }
}

/* ***************************
 *  Get all inventory items with their classifications
 * ************************** */
async function getAllInventory() {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id`
    );
    return data.rows; // Return all inventory items
  } catch (error) {
    console.error("getAllInventory error: " + error);
    throw error; // Re-throw the error for handling in controller
  }
}

async function addVehicle(newVehicle) {
  try {
    console.log("Inserting vehicle with data:", newVehicle);
    const result = await pool.query(
      `INSERT INTO public.inventory (
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
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        newVehicle.inv_make,
        newVehicle.inv_model,
        newVehicle.inv_year,
        newVehicle.inv_description,
        newVehicle.inv_image,
        newVehicle.inv_thumbnail,
        newVehicle.inv_price,
        newVehicle.inv_miles,
        newVehicle.inv_color,
        newVehicle.classificationId, // Use the correct classification ID here
      ]
    );
    console.log("Insert result:", result);
    return result;
  } catch (error) {
    console.error("Error inserting vehicle:", error);
    throw error;
  }
}


module.exports = {
  getInventoryByClassificationId,
  getVehicleById,
  getAllInventory,
  addVehicle
};