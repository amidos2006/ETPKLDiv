using System;
using System.Collections.Generic;

namespace ETPKLDivLibrary{
  class Pattern{
    private string _key;
    private int[,] _map;

    public Pattern(int size){
      this._map = new int[size, size];
      this._key = "";
    }

    public string Key{
      get{ return this._key; }
    }

    public int Size{
      get{ return this._map.GetLength(0); }
    }

    public static Pattern operator+(Pattern p, string s){
      p._key += s;
      return p;
    }

    public int this[int i, int j]{
      get { return this._map[i,j]; }
      set { this._map[i,j] = value; }
    }
  }

  class PatternCounts{
    private Dictionary<string, int> _counts;

    public PatternCounts(){
      this._counts = new Dictionary<string, int>();
    }

    public void Add(string key){
      if(!this._counts.ContainsKey(key)){
        this._counts[key] = 0;
      }
      this._counts[key] += 1;
    }

    public void Add(Pattern p){
      this.Add(p.Key);
    }

    public bool ContainsKey(string key){
      return this._counts.ContainsKey(key);
    }

    public int this[string key]{
      get{ return this._counts[key]; }
    }

    public int this[Pattern p]{
      get{ return this[p.Key]; }
    }

    public List<string> Keys{
      get{ return new List<string>(this._counts.Keys); }
    }
  }

  class PatternList{
    private List<Pattern> _patterns;

    public PatternList(){
      this._patterns = new List<Pattern>();
    }

    public Pattern this[int i]{
      get{ return this._patterns[i]; }
    }

    public void Add(Pattern p){
      this._patterns.Add(p);
    }

    public void AddRange(PatternList list){
      this._patterns.AddRange(list._patterns);
    }

    public int Length{
      get{ return this._patterns.Count; }
    }

    public Pattern Sample(Random random){
      return this[random.Next(this.Length)];
    }
  }

  class BorderPatternList{
    private Dictionary<string, PatternList> _borderDict;

    public BorderPatternList(){
      this._borderDict = new Dictionary<string, PatternList>();
      this._borderDict["top"] = new PatternList();
      this._borderDict["bot"] = new PatternList();
      this._borderDict["left"] = new PatternList();
      this._borderDict["right"] = new PatternList();
    }

    public PatternList this[string key]{
      get{ return this._borderDict[key.ToLower()]; }
    }

    public void Add(string key, Pattern p){
      this[key].Add(p);
    }
  }

  static class Helper{
    private static Pattern CalculateTilePattern(int[,] map, int x, int y, int size){
      Pattern pattern = new Pattern(size);
      for(int dy=0;dy<size;dy++){
        for(int dx=0; dx<size; dx++){
          int new_y=(y+dy)%map.GetLength(0);
          int new_x=(x+dx)%map.GetLength(1);

          pattern += map[new_y,new_x] + ",";
          pattern[dy,dx] = map[new_y,new_x];
        }
      }
      return pattern;
    }

    public static Tuple<Dictionary<int, PatternCounts>, Dictionary<int, PatternList>, Dictionary<int, BorderPatternList>> CalculateTilePatternProbabilities(List<int[,]> maps, List<int> tp_sizes, WarpOptions warp = null, BorderOptions borders = null){
      Dictionary<int, PatternCounts> p = new Dictionary<int, PatternCounts>();
      Dictionary<int, PatternList> patterns = new Dictionary<int, PatternList>();
      Dictionary<int, BorderPatternList> border_patterns = new Dictionary<int, BorderPatternList>();
      foreach(int size in tp_sizes){
        p[size] = new PatternCounts();
        patterns[size] = new PatternList();
        border_patterns[size] = new BorderPatternList();
        for(int i=0; i<maps.Count; i++){
          int[,] map = maps[i];
          int ySize = size;
          if(warp != null && warp["y"]){
            ySize = 1;
          }
          for(int y=0; y<map.GetLength(0)-ySize+1; y++){
            int xSize = size;
            if(warp != null && warp["x"]){
              xSize = 1;
            }
            for(int x=0; x<map.GetLength(1)-xSize+1; x++){
              Pattern pattern=CalculateTilePattern(map, x, y, size);

              p[size].Add(pattern);

              if(borders != null){
                bool temp_border = false;
                if(borders["top"] && y == 0){
                  temp_border = true;
                  border_patterns[size].Add("top", pattern);
                }
                if(borders["bot"] && y == map.GetLength(0)-size){
                  temp_border = true;
                  border_patterns[size].Add("bot", pattern);
                }
                if(borders["left"] && x == 0){
                  temp_border = true;
                  border_patterns[size].Add("left", pattern);
                }
                if(borders["right"] && x == map.GetLength(1)-size){
                  temp_border = true;
                  border_patterns[size].Add("right", pattern);
                }
                if(!temp_border){
                  patterns[size].Add(pattern);
                }
              }
              else{
                patterns[size].Add(pattern);
              }
            }
          }
        }
      }
      return Tuple.Create(p, patterns, border_patterns);
    }
  }
}
