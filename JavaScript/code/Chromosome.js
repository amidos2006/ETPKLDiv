import {calculateTilePatternProbabilities} from "./Helper.js"

export default class Chromosome{
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
    clone._first = this._first;
    clone._second = this._second;
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
    this._first = 0;
    this._second = 0;
    for (let key of x){
      let p_dash = (this._epsilon)/((total_p + this._epsilon) * (1 + this._epsilon));
      let q_dash = (this._epsilon)/((total_q + this._epsilon) * (1 + this._epsilon));
      if (key in p){
        p_dash = (p[key] + this._epsilon)/((total_p + this._epsilon) * (1 + this._epsilon))
      }
      if (key in q){
        q_dash = (q[key] + this._epsilon)/((total_q + this._epsilon) * (1 + this._epsilon))
      }
      this._first += p_dash * Math.log(p_dash/q_dash);
      this._second += q_dash * Math.log(q_dash/p_dash);
    }
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
        clone._first = null;
        clone._second = null;
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
