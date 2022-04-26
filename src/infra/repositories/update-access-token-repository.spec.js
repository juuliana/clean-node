const MongoHelper = require("../helpers/mongo-helper");
const UpdateAccessTokenRepository = require("./update-access-token-repository");
const { MissingParamError } = require("../../utils/errors");

let db;

const makeSut = () => {
  const userModel = db.collection("users");
  const sut = new UpdateAccessTokenRepository(userModel);

  return { userModel, sut };
};

describe("UpdateAccessToken Repository ", () => {
  let fakeUserId;

  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
    db = await MongoHelper.getDb();
  });

  beforeEach(async () => {
    const userModel = db.collection("users");
    await userModel.deleteMany();

    const fakeUser = await userModel.insertOne({
      email: "valid_email@email.com",
      name: "any_name",
      password: "hashed_password",
    });

    fakeUserId = fakeUser.insertedId;
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  it("Should update the user with the given accessToken", async () => {
    const { sut, userModel } = makeSut();

    await sut.update(fakeUserId, "valid_token");

    const updatedFakeUser = await userModel.findOne({
      _id: fakeUserId,
    });

    expect(updatedFakeUser.accessToken).toBe("valid_token");
  });

  test("Should throw if no userModel is provided", async () => {
    const sut = new UpdateAccessTokenRepository();

    const promise = sut.update(fakeUserId, "valid_token");

    expect(promise).rejects.toThrow();
  });

  test("Should throw if params are provided", async () => {
    const { sut } = makeSut();

    expect(sut.update()).rejects.toThrow(new MissingParamError("userId"));
    expect(sut.update(fakeUserId)).rejects.toThrow(
      new MissingParamError("accessToken")
    );
  });
});
