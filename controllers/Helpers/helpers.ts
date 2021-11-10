
/**
 * Function to return both success and error response
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

    
const handleResponse = async (res: { status: any; }, statusCode: number, success: boolean, message: string, data: any = null, errors: any = null) => {
    // RETURN RESPONSE
    return res.status(statusCode).json({success, message, data, errors});
};

const successResponse = (res: { status: any; }, message: string = 'Operation successfull', data: any = null) => {
    return res.status(200).json({ success: true, message, data });
}

const errorResponse = (res: { status: any;}, message: string = 'An error occured', data: any = null) => {
    return res.status(400).json({ success: false, message, data });
}

const getRandomInt = (min: number, max: number) => {
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

    
export { handleResponse, successResponse, errorResponse,getRandomInt, generateId };