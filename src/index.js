/**
 * @params {Array[String|Number]} obervations – A set of obervations
 * @params {}
 */
export default class Marc {
  get averageTransitionLength() {
    return Math.round(Object.values(this.observations)
      .reduce((avgLength, o) =>
        avgLength + o.split(this.delimeter).length,
        0
      ) / this.observations.length
    );
  }

  constructor(observations, delimeter = '') {
		this.delimeter = delimeter;
    this.observations = observations;
    this.transitions = this.getTransitions();
  }
  /**
   * Get the transition map. Each transition maps a given token/word to another
   * map of tokens/words whose values are occurences. Given the following observations
   *   'abc', 'acv', 'vac'
   *
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
  getTransitions() {
    return this.observations.reduce((transitions, set) => {
      const tokens = Array.isArray(set) ? set : `${set}`.split(this.delimeter);
      // Add entries to transition probabilities for the given set of `tokens`
      return tokens.reduce((probs, token, i, tokens) => Object.assign(probs, {
        // If i === 0, increment the total observations starting with `token`
        'START': Object.assign((probs.START || {}), {
          [token]: ((probs.START || {})[token] || 0) + (i === 0 ? 1 : 0)
        }),
        // Add entries to transition probabilities for the given `token`
        [token]: Object.assign(probs[token] || {},
          {
            // increment the total observations of `token` transitioning to END
            'END': Object.assign((probs.END || {}), {
              [token]: ((probs.END || {})[token] || 0) + (i === tokens.length - 1 ? 1 : 0)
            })
          },
          // increment observations of `token` transitioning to next `token`
          {
            [tokens[i + 1]]: ((probs[token] || {})[tokens[i + 1]] || 0) + (i < tokens.length - 1 ? 1 : 0)
          }
        )
      }), transitions);
    }, {});
  }
  /**
   * Given a token `state`, outputs a random resulting state based on probabilities
   * from observations.
   *
   * @param  {String|Number} state – The state we're leaving
   * @return {String|Number}       – The new state
   */
  transitionFrom(state = 'START') {
    const possibilities = Object.keys(this.transitions)
      .reduce((probs, t) => {
        const p = this.transitions[state][t];
        return p ? probs.concat(new Array(p).fill(t)) : probs;
      }, []);

    return possibilities.length
      ? possibilities[Math.floor(Math.random()*possibilities.length)]
      : Object.keys(this.transitions).filter(t => t !== 'START' && t !== 'END')[Math.floor(Math.random()*Object.keys(this.transitions).length)]
  }

  /**
   * Generates a random output based on `observations`
   * @return {String|Number} randomly generated output of average length
   */
  random(n = this.averageTransitionLength) {
    return new Array(n).fill(0).reduce((v, _, i) => {
      // last character of last word
      if (/[.?]|END$/.test(v[v.length-1])) return v;
      return v.concat(i === 0 ? this.transitionFrom() : this.transitionFrom(v[i-1]));
    }, []).join(this.delimeter);
  }
}
