const SHOW_TIME = 5;
const FILL_TIME = 10;
const TEST_SIZE = 12;
const TEST_REPEAT = 3;
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

const timer_ele = document.getElementById("timer_div");
const area_ele = document.getElementsByTagName("textarea")[0];
const numbers_ele = document.getElementById("numbers_div");
const button_ele = document.getElementsByTagName("input")[0];

function change_display(ele, displayed) {
  ele.style.display = displayed ? "block" : "none";
}

function generate_test() {
  change_display(button_ele, false);
  let numbers = new Set();
  while (numbers.size < TEST_SIZE) {
    numbers.add(Math.floor(random() * (max - min) + min));
  }
  numbers_ele.innerHTML = [...numbers].join(" ");
  change_display(numbers_ele, true);
  
  start_timer(SHOW_TIME, () => {
    change_display(numbers_ele, false);
    setTimeout(() => start_input(numbers), 0);
  });
}

function start_timer(timeout, exp_callback) {
  timer_ele.innerHTML = `${timeout--} seconds remaining`;
  const timer_d = setInterval(() => {
    timer_ele.innerHTML = `${timeout--} seconds remaining`;
    if (timeout < 0) {
      clearInterval(timer_d);
      setTimeout(exp_callback, 0);
    }
  }, 1000);
}

function start_input(numbers) {
  let inputs;
  change_display(area_ele, true);
  start_timer(FILL_TIME, () => {
    inputs = area_ele.value
      .split(/\s+/)
      .map(x => Number(x.trim()))
      .filter(x => !isNaN(x));
    change_display(area_ele, false);
    setTimeout(() => scoring(numbers, new Set(inputs)), 0);
  });
}

let results = [];

function scoring(orig, input) {
  const score = [...orig].reduce((accr, x) => input.has(x)?accr+1:accr, 0);
  console.log(orig, input);
  console.log(`score: ${score}`);
  results.push({
    orig, input, score
  });
  if (results.length < TEST_REPEAT) {
    setTimeout(() => {
      button_ele.value = `Start Test ${results.length}`;
      change_display(button_ele, true);
    }, 0);
  }
}

//scoring(new Set([11, 22, 33, 4, 2]), new Set([2, 56, 33]))
