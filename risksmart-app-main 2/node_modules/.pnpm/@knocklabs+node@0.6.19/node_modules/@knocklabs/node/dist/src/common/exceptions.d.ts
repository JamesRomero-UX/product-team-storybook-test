import { HttpException, UnprocessableEntityError } from "./interfaces";
export declare class NoApiKeyProvidedException extends Error {
    readonly status: number;
    readonly name: string;
    readonly message: string;
}
export declare class NoSigningKeyProvidedException extends Error {
    readonly status: number;
    readonly name: string;
    readonly message: string;
}
export declare class GenericServerException implements HttpException {
    readonly status: number;
    readonly requestID: string;
    readonly name: string;
    readonly message: string;
    constructor(status: number, message: string | undefined, requestID: string);
}
export declare class UnauthorizedException implements HttpException {
    readonly code: string;
    readonly message: string;
    readonly requestID: string;
    readonly status: number;
    readonly name: string;
    constructor(code: string, message: string, requestID: string);
}
export declare class NotFoundException implements HttpException {
    readonly requestID: string;
    readonly status: number;
    readonly name: string;
    readonly message: string;
    constructor(path: string, requestID: string);
}
export declare class UnprocessableEntityException implements HttpException {
    readonly requestID: string;
    readonly status: number;
    readonly name: string;
    readonly message: string;
    constructor(errors: UnprocessableEntityError[], requestID: string);
}
export declare class BadRequestException implements HttpException {
    readonly code: string;
    readonly message: string;
    readonly requestID: string;
    readonly status: number;
    readonly name: string;
    constructor(code: string, message: string, requestID: string);
}
