const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().min(0).required(),
        image: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null)
        }).allow(null),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
})



// // Schema OBJECT - plain JavaScript object
// const userSchema = {
//   name: Joi.string().min(3),
//   age: Joi.number().min(0)
// };

// // This gets converted internally to:
// const equivalentSchema = Joi.object({
//   name: Joi.string().min(3),
//   age: Joi.number().min(0)
// });