using System;
using System.Collections.Generic;

namespace ETPKLDiv{
  class TPDict{
    private Dictionary<int, PatternCounts> _q_counts;
    private Dictionary<int, PatternList> _patterns;
    private Dictionary<int, BorderPatternList> _border_patterns;

    public TPDict(List<int[,]> input_samples, List<int> sizes, WarpOptions warp=null, BorderOptions borders=null){
      Tuple<Dictionary<int, PatternCounts>, Dictionary<int, PatternList>, Dictionary<int, BorderPatternList>> temp =
        Helper.CalculateTilePatternProbabilities(input_samples, sizes, warp, borders);
      this._q_counts = temp.Item1;
      this._patterns = temp.Item2;
      this._border_patterns = temp.Item3;
    }

    public PatternList GetTPArray(int size){
      return this._patterns[size];
    }

    public PatternList GetTPBorderArray(int size, string dir){
      return this._border_patterns[size][dir];
    }

    public PatternCounts GetQCount(int size){
      return this._q_counts[size];
    }
  }
}
