import path from 'path';
import fs from 'fs';
import Marc from '../src/index.js';
const { writeFileSync, readFileSync, readdirSync } = fs;

const observations = JSON.parse(readFileSync(__dirname + '/News_Headlines-NYTimes-1-19-2018_1-25-2018.json'));
const m = new Marc(observations, { delimeter: ' ', order: 0 });
// console.dir(m.transitions, { colors: true, depth: 6 });
console.log(m.random());
console.log(new Array(10).fill(0).map(() => m.random()).join('\n'));
