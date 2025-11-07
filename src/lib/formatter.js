const getInitials = (fullName) => {
    if (!fullName) return "";
    const names = fullName.split(" ");
    if (names.length === 0) return "";
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
        names[0].charAt(0).toUpperCase() +
        names[names.length - 1].charAt(0).toUpperCase()
    );
};

const formatName = (name) => {
    if (!name) return "";
    name = name.trim().replace(/\s+/g, ' ');
    return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

const formatPrice = (price) => {
    if (typeof price !== "number") {
        try {
            price = parseFloat(price);
        } catch (error) {
            console.error(error);
            return "";
        }
    }
    return price.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
    });
};

const formatHours = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}${minutes === "00" ? "" : `:${minutes}`} ${period}`;
};

const formatDistance = (distance) => {
    if (distance < 10) return 0;
    if (distance < 1000) {
        return `${distance.toFixed(1)} m`;
    } else {
        return `${(distance / 1000).toFixed(1)} km`;
    }
}

const getDiscountPercentage = (originalPrice, salePrice) => {
    console.log("Calculating discount percentage for:", originalPrice, salePrice);
    if (salePrice < originalPrice) {
        // move to float
        originalPrice = parseFloat(originalPrice);
        salePrice = parseFloat(salePrice);
        if (typeof originalPrice !== "number" || typeof salePrice !== "number") {
            console.error("Invalid price values for discount calculation");
            return null;
        }
        if (originalPrice <= 0) {
            console.error("Original price must be greater than zero");
            return null;
        }
        if (salePrice < 0) {
            console.error("Sale price must be non-negative");
            return null;
        }
        const discount = ((originalPrice - salePrice) / originalPrice) * 100;
        return discount.toFixed(0);
    };
    console.error("Sale price must be less than original price for discount calculation");
    return null;
}


const formatTimeAgo = (date) => {
    if (!date) return "";

    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffYears > 0) {
        return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    } else if (diffMonths > 0) {
        return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMins > 0) {
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else {
        return 'just now';
    }
};

const formatTimeLeft = (date) => {
    if (!date) return "";

    const d = new Date(date);
    const now = new Date();
    const diffMs = d - now;

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffYears > 0) {
        return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} left`;
    } else if (diffMonths > 0) {
        return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} left`;
    } else if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`;
    } else if (diffHours > 0) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} left`;
    } else if (diffMins > 0) {
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} left`;
    } else {
        return 'Expired';
    }
}
const formatString = (str) => {
    if (!str) return "";
    return str
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export {
    getInitials,
    formatPrice,
    formatHours,
    formatDistance,
    getDiscountPercentage,
    formatTimeAgo,
    formatTimeLeft,
    formatString,
    formatName
}