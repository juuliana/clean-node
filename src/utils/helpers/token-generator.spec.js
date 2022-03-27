const jwt = require('jsonwebtoken')

class TokenGenerator {
  async generate (id) {
    const token = jwt.sign(id, 'secret_key')

    return token
  }
}

const makeSut = () => {
  const sut = new TokenGenerator()

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
})
