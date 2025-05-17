/**
 * SpinShield Helpers
 * Node.js implementation of spinshield\spinclient helpers
 */
const crypto = require('crypto');

class Helpers {
    /**
     * Checks if the provided key is valid
     * @param {string} key - The key to validate
     * @param {string} timestamp - The timestamp
     * @param {string} salt - The salt
     * @returns {boolean} Returns true if the key is valid, false otherwise
     */
    isValidKey(key, timestamp, salt) {
        const generatedKey = crypto.createHash('md5').update(timestamp + salt).digest('hex');
        return key === generatedKey;
    }

    /**
     * Generates a JSON-encoded balance response
     * @param {number} balance - The balance value
     * @returns {string} The JSON-encoded balance response
     */
    balanceResponse(balance) {
        const data = {
            error: 0,
            balance: balance
        };
        return JSON.stringify(data);
    }

    /**
     * Checks if the response has an error
     * @param {Object|string} input - The input to check
     * @returns {boolean} Returns true if the response has an error, false otherwise
     */
    responseHasError(input) {
        let parsedInput = input;
        
        if (typeof input === 'string') {
            try {
                parsedInput = JSON.parse(input);
            } catch (e) {
                return true;
            }
        }
        
        if (parsedInput.error !== undefined) {
            if (typeof parsedInput.error !== 'number') {
                return true;
            }
            
            return parsedInput.error > 0;
        } else {
            return true;
        }
    }

    /**
     * Converts a JSON string to an associative array
     * @param {string} json - The JSON string to convert
     * @returns {Object} The object representation of the JSON string
     */
    morphJsonToArray(json) {
        return JSON.parse(json);
    }

    /**
     * Generates a JSON-encoded processing error response
     * @param {number} balance - The balance value
     * @returns {string} The JSON-encoded processing error response
     */
    processingError(balance = 0) {
        const data = {
            error: 2,
            balance: balance
        };
        return JSON.stringify(data);
    }

    /**
     * Formats a number with the specified precision and separator
     * @param {number|string} number - The number to format
     * @param {number} precision - The number of decimal places
     * @param {string} separator - The decimal separator
     * @returns {string} The formatted number
     */
    numberFormatPrecision(number, precision = 2, separator = '.') {
        const numberStr = number.toString();
        const numberParts = numberStr.split(separator);
        let response = numberParts[0];
        
        if (numberParts.length > 1 && precision > 0) {
            response += separator;
            response += numberParts[1].substring(0, precision);
        }
        
        return response;
    }

    /**
     * Converts a float value to an integer
     * @param {number} floatValue - The float value to convert
     * @returns {number} The converted integer value
     */
    floatToIntHelper(floatValue) {
        const formatted = this.numberFormatPrecision(floatValue);
        return parseInt((parseFloat(formatted) * 100).toFixed(0), 10);
    }

    /**
     * Converts an integer value to a float
     * @param {number} intValue - The integer value to convert
     * @param {number} precision - The number of decimal places
     * @returns {string} The converted float value
     */
    intToFloatHelper(intValue, precision = 2) {
        return this.numberFormatPrecision(intValue / 100, precision);
    }

    /**
     * Generates a JSON-encoded insufficient balance error response
     * @param {number} balance - The balance value
     * @returns {string} The JSON-encoded insufficient balance error response
     */
    insufficientBalance(balance = 0) {
        const data = {
            error: 1,
            balance: balance
        };
        return JSON.stringify(data);
    }
}

module.exports = Helpers;
