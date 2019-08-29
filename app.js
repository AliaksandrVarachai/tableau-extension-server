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
    const parsedUrl = new URL(url, 'https://fake-hostname.com');
    const pathname = parsedUrl.pathname.toLowerCase();
    const params = new URLSearchParams(parsedUrl.search);

    if (method === 'GET') {
      if (pathname === '/api/tours/getTour'.toLowerCase()) {
        const id = params.get('id'); // TODO: check id first
        collection.findOne({ id })
          .then(tour => {
            res.writeHead(200, {
              // 'Content-Length': Buffer.byteLength(tour.htmlContent),
              'Content-type': 'text/plain'
            });
            res.end(tour.htmlContent);
          })
          .catch(err => {
            console.error(err.message);
            res.writeHead(404, 'Tour is not found');
            res.end();
          });
      } else {
        console.error(`API request pathname=${parsedUrl.pathname} cannot be processed.`);
        res.writeHead(400, 'Bad request: no api provided');
        res.end();
      }

    } else if (method === 'PUT') {

      if (pathname === '/api/tours/createTour'.toLowerCase()) {
        const id = params.get('id');
        let htmlContent = [];
        req.on('data', chunk => {
          htmlContent.push(chunk);
        });
        req.on('end', () => {
          htmlContent = Buffer.concat(htmlContent).toString();
          collection.insertOne({id, htmlContent})
            .then(r => {
              res.writeHead(200);
              res.end();
            })
            .catch(err => {
              console.error(err.message);
              res.writeHead(404, 'Tour is not created');
              res.end();
            });
        });

      } else if (pathname === '/api/tours/updateTour'.toLowerCase()) {
        const id = params.get('id');
        let htmlContent = [];
        req.on('data', chunk => {
          htmlContent.push(chunk);
        });
        req.on('end', () => {
          htmlContent = Buffer.concat(htmlContent).toString();
          collection.findOneAndUpdate({ id }, {$set: { htmlContent }})
            .then(r => {
              res.writeHead(200);
              res.end();
            })
            .catch(err => {
              console.error(err.message);
              res.writeHead(404, 'Tour is not updated');
              res.end();
            });
        });
      }

    } else if (method === 'DELETE') {
      const id = params.get('id');
      collection.findOneAndDelete({ id })
        .then(r => {
          res.writeHead(200);
          res.end();
        })
        .catch(err => {
          console.error(err.message);
          res.writeHead(404, 'Tour is not updated');
          res.end();
        });


    } else {
      console.error(`Unsupported method ${method}.`);
      res.writeHead(400, `Unsupported method ${method}.`);
      res.end();
    }

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
