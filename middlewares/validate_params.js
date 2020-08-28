const mongoose = require('mongoose');
const Ajv = require('ajv');
const lodash = require('lodash');

const validateParams = function (paramSchema) {
    return async (req, res, next) => {
        const ajv = new Ajv({$data: true});
        const paramSchemaKeys = Object.keys(paramSchema.properties);
        let requestParamObj = {};
        for (let key of paramSchemaKeys){
            // Use req.query/req.params if you want to validate query params.
            requestParamObj[key] = lodash.get(req.body, key);
        }
        const validated = ajv.validate(paramSchema, requestParamObj);
        if (!validated) 
            return res.status(400).json({
                message: getCustomMessage(ajv.errors[0])
            });
        
        next();
    }
};

const getCustomMessage = (errorObject) => {
    if (['minLength', 'maxLength'].includes(errorObject.keyword)) {
        return `${errorObject.dataPath.replace('.', '')} ${errorObject.message}`;
    }
    return errorObject.message;
};

module.exports = {
    validateParams: validateParams
};