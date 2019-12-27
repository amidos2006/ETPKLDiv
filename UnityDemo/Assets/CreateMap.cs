using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using ETPKLDivLibrary;

public class CreateMap : MonoBehaviour
{
    [Range(0.0f, 1.0f)]
    public double inter_weight=0.5;
    public int mut_times = 1;
    [Range(0.0f, 1.0f)]
    public double noise = 0;
    public GameObject tileObject;

    private ETPKLDiv etpkldiv;
    private TileRender[,] _map;

    // Start is called before the first frame update
    void Start()
    {
        int[,] map = new int[4,4]{
            {1, 1, 1, 1},
            {1, 0, 0, 0},
            {1, 0, 2, 0},
            {1, 0, 0, 0}
        };
        this.etpkldiv = new ETPKLDiv();
        this.etpkldiv.InitializePatternDictionary(new List<int[,]>{map}, 2, new WarpOptions(true, true));
        this.etpkldiv.InitializeGeneration(30, 30, 2);
        int[,] current = this.etpkldiv.GetMap();
        this._map = new TileRender[30, 30];
        for(int y=0; y<30; y++){
            for(int x=0; x<30; x++){
                GameObject obj = GameObject.Instantiate(tileObject, new Vector3(x-30/2, y-30/2), Quaternion.identity);
                obj.transform.parent = this.transform;
                this._map[y,x] = obj.GetComponent<TileRender>();
                this._map[y,x].ChangeTile(current[y, x]);
            }
        }
    }

    // Update is called once per frame
    void Update()
    {
        this.etpkldiv.Step(this.inter_weight, this.mut_times, this.noise);
        int[,] current = this.etpkldiv.GetMap();
        for(int y=0; y<30; y++){
            for(int x=0; x<30; x++){
                this._map[y,x].ChangeTile(current[y, x]);
            }
        }
        Debug.Log("Iteration: " + this.etpkldiv.GetIteration() + " - Fitness: " + this.etpkldiv.GetFitness());
    }
}
