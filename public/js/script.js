// public/js/scripts.js

// Toggle password visibility
const passwordInput = document.getElementById('account_password');
const togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('change', function () {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
});

// Prevent spaces in the input field
function preventSpaces(event) {
    const input = event.target;
    input.value = input.value.replace(/\s+/g, ''); // Remove spaces
}

// Validate the form before submission
function validateForm() {
    const classificationNameInput = document.getElementById('classification_name');
    const classificationName = classificationNameInput.value.trim();

    // Check for non-alphabetic characters
    const isValid = /^[A-Za-z]+$/.test(classificationName);

    if (!isValid) {
        alert('Classification name must be alphabetic characters only.');
        classificationNameInput.focus();
        return false; // Prevent form submission
    }

    return true; // Allow form submission
}