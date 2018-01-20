/**
 * @params {Array[String|Number]} obervations – A set of obervations
 * @params {}
 */
export default class Marc {
  constructor (observations, { delimeter = '', order = 0 }) {
    this.order = order
    this.delimeter = delimeter
    this.observations = observations
    this.transitions = this.getTransitions()
  }
  /**
   * Get the transition map. Each transition maps a given token/word to another
   * map of tokens/words whose values are occurences.
   *
   * @param {Number} order - The order (ie. "memory") of the chain
   *
   * Given the following observations: 'abc', 'acv', 'vac'
   * Our transitions for the letter `a` would be:
   * @example
   *   {
   *     a: {
   *       START: 2,
   *       b: 1,
   *       c: 2
   *     }
   *   }
   *
   * @return {Object} The transition map generated from `this.observations`
   */
  getTransitions (order = this.order) {
    return this.observations.reduce((transitions, set) => {
      const tokens = Array.isArray(set) ? set : `${set}`.split(this.delimeter)
      // Add entries to transition probabilities for the given set of `tokens`
      return tokens.reduce((probs, token, i, tokens) =>
        Object.assign(probs, {
          // If i === 0, increment the total observations starting with `token`
          'START': Object.assign((probs.START || {}), {
            [token]: ((probs.START || {})[token] || 0) + (i === 0 ? 1 : 0)
          })
        },
        (new Array(i - order + 1).fill(0)).reduce((transitions, _, j) => {
          const t = tokens.slice(i - order, i + 1).join(this.delimeter)
          return Object.assign(transitions, {
            [t]: Object.assign(transitions[t] || {}, {
              'END': ((transitions[t] || {}).END || 0) + (i === tokens.length - 1 ? 1 : 0)
            }, i < tokens.length - 1
              ? {
                [tokens[i + 1]]: ((probs[token] || {})[tokens[i + 1]] || 0) + 1
              }
              : {}
            )
          })
        }, transitions)
        ), transitions)
    }, {})
  }
  /**
   * Given a token `state`, outputs a random resulting state based on probabilities
   * from observations.
   *
   * @param  {String|Number} state – The state we're leaving
   * @return {String|Number}       – The new state
   */
  transitionFrom (state = 'START') {
    const possibilities = Object.keys(this.transitions)
      .reduce((probs, t) => {
        const p = this.transitions[state][t]
        return p ? probs.concat(new Array(p).fill(t)) : probs
      }, [])

    return possibilities.length
      ? possibilities[Math.floor(Math.random() * possibilities.length)]
      : 'END'
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
    return v.filter(t => t !== 'START' && t !== 'END').join(this.delimeter);
  }
}
