import Random from "./Random.js"
import TPDict from "./TPDict.js"
import Chromosome from "./Chromosome.js"

export default class EvolutionStrategy{
  /**
   *  create the Evolution Strategy object to be used in generation
   **/
  constructor(){
    this._random = new Random();
    this._tpdict = null;
    this._chromosomes = null;
  }

  /**
   *  Get a chromosome probabilistically based on its rank (the last element has the highest rank)
   *
   *  @access private
   *
   *  @param {Chromosome[]} chromosomes  a list of all the possible maps
   *
   *  @return {Chromosome} the selected chromosome
   **/
  _rankSelection(chromosomes){
    let prob=[];
    for(let i=0; i<chromosomes.length; i++){
      prob.push(i+1);
      if(i > 0){
        prob[i] += prob[i-1];
      }
    }
    let total = prob[prob.length-1];
    let temp = this._random.next();
    for(let i=0; i<chromosomes.length; i++){
      if(temp < prob[i] / total){
        return chromosomes[i];
      }
    }
    return chromosomes[chromosomes.length-1];
  }

  /**
   *  Compute the fitness for all the chromosomes, this was separated in a function for future usage of using parallelism
   *
   *  @access private
   *
   *  @param {Chromosome[]} chromosomes  a list of all the possible maps
   *  @param {float}        inter_weight the Asymmetric weight defined from Lucas and Volz work. It balances between having the input_sample have at least one of each pattern in the generated image or vice versa.
   **/
  _computeDivergenceFintess(chromosomes, inter_weight){
    for(let c of chromosomes){
      c.calculateDivergence(this._tp_size, inter_weight);
    }
  }

  /**
   *  Sort the chromosomes based on their fitness and temperature noise input
   *
   *  @access private
   *
   *  @param {Chromosome[]} chromosomes  a list of all the possible maps
   *  @param {float}        noise        an additional uniform noise added during sorting, it helps to get out local minimum similar to the temprature in simulated annealing
   **/
  _sortChromosomes(chromosomes, noise){
    chromosomes.sort((c1, c2) => {return c1.getFitness() - c2.getFitness() + noise * (this._random.next()*2-1)});
  }

  /**
   *  Initialize the pattern dictionary that is used during generation
   *  only call that function when you want to change any aspect of the patterns
   *
   *  @param {int[][]} input_samples  the input integer matrix that the algorithm sample from
   *  @param {int}     tp_size        the size of the tile patterns used in generation larger than 1
   *  @param {Object}  warp           an object that allow the patterns to sample by wrapping across the edges
   *  @param {Object}  borders        an object that allow the edges to be similar to the edges from the input_samples
   */
  initializePatternDictionary(input_samples, tp_size, warp, borders){
    let sizes = [];
    for(let i=1; i<=tp_size; i++){
      sizes.push(i);
    }
    this._tpdict = new TPDict(input_samples, sizes, warp, borders);
    this._tp_size = tp_size;
    this._warp = warp;
    this._borders = borders;
  }

  /**
   *  Initialize the algorithm with a bunch of randomly generated maps
   *  only call after calling initializePatternDictionary
   *
   *  @param {int}   width              the width of the generated map
   *  @param {int}   height             the height of the generated map
   *  @param {int}   pop_size           the number of generated map at once (having more maps in parallel) helps find good solution faster
   **/
  initializeGeneration(width, height, pop_size){
    if(this._tpdict == null){
      throw "you must call initializePatternDictionary first."
    }

    this._iteration = 0;

    this._chromosomes = [];
    for(let i=0; i<pop_size; i++){
      this._chromosomes.push(new Chromosome(this._tpdict, this._random, width, height));
      this._chromosomes[i].randomInitialize(1, this._borders);
    }
  }

  /**
   *  Advance the algorithm one step you need to call initializeGeneration and initializePatternDictionary first
   *
   *  @param {float} [inter_weight=0.5] the Asymmetric weight defined from Lucas and Volz work. It balances between having the input_sample have at least one of each pattern in the generated image or vice versa.
   *  @param {int}   [mut_times=1]      the maximum number of modifications the algorithm is allowed to do in one step
   *  @param {float} [noise=0]          noise value to push the algorithm away from certain arrays and embrace some new noise
   **/
  step(inter_weight, mut_times, noise){
    if(this._tpdict == null){
      throw "you must call initializePatternDictionary before calling this function."
    }
    if(this._chromosomes == null){
      throw "you must call initializeGeneration before calling this function."
    }

    if(this._iteration == 0){
      this._computeDivergenceFintess(this._chromosomes, inter_weight);
      this._sortChromosomes(this._chromosomes, noise);
    }

    let new_chromosomes = [];
    for(let j=0; j<this._chromosomes.length; j++){
      let c = this._rankSelection(this._chromosomes).mutate(this._tp_size, mut_times, this._borders);
      new_chromosomes.push(c);
    }
    this._chromosomes = this._chromosomes.concat(new_chromosomes);
    this._computeDivergenceFintess(this._chromosomes, inter_weight);
    this._sortChromosomes(this._chromosomes, noise);
    this._chromosomes = this._chromosomes.splice(this._chromosomes.length/2);
    this._iteration += 1;
  }

  /**
   *  Get the fitness of the best chromosome in the generation
   */
  getFitness(){
    if(this._chromosomes == null){
      throw "you must call initializeGeneration before calling this function."
    }

    return this._chromosomes[this._chromosomes.length - 1].getFitness();
  }

  /**
   *  Get the map of the best chromosome in the generation
   */
  getMap(){
    if(this._chromosomes == null){
      throw "you must call initializeGeneration before calling this function."
    }

    return this._chromosomes[this._chromosomes.length - 1].getMap();
  }

  /**
   *  Get the current iteration
   */
  getIteration(){
    if(this._chromosomes == null){
      throw "you must call initializeGeneration before calling this function."
    }

    return this._iteration;
  }

  /**
   *  Lock a certain tile to a certain value so it won't be affected with the Generation process
   *
   *  @param {int} x     the locked x location
   *  @param {int} y     the locked y location
   *  @param {int} value the locked value
   */
  lockTile(x, y, value){
    if(this._chromosomes == null){
      throw "you must call initializeGeneration before calling this function."
    }

    for(let c of this._chromosomes){
      c.lockTile(x, y, value);
    }
  }

  /**
   *  Unlock a certain tile in the generated maps
   *
   *  @param {int} x     the locked x location
   *  @param {int} y     the locked y location
   */
  unlockTile(x, y){
    if(this._chromosomes == null){
      throw "you must call initializeGeneration before calling this function."
    }

    for(let c of this._chromosomes){
      c.unlockTile(x, y);
    }
  }

  /**
   *  unlock all the locked tiles in the generated maps
   */
  unlockAll(){
    if(this._chromosomes == null){
      throw "you must call initializeGeneration before calling this function."
    }

    for(let c of this._chromosomes){
      c.unlockAll();
    }
  }
}
