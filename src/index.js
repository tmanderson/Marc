/**
 * @params {Array[Array|String|Number]} obervations – A set of obervations
 * @params {}
 */
export default class Marc {
  constructor(observationsOrTransitions, { delimeter = '', order = 0 }) {
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
  setTransitions(transitions) {
    this.transitions = transitions
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
  getTransitions(order = this.order) {
    return this.observations.reduce((transitions, set, p) => {
      const tokens = !Array.isArray(set)
        ? `${set}`.toLowerCase()
          .replace(/[^-$0-9A-Z:a-z ]/g, '')
          .split(this.delimeter)
        : set

      return tokens.reduce((map, token, i, tokens) => {
        // Sequence of tokens leading to the current `token`, for higher-order sampling
        const Pt = tokens.slice(Math.max(0, i - order), i + 1); //.join(this.delimeter);
        // Find pre-existing transitions for `token` or create a new entry
        return (map.find(([t]) => t === Pt) ? map : map.concat([[Pt]]))
          .map(([tok, ...followers], j) => {
            // the last token in sequence, irrelevant for 0-orders
            const t = tok[tok.length - 1];
            if (t === 'START' && i === 0) return [tok, ...followers, token]
            if (t === token && i === tokens.length - 1) return [tok, ...followers, 'END']
            if (t === token) return [tok, ...followers, tokens[i + 1]]
            return [tok, ...followers]
          });
      }, transitions)
    }, [[['START']]])
      .sort(() => Math.round(Math.random() * 2 - 1))
      // Join higher-order keys once transitions are completed (TODO: maybe forgo this when `order === 0`)
      .map(([key, ...followers]) => [key.join(this.delimeter), ...followers])
  }
  /**
   * Given a token `state`, outputs a random resulting state based on probabilities
   * from observations.
   *
   * @param  {String|Number} state – The state we're leaving
   * @return {String|Number}       – The new state
   */
  transitionFrom(state = 'START') {
    const possibilities = (this.transitions.find(([t]) => t === state) ||
      // for higher-orders, smaller data sets lack sufficient samples, so we randomly choose the transition here.
      this.transitions[Math.floor(Math.random() * this.transitions.length)]);
    return possibilities.slice(1)[Math.floor(Math.random() * (possibilities.length - 1))];
  }

  /**
   * Generates a random output based on `observations`
   * @param      {Function} end - Given the current list of output tokens,
   *                              return true to STOP and false to CONTINUE
   * @return {String|Number} randomly generated output of average length
   */
  random(end = v => v[v.length - 1] === 'END') {
    const v = [];
    while (!end(v))
      v.push(v.length === 0
        ? this.transitionFrom()
        : this.transitionFrom(v.slice(-(1 + this.order)).join(this.delimeter)))

    return v
      .filter(t => t !== 'START' && t !== 'END')
      .join(this.delimeter)
  }
}
