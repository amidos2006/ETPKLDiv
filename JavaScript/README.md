<p align="center">
  <h1>ETPKLDiv JavaScript Implementation</h1>
</p>

This is the javascript implementation of the ETPKLDiv method introduced by Lucas and Volz. For more understanding about the main algorithm and the interface check the main README.

## How to use
The library is written in ES6 and compiled to [iife](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) standard using [rollup.js](https://rollupjs.org/guide/en/). The compiled file can be found in the [`bin`](https://github.com/amidos2006/ETPKLDiv/tree/master/JavaScript/bin) folder. Add the compiled file ([`ETPKLDiv.js`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/bin/ETPKLDiv.js)) to the same folder beside your `index.html`. Then add the following tag in your `index.html`:
```html
<html>
  ...
  <script type="text/javascript" src="ETPKLDiv.js"></script>
  ...
</html>
```

The way to use the library is pretty the same between all languages. It involves creating an object of the [`ETPKLDiv`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/code/ETPKLDiv.js) class. Followed by one of these two methods:

- **step by step:** you will need to call [`initializePatternDictionary`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/code/ETPKLDiv.js#L78) followed by [`initializeGeneration`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/code/ETPKLDiv.js#L101) then we can call [`step`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/code/ETPKLDiv.js#L122) as many as needed to enhance the generated map. To get the best fitness call [`getFitness`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/code/ETPKLDiv.js#L150) function and to get the best generated map call [`getMap`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/code/ETPKLDiv.js#L161). Here is a simple example to illustrate:

```javascript
// create the etpkldiv object
let etpkldiv = new ETPKLDiv();
// input_sample is a 2D matrix of integers - 3 is the size of the pattern being sampled
etpkldiv.initializePatternDictionary(input_sample, 3);
// intialize the generated map to be of size 30x30
etpkldiv.initializeGeneration(30, 30);
// Loop for 1000 time to enhance
for(let i=0; i<1000; i++){
  // update the maps
  etpkldiv.step();
  // get the best map
  let bestMap = etpkldiv.getMap();
  // get the fitness of the best map
  let bestFitness = etpkldiv.getFitness();
}
let finalMap = etpkldiv.getMap();
let finalFitness = etpkldiv.getFitness();
```

- **full generation:** you will need to call [`generate`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/code/ETPKLDiv.js#L186) and wait till it is done and return the best generated sample. After done, you can check for the fitness using [`getFitness`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/code/ETPKLDiv.js#L150), or improve the result by calling [`step`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/code/ETPKLDiv.js#L122) as many times as needed (beware: calling [`generate`](https://github.com/amidos2006/ETPKLDiv/blob/master/JavaScript/code/ETPKLDiv.js#L186) again will restart everything from scratch erasing any previous progress). Here is a simple example to illustrate:

```javascript
// create the etpkldiv object
let etpkldiv = new ETPKLDiv();
// generate a map of 30x30 size and run for 1000 iterations based on 3x3 tile patterns from the 2D input_sample
let finalMap = etpkldiv.generate(input_sample, 3, 30, 30, 1000);
// get the fitness of the best map
let finalFitness = etpkldiv.getFitness();
```

We advice using the **full generation** method unless you want to make render during generation or to automatically tune parameters on the fly.
