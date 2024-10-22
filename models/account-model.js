const pool = require('../database'); // This is my databases 

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

// Function to get account information based on account_id
async function getAccountById(account_id) {
  try {
      const result = await pool.query(
          'SELECT * FROM account WHERE account_id = $1',
          [account_id]
      );
      return result.rows[0];  // Return the first row, which contains the account data
  } catch (error) {
      console.error('Error fetching account by ID:', error);
      throw error;  // Throw error to be handled by the calling function
  }
}

// Function to update account information
async function updateAccount(account_id, firstname, lastname, email) {
  try {
    const result = await pool.query(
      `UPDATE account 
      SET account_firstname = $1, account_lastname = $2, account_email = $3 
      WHERE account_id = $4 RETURNING *`,
      [firstname, lastname, email, account_id]
    );
    return result.rowCount; // Returns 1 if successful
  } catch (error) {
    throw new Error('Error updating account information');
  }
}

// Function to update account password
async function updatePassword(account_id, hashedPassword) {
  try {
    const result = await pool.query(
      `UPDATE account 
      SET account_password = $1 
      WHERE account_id = $2 RETURNING *`,
      [hashedPassword, account_id]
    );
    return result.rowCount; // Returns 1 if successful
  } catch (error) {
    throw new Error('Error updating account password');
  }
}


module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updatePassword,
  updateAccount
};