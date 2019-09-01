#!/usr/bin/env node --experimental-worker
var path = require('path');
var sampler = require('../src/sample');
var fs = require('fs');

const args = require('yargs')
  .usage('Usage: marc <input json> <output json>')
  .option('format', {
    type: 'boolean',
    alias: 'f',
    describe: 'Format the input by normalizing case (of all words) and removing special characters',
    default: true
  })
  .option('delimiter', {
    type: 'number',
    alias: 'd',
    describe: 'Specify the word delimiter',
    default: ' '
  })
  .option('order', {
    type: 'number',
    alias: 'o',
    describe: 'Set the transition order',
    default: 2
  })
  .help()
  .argv;

args.input = args._[0];
args.output = args._[1];

if (args.input) {
  console.log(`Reading file from ${args.input}`);
  var data = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), args.input), 'utf8'))
    .map(observation => {
      if (args.format) observation = observation.toLowerCase().replace(/[^-$0-9A-Z:a-z ]/g, '');
      return observation;
    });

  sampler(data, { order: args.order, delimiter: args.delimiter }).then(transitions => {
    console.log(`writing output to ${args.output}`);
    fs.writeFileSync(path.join(process.cwd(), args.output || 'transitions.json'), JSON.stringify(transitions, null, 2));
    console.log('Done.');
  }, e => console.log(e.message));
}
