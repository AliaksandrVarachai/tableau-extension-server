const https = require('https');
const fs = require('fs');

const MongoClient = require('mongodb').MongoClient;

const serverDBUrl = 'mongodb://localhost:27017';
const dbName = 'tableau-extension-guided-tour';
const collectionName = 'tours';

const port = 3000;

MongoClient.connect(serverDBUrl, function(err, client) {
  if (err)
      throw err;

  console.log(`Connected successfully to server ${serverDBUrl}`);

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

/**  Create a server and listen  **/

https.createServer((req, res) => {
  res.writeHead(200);
  res.end('Hello world');
}).listen(port);