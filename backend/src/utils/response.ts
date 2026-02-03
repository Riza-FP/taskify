export type APIResponse<T> = |
{
    success: true;
    message?: string;
    data?: T;
} | {
    success: false;
    message: string;
    errors?: Record<string, string>;
}

// omit message or data if not specified
export const success = <T>(message?: string, data?: T): APIResponse<T> => ({
    success: true,
    ...(message !== undefined && { message }),
    ...(data !== undefined && { data }),
});


export const fail = (message: string, errors?: Record<string, string>): APIResponse<never> => ({
    success: false,
    message,
    ...(errors !== undefined && { errors }),
});
