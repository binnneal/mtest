const SHOW_TIME = 20;
const FILL_TIME = 9;
const TEST_SIZE = 9;
const TEST_REPEAT = 3;
const MIN = 10;
const MAX = 99;

const seed = 95811;
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

async function fade(e, fade_time = 0, fade_in = false) {
  const INCR_MSEC = 100;
  let increment = fade_time == 0 ? 1 : INCR_MSEC / (1000 * fade_time);
  let opacity;
  if (fade_in) {
    e.style.display = "block";
    opacity = 0;
  } else {
    increment = -increment;
    opacity = 1;
  }
  return await new Promise(resolve => {
    timer.forced = false;
    const interval = setInterval(() => {
      opacity += increment;
      e.style.opacity = opacity;
      if (timer.forced || fade_in && opacity >= 1 || !fade_in && opacity <= 0) {
        clearInterval(interval);
        if (!fade_in) hide(e);
        resolve(timer.forced);
      }
    }, INCR_MSEC);
  });
}

// fade_time: < 0 is for fade in and > 0 is for fade out.
async function display(e, duration = null, fade_out = 0, fade_in = 0) {
  e.style.display = "block";

  if (fade_in) {
    e.style.opacity = 0;
    await fade(e, fade_in, true); // Fade in.
  }
  e.style.opacity = 1; // Reset opacity.    

  if (!duration) return;
  if (await timer.start((duration - fade_out) * 1000)) {
    fade_out = 0; // forced
  }
  await fade(e, fade_out); // Fade out.
}


class Timer {
  constructor() {
    this.timer_d = document.getElementById("timer_d");
  }

  async start(timeout_ms, msg = "remaining") {
    this.timeout_ms = timeout_ms;
    this.forced = false;
    if (msg) display(this.timer_d);
    return await new Promise(resolve => {
      this.interval = setInterval(() => {
        if (this.timeout_ms <= 0) {
          clearInterval(this.interval);
          hide(this.timer_d);
          resolve(this.forced);
        } else {
          this.timeout_ms -= 100;
          const timeout = Math.floor(this.timeout_ms / 1000);
          this.timer_d.innerHTML = `${timeout} seconds ${msg}`;
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
    while (true) {
      numbers.add(get_random());
      if (numbers.size == TEST_SIZE) {
        if (this.is_good_set(numbers)) break;
        numbers.clear();
      }
    }
    while (wrong_numbers.size < TEST_SIZE) {
      const n = get_random();
      if (!numbers.has(n) && /* avoid doubles */ n % 11 != 0) {
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
  // Returns true for good number frequency distibution.
  is_good_set(number_set) {
    let freq_count = new Array(10).fill(0);
    for (const i of number_set) {
      const d = Math.floor(i / 10);
      freq_count[i % 10]++;
      freq_count[d]++;
      // A double is bad, add an extra.
      if (i % 10 == d) freq_count[d]++;
    }
    // console.log(number_set, freq_count);
    return Math.max(...freq_count) < 4;
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

    this.result.push([right, parseInt(this.answer)]);
    //console.log(this.result);
  }

  get_score() {
    const score = this.result.reduce(
      (accr, x) => (x[0] === x[1] ? accr + 1 : accr),
      0
    );
    return {
      score,
      record: [...this.result],
    };
  }
}

class TestNumbers extends Test {
  constructor() {
    super();
    this.type = "number";
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
    await display(this.numbers_d, SHOW_TIME, 6);
  }
}


class Canvas {
  constructor(canvas) {
    const SZ = 450;
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

  fill(n, c, clear_first = false) {
    if (clear_first) {
      this.ctx.clearRect(0, 0, this.c.width, this.c.height);
      this.do_grid();
    }
    this.ctx.font = "20px verdana";
    this.ctx.fillText(c, Math.floor(n / 10) * 50 - 40, (n % 10) * 45 + 25);
    this.c.value = `${n}`;
  }

  fill_all() {
    for (let i = MIN; i < MAX; i++) {
      this.fill(i, `${i}`);
    }
  }
}

class TestPatterns extends Test {
  constructor() {
    super();
    this.type = "visual";
    this.canvas_d = document.getElementById("canvas_d");
    this.choices = this.canvas_d.querySelectorAll("canvas");
    this.canvas = [
      new Canvas(this.choices[0]), new Canvas(this.choices[1])];
  }

  async show_all() {
    const canvas = new Canvas(document.getElementById("board_c"));
    let i = 1;
    canvas.fill_all();
    await display(this.board_d, SHOW_TIME * 10, 4);
  }

  async show_whatever() {
    // show all numbers: await this.show_all();
    const canvas = new Canvas(document.getElementById("board_c"));
    hide(canvas.c);
    display(this.board_d);
    let forced = await timer.start(4000, "to start");
    forced = await display(canvas.c, 0, 0, /* fade_in */ forced ? 0 : 1);
    let i = 1;
    for (const n of this.numbers_list) {
      canvas.fill(n, `${i++}`);
      if (!forced) {
        forced = await timer.start(500, null);
      }
    }
    await display(this.board_d, SHOW_TIME, forced ? 0 : 4);
  }

  async choose_whatever(small, big) {
    const i = this.result.length + 1;
    this.canvas[0].fill(small, `${i}`, true);
    this.canvas[1].fill(big, `${i}`, true);

    await display(this.canvas_d, FILL_TIME, 1);
  }
}

const states = {
  INIT: 0,
  START_TEST: 1,
  TEST: 2,
  RESULT: 3,
  ALL_IN: 4,
};

class TestSuite {
  constructor() {
    this.test_numbers = true;

    // reset all elements
    let content_d = document.getElementById("content_d");
    document.body.replaceChild(content_d.cloneNode(true), content_d);

    timer = new Timer();
    this.init_all();

    this.result_e = document.getElementById("result_d");
    this.master_b = document.getElementById("master_b");
    this.switch_b = document.getElementById("switch_b");

    this.master_b.addEventListener("click", (e) => this.handle_state(e));
    this.switch_b.addEventListener("click", (e) => this.handle_state(e));

    document.getElementById("subject_h1").addEventListener("click",
      () => timer.expire()
    );
    setTimeout(() => this.handle_state(), 0);
  }

  get type() {
    return this.test_numbers ? "number" : "visual";
  }
  get other_type() {
    return !this.test_numbers ? "number" : "visual";
  }

  init_all() {
    this.results = {
      number: [],
      visual: []
    };
    this.final = {};
    this.state = states.INIT;
  }

  async handle_state(e) {
    const result_type = this.results[this.type];
    if (this.state == states.INIT) {
      this.master_b.value = `Start ${this.type} test`;
      this.switch_b.value = `Switch to ${this.other_type} test`;

      if (e) {
        if (e.target == this.switch_b) {
          this.test_numbers = !this.test_numbers;
        } else if (e.target == this.master_b) {
          result_type.length = 0;
          this.state = states.START_TEST;
        }
        setTimeout(() => this.handle_state(), 0);
      }
    } else if (this.state == states.START_TEST) {
      hide(this.switch_b);
      hide(this.result_e);
      this.master_b.value = `Test (${this.type}) ${result_type.length + 1} of ${TEST_REPEAT}`;
      this.state = states.TEST;
      display(this.master_b);
    } else if (this.state == states.TEST) {
      hide(this.master_b);
      let test = this.test_numbers ? new TestNumbers() : new TestPatterns();
      await test.run();
      result_type.push(test.get_score());
      if (result_type.length == TEST_REPEAT) {
        this.handle_results();
      }
      setTimeout(() => this.handle_state(), 0);
    } else if (this.state == states.RESULT) {
      this.master_b.value = `Redo ${this.type} tests`;
      display(this.master_b);
      display(this.switch_b);
      this.state = states.INIT;
    } else if (this.state == states.ALL_IN) {
      if (e) {
        if (e.target == this.master_b) {
          this.submit_results();
          // Not reached after above.
          return;
        }
        if (e.target == this.switch_b) {
          this.init_all();
          setTimeout(() => this.handle_state(), 0);
          return;
        }
      }
      this.master_b.value = "Submit (leave)";
      this.switch_b.value = "Restart all";
      display(this.master_b);
      display(this.switch_b);
    }
  }

  handle_results() {
    const result_type = this.results[this.type];

    // final score is the average all all but the lowest score.
    let final = result_type[0].score;
    let range = 0;
    if (result_type.length > 1) {
      const bests = result_type.map(x => x.score).sort();
      range = bests[bests.length - 1] - bests[0];
      bests.shift();
      final = bests.reduce((a, x) => a + x, 0) / bests.length;
    }
    this.final[this.type] = final;
    this.final[`${this.type}_range`] = range;
    const result_text = result_type.map(x => JSON.stringify(x)).join("<br/>");
    this.result_e.innerHTML = [
      `Results for ${this.type} test (score,[correct,yours]):`,
      result_text,
      `Final Score: ${JSON.stringify(this.final)}`
    ].join("<br/>");
    display(this.result_e);

    // Check to see we got all resutls in.
    if (this.final.number && this.final.visual) {
      this.state = states.ALL_IN;
    } else {
      this.state = states.RESULT;
    }
  }

  submit_results() {
    Object.defineProperty(String.prototype, 'hashCode', {
      value: function () {
        var hash = 0,
          i, chr;
        for (i = 0; i < this.length; i++) {
          chr = this.charCodeAt(i);
          hash = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      }
    });

    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSd5PwnQyL4P57RAC_b5rnV7kf42tZ9kj5AzsBMzi8AoZDXOOA/viewform?usp=pp_url&entry.1319078321=_NUMBER_SCORE_&entry.1496658994=_VISUAL_SCORE_&entry.1641140264=_NUMBER_RANGE_&entry.1951185582=_VISUAL_RANGE_&entry.1391199194=_RAW_RECORD_&entry.235269604=_RAW_HASHCODE_";

    let url = FORM_URL.replace("_NUMBER_SCORE_", this.final.number);
    url = url.replace("_VISUAL_SCORE_", this.final.visual);
    url = url.replace("_NUMBER_RANGE_", this.final.number_range);
    url = url.replace("_VISUAL_RANGE_", this.final.visual_range);
    url = url.replace("_RAW_RECORD_", encodeURIComponent(JSON.stringify(this.results)));
    url = url.replace("_RAW_HASHCODE_", JSON.stringify(this.results).hashCode());

    console.log(url);
    window.open(url, "_self");
  }
}

let ts;

function start() {
  ts = new TestSuite();
}
