/**
 * This file is not intended for use in the browser! This is currently written for
 * Node with the --experiemental-workers flag.
 */
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  let workers;

  module.exports = function sample (observations) {
    return new Promise((resolve, reject) => {
      const transitions = [];
      let totalWorkers = Math.ceil(observations.length / 200);
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
        const w = new Worker(__filename, { workerData: observations.slice(i * 100, i * 100 + 100) });
        w.on('message', handleMessage);
        w.on('error', reject);
        return w;
      });
    })
  };
}

if (!isMainThread && workerData) {
  parentPort.postMessage(
    workerData.reduce((transitions, tokens, p) =>
      (tokens.split(' ')).reduce((map, token, i, tokens) =>
        (map.find(([t]) => t === token) ? map : map.concat([[token]]))
          .map(([t, ...followers], j) => {
            if (t === 'START' && i === 0) return [t, ...followers, token];
            if (t === token && i === tokens.length - 1) return [t, ...followers, 'END'];
            if (t === token) return [t, ...followers, tokens[i + 1]]
            return [t, ...followers];
          }), transitions),
    [['START']]).sort(() => Math.round(Math.random() * 2 - 1))
  );
}
