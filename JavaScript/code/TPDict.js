import {calculateTilePatternProbabilities} from "./Helper.js"

export default class TPDict{
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
