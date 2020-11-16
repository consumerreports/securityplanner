const mock = jest.fn().mockImplementation(() => {
    return { 
        language: "en-US",
        get: jest.fn(value => value),
        getLanguage: () => "en-US",
        getArray: jest.fn(value => [ value ]),
        getAssetArray: jest.fn(value => {
            return [{
                link: "http://example.com",
                title: "example asset",
                src: "http://example.com/asset"
            }]
        }),
    }
});

export default mock;