import { validateEmail, validatePassword } from "../validators";

export const validateLoginForm = (formData) => {
    const errors = {};

    const validatedEmail = validateEmail(formData.email);
    const validatedPassword = validatePassword(formData.password);

    if (validatedEmail) {
        errors.email = validatedEmail;
    }

    if (validatedPassword) {
        errors.password = validatedPassword;
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0,
    };
};
