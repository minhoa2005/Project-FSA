import commonValidator from "./commonValidator";

export const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        return 'Email không được để trống';
    }
    if (email.length > 254) {
        return 'Email không được vượt quá 254 ký tự';
    }
    if (!emailRegex.test(email)) {
        return 'Vui lòng nhập địa chỉ email hợp lệ ';
    }
    return '';
};


export const validatePassword = (password: string) => {
    if (!password) {
        return 'Cần có mật khẩu';
    }
    if (password.length < 8) {
        return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    return '';
};

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (!confirmPassword) {
        return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    return '';
};

export const validateFullName = (fullName: string) => {
    // if (![...fullName].every((char) => /^[\p{L}\s]+$/u.test(char))) {
    //     return 'Full name must contain only letters';
    // }
    fullName = fullName.trim().replace(/\s+/g, ' ');
    if (!fullName) {
        return 'Cần có họ và tên';
    }
    if (!/^[\p{L}\s]+$/u.test(fullName)) {
        return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
    }
    const validatedLength = commonValidator.validateStringLengthRange(fullName, 2, 50);
    if (!validatedLength) {
        return 'Họ và tên phải có ít nhất 2 ký tự và không vượt quá 50 ký tự';
    }
    return '';
};

export const validatePhone = (phone: string) => {
    const phoneRegex = /^(0)\d{9}$/;
    if (!phone) {
        return 'Phone number is required';
    }
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        return 'Please enter a valid phone number (10-11 digits)';
    }
    return '';
};


export const validateDateOfBirth = (dateOfBirth: string) => {
    if (!dateOfBirth) {
        return '';
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 18) {
        return 'You must be at least 18 years old';
    }
    if (age > 120) {
        return 'Please enter a valid date of birth';
    }

    return '';
};


export const validateRegisterForm = (formData: any) => {
    const errors: {
        fullName?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        phone?: string;
        dateOfBirth?: string;
    } = {};

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


export const validateLoginForm = (formData: any) => {
    const errors: {
        email?: string;
        password?: string;
    } = {};

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