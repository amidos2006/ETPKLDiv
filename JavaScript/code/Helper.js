function calculateTilePatternKey(map,x,y,size){
  let pattern = [];
  let key = "";
  for(let dy=0;dy<size;dy++){
    pattern.push([]);
    for(let dx=0; dx<size; dx++){
      let new_y=(y+dy)%map.length;
      let new_x=(x+dx)%map[0].length;
      key += map[new_y][new_x] + ",";
      pattern[pattern.length-1].push(map[new_y][new_x]);
    }
  }
  return [key, pattern];
}

export function calculateTilePatternProbabilities(maps, tp_sizes, warp = null, borders = null){
  let p = {};
  let patterns = {};
  let border_patterns = {};
  for(let size of tp_sizes){
    p[size] = {};
    patterns[size] = [];
    border_patterns[size] = {"top": [], "bot": [], "left": [], "right": []};
    for(let i=0; i<maps.length; i++){
      let map = maps[i];
      let ySize = size;
      if(warp != null && "y" in warp && warp["y"]){
        ySize = 1;
      }
      for(let y=0;y<map.length-ySize+1;y++){
        let xSize = size;
        if(warp != null && "x" in warp && warp["x"]){
          xSize = 1;
        }
        for(let x=0; x<map[y].length-xSize+1;x++){
          const [key,pattern]=calculateTilePatternKey(map,x,y,size);
          if(!(key in p[size])){
            p[size][key] = 0;
          }
          p[size][key] += 1;
          if(borders != null){
            let temp_border = false;
            if("top" in borders && borders["top"] && y == 0){
              temp_border = true;
              border_patterns[size]["top"].push(pattern);
            }
            if("bot" in borders && borders["bot"] && y == map.length-size){
              temp_border = true;
              border_patterns[size]["bot"].push(pattern);
            }
            if("left" in borders && borders["left"] && x == 0){
              temp_border = true;
              border_patterns[size]["left"].push(pattern);
            }
            if("right" in borders && borders["right"] && x == map[y].length-size){
              temp_border = true;
              border_patterns[size]["right"].push(pattern);
            }
            if(!temp_border){
              patterns[size].push(pattern);
            }
          }
          else{
            patterns[size].push(pattern)
          }
        }
      }
    }
  }
  return [p, patterns, border_patterns];
}
