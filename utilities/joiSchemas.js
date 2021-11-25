const Joi = require('joi');

module.exports.userSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
})

module.exports.tripSchema = Joi.object({
    name: Joi.string().required(),
    time: Joi.number().allow(''),
    distance: Joi.number().allow(''),
    elevation: Joi.number().allow(''),
    season: Joi.string().allow(''),
    map: Joi.string().allow(''),
    notes: Joi.string().allow(''),
    creator: Joi.string().allow(''),
}).required();