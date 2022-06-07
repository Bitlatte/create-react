#! /usr/bin/env node
'use strict';

import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import { Parse } from 'unzipper';

const url = 'https://codeload.github.com/Bitlatte/vite-react/zip/main';
// @ts-ignore
const args = process.argv.slice(2);

const fetch = (url: string) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream("repo.zip");
    https.get(url, (response) => {
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(resolve);
      }).on('error', () => reject);
    }).on('error', () => reject);
  })
}

const unzip = (file: string, path: string) => {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(file).pipe(Parse());
    fileStream.on('entry', (entry) => {
      const writeStream = fs.createWriteStream(`${path}/${entry.path}`);
      return entry.pipe(writeStream);
    });
    fileStream.on('finish', () => resolve);
    fileStream.on('error', (err) => reject(err))
  })
}

fetch(url)
  .then(() => {
    const zip = path.join(process.cwd(), 'repo.zip');
    fs.mkdir(path.join(process.cwd(), args[0]), () => {
      unzip(zip, path.join(__dirname, args[0]))
        .then(() => {
          console.log('Done');
        }).catch(e => console.log(e))
    });
  }).catch(e => console.log(e));
