#! /usr/bin/env node
'use strict';

import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
// @ts-ignore
import { Extract, Parse } from 'unzipper';

const url = 'https://codeload.github.com/Bitlatte/vite-react/zip/main';
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

const extract = (stream: fs.ReadStream, path: string) => {
  return new Promise<void>((resolve) => {
    stream
      .pipe(Extract({ path: path }))
      .on('close', () => {
        resolve();
      })
  })
}

fetch(url)
  .then(() => {
    const stream = fs.createReadStream(path.join(process.cwd(), 'repo.zip'));
    extract(stream, process.cwd())
      .then(() => {
        fs.rename(`${process.cwd()}/vite-react-main`, `${process.cwd()}/${args[0]}`, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('Done');
          }
        })
      });
  }).catch(e => console.log(e));
