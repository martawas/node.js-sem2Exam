const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const AdCollectionName = "advertisments";

let db;
let adsCollection;

const init = () =>
  MongoClient.connect(process.env.CONNECTION_STRING, {
    serverApi: ServerApiVersion.v1,
  })
    .then((client) => {
      db = client.db(process.env.DATABASE_NAME);
      adsCollection = db.collection(AdCollectionName);
    })
    .catch((error) => console.log(error));

const getAds = () => {
  return adsCollection.find().toArray();
};

const getAd = (id) => {
  return adsCollection.findOne({ _id: new ObjectId(id) });
};

const deleteAd = (id) => {
  return adsCollection.deleteOne({ _id: new ObjectId(id) });
};

const addAd = (newAd) => {
  newAd.createdTime = new Date();
  return adsCollection.insertOne(newAd);
};

const updateAd = (id, updatedFields) => {
  return adsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedFields }
  );
};

const searchAds = (query) => {
  const filter = {};

  if (query.title) {
    filter.title = { $regex: query.title, $options: "i" };
  }

  if (query.description) {
    filter.description = { $regex: query.description, $options: "i" };
  }

  if (query.minPrice) {
    filter.price = { $gte: parseFloat(query.minPrice) };
  }

  if (query.maxPrice) {
    filter.price = { ...filter.price, $lte: parseFloat(query.maxPrice) };
  }

  if (query.author) {
    filter.author = { $regex: query.author, $options: "i" };
  }

  if (query.category) {
    filter.category = { $regex: query.category, $options: "i" };
  }

  if (query.location) {
    filter.location = { $regex: query.location, $options: "i" };
  }

  return adsCollection.find(filter).toArray();
};

module.exports = {
  init,
  getAds,
  getAd,
  deleteAd,
  addAd,
  updateAd,
  searchAds,
};
