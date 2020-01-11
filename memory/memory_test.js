const SHOW_TIME = 10;
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
const timer_ele = document.getElementById("timer_div");
const area_ele = document.getElementsByTagName("textarea")[0];
const numbers_ele = document.getElementById("numbers_div");

function change_display(ele, visible) {
  ele.style.visibility = visible ? "visible" : "hidden";
}

function generate_test() {
  function generate_numbers(len) {
    const randInt = () => Math.floor(random() * (max - min) + min);
    let numbers = [];
    for (let i = 0; i < len; i++) {
      numbers.push(randInt());
    }
    return numbers;
  }

  const numbers = generate_numbers(TEST_SET);
  numbers_ele.appendChild(document.createTextNode(numbers.join(" ")));

  let inputs;
  start_timer(SHOW_TIME, () => {
    change_visible(numbers_ele, false);
    console.log(area_ele.innerHTML);
  });
}

function start_timer(timeout, exp_callback) {
  const timer_d = setInterval(() => {
    timer_ele.innerHTML = `${timeout--} seconds remaining`;
    if (timeout < 0) {
      clearInterval(timer_d);
      setTimeout(exp_callback, 0);
    }
  }, 1000);
}

function start_input() {}

function start_grading() {}

generate_test();
