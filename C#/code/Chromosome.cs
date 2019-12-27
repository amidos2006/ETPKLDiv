using System;
using System.Collections.Generic;

namespace ETPKLDivLibrary{
  class Chromosome{
    private TPDict _tpdict;
    private Random _random;
    private double _epsilon;
    private double _first;
    private double _second;
    private double _fitness;
    private bool _calculated;
    private int _width;
    private int _height;
    private int[,] _map;
    private bool[,] _locked;

    public Chromosome(TPDict tpdict, Random random, int width, int height){
      this._tpdict = tpdict;
      this._random = random;

      this._epsilon = 1e-6;
      this._first = -1e6;
      this._second = -1e6;
      this._fitness = -1e6;
      this._calculated = false;

      this._width = width;
      this._height = height;
      this._map = new int[height, width];
      this._locked = new bool[height, width];
    }

    public void RandomInitialize(List<int> tp_sizes, BorderOptions borders){
      for(int y=0; y<this._height; y++){
        for(int x=0; x<this._width; x++){
          int size = tp_sizes[this._random.Next(tp_sizes.Count)];
          size = Math.Min(size, this._height - y);
          size = Math.Min(size, this._width - x);
          PatternList patterns = this._tpdict.GetTPArray(size);
          PatternList border_patterns = new PatternList();
          if(borders != null){
            if(borders["top"] && y == 0){
              border_patterns.AddRange(this._tpdict.GetTPBorderArray(size, "top"));
            }
            if(borders["bot"] && y == this._height - size){
              border_patterns.AddRange(this._tpdict.GetTPBorderArray(size, "bot"));
            }
            if(borders["left"] && x == 0){
              border_patterns.AddRange(this._tpdict.GetTPBorderArray(size, "left"));
            }
            if(borders["right"] && x == this._width - size){
              border_patterns.AddRange(this._tpdict.GetTPBorderArray(size, "rigth"));
            }
          }
          if(border_patterns.Length > 0){
            patterns = border_patterns;
          }
          if(patterns.Length > 0){
            this.ApplyTP(patterns.Sample(this._random), x, y);
          }
        }
      }
    }

    public Chromosome Clone(){
      Chromosome clone = new Chromosome(this._tpdict, this._random, this._width, this._height);
      for(int i=0; i<this._map.GetLength(0); i++){
        for(int j=0; j<this._map.GetLength(1); j++){
          clone._map[i,j] = this._map[i,j];
          clone._locked[i,j] = this._locked[i,j];
        }
      }
      clone._first = this._first;
      clone._second = this._second;
      clone._fitness = this._fitness;
      clone._calculated = this._calculated;
      return clone;
    }

    private void ApplyTP(Pattern pattern, int x, int y){
      for(int i=0; i<pattern.Size; i++){
        for(int j=0; j<pattern.Size; j++){
          if(!this._locked[y+i,x+j]){
            this._map[y+i,x+j] = pattern[i,j];
          }
        }
      }
    }

    private void CalculateKLDivergence(PatternCounts p, PatternCounts q, double w){
      List<string> x = new List<string>();
      double total_p = 0;
      foreach(string key in p.Keys){
        x.Add(key);
        total_p += p[key];
      }
      double total_q = 0;
      foreach(string key in q.Keys){
        x.Add(key);
        total_q += q[key];
      }
      this._first = 0;
      this._second = 0;
      foreach(string key in x){
        double p_dash = (this._epsilon)/((total_p + this._epsilon) * (1 + this._epsilon));
        double q_dash = (this._epsilon)/((total_q + this._epsilon) * (1 + this._epsilon));
        if (p.ContainsKey(key)){
          p_dash = (p[key] + this._epsilon)/((total_p + this._epsilon) * (1 + this._epsilon));
        }
        if (q.ContainsKey(key)){
          q_dash = (q[key] + this._epsilon)/((total_q + this._epsilon) * (1 + this._epsilon));
        }
        this._first += p_dash * Math.Log(p_dash/q_dash);
        this._second += q_dash * Math.Log(q_dash/p_dash);
      }
      this._fitness = -(w * this._first + (1-w) * this._second);
      this._calculated = true;
    }

    public void CalculateDivergence(int tp_size, double inter_weight=0.5){
      if(this._calculated){
        this._fitness = -(inter_weight * this._first + (1-inter_weight) * this._second);
        return;
      }
      Tuple<Dictionary<int, PatternCounts>, Dictionary<int, PatternList>, Dictionary<int, BorderPatternList>> temp =
        Helper.CalculateTilePatternProbabilities(new List<int[,]>(){this._map}, new List<int>(){tp_size});
      this.CalculateKLDivergence(temp.Item1[tp_size], this._tpdict.GetQCount(tp_size), inter_weight);
    }

    public Double GetFitness(){
      if(!this._calculated){
        return -1e6;
      }
      return this._fitness;
    }

    public int[,] GetMap(){
      return this._map;
    }

    public Chromosome Mutate(List<int> tp_sizes, int mut_times, BorderOptions borders){
      Chromosome clone = this.Clone();
      int times = Math.Max(0, this._random.Next(mut_times)) + 1;
      for(int i=0; i<times; i++){
        int size = tp_sizes[this._random.Next(tp_sizes.Count)];
        int x = clone._random.Next(clone._width - size + 1);
        int y = clone._random.Next(clone._height - size + 1);
        PatternList patterns = clone._tpdict.GetTPArray(size);
        PatternList border_patterns = new PatternList();
        if(borders != null){
          if(borders["top"] && y == 0){
            border_patterns.AddRange(clone._tpdict.GetTPBorderArray(size, "top"));
          }
          if(borders["bot"] && y == clone._height - size){
            border_patterns.AddRange(clone._tpdict.GetTPBorderArray(size, "bot"));
          }
          if(borders["left"] && x == 0){
            border_patterns.AddRange(clone._tpdict.GetTPBorderArray(size, "left"));
          }
          if(borders["right"] && x == clone._width - size){
            border_patterns.AddRange(clone._tpdict.GetTPBorderArray(size, "right"));
          }
        }
        if(border_patterns.Length > 0){
          patterns = border_patterns;
        }
        if(patterns.Length > 0){
          clone.ApplyTP(patterns.Sample(clone._random), x, y);
          clone._calculated = false;
        }
      }
      return clone;
    }

    public void LockTile(int x, int y, int value){
      this._locked[y,x] = true;
      this._map[y,x] = value;
    }

    public void UnlockTile(int x, int y){
      this._locked[y,x] = false;
    }

    public void UnlockAll(){
      for(int y=0; y<this._height; y++){
        for(int x=0; x<this._width; x++){
          this._locked[y,x] = false;
        }
      }
    }
  }
}
