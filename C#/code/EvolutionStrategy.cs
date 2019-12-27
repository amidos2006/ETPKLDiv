using System;
using System.Collections.Generic;

namespace ETPKLDivLibrary{
  class EvolutionStrategy{
    private Random _random;
    private TPDict _tpdict;
    private List<Chromosome> _chromosomes;
    private int _tp_size;
    private WarpOptions _warp;
    private BorderOptions _borders;
    private int _iteration;

    public EvolutionStrategy(){
      this._random = new Random();
      this._tpdict = null;
      this._chromosomes = null;
      this._tp_size = 2;
      this._iteration = 0;
      this._warp = null;
      this._borders = null;
    }

    private Chromosome RankSelection(){
      List<double> prob=new List<double>();
      double total=0;
      for(int i=0; i<this._chromosomes.Count; i++){
        prob.Add(i+1);
        if(i > 0){
          prob[i] += prob[i-1];
        }
        total += prob[prob.Count-1];
      }
      double temp = this._random.NextDouble();
      for(int i=0; i<this._chromosomes.Count; i++){
        if(temp < prob[i] / total){
          return this._chromosomes[i];
        }
      }
      return this._chromosomes[this._chromosomes.Count-1];
    }

    private void ComputeDivergenceFintess(double inter_weight){
      foreach(Chromosome c in this._chromosomes){
        c.CalculateDivergence(this._tp_size, inter_weight);
      }
    }

    private void SortChromosomes(double noise){
      this._chromosomes.Sort(delegate(Chromosome c1, Chromosome c2)
        {
            return Math.Sign(c1.GetFitness() - c2.GetFitness() + noise * (this._random.NextDouble()*2-1));
        });
    }

    public void InitializePatternDictionary(List<int[,]> input_samples, int tp_size, WarpOptions warp, BorderOptions borders){
      List<int> sizes = new List<int>();
      for(int i=1; i<=tp_size; i++){
        sizes.Add(i);
      }
      this._tpdict = new TPDict(input_samples, sizes, warp, borders);
      this._tp_size = tp_size;
      this._warp = warp;
      this._borders = borders;
    }

    public void InitializeGeneration(int width, int height, int pop_size){
      if(this._tpdict == null){
        throw new Exception("you must call initializePatternDictionary first.");
      }

      this._iteration = 0;
      this._chromosomes = new List<Chromosome>();
      for(int i=0; i<pop_size; i++){
        this._chromosomes.Add(new Chromosome(this._tpdict, this._random, width, height));
        this._chromosomes[i].RandomInitialize(new List<int>(){1}, this._borders);
      }
    }

    public void Step(double inter_weight, int mut_times, double noise){
      if(this._tpdict == null){
        throw new Exception("you must call initializePatternDictionary before calling this function.");
      }
      if(this._chromosomes == null){
        throw new Exception("you must call initializeGeneration before calling this function.");
      }

      if(this._iteration == 0){
        this.ComputeDivergenceFintess(inter_weight);
        this.SortChromosomes(noise);
      }

      List<Chromosome> new_chromosomes = new List<Chromosome>();
      for(int j=0; j<this._chromosomes.Count; j++){
        Chromosome c = this.RankSelection().Mutate(new List<int>(){this._tp_size}, mut_times, this._borders);
        new_chromosomes.Add(c);
      }
      this._chromosomes.AddRange(new_chromosomes);
      this.ComputeDivergenceFintess(inter_weight);
      this.SortChromosomes(noise);
      this._chromosomes.RemoveRange(0, this._chromosomes.Count/2);
      this._iteration += 1;
    }

    public double GetFitness(){
      if(this._chromosomes == null){
        throw new Exception("you must call initializeGeneration before calling this function.");
      }

      return this._chromosomes[this._chromosomes.Count - 1].GetFitness();
    }

    public int[,] GetMap(){
      if(this._chromosomes == null){
        throw new Exception("you must call initializeGeneration before calling this function.");
      }

      return this._chromosomes[this._chromosomes.Count - 1].GetMap();
    }

    public int GetIteration(){
      if(this._chromosomes == null){
        throw new Exception("you must call initializeGeneration before calling this function.");
      }

      return this._iteration;
    }

    public void LockTile(int x, int y, int value){
      if(this._chromosomes == null){
        throw new Exception("you must call initializeGeneration before calling this function.");
      }

      foreach(Chromosome c in this._chromosomes){
        c.LockTile(x, y, value);
      }
    }

    public void UnlockTile(int x, int y){
      if(this._chromosomes == null){
        throw new Exception("you must call initializeGeneration before calling this function.");
      }

      foreach(Chromosome c in this._chromosomes){
        c.UnlockTile(x, y);
      }
    }

    public void UnlockAll(){
      if(this._chromosomes == null){
        throw new Exception("you must call initializeGeneration before calling this function.");
      }

      foreach(Chromosome c in this._chromosomes){
        c.UnlockAll();
      }
    }

    public int TPSize{
      get{ return this._tp_size; }
    }
  }
}
