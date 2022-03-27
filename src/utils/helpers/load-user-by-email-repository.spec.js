class LoadUserByEmailRepository {
  async load (email) {
    this.email = email

    return null
  }
}

const makeSut = () => {
  const sut = new LoadUserByEmailRepository()

  return { sut }
};

describe('LoadUserByEmail Repository', () => {
  test('Should return null if no user if found', async () => {
    const { sut } = makeSut()
    const user = await sut.load('invalid_email@email.com')
    expect(user).toBe(null)
  })
})
