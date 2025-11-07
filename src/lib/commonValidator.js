const commonValidator = {
    validateStringLengthRange: (string, min, max) => {
        if (typeof string !== 'string') return false;
        const length = string.length;
        return length >= min && length <= max;
    },
    validateEachStringLetterCondition: (string, letterCondition = () => { }) => {
        if (typeof string !== 'string') return false;
        for (let i = 0; i < string.length; i++) {
            if (!letterCondition(string[i])) {
                return false;
            }
        }
        return true;
    },
    validateStringContains: (string, substring) => {
        if (typeof string !== 'string' || typeof substring !== 'string') return false;
        return string.includes(substring);
    },
    validateStringRegex: (string, regex) => {
        if (typeof string !== 'string' || !(regex instanceof RegExp)) return false;
        return regex.test(string);
    },
    validateStringEmail: (string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return commonValidator.validateStringRegex(string, emailRegex);
    },
    validateStringUrl: (string) => {
        const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
        return commonValidator.validateStringRegex(string, urlRegex);
    },
    validateStringPhoneNumber: (string) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return commonValidator.validateStringRegex(string, phoneRegex);
    },
    validateStringDate: (string) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return commonValidator.validateStringRegex(string, dateRegex);
    },
    validateStringStartsWith: (string, start) => {
        if (typeof string !== 'string' || typeof start !== 'string') return false;
        return string.startsWith(start);
    },
    validateStringEndsWith: (string, end) => {
        if (typeof string !== 'string' || typeof end !== 'string') return false;
        return string.endsWith(end);
    },
    validateInputIsTypeOf: (input, type) => {
        return typeof input === type;
    },
    validateNumber: (input, max, min) => {
        if (typeof input !== 'number' && typeof input !== 'string') return false;
        const num = parseFloat(input);
        if (isNaN(num)) return false;
        if (max !== undefined && num > max) return false;
        if (min !== undefined && num < min) return false;
        return true;
    },
};

export default commonValidator;