#! /usr/bin/env node
'use strict';

import * as fs from 'fs';
import * as https from 'https';
import { join } from 'path';
import { Extract } from 'unzipper';

const url = 'https://codeload.github.com/Bitlatte/vite-react/zip/main';
const args = process.argv.slice(2);

/**
 * Downloads zip file from url
 * 
 * @param url URL of the Repository
 */
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

/**
 * Extract the contents of .zip to path
 * 
 * @param stream Readable Stream of .zip file
 * @param path Path to output the contents of the .zip file
 */
const extract = (stream: fs.ReadStream, path: string) => {
  return new Promise<void>((resolve) => {
    stream
      .pipe(Extract({ path: path }))
      .on('close', () => {
        resolve();
      })
  })
}

/**
 * 
 * @param url URL to pass to the Fetch Function
 * @param path Path to output the contents of the .zip file
 * @returns 
 */
const create = (url: string, path: string) => {
  return new Promise<void>((resolve, reject) => {
    fetch(url)
      .then(() => {
        const stream = fs.createReadStream(join(process.cwd(), 'repo.zip'));
        extract(stream, process.cwd())
          .then(() => {
            fs.rename(`${process.cwd()}/vite-react-main`, `${process.cwd()}/${args[0]}`, (err) => {
              if (err) reject(err)
              resolve()
            })
          })
      }).catch(e => reject(e))
  })
}

/**
 * Cleanup filesystem after project has been created
 */
const cleanup = () => {
  return new Promise<void>((resolve, reject) => {
    fs.rm(join(process.cwd(), "repo.zip"), (err) => {
      if (err) reject(err);
      resolve();
    })
  })
}

create(url, args[0])
  .then(() => {
    cleanup()
      .then(() => {
        console.log(`Project ${args[0]} created successfully!`);
        console.log('\n');
        console.log('    Get started with the following commands:');
        console.log(`      [*] cd ${args[0]}`);
        console.log('      [*] npm install');
        console.log('      [*] npm run dev');
      }).catch(e => console.log('There seems to be an issue. Try again'))
  }).catch(e => console.log('There seems to be an issue. Try again'))