import { toast } from "sonner";

/**
 * Handle API errors consistently throughout the application
 * 
 * @param {Error} error - The error caught from API request
 * @param {boolean} showToast - Whether to show a toast notification
 * @returns {Object} Formatted error response
 */
export const handleApiError = (error, showToast = false) => {
    // Get the response data if available
    const responseData = error.response?.data;

    // Determine the error message
    const errorMessage =
        responseData?.message ||
        error.message ||
        "An unexpected error occurred";

    // Create a standardized error response
    const errorResponse = {
        success: false,
        status: error.response?.status || 500,
        message: errorMessage,
        data: null,
        error: responseData || error
    };

    // Show toast notification if requested
    if (showToast) {
        toast.error(errorMessage);
    }

    // Log the error (can be removed in production)
    console.error("API Error:", errorResponse);

    return errorResponse;
};
