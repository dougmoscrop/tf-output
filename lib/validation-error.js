'use strict';

module.exports = class ValidationError extends Error {
  constructor(msg, details) {
    super(msg);
    Object.assign(this, details);
  }
};
