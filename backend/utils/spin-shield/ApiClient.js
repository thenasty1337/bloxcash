/**
 * SpinShield API Client
 * Node.js implementation of spinshield\spinclient
 */
const axios = require('axios');
const querystring = require('querystring');

class ApiClient {
    /**
     * ApiClient constructor
     * @param {Object} config - Configuration object
     * @param {string} config.endpoint - API endpoint
     * @param {string} config.api_login - API login
     * @param {string} config.api_password - API password
     * @throws {Error} If required config parameters are missing
     */
    constructor(config) {
        if (!config.endpoint) {
            throw new Error("You must specify endpoint for API");
        }
        if (!config.api_login) {
            throw new Error("You must specify api_login");
        }
        if (!config.api_password) {
            throw new Error("You must specify api_password");
        }
        
        this.api_login = config.api_login;
        this.api_password = config.api_password;
        this.endpoint = config.endpoint;
    }

    /**
     * Retrieves the game list
     * @param {string} currency - Currency code
     * @param {number} list_type - List type
     * @returns {Promise<Object>} API response
     */
    async getGameList(currency, list_type) {
        const response = await this.sendRequest('post', 'getGameList', {
            show_additional: 1,
            show_systems: 1,
            list_type: Number(list_type),
            currency: currency.toUpperCase()
        });
        
        return response;
    }

    /**
     * Creates a player
     * @param {string} username - User's username
     * @param {string} userpassword - User's password
     * @param {string} usernickname - User's nickname
     * @param {string} currency - Currency code
     * @returns {Promise<Object>} API response
     */
    async createPlayer(username, userpassword, usernickname, currency) {
        const response = await this.sendRequest('post', 'createPlayer', {
            user_username: username,
            user_password: userpassword,
            user_nickname: usernickname,
            currency: currency.toUpperCase()
        });
        
        return response;
    }

    /**
     * Retrieves free rounds
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @param {string} currency - Currency code
     * @returns {Promise<Object>} API response
     */
    async getFreeRounds(username, password, currency) {
        const response = await this.sendRequest('post', 'getFreeRounds', {
            user_username: username,
            user_password: password,
            currency: currency.toUpperCase()
        });
        
        return response;
    }

    /**
     * Adds free rounds
     * @param {string} username - User's username
     * @param {string} userpassword - User's password
     * @param {string} game_id - Game ID
     * @param {string} currency - Currency code
     * @param {number} freespins - Number of free spins
     * @param {number} betlevel - Bet level
     * @param {number} valid_days - Number of days the free spins are valid
     * @returns {Promise<Object>} API response
     */
    async addFreeRounds(username, userpassword, game_id, currency, freespins, betlevel, valid_days = 7) {
        const response = await this.sendRequest('post', 'addFreeRounds', {
            lang: 'en',
            user_username: username,
            user_password: userpassword,
            gameid: String(game_id), // Ensure game_id is converted to string
            freespins: freespins,
            bet_level: betlevel,
            valid_days: valid_days,
            currency: currency.toUpperCase()
        });
        
        return response;
    }

    /**
     * Creates a demo session, return game URL you serve to your players
     * @param {string} game_id - Game ID
     * @param {string} currency - Currency code
     * @param {string} homeurl - Home URL
     * @param {string} cashierurl - Cashier URL
     * @param {string} lang - Language code
     * @returns {Promise<Object>} API response
     */
    async getGameDemo(game_id, currency, homeurl, cashierurl, lang) {
        const response = await this.sendRequest('post', 'getGameDemo', {
            gameid: String(game_id),
            homeurl: homeurl,
            cashierurl: cashierurl,
            lang: lang,
            currency: currency.toUpperCase()
        });
        
        return response;
    }

    /**
     * Deactivates all active free rounds for a player
     * @param {string} username - User's username
     * @param {string} userpassword - User's password
     * @param {string} currency - Currency code
     * @returns {Promise<Object>} API response
     */
    async deleteAllFreeRounds(username, userpassword, currency) {
        const response = await this.sendRequest('post', 'deleteAllFreeRounds', {
            user_username: username,
            user_password: userpassword,
            currency: currency.toUpperCase()
        });
        
        return response;
    }

    /**
     * Deactivates all active free rounds on specified game for a player
     * @param {string} game_id - Game ID
     * @param {string} username - User's username
     * @param {string} userpassword - User's password
     * @param {string} currency - Currency code
     * @returns {Promise<Object>} API response
     */
    async deleteFreeRounds(game_id, username, userpassword, currency) {
        const response = await this.sendRequest('post', 'deleteFreeRounds', {
            gameid: String(game_id),
            user_username: username,
            user_password: userpassword,
            currency: currency.toUpperCase()
        });
        
        return response;
    }

    /**
     * Creates a game session, return game URL you serve to your players
     * @param {string} username - User's username
     * @param {string} userpassword - User's password
     * @param {string} game_id - Game ID
     * @param {string} currency - Currency code
     * @param {string} homeurl - Home URL
     * @param {string} cashierurl - Cashier URL
     * @param {number} play_for_fun - Play for fun flag
     * @param {string} lang - Language code
     * @returns {Promise<Object>} API response
     * @throws {Error} If play_for_fun is not 0 or 1
     */
    async getGame(username, userpassword, game_id, currency, homeurl, cashierurl, play_for_fun, lang) {
        if (play_for_fun > 1) {
            throw new Error("play_for_fun should be 0 or 1 integer");
        }
        
        const response = await this.sendRequest('post', 'getGame', {
            user_username: username,
            user_password: userpassword,
            gameid: String(game_id),
            homeurl: homeurl,
            cashierurl: cashierurl,
            play_for_fun: Number(play_for_fun),
            lang: lang,
            currency: currency.toUpperCase()
        });
        
        return response;
    }

    /**
     * Sends a request to the API
     * @param {string} method - HTTP method
     * @param {string} api_method - API method
     * @param {Object} data - Request data
     * @returns {Promise<Object>} API response
     */
    async sendRequest(method, api_method, data) {
        const requestData = {
            ...data,
            api_login: this.api_login,
            api_password: this.api_password,
            method: api_method
        };

        console.log(`Sending request to ${this.endpoint} for method ${api_method}`);

        try {
            const response = await axios({
                method: method,
                url: this.endpoint,
                data: requestData,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`Got response from ${api_method}:`, {
                status: response.status,
                statusText: response.statusText
            });
            
            // Validate response format
            if (!response.data) {
                throw new Error(`${api_method} returned empty response`);
            }
            
            // Check if the response is a string (unexpected format)
            if (typeof response.data === 'string') {
                console.error(`${api_method} returned unexpected string response:`, response.data);
                throw new Error(`${api_method} returned unexpected format`);
            }
            
            return response.data;
        } catch (error) {
            console.error(`Error in ${api_method} request:`, {
                message: error.message,
                code: error.code,
                response: error.response ? {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                } : 'No response'
            });
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                const errorData = error.response.data || { message: `${api_method} failed with status ${error.response.status}` };
                
                // Add additional context to the error data
                errorData.statusCode = error.response.status;
                errorData.statusText = error.response.statusText;
                
                return errorData;
            } else if (error.request) {
                // The request was made but no response was received
                throw new Error(`${api_method} request failed: No response from server`);
            } else {
                // Something happened in setting up the request that triggered an Error
                throw error;
            }
        }
    }
}

module.exports = ApiClient;
