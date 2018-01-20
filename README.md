# MARC
#### A tiny Markov chain generator in JavaScript

Easily create Markov models from a given set of observations to generate random
sequences of _potential_ observations.

#### Usage
```
import Marc from 'marc';
// Our observations consist of four sentences from a rando's Twitter account
const observations = ['a sentence', 'another sentence', 'one more', 'and the last'];
// Give Mark the observations and tell it our token delimeter (' ')
const m = new Mark(observations, ' ');
// Generate a probable observation
const random = m.random();
```

#### Run the example
```
$> npm run example
```

#### A few examples (from NYTimes homepage, 01-19-2018):
- Cuomo Looks at The Bike That Could Cost $11.52
- Vows: For Love of Oat Milk Merkel?
- Timeline: How Congress Breaks Down the Collusion We Were Waiting For?
- Trilobites: Debunking the Jewelry Is Dead Trees
- Military Shifts Focus to Trump’s Radical Honesty
- A Good at 78 Movement Has Plenty to Win
- Trump Administration on #MeToo Moment Shape the Bitcoin Bubble
- Sundance Film Festival: 5 Movies to Thwart Federal Government
