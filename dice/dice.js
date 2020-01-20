  const diceFiles = ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8"];
  const [FAST_DICE_IDX, SLOW_DICE_IDX] = [6, 7];
  const diceSrc = diceFiles.map(src => `${src}.gif`);
  const battleTypes = ["3:2", "3:1", "2:2", "2:1", "1:1"];

  let numDices; // [numAtt, numDef]

  function createButtons() {
    const form = document.getElementsByTagName("form")[0];

    const mouseOverF = function(event) {
      numDices = event.target.innerHTML.split(":");
      showDice("#attacks", numDices[0]);
      showDice("#defends", numDices[1]);
      updateDice("", FAST_DICE_IDX);
      event.preventDefault();
    };

    // Buttons
    for (const text of battleTypes) {
      let button = document.createElement("button");
      button.innerHTML = text;
      button.className = "button";
      button.addEventListener("mousedown", event => {
        updateDice("", SLOW_DICE_IDX);
        event.preventDefault()
      });
      button.addEventListener("mouseup", event => {
        console.log(event);
        throwDice();
        event.preventDefault();
      });
      button.addEventListener("click", event => event.preventDefault());
      button.addEventListener("mouseover", mouseOverF);
      form.appendChild(button);
    }
  };
  createButtons();

  function aboutThrow(event) {
    console.log(event);
  }

  function throwDice() {
    const att = Array.from({
      length: numDices[0]
    }, () => Math.floor(Math.random() * 6));
    const def = Array.from({
      length: numDices[1]
    }, () => Math.floor(Math.random() * 6));

    const win = Math.max(...att) > Math.max(...def);
    console.log(att, def, win);

    updateDice("#attacks", att)
    updateDice("#defends", def)

    const winner = document.getElementById(win ? 'aText' : 'dText');
    const loser = document.getElementById(win ? 'dText' : 'aText');

    // Update 
    winner.style.textDecoration = "none";
    winner.style.color = "blue";
    winner.style.backgroundColor = "yellow";
    loser.style.textDecoration = "line-through";
    loser.style.color = "red";
    loser.style.backgroundColor = "white";
  }

  function updateDice(groupId, numbers) {
    const childList = document.querySelectorAll(groupId + " .dice");
    for (let i = 0; i < childList.length; i++) {
      const val = Array.isArray(numbers) ? numbers[i] : numbers;
      childList[i].src = diceSrc[val];
    }
  }

  function showDice(groupId, targetNum) {
    const diceDiv = document.querySelector(groupId);
    let diff = diceDiv.childElementCount - targetNum;
    while (diff) {
      if (diff > 0) {
        diceDiv.removeChild(diceDiv.lastElementChild);
        diff--;
      } else {
        diceDiv.appendChild(diceDiv.lastElementChild.cloneNode());
        diff++;
      }
    }
  }

