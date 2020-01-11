const SHOW_TIME = 30;
const FILL_TIME = 30;
const TEST_SET = 12;
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
  const numbers = generate_numbers(TEST_SET);
  const p = document.createElement("P");
  p.innerHTML = numbers.join(' ');
  document.getElementById("numbers_div").appendChild(p);
}

function generate_numbers(len) {
  const randInt = () => Math.floor(random() * (max - min) + min);
  let numbers = [];
  for (let i = 0; i < len; i++) {
    numbers.push(randInt());
  }
  return numbers;
}

generate_test();
