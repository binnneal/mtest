const SHOW_TIME = 20;
const FILL_TIME = 25;
const TEST_SIZE = 8;
const TEST_REPEAT = 3;
const min = 2;
const max = 40;

const seed = 2345;
const rand_factory = s => {
  return function() {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};
const random = rand_factory(seed);

const timer_ele = document.getElementById("timer_div");
const area_ele = document.getElementsByTagName("textarea")[0];
const input_ele = document.getElementById("input_area");
const numbers_ele = document.getElementById("numbers_div");
const button_ele = document.getElementsByTagName("input")[0];
const result_ele = document.getElementById("result");

let ff_function = () => console.log("no op");

function change_display(ele, displayed) {
  ele.style.display = displayed ? "block" : "none";
  if (displayed) {
    ele.style.opacity = 1;
  }
}

function fading(ele, done_cb) {
  let opacity = 1.0;

  let intId = setInterval(() => {
    opacity -= 0.1;
    if (opacity < 0) {
      clearInterval(intId);
      change_display(ele, false);
      setTimeout(done_cb, 0);
    } else {
      ele.style.opacity = opacity;
    }
  }, 200);
}

function start_test() {
  change_display(button_ele, false);
  let numbers = new Set();
  while (numbers.size < TEST_SIZE) {
    numbers.add(Math.floor(random() * (max - min) + min));
  }
  numbers_ele.lastChild.innerHTML = [...numbers].join(" ");
  change_display(numbers_ele, true);

  start_timer(SHOW_TIME, () => {
    fading(numbers_ele, () => start_input(numbers));
  });
}

function start_timer(timeout, exp_callback) {
  ff_function = () => {
    timeout = 1;
    console.log("Fast forwarded");
    ff_function = () => console.log("No op");
  };
  change_display(timer_ele, true);

  timer_ele.innerHTML = `${timeout--} seconds remaining`;
  const timer_d = setInterval(() => {
    timer_ele.innerHTML = `${timeout--} seconds remaining`;
    if (timeout == 0) {
      clearInterval(timer_d);
      change_display(timer_ele, false);
      setTimeout(exp_callback, 0);
    }
  }, 1000);
}

function start_input(numbers) {
  let inputs;
  area_ele.value = "";
  change_display(input_ele, true);
  start_timer(FILL_TIME, () => {
    inputs = area_ele.value
      .split(/[\s,]+/)
      .map(x => Number(x.trim()))
      .filter(x => x);
    fading(input_ele, () => scoring(numbers, new Set(inputs)));
  });
}

let results = [];

function scoring(orig, input) {
  const score = [...orig].reduce(
    (accr, x) => (input.has(x) ? accr + 1 : accr),
    0
  );
  results.push({
    orig: [...orig],
    input: [...input],
    score
  });
  if (results.length < TEST_REPEAT) {
    setTimeout(() => {
      button_ele.value = `Test ${results.length + 1} of ${TEST_REPEAT}`;
      change_display(button_ele, true);
    }, 0);
  } else {
    do_result();
  }
}

function do_result() {
  const result_text = results.map(x => JSON.stringify(x)).join("<br/>");
  let final = results[0].score;
  if (results.length > 1) {
    const bests = results.map(x => x.score).sort();
    bests.shift();
    final = bests.reduce((a, x) => a + x, 0) / bests.length;
  }
  result_ele.innerHTML = `${result_text}<br/>Final Score: ${final}`;
  change_display(result_ele, true);

  button_ele.value = "Restart Test";
  button_ele.onclick = generate_test_set;
  change_display(button_ele, true);
}

function ff_wrapper() {
  ff_function();
}
function generate_test_set() {
  results = [];
  change_display(result_ele, false);

  button_ele.value = `Test ${results.length + 1} of ${TEST_REPEAT}`;
  button_ele.onclick = start_test;
  document.getElementsByTagName("h1")[0].addEventListener("click", ff_wrapper);
}
