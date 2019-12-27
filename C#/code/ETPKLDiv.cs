using System;
using System.Collections.Generic;

namespace ETPKLDiv{
  class ETPKLDiv{
    /// optimizer object
    private EvolutionStrategy _es;

    /// <summary>
    /// Constructor for the generation class, can be used in the future to select between different optimizers
    /// </summary>
    public ETPKLDiv(){
      this._es = new EvolutionStrategy();
    }

    /// <summary>
    /// Initialize the pattern dictionary that is used during generation
    /// only call that function when you want to change any aspect of the patterns
    /// </summary>
    /// <param name="input_samples">the input integer matrix that the algorithm sample from</param>
    /// <param name="tp_size">the size of the tile patterns used in generation larger than 1</param>
    /// <param name="warp">an object that allow the patterns to sample by wrapping across the edges</param>
    /// <param name="borders">an object that allow the edges to be similar to the edges from the input_samples</param>
    public void InitializePatternDictionary(List<int[,]> input_samples, int tp_size, WarpOptions warp = null, BorderOptions borders = null){
      if(tp_size <= 1){
        tp_size = 2;
      }
      this._es.InitializePatternDictionary(input_samples, tp_size, warp, borders);
    }

    /// <summary>
    /// Initialize the algorithm with a bunch of randomly generated maps
    /// only call after calling initializePatternDictionary
    /// </summary>
    /// <param name="width">the width of the generated sample</param>
    /// <param name="height">the height of the generated sample</param>
    /// <param name="pop_size">the number of generated map at once (having more maps in parallel) helps find good solution faster</param>
    public void InitializeGeneration(int width, int height, int pop_size=1){
      if(width < this._es.TPSize){
        throw new Exception("width has to be bigger than or equal to tp_size");
      }
      if(height < this._es.TPSize){
        throw new Exception("height has to be bigger than or equal to tp_size");
      }
      if(pop_size < 1){
        throw new Exception("population must be greater than 0");
      }
      this._es.InitializeGeneration(width, height, pop_size);
    }

    /// <summary>
    /// Advance the algorithm one step you need to call initializeGeneration and initializePatternDictionary first
    /// </summary>
    /// <param name="inter_weight">the Asymmetric weight defined from Lucas and Volz work. It balances between having the input_sample have at least one of each pattern in the generated image or vice versa.</param>
    /// <param name="mut_times">the maximum number of modifications the algorithm is allowed to do in one step</param>
    /// <param name="noise">noise value to push the algorithm away from certain arrays and embrace some new noise</param>
    public void Step(double inter_weight=0.5, int mut_times=1, double noise=0.0){
      if(mut_times < 1){
        throw new Exception("mut_times has to be bigger than 1");
      }
      if(noise < 0){
        throw new Exception("noise must be >= 0");
      }
      this._es.Step(inter_weight, mut_times, noise);
    }

    /// <summary>
    /// Get the fitness of the best chromosome in the generation
    /// </summary>
    /// <returns>the fitness of the best individual</returns>
    public double GetFitness(){
      return this._es.GetFitness();
    }

    /// <summary>
    /// Get the map of the best chromosome in the generation
    /// </summary>
    /// <returns>the map of the best individual</returns>
    public int[,] GetMap(){
      return this._es.GetMap();
    }

    /// <summary>
    /// Get the current iteration
    /// </summary>
    /// <returns>the iteration value</returns>
    public int GetIteration(){
      return this._es.GetIteration();
    }

    /// <summary>
    /// Lock a certain tile to a certain value so it won't be affected with the Generation process
    /// </summary>
    /// <param name="x">the locked x location</param>
    /// <param name="y">the locked y location</param>
    /// <param name="value">the locked value</param>
    public void LockTile(int x, int y, int value){
      this._es.LockTile(x, y, value);
    }

    /// <summary>
    /// Unlock a certain tile in the generated maps
    /// </summary>
    /// <param name="x">the locked x location</param>
    /// <param name="y">the locked y location</param>
    public void UnlockTile(int x, int y){
      this._es.UnlockTile(x, y);
    }

    /// <summary>
    /// unlock all the locked tiles in the generated maps
    /// </summary>
    public void UnlockAll(){
      this._es.UnlockAll();
    }

    /// <summary>
    /// Run the algorithm for a fixed amount of iterations.
    /// This function doesn't need anything to be called before hand.
    /// You can call step to enhance the generation after that function is done
    /// </summary>
    /// <param name="input_samples">the input integer matrix that the algorithm sample from</param>
    /// <param name="tp_size">the size of the tile patterns used in generation larger than 1</param>
    /// <param name="width">the width of the generated map</param>
    /// <param name="height">the height of the generated map</param>
    /// <param name="iterations">the number of iterations that the algorithm should do before finishing</param>
    /// <param name="warp">an object that allow the patterns to sample by wrapping across the edges</param>
    /// <param name="borders">an object that allow the edges to be similar to the edges from the input_samples</param>
    /// <param name="pop_size">the number of generated map at once (having more maps in parallel) helps find good solution faster</param>
    /// <param name="inter_weight">the Asymmetric weight defined from Lucas and Volz work. It balances between having the input_sample have at least one of each pattern in the generated image or vice versa.</param>
    /// <param name="mut_times">the maximum number of modifications the algorithm is allowed to do in one step</param>
    /// <param name="noise">noise value to push the algorithm away from certain arrays and embrace some new noise</param>
    /// <returns>The best generated map so far</returns>
    public int[,] Generate(List<int[,]> input_samples, int tp_size, int width, int height, int iterations=10000, WarpOptions warp=null, BorderOptions borders=null, int pop_size=1, double inter_weight=0.5, int mut_times=1, double noise=0){
      this.InitializePatternDictionary(input_samples, tp_size, warp, borders);
      this.InitializeGeneration(width, height, pop_size);
      while(this.GetIteration()<iterations){
        this.Step(inter_weight, mut_times, noise);
      }
      return this.GetMap();
    }
  }
}
