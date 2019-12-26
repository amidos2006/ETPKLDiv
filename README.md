# ETPKLDiv Algorithm Implementation

## Common API interface
The API for the `ETPKLDiv` class is the same between all the implementation. The following table show all the function that is provided by the `ETPKLDiv` class.

| Function Name | Parameters | Functionality |
| ------------- | ---------- | ------------- |
| `constructor` | No parameters are needed for now but in future we should include the optimizer name | Creates the optimization algorithm object. In the current implementation it creates Evolutionary Strategy optimizer |
| `initializePatternDictionary` | `input_samples`: a 2D integer matrix of the input data (it can accept 3D matrix if you have multiple inputs, `tp_size`: the size of the patterns that the algorithm is optimizing towards (minimum is 2), `warp = null`: is an optional parameter that allow the system to warp the input_samples edges, `borders = null`: is an optional parameter that force the system to make the edge tiles changes based on the input_samples edges | This function initialize the system for generation based. you don't need to call it if you are using `generate` function as it will call it automatically |
| `initializeGeneration` | `width`: the width of the generated map, `height`: the height of the generated map, `pop_size=1`: an optional parameter to increase the number of competing maps to enhance the generation | This function initializes the generation process by specifying the size of the generated map and how many maps to compete for generation. |
| `step` | `inter_weight=0.5`: the weight variable from ETPKLDiv algorithm which balance between having every tile pattern in the generated image exists at least once in the input or vice versa, `mut_times=1`: maximum number of changes the algorithm is allowed to change in the generated map at once (can be used to push the algorithm from any stuck locations by allowing more changing power), `noise=0`: add noise to the fitness computations to push the algorithm from being stuck with a certain map by making the algorithm takes sub optimal moves | Advance the algorithm by one step forward toward enhancing the generated maps |
| `generate` | `input_samples`: a 2D integer matrix of the input data (it can accept 3D matrix if you have multiple inputs, `tp_size`: the size of the patterns that the algorithm is optimizing towards (minimum is 2), `width`: the width of the generated map, `height`: the height of the generated map, `iterations=10000`: an optional parameter to define the number of iterations needed to generate a map, `warp = null`: is an optional parameter that allow the system to warp the input_samples edges, `borders = null`: is an optional parameter that force the system to make the edge tiles changes based on the input_samples edges, `pop_size=1`: an optional parameter to increase the number of competing maps to enhance the generation, `inter_weight=0.5`: the weight variable from ETPKLDiv algorithm which balance between having every tile pattern in the generated image exists at least once in the input or vice versa, `mut_times=1`: maximum number of changes the algorithm is allowed to change in the generated map at once (can be used to push the algorithm from any stuck locations by allowing more changing power), `noise=0`: add noise to the fitness computations to push the algorithm from being stuck with a certain map by making the algorithm takes sub optimal moves | Run the algorithm directly for a fixed amount of iterations (Recommended to use for beginners). |
| `lockTile` | `x`: the x location, `y`: the y location, `value`: the value used to lock the tile with | This function locks a single tile specified by the input to a certain value |
| `unlockTile` | `x`: the x location, `y`: the y location | This function frees a single locked tile specified by the input |
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
- Proper Documentation
- Lua Implementation
- C++ Implementation
- C# Implementation
- Python Implementation
- Java Implementation
- Unity Demo
- Defold Demo
- Jupyter Notebook Demo
- LibGDX Demo

## How to contribute

### A new implementation

### A new Demo
