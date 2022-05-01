const sut = require('./mongo-helper')

describe('Mongo helper', () => {
  beforeAll(async () => {
    await sut.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await sut.disconnect()
  })

  it('Should reconnect when getDb is invoked and client is disconnected', async () => {
    expect(sut.db).toBeTruthy()

    await sut.disconnect()
    expect(sut.db).toBeFalsy()

    await sut.getDb()
    expect(sut.db).toBeTruthy()
  })
})
