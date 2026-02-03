import { ZodError } from "zod";

export class ClientError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ClientError';
    }
}

export class InvariantError extends ClientError {
    constructor(message: string) {
        super(message);
        this.name = 'InvariantError';
    }
}


export class AuthenticationError extends ClientError {
    constructor(message: string) {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends ClientError {
    constructor(message: string) {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends ClientError {
    constructor(message: string) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}


export function formatZodErrorsAsObject(error: ZodError): Record<string, string> {

    return error.issues.reduce((acc, issue) => {
        const field = issue.path.join('.');
        let msg = issue.message;
        if (msg.includes(":")) {
            msg = msg.split(":")[1]!.replace(/"/g, "").trim();
        }
        acc[field] = msg;
        return acc;
    }, {} as Record<string, string>);
}

