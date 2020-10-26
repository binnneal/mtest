const SHOW_TIME = 20;
const FILL_TIME = 8;
const TEST_SIZE = 7;
const TEST_REPEAT = 2;
const MIN = 10;
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
    this.board_d = document.getElementById("board_d");
  }

  // to be overriden
  async show_whatever() {}

  // to be overriden
  async choose_whatever(small, big) {}

  async run() {
    await this.show_whatever();

    // show a series of multi_choice and grade answers.
    const NUM_QUESTION = TEST_SIZE;
    const click_answer = (event) => {
      this.answer = event.target.value;
      timer.expire();
    };
    this.choices[0].onclick = click_answer;
    this.choices[1].onclick = click_answer;

    while (this.result.length < NUM_QUESTION) {
      await this.do_questions();
    }
  }

  async do_questions() {
    this.answer = null;
    const right = this.numbers_list.shift();
    const wrong = this.wrong_numbers_list.shift();
    const small = right < wrong ? right : wrong;
    const big = right < wrong ? wrong : right;
    await this.choose_whatever(small, big);

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

class TestNumbers extends Test {
  constructor() {
    super();

    this.input_d = document.getElementById("input_d");
    this.choices = this.input_d.querySelectorAll("input");
  }

  async choose_whatever(small, big) {
    this.choices[0].value = `${small}`;
    this.choices[1].value = `${big}`;
    await display(this.input_d, FILL_TIME, 1);
  }

  async show_whatever() {
    this.numbers_d.lastElementChild.innerHTML = this.numbers_list.join(" ");
    await display(this.numbers_d, SHOW_TIME, 4);
  }
}


class Canvas {
  constructor(canvas) {
    const SZ = 500;
    this.c = canvas;
    this.c.height = this.c.width = SZ;
    this.ctx = canvas.getContext("2d");
    this.do_grid();
  }

  do_grid() {
    const SZ = this.c.height;
    this.ctx.strokeStyle = "gray";
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 2]);
    for (let i = SZ / 4; i < SZ; i += SZ / 4) {
      this.line(i, 0, i, SZ);
    }
    for (let i = SZ / 4; i < SZ; i += SZ / 4) {
      this.line(0, i, SZ, i);
    }
  }

  line(x1, y1, x2, y2) {
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  fill(n, clear_first = false) {
    if (clear_first) {
      this.ctx.clearRect(0, 0, this.c.width, this.c.height);
      this.do_grid();
    }
    this.ctx.font = "20px verdana";
    //this.ctx.fillText(`${n}`, Math.floor(n / 10) * 50, (n % 10) * 50 + 25);
    this.ctx.fillText(`*`, Math.floor(n / 10) * 50, (n % 10) * 50 + 25);
    this.c.value = `${n}`;
  }
}

class TestPatterns extends Test {
  constructor() {
    super();
    this.canvas_d = document.getElementById("canvas_d");
    this.choices = this.canvas_d.querySelectorAll("canvas");
    this.canvas = [
      new Canvas(this.choices[0]), new Canvas(this.choices[1])];
  }

  async show_whatever() {
    const canvas = new Canvas(document.getElementById("board_c"));
    for (const n of this.numbers_list) {
      canvas.fill(n);
    }
    await display(this.board_d, SHOW_TIME, 4);
  }

  async choose_whatever(small, big) {
    this.canvas[0].fill(small, true);
    this.canvas[1].fill(big, true);

    await display(this.canvas_d, FILL_TIME, 1);
  }
}

const states = {
  START_TEST: 0,
  TEST: 1,
  RESULT: 2,
};

class TestSuite {
  constructor() {
    this.test_numbers = true;

    // reset all elements
    let content_d = document.getElementById("content_d");
    document.body.replaceChild(content_d.cloneNode(true), content_d);

    timer = new Timer();
    this.results = [];
    this.result_e = document.getElementById("result_d");

    this.master_b = document.getElementById("master_b");
    this.master_b.value = `Start ${this.type} Test`;
    this.state = states.START_TEST;
    this.master_b.addEventListener("click", (e) => this.handle_state(e));

    this.switch_b = document.getElementById("switch_b");
    this.switch_b.value = `Switch To Visual`;
    this.switch_b.addEventListener("click", (e) => this.handle_state(e));

    document.getElementById("subject_h1").addEventListener("click",
      () => timer.expire()
    );
  }

  get type() {
    return this.test_numbers ? "Number" : "Visual";
  }
  get other_type() {
    return !this.test_numbers ? "Number" : "Visual";
  }

  async handle_state(e) {
    if (e && e.target == this.switch_b) {
      this.switch_b.value = `Switch To ${this.type}`;
      this.test_numbers = !this.test_numbers;
    }
    if (this.state == states.START_TEST) {
      hide(this.switch_b);
      hide(this.result_e);
      this.master_b.value = `${this.type} Test ${this.results.length + 1} of ${TEST_REPEAT}`;
      this.state = states.TEST;
      display(this.master_b);
    } else if (this.state == states.TEST) {
      hide(this.master_b);
      let test = this.test_numbers ? new TestNumbers() : new TestPatterns();
      await test.run();
      this.get_result(test);
    } else if (this.state == states.RESULT) {
      this.master_b.value = "Restart Test";
      this.results = [];
      display(this.master_b);
      display(this.switch_b);
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
