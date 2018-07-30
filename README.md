# MARC
#### A tiny Markov chain generator in JavaScript

Easily create Markov models from a given set of observations to generate random
sequences of other potential observations. Larger data sets can be pre-computed
using the **new** [transition generator](#pre-compute-transitions-recommended-for-large-data-sets).

Marc supports both [time-homogeneous](https://en.wikipedia.org/wiki/Markov_chain#Variations)
and [higher-order](https://en.wikipedia.org/wiki/Markov_chain#Variations) Markov chains.

#### Usage
```js
import Marc from 'marc';
// Our observations consist of four sentences from a rando's Twitter account
const observations = ['a sentence', 'another sentence', 'one more', 'and the last'];
// Give Mark the observations and tell it our token delimeter (' ')
const m = new Mark(observations, { delimeter: ' ', order: 0 }); // order = n - 1
// Generate a probable observation
const random = m.random();
```

#### Run the example
```bash
$> npm run example
```

#### Pre Compute transitions (recommended for large data sets)
##### With global install
```bash
$> npm install -g @tmanderson/marc
$> marc observations.json transitions.json
```

##### From repo
```bash
$> ./bin/index.js observations.json transitions.json
```

The output `transitions.json` file can be used with Marc via `setTransitions` or
when creating an instance.

```js
fetch('transitions.json')
  .then(res => res.json())
  .then(observations => new Marc(observations, { delimeter: ' ', order: 0 }));
```

#### A few examples, some funny, others serious (from NYTimes homepage, 01-19-2018):
- Cuomo Looks at The Bike That Could Cost $11.52
- Vows: For Love of Oat Milk Merkel?
- ICE Detained My Life
- How the Worst Way to Help Travelers Choose Safe Destinations
- Brand to Pretend They’re Homeless Pro-Life Movement Has Plenty
- Why James Franco Could Cost $11.52
- Timeline: How Congress Breaks Down the Collusion We Were Waiting For?
- Military Shifts Focus to Trump’s Radical Honesty
- Trump Administration on #MeToo Moment Shape the Bitcoin Bubble
- Sundance Film Festival: 5 Movies to Thwart Federal Government
