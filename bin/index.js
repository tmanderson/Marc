#!/usr/bin/env node --experimental-worker
var path = require('path');
var sampler = require('../src/sample');
var fs = require('fs');

const args = require('yargs')
  .usage('Usage: marc <input json> <output json>')
  .option('normalize', {
    type: 'boolean',
    alias: 'n',
    describe: 'Do not normalize input',
    default: true
  })
  .option('strip', {
    type: 'boolean',
    alias: 's',
    dsecribe: 'Do not strip input',
    default: true
  })
  .help()
  .argv;

args.input = args._[0];
args.output = args._[1];

if (args.input) {
  console.log(`Reading file from ${args.input}`);
  var data = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), args.input), 'utf8'))
    .map(observation => {
      if (!args.normalize) observation = observation.toLowerCase();
      if (!args.strip) observation = observation.replace(/[a-zA-Z0-9]/g, '');
      return observation;
    });

  sampler(data).then(transitions => {
    console.log(`writing output to ${args.output}`);
    fs.writeFileSync(path.join(process.cwd(), args.output || 'transitions.json'), JSON.stringify(transitions, null, 2));
    console.log('Done.');
  }, e => console.log(e.message));
}
