// Simple mock GraphQL server for tests
import express from 'express';
import bodyParser from 'body-parser';

const SUCCESS = {
  data: {
    currentUser: { id: "1", name: "Test User", accounts: [{ id: "101", balance: 1000 }] }
  }
};

const FAILURE = {
  data: null,
  errors: [
    {
      message: 'invalid query name',
      locations: [{ line: 1, column: 1 }],
      path: ['errorQuery']
    }
  ]
};

let server: any;

export function startTestServer(port = 4404) {
  return new Promise<void>((resolve) => {
    const app = express();
    app.use(bodyParser.json());
    app.post('/', (req, res) => {
      // If the query contains 'currentUser', return a success response
      if (req.body && req.body.query && req.body.query.includes('currentUser')) {
        return res.json(SUCCESS);
      }
      return res.json(FAILURE);
    });
    server = app.listen(port, () => {
      resolve();
    });
  });
}

export function stopTestServer() {
  return new Promise<void>((resolve, reject) => {
    if (server) {
      server.close((err: any) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
}
