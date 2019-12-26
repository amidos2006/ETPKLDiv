import Random from "./Random.js"
import TPDict from "./TPDict.js"
import Chromosome from "./Chromosome.js"

export default class ETPKLDiv{
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
