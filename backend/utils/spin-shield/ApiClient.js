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
            gameid: game_id,
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
            gameid: game_id,
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
            gameid: game_id,
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
            gameid: game_id,
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

        try {
            const response = await axios({
                method: method,
                url: this.endpoint,
                data: querystring.stringify(requestData),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            
            return response.data;
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                return error.response.data;
            } else {
                throw error;
            }
        }
    }
}

module.exports = ApiClient;
