"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestException = exports.UnprocessableEntityException = exports.NotFoundException = exports.UnauthorizedException = exports.GenericServerException = exports.NoSigningKeyProvidedException = exports.NoApiKeyProvidedException = void 0;
class NoApiKeyProvidedException extends Error {
    constructor() {
        super(...arguments);
        this.status = 500;
        this.name = "NoApiKeyProvidedException";
        this.message = `Missing API key. Pass it to the constructor (new Knock("sk_test_Sz3IQjepeSWaI4cMS4ms4sMuU")) ` +
            `or define it in the KNOCK_API_KEY environment variable.`;
    }
}
exports.NoApiKeyProvidedException = NoApiKeyProvidedException;
class NoSigningKeyProvidedException extends Error {
    constructor() {
        super(...arguments);
        this.status = 500;
        this.name = "NoSigningKeyProvidedException";
        this.message = `Missing or invalid signing key key. Pass it as an option to Knock.signUserToken(userId, {signingKey: "S25vY2sga25vY2sh..."}) ` +
            `or define it in the KNOCK_SIGNING_KEY environment variable. The signing key can either be a Base-64 encoded string ` +
            `or a PEM-encoded certificate. For more information, see https://docs.knock.app/in-app-ui/security-and-authentication#authentication-with-enhanced-security-enabled`;
    }
}
exports.NoSigningKeyProvidedException = NoSigningKeyProvidedException;
class GenericServerException {
    constructor(status, message, requestID) {
        this.status = status;
        this.requestID = requestID;
        this.name = "GenericServerException";
        this.message = "The request could not be completed.";
        if (message) {
            this.message = message;
        }
    }
}
exports.GenericServerException = GenericServerException;
class UnauthorizedException {
    constructor(code, message, requestID) {
        this.code = code;
        this.message = message;
        this.requestID = requestID;
        this.status = 401;
        this.name = "UnauthorizedException";
    }
}
exports.UnauthorizedException = UnauthorizedException;
class NotFoundException {
    constructor(path, requestID) {
        this.requestID = requestID;
        this.status = 404;
        this.name = "NotFoundException";
        this.message = `The requested path '${path}' could not be found.`;
    }
}
exports.NotFoundException = NotFoundException;
class UnprocessableEntityException {
    constructor(errors, requestID) {
        this.requestID = requestID;
        this.status = 422;
        this.name = "UnprocessableEntityException";
        this.message = `The following errors occurred:\n`;
        for (const { type, field, message } of errors) {
            this.message = this.message.concat(`\t${field}(${type}): ${message}\n`);
        }
    }
}
exports.UnprocessableEntityException = UnprocessableEntityException;
class BadRequestException {
    constructor(code, message, requestID) {
        this.code = code;
        this.message = message;
        this.requestID = requestID;
        this.status = 400;
        this.name = "BadRequestException";
        this.message = `A ${code} error occurred: ${message}`;
    }
}
exports.BadRequestException = BadRequestException;
