const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';

const dbName = 'tableau-extension-guided-tour';

const collectionName = 'tours';


MongoClient.connect(url, function(err, client) {
  if (err)
      throw err;

  console.log(`Connected successfully to server ${url}`);

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const uuid = '123-456';
  collection.findOne({id: uuid}, (err, tour) => {
    if (err)
      throw err;

    console.log(tour.htmlContent);
  });

  client.close();

});