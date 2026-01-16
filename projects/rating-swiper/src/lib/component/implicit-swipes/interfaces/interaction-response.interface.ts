/**
 * Interface for API interaction response
 */
export interface InteractionResponse {
    status: string;
    id?: string;
    message?: string;
}

/**
 * Interface for HTTP error responses
 */
export interface HttpErrorResponse {
    message: string;
    statusCode?: number;
    error?: string;
}
