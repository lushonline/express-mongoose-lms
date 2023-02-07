const { IsCmiScore } = require('../src/lib/aicc/validators');

console.log(`IsCmiScore('') : ${IsCmiScore('')}`);
console.log(`IsCmiScore('10') : ${IsCmiScore('10')}`);
console.log(`IsCmiScore('+10') : ${IsCmiScore('+10')}`);
console.log(`IsCmiScore('-10') : ${IsCmiScore('-10')}`);
console.log(`IsCmiScore('10.1') : ${IsCmiScore('10.1')}`);
console.log(`IsCmiScore('+10.1') : ${IsCmiScore('+10.1')}`);
console.log(`IsCmiScore('-10.1') : ${IsCmiScore('-10.1')}`);

console.log(`IsCmiScore(10) : ${IsCmiScore(10)}`);
console.log(`IsCmiScore(+10) : ${IsCmiScore(+10)}`);
console.log(`IsCmiScore(-10) : ${IsCmiScore(-10)}`);
console.log(`IsCmiScore(10.1) : ${IsCmiScore(10.1)}`);
console.log(`IsCmiScore(+10.1) : ${IsCmiScore(+10.1)}`);
console.log(`IsCmiScore(-10.1) : ${IsCmiScore(-10.1)}`);

console.log(`IsCmiScore('-10.1,    10    ') : ${IsCmiScore('-10.1,    10    ')}`);
console.log(`IsCmiScore('-10.1,    10    ,') : ${IsCmiScore('-10.1,    10    ,')}`);
console.log(`IsCmiScore('-10.1,    10    ,1') : ${IsCmiScore('-10.1,    10    ,1')}`);
console.log(
  `IsCmiScore('-10.1,    10    ,1         ,1') : ${IsCmiScore('-10.1,    10    ,1         ,1')}`,
);
