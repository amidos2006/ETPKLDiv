import EvolutionStrategy from "./EvolutionStrategy.js"

export default class ETPKLDiv{
  /**
   *  create the ETPKLDiv object to be used in generation
   **/
  constructor(){
    this._es = new EvolutionStrategy();
  }

  /**
   *  Initialize the pattern dictionary that is used during generation
   *  only call that function when you want to change any aspect of the patterns
   *
   *  @param {int[][]} input_samples  the input integer matrix that the algorithm sample from
   *  @param {int}     tp_size        the size of the tile patterns used in generation larger than 1
   *  @param {Object}  [warp=null]    an object that allow the patterns to sample by wrapping across the edges
   *  @param {Object}  [borders=null] an object that allow the edges to be similar to the edges from the input_samples
   */
  initializePatternDictionary(input_samples, tp_size, warp = null, borders = null){
    if(!(input_samples instanceof Array)){
      throw "input_samples has to be a 2D input array or 3D where the 3rd dimensions are different inputs (example different levels)";
    }
    if(!(input_samples[0] instanceof Array)){
      throw "input_samples has to be a 2D input array or 3D where the 3rd dimensions are different inputs (example different levels)";
    }
    if(input_samples[0][0] instanceof Array && input_samples[0][0][0] instanceof Array){
      throw "input_samples has to be a 2D input array or 3D where the 3rd dimensions are different inputs (example different levels)";
    }
    if(tp_size <= 1){
      tp_size = 2;
    }
    this._es.initializePatternDictionary(input_samples, tp_size, warp, borders);
  }

  /**
   *  Initialize the algorithm with a bunch of randomly generated maps
   *  only call after calling initializePatternDictionary
   *
   *  @param {int}   width              the width of the generated map
   *  @param {int}   height             the height of the generated map
   *  @param {int}   [pop_size=1]       the number of generated map at once (having more maps in parallel) helps find good solution faster
   **/
  initializeGeneration(width, height, pop_size=1){
    if(width < this._es._tp_size){
      throw "width has to be bigger than or equal to tp_size"
    }
    if(height < this._es._tp_size){
      throw "height has to be bigger than or equal to tp_size"
    }
    if(pop_size < 1){
      throw "pop_size can be minimum 1"
    }
    this._es.initializeGeneration(width, height, pop_size);
  }

  /**
   *  Advance the algorithm one step you need to call initializeGeneration and initializePatternDictionary first
   *
   *  @param {float} [inter_weight=0.5] the Asymmetric weight defined from Lucas and Volz work. It balances between having the input_sample have at least one of each pattern in the generated image or vice versa.
   *  @param {int}   [mut_times=1]      the maximum number of modifications the algorithm is allowed to do in one step
   *  @param {float} [noise=0]          noise value to push the algorithm away from certain arrays and embrace some new noise
   **/
  step(inter_weight=0.5, mut_times=1, noise=0){
    if(mut_times < 1){
      throw "mut_times has to be bigger than 1"
    }
    if(noise < 0){
      throw "noise must be >= 0"
    }
    this._es.step(inter_weight, mut_times, noise);
  }

  /**
   *  Get the fitness of the best chromosome in the generation
   */
  getFitness(){
    return this._es.getFitness();
  }

  /**
   *  Get the map of the best chromosome in the generation
   */
  getMap(){
    return this._es.getMap();
  }

  /**
   *  Get the current iteration
   */
  getIteration(){
    return this._es.getIteration();
  }

  /**
   *  Lock a certain tile to a certain value so it won't be affected with the Generation process
   *
   *  @param {int} x     the locked x location
   *  @param {int} y     the locked y location
   *  @param {int} value the locked value
   */
  lockTile(x, y, value){
    this._es.lockTile(x, y, value);
  }

  /**
   *  Unlock a certain tile in the generated maps
   *
   *  @param {int} x     the locked x location
   *  @param {int} y     the locked y location
   */
  unlockTile(x, y){
    this._es.unlockTile(x, y);
  }

  /**
   *  unlock all the locked tiles in the generated maps
   */
  unlockAll(){
    this._es.unlockAll();
  }

  /**
   *  Run the algorithm for a fixed amount of iterations.
   *  This function doesn't need anything to be called before hand.
   *  You can call step to enhance the generation after that function is done
   *
   *  @param {int[][]} input_samples      the input integer matrix that the algorithm sample from
   *  @param {int}     tp_size            the size of the tile patterns used in generation larger than 1
   *  @param {int}     width              the width of the generated map
   *  @param {int}     height             the height of the generated map
   *  @param {int}     [iterations=10000] the number of iterations that the algorithm should do before finishing
   *  @param {Object}  [warp=null]        an object that allow the patterns to sample by wrapping across the edges
   *  @param {Object}  [borders=null]     an object that allow the edges to be similar to the edges from the input_samples
   *  @param {int}     [pop_size=1]       the number of generated map at once (having more maps in parallel) helps find good solution faster
   *  @param {float}   [inter_weight=0.5] the Asymmetric weight defined from Lucas and Volz work. It balances between having the input_sample have at least one of each pattern in the generated image or vice versa.
   *  @param {int}     [mut_times=1]      the maximum number of modifications the algorithm is allowed to do in one step
   *  @param {float}   [noise=0]          noise value to push the algorithm away from certain arrays and embrace some new noise
   */
  generate(input_samples, tp_size, width, height, iterations=10000, warp=null, borders=null, pop_size=1, inter_weight=0.5, mut_times=1, noise=0){
    this.initializePatternDictionary(input_samples, tp_size, warp, borders);
    this.initializeGeneration(width, height, pop_size);
    while(this.getIteration()<iterations){
      this.step(inter_weight, mut_times, noise);
    }
    return this.getMap();
  }
}
