const jwt = require('jsonwebtoken')
const MissingParamError = require('../errors/missing-param-error')

module.exports = class TokenGenerator {
  constructor (secretKey) {
    this.secretKey = secretKey
  }

  async generate (id) {
    if (!this.secretKey) {
      throw new MissingParamError('secretKey')
    }

    if (!id) {
      throw new MissingParamError('id')
    }

    const token = jwt.sign(id, this.secretKey)

    return token
  }
}
