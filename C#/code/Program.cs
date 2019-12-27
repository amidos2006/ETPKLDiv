using System;
using System.Collections.Generic;

namespace ETPKLDiv{
  class Program{
    static void Main(string[] args){
      int[,] map = new int[4,4]{
        {1, 1, 1, 1},
        {1, 0, 0, 0},
        {1, 0, 2, 0},
        {1, 0, 0, 0}
      };
      ETPKLDiv etpkldiv = new ETPKLDiv();
      etpkldiv.Generate(new List<int[,]>(){map}, 2, 30, 30, 1000, new WarpOptions(true, true), null, 4);
      Console.WriteLine(etpkldiv.GetFitness());
    }
  }
}
