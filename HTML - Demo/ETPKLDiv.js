var ETPKLDiv = (function () {
  'use strict';

  class Random{
    constructor(seed){
      //seeding is not working yet
    }

    next(){
      return Math.random();
    }

    nextInt(max){
      return Math.floor(Math.random() * max);
    }
  }

  function calculateTilePatternKey(map,x,y,size){
    let pattern = [];
    let key = "";
    for(let dy=0;dy<size;dy++){
      pattern.push([]);
      for(let dx=0; dx<size; dx++){
        let new_y=(y+dy)%map.length;
        let new_x=(x+dx)%map[0].length;
        key += map[new_y][new_x] + ",";
        pattern[pattern.length-1].push(map[new_y][new_x]);
      }
    }
    return [key, pattern];
  }

  function calculateTilePatternProbabilities(maps, tp_sizes, warp = null, borders = null){
    let p = {};
    let patterns = {};
    let border_patterns = {};
    for(let size of tp_sizes){
      p[size] = {};
      patterns[size] = [];
      border_patterns[size] = {"top": [], "bot": [], "left": [], "right": []};
      for(let i=0; i<maps.length; i++){
        let map = maps[i];
        let ySize = size;
        if(warp != null && "y" in warp && warp["y"]){
          ySize = 1;
        }
        for(let y=0;y<map.length-ySize+1;y++){
          let xSize = size;
          if(warp != null && "x" in warp && warp["x"]){
            xSize = 1;
          }
          for(let x=0; x<map[y].length-xSize+1;x++){
            const [key,pattern]=calculateTilePatternKey(map,x,y,size);
            if(!(key in p[size])){
              p[size][key] = 0;
            }
            p[size][key] += 1;
            if(borders != null){
              let temp_border = false;
              if("top" in borders && borders["top"] && y == 0){
                temp_border = true;
                border_patterns[size]["top"].push(pattern);
              }
              if("bot" in borders && borders["bot"] && y == map.length-size){
                temp_border = true;
                border_patterns[size]["bot"].push(pattern);
              }
              if("left" in borders && borders["left"] && x == 0){
                temp_border = true;
                border_patterns[size]["left"].push(pattern);
              }
              if("right" in borders && borders["right"] && x == map[y].length-size){
                temp_border = true;
                border_patterns[size]["right"].push(pattern);
              }
              if(!temp_border){
                patterns[size].push(pattern);
              }
            }
            else{
              patterns[size].push(pattern);
            }
          }
        }
      }
    }
    return [p, patterns, border_patterns];
  }

  class TPDict{
    constructor(input_samples, sizes, warp=null, borders=null){
      //rotation and flipping need to be added
      this._patterns = {};
      this._q_prob = {};
      if(!(input_samples[0][0] instanceof Array)){
        input_samples = [input_samples];
      }
      if(!(sizes instanceof Array)){
        sizes=[sizes];
      }
      sizes = sizes.slice();
      if (sizes.indexOf(1)<0){
        sizes.push(1);
      }
      const [probs, patterns, border_patterns] = calculateTilePatternProbabilities(input_samples, sizes, warp, borders);
      this._q_prob = probs;
      this._patterns = patterns;
      this._border_patterns = border_patterns;
    }

    getTPArray(size){
      return this._patterns[size];
    }

    getTPBorderArray(size, loc){
      return this._border_patterns[size][loc];
    }

    getQProbability(size){
      return this._q_prob[size];
    }
  }

  class Chromosome{
    constructor(tpdict, random, width, height){
      this._tpdict = tpdict;
      this._random = random;

      this._epsilon = 1e-6;
      this._first = null;
      this._second = null;
      this._fitness = null;

      this._width = width;
      this._height = height;
      this._map = [];
      this._locked = [];
      for(let i=0; i<this._height; i++){
        this._map.push([]);
        this._locked.push([]);
        for(let j=0; j<this._width; j++){
          this._map[i].push(0);
          this._locked[i].push(false);
        }
      }
    }

    randomInitialize(tp_sizes, borders){
      for(let y=0; y<this._height; y++){
        for(let x=0; x<this._width; x++){
          let size = tp_sizes;
          if(tp_sizes instanceof Array){
            size = tp_sizes[this._random.nextInt(tp_sizes.length)];
          }
          size = Math.min(size, this._height - y);
          size = Math.min(size, this._width - x);
          let patterns = this._tpdict.getTPArray(size);
          let border_patterns = [];
          if(borders != null){
            if("top" in borders && borders["top"] && y == 0){
              border_patterns = border_patterns.concat(this._tpdict.getTPBorderArray(size, "top"));
            }
            if("bot" in borders && borders["bot"] && y == this._height - size){
              border_patterns = border_patterns.concat(this._tpdict.getTPBorderArray(size, "bot"));
            }
            if("left" in borders && borders["left"] && x == 0){
              border_patterns = border_patterns.concat(this._tpdict.getTPBorderArray(size, "left"));
            }
            if("right" in borders && borders["right"] && x == this._width - size){
              border_patterns = border_patterns.concat(this._tpdict.getTPBorderArray(size, "right"));
            }
          }
          if(border_patterns.length > 0){
            patterns = border_patterns;
          }
          if(patterns.length > 0){
            this._applyTP(patterns[this._random.nextInt(patterns.length)], x, y);
          }
        }
      }
    }

    clone(){
      let clone = new Chromosome(this._tpdict, this._random, this._width, this._height);
      for(let i=0; i<this._map.length; i++){
        for(let j=0; j<this._map[i].length; j++){
          clone._map[i][j] = this._map[i][j];
          clone._locked[i][j] = this._locked[i][j];
        }
      }
      clone._fitness = this._fitness;
      return clone;
    }

    _applyTP(pattern, x, y){
      for(let i=0; i<pattern.length; i++){
        for(let j=0; j<pattern[i].length; j++){
          if(!this._locked[y+i][x+j]){
            this._map[y+i][x+j] = pattern[i][j];
          }
        }
      }
    }

    _calculateKLDivergence(p, q, w){
      let x = [];
      let total_p = 0;
      for (let key in p){
        x.push(key);
        total_p += p[key];
      }
      let total_q = 0;
      for (let key in q){
        x.push(key);
        total_q += q[key];
      }
      let first = 0;
      let second = 0;
      for (let key of x){
        let p_dash = (this._epsilon)/((total_p + this._epsilon) * (1 + this._epsilon));
        let q_dash = (this._epsilon)/((total_q + this._epsilon) * (1 + this._epsilon));
        if (key in p){
          p_dash = (p[key] + this._epsilon)/((total_p + this._epsilon) * (1 + this._epsilon));
        }
        if (key in q){
          q_dash = (q[key] + this._epsilon)/((total_q + this._epsilon) * (1 + this._epsilon));
        }
        first += p_dash * Math.log(p_dash/q_dash);
        second += q_dash * Math.log(q_dash/p_dash);
      }
      this._first = first;
      this._second = second;
      this._fitness = -(w * this._first + (1-w) * this._second);
    }

    calculateDivergence(tp_size, inter_weight=0.5){
      if(this._first != null && this._second != null){
        this._fitness = -(inter_weight * this._first + (1-inter_weight) * this._second);
        return;
      }
      const [probs,patterns,border_patterns] = calculateTilePatternProbabilities([this._map], [tp_size]);
      this._calculateKLDivergence(probs[tp_size], this._tpdict.getQProbability(tp_size), inter_weight);
    }

    getFitness(){
      return this._fitness;
    }

    getMap(){
      return this._map;
    }

    mutate(tp_sizes, mut_times, borders){
      let clone = this.clone();
      let times = Math.max(0, this._random.nextInt(mut_times)) + 1;
      for(let i=0; i<times; i++){
        let size = tp_sizes;
        if(tp_sizes instanceof Array){
          size = tp_sizes[this._random.nextInt(tp_sizes.length)];
        }
        let x = clone._random.nextInt(clone._width - size + 1);
        let y = clone._random.nextInt(clone._height - size + 1);
        let patterns = clone._tpdict.getTPArray(size);
        let border_patterns = [];
        if(borders != null){
          if("top" in borders && borders["top"] && y == 0){
            border_patterns = border_patterns.concat(clone._tpdict.getTPBorderArray(size, "top"));
          }
          if("bot" in borders && borders["bot"] && y == clone._height - size){
            border_patterns = border_patterns.concat(clone._tpdict.getTPBorderArray(size, "bot"));
          }
          if("left" in borders && borders["left"] && x == 0){
            border_patterns = border_patterns.concat(clone._tpdict.getTPBorderArray(size, "left"));
          }
          if("right" in borders && borders["right"] && x == clone._width - size){
            border_patterns = border_patterns.concat(clone._tpdict.getTPBorderArray(size, "right"));
          }
        }
        if(border_patterns.length > 0){
          patterns = border_patterns;
        }
        if(patterns.length > 0){
          clone._applyTP(patterns[clone._random.nextInt(patterns.length)], x, y);
          clone._fitness = null;
        }
      }
      return clone;
    }

    lockTile(x, y, value){
      this._locked[y][x] = true;
      this._map[y][x] = value;
    }

    unlockTile(x, y){
      this._locked[y][x] = false;
    }

    unlockAll(){
      for(let y=0; y<this._height; y++){
        for(let x=0; x<this._width; x++){
          this._locked[y][x] = false;
        }
      }
    }
  }

  class EvolutionStrategy{
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
      let total=0;
      for(let i=0; i<chromosomes.length; i++){
        prob.push(i+1);
        if(i > 0){
          prob[i] += prob[i-1];
        }
        total += prob[prob.length-1];
      }
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

  class ETPKLDiv{
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
    }
  }

  return ETPKLDiv;

}());
