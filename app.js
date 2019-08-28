const https = require('https');
const util = require('util');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

const serverDBUrl = 'mongodb://localhost:27017';
const dbName = 'tableau-extension-guided-tour';
const collectionName = 'tours';

const port = 3000;

const readFileAsync = util.promisify(fs.readFile);

Promise.all([
  readFileAsync('./resources/ssl/key.pem'),
  readFileAsync('./resources/ssl/cert.pem'),
  util.promisify(MongoClient.connect)(serverDBUrl)
]).then(([sslKey, sslCert, mongoClient]) => {
  const db = mongoClient.db(dbName);
  const collection = db.collection(collectionName);
  const httpsOptions = {
    key: sslKey,
    cert: sslCert,
    ca: [sslCert],
  };

  const server = https.createServer(httpsOptions,(req, res) => {
    const { headers, method, url } = req;

    if (method === 'GET') {
      if ((/^\/api\/tours\/getTour\//i).test(url)) {
        console.log(url)
        // TODO: eject id & search param => then pass them to mongoClient
        const uuid = '123-456';
        collection.findOne({id: uuid}, (err, tour) => {
          if (err)
            throw err;

          console.log(tour.htmlContent);
        });
      } else {
        console.log('WRONG*****************');
      }
    } else {
      console.log(`Unsupported method ${mothod}`)
    }





    res.writeHead(200);
    res.end(`Response from ${port}`);
  });

  server.listen(port, () => {
    console.log(`Server is started on https://localhost:${port}.`);
  });

  server.on('close', () => {
    mongoClient.close();
    console.log(`Server https://localhost:${port} is stopped.`);
  });
}).catch(err => {
  console.log(err); // cert files are not found
});


// MongoClient.connect(serverDBUrl, function(err, client) {
//   if (err) {
//     console.log(`Connection to DB server "${serverDBUrl}" is failed.`);
//     return;
//   }
//
//   console.log(`Connected successfully to server ${serverDBUrl}.`);
//
//   const db = client.db(dbName);
//   const collection = db.collection(collectionName);
//
//   const uuid = '123-456';
//   collection.findOne({id: uuid}, (err, tour) => {
//     if (err)
//       throw err;
//
//     console.log(tour.htmlContent);
//   });
//
//   client.close();
//
// });



// https.createServer(httpsOptions,(req, res) => {
//   res.writeHead(200);
//   res.end(`Response from ${port}`);
// }).listen(port, () => {
//   console.log(`Server is started on https://localhost:${port}`);
// });