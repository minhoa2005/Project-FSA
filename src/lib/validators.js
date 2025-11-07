import commonValidator from "./commonValidator";

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        return 'Email is required';
    }
    if (email.length > 254) {
        return 'Email must not exceed 254 characters';
    }
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return '';
};


export const validatePassword = (password) => {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
        return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    return '';
};

export const validateFullName = (fullName) => {
    // if (![...fullName].every((char) => /^[\p{L}\s]+$/u.test(char))) {
    //     return 'Full name must contain only letters';
    // }
    fullName = fullName.trim().replace(/\s+/g, ' ');
    if (!fullName) {
        return 'Full name is required';
    }
    if (!/^[\p{L}\s]+$/u.test(fullName)) {
        return 'Full name must contain only letters and spaces';
    }
    const validatedLength = commonValidator.validateStringLengthRange(fullName, 2, 50);
    if (!validatedLength) {
        return 'Full name must be at least 2 characters long and not exceed 50 characters';
    }
    return '';
};

export const validatePhone = (phone) => {
    const phoneRegex = /^(0)\d{9}$/;
    if (!phone) {
        return 'Phone number is required';
    }
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        return 'Please enter a valid phone number (10-11 digits)';
    }
    return '';
};


export const validateDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) {
        return '';
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 13) {
        return 'You must be at least 13 years old';
    }
    if (age > 120) {
        return 'Please enter a valid date of birth';
    }

    return '';
};


export const validateRegisterForm = (formData) => {
    const errors = {};

    errors.fullName = validateFullName(formData.full_name);
    errors.email = validateEmail(formData.email);
    errors.password = validatePassword(formData.password);
    errors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
    errors.phone = validatePhone(formData.phone);
    errors.dateOfBirth = validateDateOfBirth(formData.date_of_birth);


    Object.keys(errors).forEach(key => {
        if (!errors[key]) {
            delete errors[key];
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};


export const validateLoginForm = (formData) => {
    const errors = {};

    errors.email = validateEmail(formData.email);
    errors.password = validatePassword(formData.password);


    Object.keys(errors).forEach(key => {
        if (!errors[key]) {
            delete errors[key];
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};