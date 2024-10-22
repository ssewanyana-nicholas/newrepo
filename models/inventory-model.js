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

async function getClassifications() {
  try {
    // Query to get classifications from the "classification" table
    const result = await pool.query('SELECT classification_id, classification_name FROM public.classification ORDER BY classification_name');

    // Return the rows (classifications) if the query is successful
    return result.rows;
  } catch (error) {
    // Handle any database errors
    console.error('Error fetching classifications:', error);
    throw new Error('Database query failed');
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

module.exports = {
  getInventoryByClassificationId,
  getVehicleById,
  getAllInventory,
  addVehicle,
  getClassifications,
  updateInventory, 
  deleteInventoryItem
};