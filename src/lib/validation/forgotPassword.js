export const validateRecoveryRequestForm = (formData) => {
    const errors = {};
    // Email validation
    if (!formData.email) {
        errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0,
    };
}

export const validateResetPasswordForm = (formData) => {
    // Function to validate forgot password form
    // Password validation
    if (!formData.password) {
        errors.password = "Password is required";
    } else if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0,
    };
};

