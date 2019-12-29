<p align="center">
	<img height="200px" src="ETPKLDiv_logo.png"/>
</p>

<h1 align="center">
	ETPKLDiv Algorithm Implementation
</h1>

<p align="center">
  <b>Current Framework Version: 0.5.0</b>
</p>

ETPKLDiv Algrorithm was introduced by [Lucas and Volz](https://gecco2019:prague@gecco-2019.sigevo.org/proceedings_2019/proceedings/proceedings_files/pap291s3-file1.pdf) in GECCO 2019. The name stands for Evolutionary Tile Pattern KL-Divergence algorithm. The authors showed amazing results and compared it to [GAN](https://arxiv.org/abs/1805.00728) and to [WFC](https://github.com/mxgmn/WaveFunctionCollapse) and it had very competitive results. The algorithm was able to work on small or big inputs which neither GANs nor WFC are able to do. In addition, ETPKLDiv is always able to return a generated map and doesn't get stuck like WFC. The following table is pulled from the paper and shows the comparison between all the algorithms.

<p align="center">

| Method | Training Time | Generation | Tiny Input |
| ------ | ------------- | ---------- | ---------- |
| ETPKLDiv | Fast | Fast to Medium, Never Fails | Yes |
| WFC | Fast | Fast to Slow, May Fail | Yes |
| GAN | Slow | Always Fast, Never Fails | No |
| ELSGAN | Slow | Slow, Never Fails | No |

</p>

Here are some actual numbers from running the algorithm to generate new samples using `pop_size` equal to `1` and `tp_size` equal to `2` on the `red and black` picture from the Wave Function Collapse demo. We show the effect of the number of `iterations` with respect to the size of the generated sample (`width`x`height`). About the effect of `pop_size`, it doesn't need to be tested because it will always increase the time by that much unless we parallelize them. Also using higher `pop_size` find the solution faster (almost around `1/pop_size`). The `tp_size` effect on speed is pretty small where increasing it will increase the number of unique pattern that can be found in any of the images. But since the image size is fixed this means there is a limited amount of unique tiles can appear which is equal to the size of the sample. Because of that the effect of increasing `tp_size` is almost negligible.

The following table show the results using the JavaScript implementation running on an old mac book pro from 2015. These values are averaged over multiple runs to get an accurate estimate.

<p align="center">

| Iterations | 30x30     | 60x60      | 120x120    |
| ---------- | --------- | ---------- | ---------- |
| 1000       | 0.438 sec | 1.768  sec | 9.598  sec |
| 5000       | 2.002 sec | 8.023  sec | 46.839 sec |
| 10000      | 3.985 sec | 16.080 sec | 91.976 sec |

</p>

That following table reports the results from the C# implementation on the same machine. These values are averaged over multiple runs to get an accurate estimate.

<p align="center">

| Iterations | 30x30      | 60x60      | 120x120     |
| ---------- | ---------- | ---------- | ----------- |
| 1000       | 0.972  sec | 4.381  sec | 24.490  sec |
| 5000       | 4.778  sec | 21.560 sec | 125.510 sec |
| 10000      | 10.204 sec | 20.340 sec | 112.943 sec |

</p>

As you can see that the C# implementation is slower than JavaScript (Sorry I am not great in C# as I didn't use it for awhile). Please help improve it if you are good with C# optimization.

Here are some generate images at different iterations using several different input images and map of size 30x30. All these results are using `inter_weight` equal to 0.5. Results quality differ based on that value, for some applications having low `inter_weight` might cause producing a more appealing images at fewer iterations than others and vice versa. Just remember the time for 10000 iterations is less than 4 seconds (in the JS implementation as it is more optimized) which will generate on the fly while your game is loading.

<p align="center">

| Iterations | Example 1 | Example 2 | Example 3 |
| ---------- | --------- | --------- | --------- |
| 1000       | ![](examples/rb_1000_1.png | width=100) ![](examples/lr_1000_1.png) | ![](examples/rb_1000_2.png) ![](examples/lr_1000_2.png) | ![](examples/rb_1000_3.png) ![](examples/lr_1000_3.png) |
| 5000       | ![](examples/rb_5000_1.png) ![](examples/lr_5000_1.png) | ![](examples/rb_5000_2.png) ![](examples/lr_5000_2.png) | ![](examples/rb_5000_3.png) ![](examples/lr_5000_3.png) |
| 10000      | ![](examples/rb_10000_1.png) ![](examples/lr_10000_1.png) | ![](examples/rb_10000_2.png) ![](examples/lr_10000_2.png) | ![](examples/rb_10000_3.png) ![](examples/lr_10000_3.png) |

</p>

As you can see the algorithm is pretty fast with amazing results in very short time (similar to WFC). But it is very noticeable that the speed drops a lot down when the output image increases. One of the solution is to divide the big image into a grid and generate every part of the grid separately. To blend these independent part you can generate a small image for the in between by fixing the stuff on the left and right and allow the algorithm to just update the middle.

Here are some examples of the generated inputs using the [online interactive demo](http://www.akhalifa.com/etpkldiv/):

<p align="center">
  <img height="700px" src="ETPKLDiv.png" />
</p>

As you can see from the picture that the ETPKLDiv is not as strict as WFC in generation which sometimes in harder problems (like Mario and Flowers) will get stuck in local optima. We think by some parameter tuning you might be able to get better results than shown above. Also, we would like to experiment with some quality diversity techniques and having crossover and see its effect. Also, locking some tiles to certain values will make the algorithm generate better results as it is guiding it towards a more desirable output.

## Algorithm
The algorithm is pretty simple with no complication. You can read more about it in [Lucas and Volz paper](https://gecco2019:prague@gecco-2019.sigevo.org/proceedings_2019/proceedings/proceedings_files/pap291s3-file1.pdf). It uses an optimization algorithm (`EvolutionStrategy`) to minimize the KL-Divergence value between the new generated map and the original data. KL-Divergence is a method that measures how close two distributions (in our case: the generated sample and the input sample) are to each other. The distributions in our case are just a simple count of the difference in the tile pattern configurations of a certain size (`tp_size`) where tile pattern configurations are just a group of tiles beside each other. The algorithm at each step generate a new sample (`pop_size`) from the current one (`pop_size`) by copying one or more (`mut_times`) tile pattern configuration from the input sample to the new one. The algorithm picks the best ones (`pop_size`) but allowing some bad ones if the user wants (`noise`).

Here is a step by step algorithm if you are trying to replicate it:
1. Create `pop_size` number of new samples with dimensions `width`x`height`. These samples values are randomly chosen from all the possible tile values (tile values is just an integer that could be a color or an index to a tile).
2. Compute the fitness for each sample by computing the KL-Divergence between that sample and the `input_samples`.
   1. Count the frequency of each tile pattern configuration of size `tp_size`x`tp_size` in the tested sample.
   2. Count the frequency of each tile pattern configuration of size `tp_size`x`tp_size` in the `input_samples`.
   3. Calculate the KL-Divergence for the tested sample with respect to `input_samples`. This value shows that every tile pattern configuration in the tested sample exists in the `input_samples`.
   4. Calculate the KL-Divergence for `input_samples` with respect to the tested sample. This value shows that every tile pattern configuration in the `input_samples` exists in the tested sample.
   5. Calculate the fitness as negated average weighted sum of the first and second KL-Divergence using `inter_weight`.
3. Generate a new mutated sample of size `pop_size` from the current samples based on their fitness value. Higher fitness individuals have higher chance to generate new samples than lower ones (`noise` can affect that value by giving low fitness individual higher chance to be selected).
   1. Use [Rank Selection](https://stackoverflow.com/questions/20290831/how-to-perform-rank-based-selection-in-a-genetic-algorithm) to select a sample from the current population.
   2. Clone that selected sample.
   3. Copy a `tp_size`x`tp_size` tile pattern configuration from the `input_samples` to a random location in the cloned sample. Repeat that as many times between `1` and `mut_times`.
   4. Repeat the previous steps till we have `pop_size` new mutated samples.
4. Merge the new mutated samples with the original samples and kill the lowest `pop_size` samples with respect to their fitness value (`noise` can affect that order by giving a higher chance to low fitness individual to survive).
5. Repeat from the second step again till the number of `iterations` has been reached.

Here is a some pictures of the algorithm in action (Don't worry the algorithm is a lot faster than that, it is just slowed down for rendering):

<p align="center">
  <img src="redblack.gif" />
  <img src="loderunner.gif" />
</p>

## Common API interface
The API for the `ETPKLDiv` class is the same between all the implementation. The following table shows all the functions that are provided by the `ETPKLDiv` class.

| Function Name | Parameters | Functionality |
| ------------- | ---------- | ------------- |
| `constructor` | No parameters are needed for now but in future we should include the optimizer name | Creates the optimization algorithm object. In the current implementation it creates Evolutionary Strategy optimizer |
| `initializePatternDictionary` | `input_samples`: a 2D integer matrix of the input data (it can accept 3D matrix if you have multiple inputs) <br> `tp_size`: the size of the patterns that the algorithm is optimizing towards (minimum is 2) <br> `warp = null`: is an optional parameter that allows the system to warp the input_samples edges <br> `borders = null`: is an optional parameter that forces the system to make the edge tiles change based on the `input_samples` edges | This function initialize the system for generation based. you don't need to call it if you are using `generate` function as it will call it automatically |
| `initializeGeneration` | `width`: the width of the generated map <br> `height`: the height of the generated map <br> `pop_size=1`: an optional parameter to increase the number of competing maps to enhance the generation | This function initializes the generation process by specifying the size of the generated map and how many maps to compete for generation. |
| `step` | `inter_weight=0.5`: the weight variable from ETPKLDiv algorithm which balances between having every tile pattern in the generated image exist at least once in the input or vice versa <br> `mut_times=1`: maximum number of changes the algorithm is allowed to change in the generated map at once (can be used to push the algorithm from any stuck locations by allowing more changing power) <br> `noise=0`: add noise to the fitness computations to push the algorithm from being stuck with a certain map by allowing the algorithm to takes sub optimal moves | Advance the algorithm by one step forward toward enhancing the generated maps |
| `generate` | `input_samples`: a 2D integer matrix of the input data (it can accept 3D matrix if you have multiple inputs) <br> `tp_size`: the size of the patterns that the algorithm is optimizing towards (minimum is 2) <br> `width`: the width of the generated map <br> `height`: the height of the generated map <br> `iterations=10000`: an optional parameter to define the number of iterations needed to generate a map <br> `warp = null`: is an optional parameter that allow the system to warp the input_samples edges <br> `borders = null`: is an optional parameter that force the system to make the edge tiles changes based on the input_samples edges <br> `pop_size=1`: an optional parameter to increase the number of competing maps to enhance the generation <br> `inter_weight=0.5`: the weight variable from ETPKLDiv algorithm which balance between having every tile pattern in the generated image exists at least once in the input or vice versa <br> `mut_times=1`: maximum number of changes the algorithm is allowed to change in the generated map at once (can be used to push the algorithm from any stuck locations by allowing more changing power) <br> `noise=0`: add noise to the fitness computations to push the algorithm from being stuck with a certain map by making the algorithm takes sub optimal moves | Run the algorithm directly for a fixed amount of iterations (Recommended to use for beginners). |
| `lockTile` | `x`: the x location <br> `y`: the y location <br> `value`: the value used to lock the tile with | This function locks a single tile specified by the input to a certain value |
| `unlockTile` | `x`: the x location <br> `y`: the y location | This function frees a single locked tile specified by the input |
| `unlockAll` | No parameters are needed | This function frees all the locked tiles |
| `getIteration` | No parameters are needed | This function returns the number of iterations the optimization algorithm applied |
| `getFitness` | No parameters are needed | This function returns the fitness of the best generated map |
| `getMap` | No parameters are needed | This function returns the best generated map |

## Missing Features
- Allow multiple tile pattern sizes to be used in generation (needs a way to do the inter_weights and a way to do intra_weights)
- Adding Convolutional Crossover
- Adding Different Optimization Algorithms beside ES
- Adding more exceptions to handle all corner cases
- Adding parallelization when the population size is greater than 1
- Add 3D generation
- Proper Documentation
- Lua Implementation
- C++ Implementation
- Python Implementation
- Java Implementation
- Make more elaborate Unity demo
- Phaser Demo
- Defold Demo
- Jupyter Notebook Demo
- LibGDX Demo

## How to contribute
Contributing in this repo is very welcome. You can contribute in many facets explained in the following subsections:

### A new implementation
Create a new folder with the name of the language or interface. Add your code inside and make sure that there is an `ETPKLDiv` class that can be created and have the same functions provided in [Common API section](https://github.com/amidos2006/ETPKLDiv/blob/master/README.md#common-api-interface). In the end add a `README.md` file to explain how to use it in that language with a small example.

### A new Demo
Create a folder for the Demo. The name has to be the engine/languages name followed by "Demo" similar to the "HTMLDemo". Get the latest build of the language needed from the corresponding language folder. Write your demo and make sure it is working fine. Make a pull request to the main repo.

### Bugs and Pull Requests
Bug reports and pull requests are welcome on GitHub at https://github.com/amidos2006/etpkldiv.

## License
This code is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
