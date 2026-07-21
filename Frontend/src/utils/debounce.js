export function debounce(fn, delay = 300) {
    let timerId;

    return function (...args) {
        clearTimeout(timerId);

        timerId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}
