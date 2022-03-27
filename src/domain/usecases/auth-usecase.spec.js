const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeTokenGenerator = () => {
  class TokenGenerator {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }

  const tokenGeneratorSpy = new TokenGenerator()
  tokenGeneratorSpy.accessToken = 'any_token';

  return tokenGeneratorSpy
};

const makeTokenGeneratorWithError = () => {
  class TokenGenerator {
    async generate () {
      return new Error()
    }
  }

  return new TokenGenerator()
};

const makeEncrypter = () => {
  class Encrypter {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }

  const encrypterSpy = new Encrypter()
  encrypterSpy.isValid = true

  return encrypterSpy
};

const makeEncrypterWithError = () => {
  class Encrypter {
    async compare () {
      return new Error()
    }
  }

  return new Encrypter()
};

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepository {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepository()
  loadUserByEmailRepositorySpy.user = {
    id: 'any_id',
    password: 'hashed_password'
  }

  return loadUserByEmailRepositorySpy
};

const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepository {
    async load () {
      return new Error()
    }
  }

  return new LoadUserByEmailRepository()
};

const makeSut = () => {
  const tokenGeneratorSpy = makeTokenGenerator()
  const encrypterSpy = makeEncrypter()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()

  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy
  })

  return { sut, loadUserByEmailRepositorySpy, encrypterSpy, tokenGeneratorSpy }
};

describe('Auth UseCase ', () => {
  test('Should throw if no email is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth()

    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw if no password is provided', async () => {
    const { sut } = makeSut()
    const promise = sut.auth('any_email@email.com')

    expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@email.com', 'any_password')

    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@email.com')
  })

  test('Should return null if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    loadUserByEmailRepositorySpy.user = null
    const accessToken = await sut.auth(
      'invalid_email@email.com',
      'any_password'
    )

    expect(accessToken).toBe(null)
  })

  test('Should return null if an invalid password is provided', async () => {
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.isValid = false
    const accessToken = await sut.auth(
      'valid_email@email.com',
      'invalid_password'
    )

    expect(accessToken).toBe(null)
  })

  test('Should call Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut()
    await sut.auth('valid_email@email.com', 'any_password')

    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(
      loadUserByEmailRepositorySpy.user.password
    )
  })

  test('Should call TokenGenerator with correct userId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth('valid_email@email.com', 'valid_password')

    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
  })

  test('Should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGeneratorSpy } = makeSut()
    const accessToken = await sut.auth(
      'valid_email@email.com',
      'valid_password'
    )

    expect(accessToken).toBe(tokenGeneratorSpy.accessToken)
    expect(accessToken).toBeTruthy()
  })

  test('Should throw if invalid dependencies is provided', async () => {
    const invalid = {}
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase({
        loadUserByEmailRepository: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: invalid
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: invalid
      })
    )

    for (const sut of suts) {
      const promise = sut.auth('any_email@email.com', 'any_password')

      expect(promise).rejects.toThrow()
    }
  })

  test('Should throw if dependency throws', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const suts = [].concat(
      new AuthUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: makeEncrypterWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        tokenGenerator: makeTokenGeneratorWithError()
      })
    )

    for (const sut of suts) {
      const promise = sut.auth('any_email@email.com', 'any_password')

      expect(promise).rejects.toThrow()
    }
  })
})
