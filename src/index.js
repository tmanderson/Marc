/**
 * @params {Array[Array|String|Number]} obervations – A set of obervations
 * @params {}
 */
export default class Marc {
  constructor(observationsOrTransitions, { delimiter = ' ', order = 2 }) {
    this.order = Math.max(order, 1);
    this.delimiter = typeof delimiter === 'string' ? delimiter : ' ';
    this.transitions = [['START']];
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
    return this.observations
      .map(words =>
        !Array.isArray(words)
          ? words.toLowerCase()
            .replace(/[^-$0-9A-Z:a-z ]/g, '')
            .split(this.delimiter)
          : words
      )
      .reduce((transitions, observation) => {
        // Size words using `order`
        const words = observation
          .reduce((scaledWords, word, i, words) =>
            (i + 1) % order > 0
            ? scaledWords
            : scaledWords.concat([words.slice((i + 1) - order, i + 1).join(this.delimiter)]),
            []
          );

        return ['START'].concat(words).reduce((transitions, word, i, words) => {
          let transitionIndex = transitions.findIndex(([leader]) => leader === word);
          if (transitionIndex < 0) transitionIndex = (transitions.push([word]) - 1);
          transitions[transitionIndex].push(words[i + 1] || 'END');
          return transitions;
        }, transitions);
      }, this.transitions)
      .map(([leader, ...followers]) => [
        leader, ...followers.sort(() => Math.round(Math.random() * 2 - 1))
      ]);
  }
  /**
   * Given a token `state`, outputs a random resulting state based on probabilities
   * from observations.
   *
   * @param  {String|Number} state – The state we're leaving
   * @return {String|Number}       – The new state
   */
  transitionFrom(state = ['START']) {
    if (state[state.length - 1] === 'END') return state.slice(1, -1).join(this.delimiter);
    const possibilities = this.transitions.find(([t]) => t === state[state.length - 1]);
    if (!possibilities) return state.slice(1, -1).join(this.delimiter);
    return this.transitionFrom(state.concat(possibilities.slice(1)[Math.floor(Math.random() * (possibilities.length - 1))]));
  }

  /**
   * Generates a random output based on `observations`
   * @param      {Function} end - Given the current list of output tokens,
   *                              return true to STOP and false to CONTINUE
   * @return {String|Number} randomly generated output of average length
   */
  random() {
    return this.transitionFrom();
  }
}
