const Environment = require('jest-environment-jsdom');
const { TextEncoder, TextDecoder } = require('util');
const FormData = require('form-data');

// TextEncoder and TextDecoder are not implemented by JS-DOM, so we augment the test environment here
// see jest issue #10431: https://github.com/facebook/jest/issues/10431
module.exports = class CustomTestEnvironment extends Environment {
    async setup() {
        await super.setup();
        if (typeof this.global.TextEncoder === 'undefined') {
            this.global.TextEncoder = TextEncoder;
        }
        if (typeof this.global.TextDecoder === 'undefined') {
            this.global.TextDecoder = TextDecoder;
        }
        this.global.FormData = FormData;
    }
}
