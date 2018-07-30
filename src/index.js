/**
 * @params {Array[Array|String|Number]} obervations – A set of obervations
 * @params {}
 */
export default class Marc {
  constructor (observationsOrTransitions, { delimeter = '', order = 0 }) {
    this.order = order
    this.delimeter = delimeter
    // Observations aren't needed if the transitions are pre-computed
    this.observations = Array.isArray(observationsOrTransitions[0])
      ? null
      : observationsOrTransitions;
    // Transition maps don't need to be created if they're pre-computed
    this.transitions = this.observations === null && observationsOrTransitions
      ? observationsOrTransitions
      : this.getTransitions()
  }

  /**
   * Change the transition map
   * @param {Array[Array]} transitions - Pre computed transitions
   */
  setTransitions (transitions) {
    this.transitions = transitions;
  }
  /**
   * Get the transition map. Each transition maps a given token/word to another
   * map of tokens/words whose values are occurences.
   *
   * @param {Number} order - Transition order (ie. "memory", tokens required _per_ transition)
   *
   * Given the following observations: 'abc', 'acv', 'vac'
   * Our transitions for the letter `a` would be:
   * @example
   *   [
   *     "a" // first entry is what's being transitioned FROM
   *     "START", // remaining entries are possible transitions
   *     "START",
   *     "b"
   *     "c",
   *     "c"
   *  ]
   *
   * @return {Object} The transition map generated from `this.observations`
   */
  getTransitions (order = this.order) {
    return this.observations.reduce((transitions, set, p) => {
      const tokens = !Array.isArray(set)
        ? `${set}`.toLowerCase().replace(/[^$0-9A-Z:a-z ]/g, '').split(' ')
        : set

      return tokens.reduce((map, token, i, tokens) =>
        (map.find(([t]) => t === token) ? map : map.concat([[token]]))
          .map(([t, ...followers], j) => {
            if (t === 'START' && i === 0) return [t, ...followers, token];
            if (t === token && i === tokens.length - 1) return [t, ...followers, 'END'];
            if (t === token) return [t, ...followers, tokens[i + 1]]
            return [t, ...followers];
          }), transitions);
    }, [['START']]).sort(() => Math.round(Math.random() * 2 - 1));
  }
  /**
   * Given a token `state`, outputs a random resulting state based on probabilities
   * from observations.
   *
   * @param  {String|Number} state – The state we're leaving
   * @return {String|Number}       – The new state
   */
  transitionFrom (state = 'START') {
    const possibilities = this.transitions.find(([t]) => t === state).slice(1);
    return possibilities[Math.floor(Math.random() * possibilities.length)];
  }

  /**
   * Generates a random output based on `observations`
   * @param      {Function} end - Given the current list of output tokens,
   *                              return true to STOP and false to CONTINUE
   * @return {String|Number} randomly generated output of average length
   */
  random (end = v => v[v.length - 1] === 'END') {
    const v = [];
    while (!end(v)) v.push(v.length === 0 ? this.transitionFrom() : this.transitionFrom(v[v.length - 1]))
    return v.filter(t => t !== 'START' && t !== 'END').map(t => `${t.charAt(0).toUpperCase()}${t.substr(1)}`).join(this.delimeter);
  }
}
