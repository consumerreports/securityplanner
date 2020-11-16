const mock = jest.fn(() => {
    return {
        replaceDOMLinksWithRoutes: jest.fn(value => null),
    }
});

export default mock;