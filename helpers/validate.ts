
const validateObject = (obj: any): boolean => {
    for (var key in obj) {
        if (obj[key] == null || obj[key] == "" )
            return false;
    }
    return true;
};

const validateData = (data: string,type: string,resource: string,errorArr: any[],config: any,rowData: { description: any; qty: any; rate: any; invoiceId: any; }): any => {
    if ((typeof data == type)  && data != '') {
        if (type == 'number' && isNaN(parseInt(data))) {
            validateDataErrorMsg(data,type,resource,errorArr,config,rowData);
            return false;
        } 
        return data
    }
    validateDataErrorMsg(data,type,resource,errorArr,config,rowData);
    return false;
};


const validateDataErrorMsg = (data: any,type: any,resource: any,errorArr: { errorMsg: any; row: any; }[],config: { VALIDATE_TYPE_OF_DATA_RESP_MSG: any; },rowData: any): void => {
    let message = config.VALIDATE_TYPE_OF_DATA_RESP_MSG
    message = message.replace('{{DATA}}', data)
    message = message.replace('{{RESOURCE}}', resource)
    message = message.replace('{{TYPE}}', type)
    errorArr.push({"errorMsg": message, "row": rowData})
}

const includesData = (data: any,objects: string | any[],resource: any,errorArr: { errorMsg: string; row: any; }[],rowData: any): any => {
    if (objects.includes(data)) return data;
    errorArr.push({"errorMsg": `Invalide data '${data}', ${resource} must include ${objects}`, "row": rowData})
    return false
}

const capitalize = (string: string): string => {
    if (typeof string !== 'string') return ''
    var splitString = string.toLowerCase().split(' ');
    for (var i = 0; i < splitString.length; i++) {
       splitString[i] = splitString[i].charAt(0).toUpperCase() + splitString[i].substring(1);     
    }
    // Directly return the joined string
    return splitString.join(' '); 
}

export {validateObject, validateData, includesData, capitalize};