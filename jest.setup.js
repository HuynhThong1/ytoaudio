import '@testing-library/jest-dom';

if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

if (typeof global.ResizeObserver === 'undefined') {
    global.ResizeObserver = class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    };
}

// Mock window.URL.createObjectURL
if (typeof window.URL.createObjectURL === 'undefined') {
    window.URL.createObjectURL = jest.fn();
}

// Mock window.URL.revokeObjectURL
if (typeof window.URL.revokeObjectURL === 'undefined') {
    window.URL.revokeObjectURL = jest.fn();
}
