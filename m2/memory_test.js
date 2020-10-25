const SHOW_TIME = 20;
const FILL_TIME = 8;
const TEST_SIZE = 8;
const TEST_REPEAT = 2;
const MIN = 2;
const MAX = 99;

const seed = 2345;
const rand_factory = s => {
  return function () {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
};
const random = rand_factory(seed);
const get_random = () => Math.floor(random() * (MAX - MIN) + MIN);

let timer;
let hide = (e) => e.style.display = "none";

async function fade(e, duration = 0) {
  const INCR_MSEC = 100;
  e.style.opacity = duration > 0 ? 1 : 0;
  return await new Promise(resolve => {
    const interval = setInterval(() => {
      e.style.opacity -= INCR_MSEC / (1000 * duration);
      if (e.style.opacity <= 0) {
        clearInterval(interval);
        hide(e);
        resolve();
      }
    }, INCR_MSEC);
  })
}

async function display(e, timeout = null, fade_int = 0) {
  e.style.display = "block";
  e.style.opacity = 1; // Reset opacity.
  if (!timeout) return;

  if (await timer.start(timeout - fade_int)) {
    fade_int = 0; // forced
  }
  await fade(e, fade_int);
}


class Timer {
  constructor() {
    this.timer_d = document.getElementById("timer_d");
  }

  async start(timeout) {
    this.timeout_ms = timeout * 1000;
    display(this.timer_d);
    return await new Promise(resolve => {
      this.interval = setInterval(() => {
        if (this.timeout_ms <= 0) {
          clearInterval(this.interval);
          hide(this.timer_d);
          resolve(this.forced);
        } else {
          this.timeout_ms -= 100;
          timeout = Math.floor(this.timeout_ms / 1000);
          this.timer_d.innerHTML = `${timeout} seconds remaining`;
        }
      }, 100);
    });
  }

  expire() {
    this.timeout_ms = 0;
    this.forced = true;
  }
}

class Test {
  constructor() {
    this.result = [];

    const numbers = new Set();
    const wrong_numbers = new Set();
    while (numbers.size < TEST_SIZE) {
      numbers.add(get_random());
    }
    while (wrong_numbers.size < TEST_SIZE) {
      const n = get_random();
      if (!numbers.has(n)) {
        wrong_numbers.add(n);
      };
    }
    this.numbers_list = [...numbers];
    this.wrong_numbers_list = [...wrong_numbers];
    console.log(this.numbers_list);
    console.log(this.wrong_numbers_list);

    this.numbers_d = document.getElementById("numbers_d");
    this.input_d = document.getElementById("input_d");
    this.buttons = input_d.querySelectorAll("input");
  }

  async run() {
    this.numbers_d.lastElementChild.innerHTML = this.numbers_list.join(" ");
    await display(this.numbers_d, SHOW_TIME, 4);

    // show a series of multi_choice and grade answers.
    const NUM_QUESTION = TEST_SIZE;
    const click_answer = (event) => {
      this.answer = event.target.value;
      timer.expire();
    };
    this.buttons[0].onclick = click_answer;
    this.buttons[1].onclick = click_answer;

    while (this.result.length < NUM_QUESTION) {
      await this.do_questions();
    }
  }

  async do_questions() {
    this.answer = null;
    const right = this.numbers_list.shift();
    const wrong = this.wrong_numbers_list.shift();
    this.buttons[0].value = `${right < wrong ? right : wrong}`;
    this.buttons[1].value = `${right < wrong ? wrong : right}`;

    await display(input_d, FILL_TIME, 1);
    this.result.push([`${right}`, this.answer]);
    console.log(this.result);
  }

  get_score() {
    const score = this.result.reduce(
      (accr, x) => (x[0] == x[1] ? accr + 1 : accr),
      0
    );
    return {
      score,
      result: [...this.result],
    };
  }
}

const states = {
  START_TEST: 0,
  TEST: 1,
  RESULT: 2,
};

class TestSuite {
  constructor() {
    console.log("TestSuite");
    // reset all elements
    let content_d = document.getElementById("content_d");
    document.body.replaceChild(content_d.cloneNode(true), content_d);

    timer = new Timer();
    this.results = [];
    this.result_e = document.getElementById("result_d");

    this.master_b = document.getElementById("master_b");
    this.master_b.value = "Click to start test set";
    this.state = states.START_TEST;
    this.master_b.addEventListener("click", () => this.handle_state());
    document.getElementById("subject_h1").addEventListener("click",
      () => timer.expire()
    );
  }

  async handle_state() {
    if (this.state == states.START_TEST) {
      hide(this.result_e);
      this.master_b.value = `Test ${this.results.length + 1} of ${TEST_REPEAT}`;
      this.state = states.TEST;
      display(this.master_b);
    } else if (this.state == states.TEST) {
      hide(this.master_b);
      let test = new Test();
      await test.run();
      this.get_result(test);
    } else if (this.state == states.RESULT) {
      this.master_b.value = "Restart Test";
      this.results = [];
      display(this.master_b);
      this.state = states.START_TEST;
    }
  }

  get_result(test) {
    this.results.push(test.get_score());
    if (this.results.length < TEST_REPEAT) {
      this.state = states.START_TEST;
    } else {
      this.state = states.RESULT;
      this.show_results();
    }
    setTimeout(() => this.handle_state(), 0);
  }

  show_results() {
    let results = this.results;
    const result_text = results.map(x => JSON.stringify(x)).join("<br/>");
    let final = results[0].score;
    if (results.length > 1) {
      const bests = results.map(x => x.score).sort();
      bests.shift();
      final = bests.reduce((a, x) => a + x, 0) / bests.length;
    }
    this.result_e.innerHTML = `${result_text}<br/>Final Score: ${final}`;
    display(this.result_e);
  }
}

let ts;

function start() {
  ts = new TestSuite();
}
