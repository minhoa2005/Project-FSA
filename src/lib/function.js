const debounce = (func, time) => {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, time);
    }
}

export { debounce };