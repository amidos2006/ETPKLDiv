# ETPKLDiv C# Implementation

This is the C# implementation of the ETPKLDiv method introduced by Lucas and Volz. For more understanding about the main algorithm and the interface check the main README.

## How to use
The library is written in C# and compiled using [dotnet core 2.1](https://docs.microsoft.com/en-us/dotnet/core/tutorials/). The compiled file can be found in the [`bin`](https://github.com/amidos2006/ETPKLDiv/tree/master/C%23/bin) folder. Add the compiled file ([`ETPKLDiv.dll`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/bin/ETPKLDiv.dll)) to your project (drag it to the unity assets folder).

The way to use the library is pretty the same between all languages. It involves creating an object of the [`ETPKLDiv`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/code/ETPKLDiv.cs) class. Followed by one of these two methods:

- **step by step:** you will need to call [`InitializePatternDictionary`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/code/ETPKLDiv.cs#L24) followed by [`InitializeGeneration`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/code/ETPKLDiv.cs#L38) then we can call [`Step`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/code/ETPKLDiv.cs#L57) as many as needed to enhance the generated map. To get the best fitness call [`GetFitness`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/code/ETPKLDiv.cs#L71) function and to get the best generated map call [`GetMap`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/code/ETPKLDiv.cs#L79). Here is a simple example to illustrate:

```cs
using ETPKLDivLibrary;
// create the etpkldiv object
ETPKLDiv etpkldiv = new ETPKLDiv();
// input_sample is a 2D matrix of integers - 3 is the size of the pattern being sampled
etpkldiv.InitializePatternDictionary(input_sample, 3);
// intialize the generated map to be of size 30x30
etpkldiv.InitializeGeneration(30, 30);
// Loop for 1000 time to enhance
for(int i=0; i<1000; i++){
  // update the maps
  etpkldiv.Step();
  // get the best map
  int[,] bestMap = etpkldiv.GetMap();
  // get the fitness of the best map
  double bestFitness = etpkldiv.GetFitness();
}
int[,] finalMap = etpkldiv.GetMap();
double finalFitness = etpkldiv.GetFitness();
```

- **full generation:** you will need to call [`Generate`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/code/ETPKLDiv.cs#L134) and wait till it is done and return the best generated sample. After done, you can check for the fitness using [`GetFitness`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/code/ETPKLDiv.cs#L171), or improve the result by calling [`Step`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/code/ETPKLDiv.cs#L38) as many times as needed (beware: calling [`Generate`](https://github.com/amidos2006/ETPKLDiv/blob/master/C%23/code/ETPKLDiv.cs#L134) again will restart everything from scratch erasing any previous progress). Here is a simple example to illustrate:

```cs
using ETPKLDivLibrary;
// create the etpkldiv object
ETPKLDiv etpkldiv = new ETPKLDiv();
// generate a map of 30x30 size and run for 1000 iterations based on 3x3 tile patterns from the 2D input_sample
int[,] finalMap = etpkldiv.Generate(input_sample, 3, 30, 30, 1000);
// get the fitness of the best map
double finalFitness = etpkldiv.GetFitness();
```

We advice using the **full generation** method unless you want to make render during generation or to automatically tune parameters on the fly.
