import path from 'path';
import fs from 'fs';
import Marc from '../src/index.js';
const { writeFileSync, readFileSync, readdirSync } = fs;

// const observations = JSON.parse(readFileSync(__dirname + '/News_Headlines-NYTimes-1-19-2018_1-25-2018.json'));
const precompiledObservations = JSON.parse(readFileSync(__dirname + '/transitions.json'));

// const m = new Marc(observations, { delimiter: ' ', order: 2 });
const m = new Marc(precompiledObservations, { delimiter: ' ', order: 2 });
// console.log(m.transitions);
console.log(new Array(10).fill(0).map(() => m.random()).join('\n'));
