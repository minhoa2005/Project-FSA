export const validateChangePasswordForm = (formData) => {
    const errors = {};

    if (!formData.current_password) {
        errors.current_password = 'Current password is required';
    }

    if (!formData.new_password) {
        errors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
        errors.new_password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
    } else if (formData.new_password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
