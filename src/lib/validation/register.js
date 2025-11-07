import commonValidator from "../commonValidator";
import { validateEmail, validateFullName, validatePassword } from "../validators";

export const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
};

export const validateRegisterForm = (formData) => {
    const errors = {};

    const validatedFullName = validateFullName(formData.full_name);
    const validatedEmail = validateEmail(formData.email);
    const validatedPassword = validatePassword(formData.password);
    const passwordStrength = calculatePasswordStrength(formData.password);
    if (validatedEmail) {
        errors.email = validatedEmail;
    }
    if (validatedPassword) {
        errors.password = validatedPassword;
    }
    if (validatedFullName) {
        errors.full_name = validatedFullName;
    }
    if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
        errors.agreeTerms = "You must agree to the terms and conditions";
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0,
        passwordStrength,
    };
};
