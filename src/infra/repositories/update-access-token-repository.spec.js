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
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
    db = await MongoHelper.getDb();
  });

  beforeEach(async () => {
    await db.collection("users").deleteMany();
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  it("Should update the user with the given accessToken", async () => {
    const { sut, userModel } = makeSut();

    const fakeUser = await userModel.insertOne({
      email: "valid_email@email.com",
      name: "any_name",
      password: "hashed_password",
    });

    await sut.update(fakeUser.insertedId, "valid_token");

    const updatedFakeUser = await userModel.findOne({
      _id: fakeUser.insertedId,
    });

    expect(updatedFakeUser.accessToken).toBe("valid_token");
  });

  test("Should throw if no userModel is provided", async () => {
    const sut = new UpdateAccessTokenRepository();
    const userModel = db.collection("users");

    const fakeUser = await userModel.insertOne({
      email: "valid_email@email.com",
      name: "any_name",
      password: "hashed_password",
    });

    const promise = sut.update(fakeUser.insertedId, "valid_token");

    expect(promise).rejects.toThrow();
  });

  test("Should throw if params are provided", async () => {
    const { sut, userModel } = makeSut();

    const fakeUser = await userModel.insertOne({
      email: "valid_email@email.com",
      name: "any_name",
      password: "hashed_password",
    });

    expect(sut.update()).rejects.toThrow(new MissingParamError("userId"));
    expect(sut.update(fakeUser.insertedId)).rejects.toThrow(
      new MissingParamError("accessToken")
    );
  });
});
