
/**
 * Function to return both success and error response
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

    
 const handleResponse = async (res, statusCode, success, message, data, errors) => {
    // RETURN RESPONSE
    return res.status(statusCode).json({success, message, data, errors});
};

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

const generateId = (length = 6) => {
    if (length < 6) return 'Required length must be greater than 6';
    const randLength = length - 3;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const dateTime = Date.now()
    for ( var i = 0; i < randLength; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `${result}${dateTime.toString().substring(10, 13)}`;
}

    
module.exports = { handleResponse, getRandomInt, generateId };