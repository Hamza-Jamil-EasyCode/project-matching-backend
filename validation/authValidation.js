const Joi = require("joi");

// User registration validation
const registerValidation = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name cannot exceed 100 characters",
      "any.required": "Name is required",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    programOfStudy: Joi.string().min(2).max(100).required().messages({
      "string.min": "Program of study must be at least 2 characters long",
      "string.max": "Program of study cannot exceed 100 characters",
      "any.required": "Program of study is required",
    }),
    interest: Joi.string().min(2).max(500).required().messages({
      "string.min": "Interest must be at least 2 characters long",
      "string.max": "Interest cannot exceed 500 characters",
      "any.required": "Interest is required",
    }),
    skills: Joi.array()
      .items(Joi.string().min(1).max(50))
      .min(1)
      .required()
      .messages({
        "array.min": "At least one skill is required",
        "any.required": "Skills are required",
      }),
    projectIdea: Joi.string().min(10).max(1000).required().messages({
      "string.min": "Project idea must be at least 10 characters long",
      "string.max": "Project idea cannot exceed 1000 characters",
      "any.required": "Project idea is required",
    }),
    availabilityDate: Joi.date().greater("now").required().messages({
      "date.greater": "Availability date must be in the future",
      "any.required": "Availability date is required",
    }),
    password: Joi.string().min(6).max(128).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "string.max": "Password cannot exceed 128 characters",
      "any.required": "Password is required",
    }),
  }),
};

// User login validation
const loginValidation = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),
};

// Update user validation
const updateUserValidation = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional().messages({
      "string.email": "Please provide a valid email address",
    }),
    programOfStudy: Joi.string().min(2).max(100).optional(),
    interest: Joi.string().min(2).max(500).optional(),
    skills: Joi.array().items(Joi.string().min(1).max(50)).min(1).optional(),
    projectIdea: Joi.string().min(10).max(1000).optional(),
    availabilityDate: Joi.date().greater("now").optional().messages({
      "date.greater": "Availability date must be in the future",
    }),
    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),
};

// Send connection request validation
const sendConnectionRequestValidation = {
  body: Joi.object({
    targetUserId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Target user ID must be a valid ObjectId",
        "any.required": "Target user ID is required",
      }),
  }),
};

// Respond to connection request validation
const respondToConnectionRequestValidation = {
  body: Joi.object({
    status: Joi.string().valid("accept", "reject").required().messages({
      "any.only": 'Status must be either "accept" or "reject"',
      "any.required": "Status is required",
    }),
    connectionId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "Connection ID must be a valid ObjectId",
        "any.required": "Connection ID is required",
      }),
  }),
};

// Delete user validation
const deleteUserValidation = {
  params: Joi.object({
    userId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "User ID must be a valid ObjectId",
        "any.required": "User ID is required",
      }),
  }),
};

module.exports = {
  registerValidation,
  loginValidation,
  updateUserValidation,
  sendConnectionRequestValidation,
  respondToConnectionRequestValidation,
  deleteUserValidation,
};
