export const validateProfileForm = (formData) => {
    const errors = {};

    if (!formData.full_name) {
        errors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2) {
        errors.full_name = 'Full name must be at least 2 characters';
    } else if (formData.full_name.length > 100) {
        errors.full_name = 'Full name must not exceed 100 characters';
    }

    if (formData.date_of_birth) {
        const dob = new Date(formData.date_of_birth);
        if (isNaN(dob.getTime())) {
            errors.date_of_birth = 'Invalid date format';
        } else if (dob > new Date()) {
            errors.date_of_birth = 'Date of birth cannot be in the future';
        }
    }

    if (formData.gender && !['male', 'female', 'other'].includes(formData.gender)) {
        errors.gender = 'Invalid gender selection';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };


};
