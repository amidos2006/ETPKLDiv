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
      this._fitness = null;

      this._width = width;
      this._height = height;
      this._map = [];
      for(let i=0; i<this._height; i++){
        this._map.push([]);
        for(let j=0; j<this._width; j++){
          this._map[i].push(0);
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
        }
      }
      clone._fitness = this._fitness;
      return clone;
    }

    _applyTP(pattern, x, y){
      for(let i=0; i<pattern.length; i++){
        for(let j=0; j<pattern[i].length; j++){
          this._map[y+i][x+j] = pattern[i][j];
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
      return -(w * first + (1-w) * second)
    }

    calculateDivergence(tp_size, inter_weight){
      if(this._fitness != null){
        return;
      }
      if(typeof inter_weight == undefined){
        inter_weight = 0.5;
      }
      const [probs,patterns,border_patterns] = calculateTilePatternProbabilities([this._map], [tp_size]);
      this._fitness = this._calculateKLDivergence(probs[tp_size], this._tpdict.getQProbability(tp_size), inter_weight);
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
  }

  class ETPKLDiv{
    constructor(input_samples, tp_size, warp = null, borders = null){
      this._random = new Random();
      let sizes = [];
      for(let i=1; i<=tp_size; i++){
        sizes.push(i);
      }
      this._tpdict = new TPDict(input_samples, sizes, warp, borders);
      this._tp_size = tp_size;
      this._borders = borders;
    }

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

    _computeDivergenceFintess(chromosomes, inter_weight){
      for(let c of chromosomes){
        c.calculateDivergence(this._tp_size, inter_weight);
      }
    }

    _sortChromosomes(chromosomes, noise=0){
      chromosomes.sort((c1, c2) => {return c1._fitness - c2._fitness + noise * (this._random.next()*2-1)});
    }

    initialize(width, height, pop_size=1, inter_weight=0.5, noise=0){
      this._chromosomes = [];
      for(let i=0; i<pop_size; i++){
        this._chromosomes.push(new Chromosome(this._tpdict, this._random, width, height));
        this._chromosomes[i].randomInitialize(1, this._borders);
      }
      this._computeDivergenceFintess(this._chromosomes, inter_weight);
      this._sortChromosomes(this._chromosomes, noise);
    }

    step(inter_weight=0.5, mut_times=1, noise=0){
      let new_chromosomes = [];
      for(let j=0; j<this._chromosomes.length; j++){
        let c = this._rankSelection(this._chromosomes).mutate(this._tp_size, mut_times, this._borders);
        new_chromosomes.push(c);
      }
      this._computeDivergenceFintess(new_chromosomes, inter_weight);
      this._chromosomes = this._chromosomes.concat(new_chromosomes);
      this._sortChromosomes(this._chromosomes, noise);
      this._chromosomes = this._chromosomes.splice(this._chromosomes.length/2);
    }

    getFitness(){
      return this._chromosomes[this._chromosomes.length - 1]._fitness;
    }

    getMap(){
      return this._chromosomes[this._chromosomes.length - 1]._map;
    }

    generate(width, height, iterations=10000, pop_size=1, inter_weight=0.5, mut_times=1, noise=0){
      this.initialize(width, height, pop_size, inter_weight, noise);
      for(let i=0; i<iterations; i++){
        this.step(inter_weight, noise);
      }
    }
  }

  return ETPKLDiv;

}());
