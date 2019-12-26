export default class Random{
  constructor(seed){
    //seeding is not working yet
  }

  next(){
    return Math.random();
  }

  nextInt(max){
    return Math.floor(Math.random() * max);
  }
}
