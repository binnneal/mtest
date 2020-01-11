const SHOW_TIME = 5;
const FILL_TIME = 10;
const TEST_SIZE = 12;
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

function change_display(ele, displayed) {
  ele.style.display = displayed ? "block" : "none";
}

function generate_test() {
  let numbers = new Set();
  while (numbers.size < TEST_SIZE) {
    numbers.add(Math.floor(random() * (max - min) + min));
  }
  numbers_ele.appendChild(document.createTextNode(numbers.join(" ")));

  let inputs;
  start_timer(SHOW_TIME, () => {
    change_display(numbers_ele, false);
    setTimeout(start_input, 0);
  });

  function start_input() {
    change_display(area_ele, true);
    start_timer(FILL_TIME, () => {
      inputs = area_ele.value
        .split("\n")
        .map(x => Number(x.trim()))
        .filter(x => !isNaN(x));
      setTimeout();
    });
  }
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

generate_test();
