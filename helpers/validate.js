const validateObject = (obj) => {
    for (var key in obj) {
        if (obj[key] == null || obj[key] == "" )
            return false;
    }
    return true;
};

const validateData = (data,type,resource,errorArr,config,rowData) => {
    if ((typeof data == type || parseInt(data) != 'NaN')  && data != '') {
        if (type == 'number' && isNaN(parseInt(data))) {
            validateDataErrorMsg(data,type,resource,errorArr,config,rowData);
            return false;
        } 
        return data
    }
    validateDataErrorMsg(data,type,resource,errorArr,config,rowData);
    return false;
};


const validateDataErrorMsg = (data,type,resource,errorArr,config,rowData) => {
    let message = config.VALIDATE_TYPE_OF_DATA_RESP_MSG
    message = message.replace('{{DATA}}', data)
    message = message.replace('{{RESOURCE}}', resource)
    message = message.replace('{{TYPE}}', type)
    errorArr.push({"errorMsg": message, "row": rowData})
}

const includesData = (data,objects,resource,errorArr,rowData) => {
    if (objects.includes(data)) return data;
    errorArr.push({"errorMsg": `Invalide data '${data}', ${resource} must include ${objects}`, "row": rowData})
    return false
}

const capitalize = (string) => {
    if (typeof string !== 'string') return ''
    var splitString = string.toLowerCase().split(' ');
    for (var i = 0; i < splitString.length; i++) {
       splitString[i] = splitString[i].charAt(0).toUpperCase() + splitString[i].substring(1);     
    }
    // Directly return the joined string
    return splitString.join(' '); 
}

module.exports = {validateObject, validateData, includesData, capitalize};