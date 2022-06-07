#! /usr/bin/env node
'use strict';

import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
// @ts-ignore
import { Extract, Parse } from 'unzipper';

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
  fs.createReadStream(file).pipe(Extract({ path: path }));
}

fetch(url)
  .then(() => {
    const zip = path.join(process.cwd(), 'repo.zip');
    unzip(zip, process.cwd());
    fs.rename(`${process.cwd()}/vite-react-main`, `${process.cwd()}/${args[0]}`, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Done');
        }
      })
  }).catch(e => console.log(e));
