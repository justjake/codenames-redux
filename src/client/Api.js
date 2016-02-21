// TODO: replace with axios
import request from 'superagent';
import path from 'path';
import Promise from 'bluebird';

export default class Api {
  constructor(rootUri) {
    this.root = rootUri;
    this.debug = true;
  }

  request(method, reqPath, dataToSend = undefined) {
    const uri = `${this.root}/${reqPath}`;
    return new Promise((resolve, reject) => {
      let req = request(method, uri);

      if (dataToSend !== undefined) {
        req = req.type('json').send(dataToSend);
      }

      req.end((err, response) => {
        if (this.debug) console.log(`response for ${method} ${uri}:`, response, err, response && response.body);
        if (err) return reject(err);
        return resolve(response.body);
      });
    })
  }

  post(uri, data) {
    return this.request('POST', uri, data);
  }

  get(uri) {
    return this.request('GET', uri);
  }
}
