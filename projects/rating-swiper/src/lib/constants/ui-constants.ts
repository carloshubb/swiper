/**
 * UI Constants
 * Centralized constants to avoid magic numbers throughout the codebase
 * 
 * Client Requirement: "Ensure that redundant code has been avoided"
 * and meaningful names are used
 * 
 * Purpose: Replace magic numbers with documented constants
 */

/**
 * UI-related constants for the rating swiper application
 * All values are documented to explain their purpose
 */
export const UI_CONSTANTS = {
    /**
     * Drag and Swipe Settings
     */

    /** Minimum drag distance in pixels before activating swipe zones */
    MIN_DRAG_DISTANCE: 60,

    /** Number of segments in the circular drag zone (like a clock) */
    DRAG_SEGMENTS: 10,

    /** Degrees per segment in the drag circle (360 / 10) */
    DEGREES_PER_SEGMENT: 36,

    /**
     * Timing Constants
     */

    /** Debounce time for search input in milliseconds */
    SEARCH_DEBOUNCE_MS: 300,

    /** Mock API delay for testing purposes in milliseconds */
    MOCK_API_DELAY_MS: 1000,

    /** Animation duration for card transitions in milliseconds */
    CARD_ANIMATION_DURATION_MS: 300,

    /** Delay before auto-advancing to next card */
    AUTO_ADVANCE_DELAY_MS: 500,

    /**
     * Cache Settings
     */

    /** Cache time-to-live for data in seconds */
    CACHE_TTL_SECONDS: 300,

    /** Maximum number of items to cache */
    MAX_CACHE_SIZE: 100,

    /**
     * Validation Constants
     */

    /** Minimum search query length */
    MIN_SEARCH_LENGTH: 2,

    /** Maximum search query length */
    MAX_SEARCH_LENGTH: 50,

    /** Minimum age for profiles */
    MIN_AGE: 18,

    /** Maximum age for profiles */
    MAX_AGE: 100,

    /**
     * Network Settings
     */

    /** Number of retry attempts for failed API calls */
    API_RETRY_COUNT: 2,

    /** Timeout for API requests in milliseconds */
    API_TIMEOUT_MS: 10000,

    /**
     * Mathematical Constants
     */

    /** Small epsilon value for floating point comparisons */
    EPSILON: 1e-4,

    /** Upper bound for fraction clamping */
    FRACTION_MAX: 0.9999,

    /**
     * Full circle in degrees */
    FULL_CIRCLE_DEGREES: 360,

    /**
     * UI Layout
     */

    /** Number of cards to preload */
    CARDS_PRELOAD_COUNT: 3,

    /** Default pagination limit */
    DEFAULT_PAGE_SIZE: 20,

    /** Maximum cards to display at once */
    MAX_VISIBLE_CARDS: 5

} as const;

/**
 * Type-safe access to constants
 */
export type UIConstants = typeof UI_CONSTANTS;

/**
 * Helper function to get a constant with type safety
 * 
 * @param key - Constant key
 * @returns Constant value
 */
export function getUIConstant<K extends keyof UIConstants>(key: K): UIConstants[K] {
    return UI_CONSTANTS[key];
}
