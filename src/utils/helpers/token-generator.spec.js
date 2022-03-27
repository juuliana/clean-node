const jwt = require('jsonwebtoken')

const MissingParamError = require('../errors/missing-param-error')
const TokenGenerator = require('./token-generator')

const makeSut = () => {
  const sut = new TokenGenerator('secret_key')

  return { sut }
};

describe('Token Generator', () => {
  test('Should return null if jwt returns null', async () => {
    const { sut } = makeSut()
    jwt.token = null
    const token = await sut.generate('any_id')
    expect(token).toBe(null)
  })

  test('Should return a token if jwt returns token', async () => {
    const { sut } = makeSut()
    const token = await sut.generate('any_id')
    expect(token).toBe(jwt.token)
  })

  test('Should call jwt with correct values', async () => {
    const { sut } = makeSut()
    await sut.generate('any_id')
    expect(jwt.id).toBe('any_id')
    expect(jwt.secretKey).toBe(sut.secretKey)
  })

  test('Should throw if no secretKey is provided', async () => {
    const sut = new TokenGenerator()
    const promise = sut.generate('any_id')
    expect(promise).rejects.toThrow(new MissingParamError('secretKey'))
  })

  test('Should throw if no id is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.generate()
    expect(promise).rejects.toThrow(new MissingParamError('id'))
  })
})
