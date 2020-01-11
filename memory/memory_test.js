const show_time=30;
const test_time=30;

const min = 10;
const max = 100;

function generate_test() {
  
}

function generate_numbers(seed) {
  const rand = (s = seed) => {
    return function() {
        s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
};

  const randInt = () => Math.floor(Math.random() * (max - min) + min);

  
}