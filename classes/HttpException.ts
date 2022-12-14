/**
 * Inherit the base Error class, but adds a status property
 */
class HttpException extends Error {
    status: number;
    message: string;

    /**
     * @param status HTTP response error status code
     * @param message HTTP response error message
     */
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    };
};

export default HttpException;

