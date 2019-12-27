using System;
using System.Collections.Generic;

namespace ETPKLDivLibrary{
  public class WarpOptions{
    private Dictionary<string, bool> _directions;

    public WarpOptions(bool x = false, bool y = false){
      this._directions = new Dictionary<string, bool>();
      this._directions["x"] = x;
      this._directions["y"] = y;
    }

    public bool this[string key]{
      get { return this._directions[key.ToLower()]; }
      set { this._directions[key.ToLower()] = value; }
    }
  }

  public class BorderOptions{
    private Dictionary<string, bool> _borders;

    public BorderOptions(bool top = false, bool bot = false, bool left = false, bool right = false){
      this._borders = new Dictionary<string, bool>();
      this._borders["top"] = top;
      this._borders["bot"] = bot;
      this._borders["left"] = left;
      this._borders["right"] = right;
    }

    public bool this[string key]{
      get { return this._borders[key.ToLower()]; }
      set { this._borders[key.ToLower()] = value; }
    }
  }
}
