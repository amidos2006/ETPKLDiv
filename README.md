<p align="center">
	<img src="etpkldiv_logo.png"/>
</p>

<h1 align="center">
	ETPKLDiv Algorithm Implementation
</h1>

<p align="center">
  <b>Current Framework Version: 0.5.0</b>
</p>

ETPKLDiv Algrorithm was introduced by [Lucas and Volz](https://gecco2019:prague@gecco-2019.sigevo.org/proceedings_2019/proceedings/proceedings_files/pap291s3-file1.pdf) in GECCO 2019. The name stands for Evolutionary Tile Pattern KL-Divergence algorithm. The authors showed amazing results and compared it to [GAN](https://arxiv.org/abs/1805.00728) and to [WFC](https://github.com/mxgmn/WaveFunctionCollapse) and it have very competitive results. The algorithm was able to work on small or big inputs which neither GANs nor WFC are able to do. Beside that, ETPKLDiv is always able to return a generated map and doesn't stuck like WFC. The following table is pulled from the paper and shows the comparison between all the algorithms.

<p align="center">

| Method | Training Time | Generation | Tiny Input |
| ------ | ------------- | ---------- | ---------- |
| ETPKLDiv | Fast | Fast to Medium, Never Fails | Yes |
| WFC | Fast | Fast to Slow, May Fail | Yes |
| GAN | Slow | Always Fast, Never Fails | No |
| ELSGAN | Slow | Slow, Never Fails | No |

</p>

Here are some example of the generated inputs using the [online interactive demo](http://www.akhalifa.com/etpkldiv/):

<p algin="center">
  <img height="500px" src="ETPKLDiv.png" />
</p>

As you can see from the picture that the ETPKLDiv is not as strict as WFC in generation which sometimes in harder problems (like Mario and Flowers) stuck in local optima. We think by some parameter turning you might be able to get better results than the shown above. Also, we would like to experiment with some quality diversity techniques and having crossover and see its effect.

## Algorithm
The algorithm is pretty simple with no complication. You can read more about it in [Lucas and Volz paper](https://gecco2019:prague@gecco-2019.sigevo.org/proceedings_2019/proceedings/proceedings_files/pap291s3-file1.pdf). It uses an optimization algorithm (Evolution Strategy) to minimize the KL-Divergence value between the new generated map and the original data. KL-Divergence is a method that measure how close two distributions (in our case: the generated sample and the input sample) to each other. The distributions in our case is just a simple count of the different the tile pattern configurations of a certain size where tile pattern configurations are just a group of tiles beside each other. The algorithm at each step generate a new samples from the current by copying a tile pattern configuration from the input sample to the new one. The algorithm then pick the best and so on.

## Common API interface
The API for the `ETPKLDiv` class is the same between all the implementation. The following table show all the function that is provided by the `ETPKLDiv` class.

| Function Name | Parameters | Functionality |
| ------------- | ---------- | ------------- |
| `constructor` | No parameters are needed for now but in future we should include the optimizer name | Creates the optimization algorithm object. In the current implementation it creates Evolutionary Strategy optimizer |
| `initializePatternDictionary` | `input_samples`: a 2D integer matrix of the input data (it can accept 3D matrix if you have multiple inputs <br> `tp_size`: the size of the patterns that the algorithm is optimizing towards (minimum is 2) <br> `warp = null`: is an optional parameter that allow the system to warp the input_samples edges <br> `borders = null`: is an optional parameter that force the system to make the edge tiles changes based on the input_samples edges | This function initialize the system for generation based. you don't need to call it if you are using `generate` function as it will call it automatically |
| `initializeGeneration` | `width`: the width of the generated map <br> `height`: the height of the generated map <br> `pop_size=1`: an optional parameter to increase the number of competing maps to enhance the generation | This function initializes the generation process by specifying the size of the generated map and how many maps to compete for generation. |
| `step` | `inter_weight=0.5`: the weight variable from ETPKLDiv algorithm which balance between having every tile pattern in the generated image exists at least once in the input or vice versa <br> `mut_times=1`: maximum number of changes the algorithm is allowed to change in the generated map at once (can be used to push the algorithm from any stuck locations by allowing more changing power) <br> `noise=0`: add noise to the fitness computations to push the algorithm from being stuck with a certain map by making the algorithm takes sub optimal moves | Advance the algorithm by one step forward toward enhancing the generated maps |
| `generate` | `input_samples`: a 2D integer matrix of the input data (it can accept 3D matrix if you have multiple inputs <br> `tp_size`: the size of the patterns that the algorithm is optimizing towards (minimum is 2) <br> `width`: the width of the generated map <br> `height`: the height of the generated map <br> `iterations=10000`: an optional parameter to define the number of iterations needed to generate a map <br> `warp = null`: is an optional parameter that allow the system to warp the input_samples edges <br> `borders = null`: is an optional parameter that force the system to make the edge tiles changes based on the input_samples edges <br> `pop_size=1`: an optional parameter to increase the number of competing maps to enhance the generation <br> `inter_weight=0.5`: the weight variable from ETPKLDiv algorithm which balance between having every tile pattern in the generated image exists at least once in the input or vice versa <br> `mut_times=1`: maximum number of changes the algorithm is allowed to change in the generated map at once (can be used to push the algorithm from any stuck locations by allowing more changing power) <br> `noise=0`: add noise to the fitness computations to push the algorithm from being stuck with a certain map by making the algorithm takes sub optimal moves | Run the algorithm directly for a fixed amount of iterations (Recommended to use for beginners). |
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
Contributing in this repo are very welcome. You can contribute in many facets explained in the following subsections:

### A new implementation
Create a new folder with the name of the language or interface. Add your code inside and make sure that there is an `ETPKLDiv` class that can be created and have the same functions provided in [Common API section](https://github.com/amidos2006/ETPKLDiv/blob/master/README.md#common-api-interface). In the end add a `README.md` file to explain how to use it in that language with a small example.

### A new Demo
Create a folder for the Demo. The name has to be the engine/languages name followed by "Demo" similar to the "HTMLDemo". Get the latest build of the language needed from the corresponding language folder. Write your demo and make sure it is working fine. Make a pull request to the main repo.

### Bugs and Pull Requests
Bug reports and pull requests are welcome on GitHub at https://github.com/amidos2006/etpkldiv.

## License
This code is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
