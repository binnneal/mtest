const show_time = 30;
const test_time = 30;

const min = 10;
const max = 100;

const seed = 1234;
const rand_factory = s => {
  return function() {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};
const random = rand_factory(seed);

function generate_test() {
  const numbers = generate_n umbers(len);
  document.getElementById('number-div')
  
}

function generate_numbers(len) {
  const randInt = () => Math.floor(random() * (max - min) + min);
  let numbers = [];
  for (const i = 0; i < len; i++) {
    numbers.push(randInt());
  }
  return numbers;
}
