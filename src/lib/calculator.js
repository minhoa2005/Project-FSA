const calculateDeliveryFee = (distance, storeSettings) => {
    const { shipping_per_km_fee, minimum_shipping_fee, shipping_distance_limit } = storeSettings;
    if (distance <= shipping_distance_limit) {
        return minimum_shipping_fee;
    }
    const extraDistance = distance - shipping_distance_limit;
    const extraFee = extraDistance * shipping_per_km_fee;
    return minimum_shipping_fee + extraFee;
}


export {
    calculateDeliveryFee,
}
