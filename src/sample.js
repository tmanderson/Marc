/**
 * This file is not intended for use in the browser! This is currently written for
 * Node with the --experiemental-workers flag.
 */
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const MAX_OBSERVATIONS = 200;

if (isMainThread) {
  let workers;

  module.exports = function sample (observations, { delimiter = ' ', order = 2 }) {
    return new Promise((resolve, reject) => {
      const transitions = [];
      let totalWorkers = Math.ceil(observations.length / MAX_OBSERVATIONS);
      let completed = 0;
      const handleMessage = data => {
        data.forEach(t => {
          const idx = transitions.findIndex(([v]) => v === t[0]);
          if (idx < 1) transitions.push(t);
          else transitions[idx].push(...t.slice(1));
        });

        completed += 1;

        if (completed >= totalWorkers) {
          workers.forEach(w => {
            w.removeAllListeners();
            w.terminate(() => totalWorkers--);
          });

          workers = [];
          resolve(transitions);
        }
      };

      workers = new Array(totalWorkers).fill().map((_, i) => {
        const w = new Worker(__filename, {
          workerData: {
            order,
            delimiter,
            observations: observations.slice(i * MAX_OBSERVATIONS, i * MAX_OBSERVATIONS + MAX_OBSERVATIONS)
          }
        });
        w.on('message', handleMessage);
        w.on('error', reject);
        return w;
      });
    })
  };
}

if (!isMainThread && workerData) {
  const { observations, order, delimiter } = workerData;

  parentPort.postMessage(
    observations
      .map(words => words.split(delimiter))
      .reduce((transitions, observation, p) => {
        const words = observation
          .reduce((scaledWords, word, i, words) =>
            (i + 1) % order > 0
            ? scaledWords
            : scaledWords.concat([words.slice((i + 1) - order, i + 1).join(delimiter)]),
            []
          );
        return ['START'].concat(words).reduce((transitions, word, i, words) => {
          let transitionIndex = transitions.findIndex(([leader]) => leader === word);
          if (transitionIndex < 0) transitionIndex = (transitions.push([word]) - 1);
          transitions[transitionIndex].push(words[i + 1] || 'END');
          return transitions;
        }, transitions);
      }, [['START']])
      .map(([leader, ...followers]) => [
        leader, ...followers.sort(() => Math.round(Math.random() * 2 - 1))
      ])
  );
}
