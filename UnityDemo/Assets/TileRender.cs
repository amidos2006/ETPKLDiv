using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TileRender : MonoBehaviour
{
    public Sprite[] sprites;

    private SpriteRenderer spriteRender;

    // Start is called before the first frame update
    void Start()
    {
        this.spriteRender = this.GetComponent<SpriteRenderer>();
        Debug.Log(this.spriteRender);
    }

    public void ChangeTile(int index){
        if(this.spriteRender == null){
            this.spriteRender = this.GetComponent<SpriteRenderer>();
        }
        this.spriteRender.sprite = sprites[index];
    }
}
