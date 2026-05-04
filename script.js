document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js loaded");
  
  let totalOvers = 2; // ✅ default

  /*************************************************
   * CONFIG
   *************************************************/
  const outcomes = [
    { type: "run", value: 0 },
    { type: "run", value: 1 },
    { type: "run", value: 2 },
    { type: "run", value: 3 },
    { type: "run", value: 4 },
    { type: "run", value: 6 },
    { type: "out", value: "Catch" },
    { type: "out", value: "Run Out" },
    { type: "out", value: "Clean Bowled" }
  ];

  /*************************************************
   * GAME STATE
   *************************************************/
  let teams = [];
  let batsmenLimit = 0;
  let currentTeamIndex = 0;
  let currentBatsmanIndex = 0;
  let highestScore = 0;
  let currentTarget = null;

  /*************************************************
   * SETUP SCREEN
   *************************************************/
  const playerCountEl = document.getElementById("playerCount");
  const batsmenCountEl = document.getElementById("batsmenCount");
  const playerNamesEl = document.getElementById("playerNames");
  const startGameBtn = document.getElementById("startGame");

  const defaults = ["Ansh", "Ravi"];

  function buildNameInputs() {
    playerNamesEl.innerHTML = "";
    for (let i = 0; i < Number(playerCountEl.value); i++) {
      const input = document.createElement("input");
      input.value = defaults[i] || `Player ${i + 1}`;
      playerNamesEl.appendChild(input);
    }
  }

  playerCountEl.onchange = buildNameInputs;
  buildNameInputs();

  startGameBtn.onclick = () => {
    batsmenLimit = Number(batsmenCountEl.value);
    teams = [...playerNamesEl.querySelectorAll("input")].map(i => ({
      name: i.value.trim(),
      batsmen: []
    }));
    openTossModal();
  };


  /*************************************************
   * Populate overs dropdown (run once)
   *************************************************/
	const oversCountEl = document.getElementById("oversCount");



	if (oversCountEl) {
	  for (let i = 1; i <= 20; i++) {
		const opt = document.createElement("option");
		opt.value = i;
		opt.textContent = i;
		if (i === 2) opt.selected = true;
		oversCountEl.appendChild(opt);
	  }

	  oversCountEl.onchange = () => {
		totalOvers = Number(oversCountEl.value);
	  };
	}



  /*************************************************
   * TOSS MODAL
   *************************************************/
  const tossModal = document.getElementById("tossModal");
  const coinToss = document.getElementById("coinToss");
  const lineToss = document.getElementById("lineToss");

	 function hardResetTossUI() {
	  // ✅ Hide both toss content sections
	  coinToss.classList.add("hidden");
	  lineToss.classList.add("hidden");
	  coinToss.style.display = "none";
	  lineToss.style.display = "none";

	  // ✅ RESET Toss Order to STATE 1 (Selection screen)
	  const tossSelection = document.getElementById("tossSelection");
	  const tossResult = document.getElementById("tossResult");
	  const barsContainer = document.getElementById("barsContainer");

	  if (tossSelection) {
		tossSelection.classList.add("active");
		tossSelection.classList.remove("hidden");
	  }

	  if (tossResult) {
		tossResult.classList.add("hidden");
		tossResult.classList.remove("active");
	  }

	  // ✅ Clear previous result bars (important!)
	  if (barsContainer) {
		barsContainer.innerHTML = "";
	  }

	  // ✅ Reset Coin Toss UI elements
	  const flip = document.getElementById("coinFlipArea");
	  const batChoice = document.getElementById("batChoice");
	  const resultText = document.getElementById("tossResultText");
	  const tossBtn = document.getElementById("doCoinToss");

	  if (flip) {
		flip.classList.add("hidden");
		flip.textContent = "";
	  }

	  if (batChoice) {
		batChoice.classList.add("hidden");
		batChoice.style.display = "none";
	  }

	  if (resultText) {
		resultText.textContent = "";
	  }

	  if (tossBtn) {
		tossBtn.style.display = "block";
		tossBtn.disabled = true;
	  }

	  // ✅ Reset coin selection visuals
	  document.querySelectorAll(".coin").forEach(btn => {
		btn.classList.remove("selected");
	  });
	}



  function openTossModal() {
    tossModal.classList.remove("hidden");
    hardResetTossUI();
    teams.length === 2 ? setupCoinToss() : setupLineToss();
  }

	document.querySelectorAll(".modal-close").forEach(btn => {
	  btn.onclick = () => {
		const modalId = btn.dataset.close;
		const modal = document.getElementById(modalId);

		if (modal) {
		  modal.classList.add("hidden");
		}

		// Optional safety resets
		hardResetTossUI();
	  };
	});

	document.addEventListener("keydown", (e) => {
	  if (e.key !== "Escape") return;

	  // ✅ Close Toss Modal
	  const tossModal = document.getElementById("tossModal");
	  if (tossModal && !tossModal.classList.contains("hidden")) {
		tossModal.classList.add("hidden");
		hardResetTossUI();
		return;
	  }

	  // ✅ Close Next Team Modal
	  const nextTeamModal = document.getElementById("nextTeamModal");
	  if (nextTeamModal && !nextTeamModal.classList.contains("hidden")) {
		nextTeamModal.classList.add("hidden");

		// Resume game safely if needed
		hitBtn.disabled = false;
		return;
	  }

	  // ✅ Close Winner Modal (optional but nice UX)
	  const winnerModal = document.getElementById("winnerModal");
	  if (winnerModal && !winnerModal.classList.contains("hidden")) {
		winnerModal.classList.add("hidden");
	  }
	});

  /*************************************************
   * COIN TOSS (2 PLAYERS)
   *************************************************/
  function setupCoinToss() {
    coinToss.style.display = "block";
    coinToss.classList.remove("hidden");
    lineToss.style.display = "none";

    const caller = document.getElementById("tossCaller");
    const tossBtn = document.getElementById("doCoinToss");
    const flip = document.getElementById("coinFlipArea");
    const resultText = document.getElementById("tossResultText");
    const batChoice = document.getElementById("batChoice");
    const batFirst = document.getElementById("batFirst");
    const batLater = document.getElementById("batLater");

    let selectedSide = null;
    let callerIndex = 0;
    let tossWinnerIndex = -1;

    caller.innerHTML = teams
      .map((t, i) => `<option value="${i}">${t.name}</option>`)
      .join("");

    document.querySelectorAll(".coin").forEach(btn => {
      btn.classList.remove("selected");
      btn.onclick = () => {
        document.querySelectorAll(".coin")
          .forEach(b => b.classList.remove("selected"));

        btn.classList.add("selected");
        selectedSide = btn.dataset.side;
        callerIndex = Number(caller.value);
        tossBtn.disabled = false;
      };
    });

    tossBtn.onclick = () => {
      if (!selectedSide) return;

      tossBtn.style.display = "none";
      flip.textContent = "🪙 Flipping...";
      flip.classList.remove("hidden");

      setTimeout(() => {
        const result = Math.random() < 0.5 ? "HEADS" : "TAILS";
        tossWinnerIndex =
          result === selectedSide ? callerIndex : 1 - callerIndex;

        flip.classList.add("hidden");
        resultText.textContent =
          `${teams[tossWinnerIndex].name} WON THE TOSS`;

        batChoice.style.display = "flex";
        batChoice.classList.remove("hidden");

        batFirst.onclick = () => {
          if (tossWinnerIndex !== 0) {
            teams.unshift(teams.splice(tossWinnerIndex, 1)[0]);
          }
          startMatch();
        };

        batLater.onclick = () => {
          if (tossWinnerIndex === 0) teams.reverse();
          startMatch();
        };

      }, 1200);
    };
  }
  

document.getElementById("playMatch").onclick = () => {
  document.getElementById("tossModal").classList.add("hidden");
  startMatch();
};



  /*************************************************
   * LINE TOSS (MULTIPLAYER)
   *************************************************/
  let lineDropdowns = [];
  let lineBars = [];

  function updateLineTossDropdowns() {
    const selected = lineDropdowns.map(d => d.value).filter(Boolean);

    lineDropdowns.forEach(dropdown => {
      Array.from(dropdown.options).forEach(opt => {
        if (!opt.value) return;
        opt.disabled =
          selected.includes(opt.value) && opt.value !== dropdown.value;
      });
    });

    document.getElementById("showLines").disabled =
      lineDropdowns.some(d => !d.value);
  }

  function setupLineToss() {
    lineToss.style.display = "block";
    lineToss.classList.remove("hidden");
    coinToss.style.display = "none";

    const container = document.getElementById("linesContainer");
    const showBtn = document.getElementById("showLines");

    container.innerHTML = "";
    showBtn.disabled = true;
    lineDropdowns = [];
    lineBars = [];

teams.forEach((team, index) => {
  const col = document.createElement("div");

  col.innerHTML = `
    <label>Player ${index + 1}</label>
    <select>
      <option value="">Select</option>
      ${teams.map(t => `<option value="${t.name}">${t.name}</option>`).join("")}
    </select>
    <div class="underline"></div>
  `;

  const select = col.querySelector("select");
  select.onchange = updateLineTossDropdowns;

  container.appendChild(col);
  lineDropdowns.push(select);
});


  // ✅ ✅ ADD BELOW (VERY IMPORTANT)
  document.getElementById("tossSelection").classList.add("active");
  document.getElementById("tossResult").classList.add("hidden");

    showBtn.onclick = revealLines;
  }

	function revealLines() {
	  const selection = document.getElementById("tossSelection");
	  const result = document.getElementById("tossResult");
	  const barsContainer = document.getElementById("barsContainer");

	  if (!selection || !result || !barsContainer) {
		console.error("Toss Order: Missing layout elements");
		return;
	  }

	  selection.classList.remove("active");
	  selection.classList.add("hidden");
	  result.classList.remove("hidden");
	  result.classList.add("active");

	  barsContainer.innerHTML = "";

	  const order = lineDropdowns.map((d) => ({
		name: d.value,
		height: Math.random() * 80 + 60
	  }));

	  order.sort((a, b) => b.height - a.height);

	  teams = order.map(o => teams.find(t => t.name === o.name));

	  order.forEach(o => {
		const bar = document.createElement("div");
		bar.className = "toss-bar";
		bar.style.height = `${o.height}px`;
		bar.textContent = o.name;
		barsContainer.appendChild(bar);
	  });
	}


  /*************************************************
   * MATCH + GAMEPLAY
   *************************************************/
  const hitBtn = document.getElementById("hitBtn");
  const pitchResult = document.getElementById("pitchResult");

  hitBtn.disabled = true;
  hitBtn.onclick = spin;

  function startMatch() {
    tossModal.classList.add("hidden");
    document.getElementById("winnerModal").classList.add("hidden");

    document.getElementById("setup").classList.remove("active");
    document.getElementById("game").classList.add("active");

    currentTeamIndex = 0;
    currentBatsmanIndex = 0;
    highestScore = 0;
    currentTarget = null;

    initBatsmen(teams[0]);
    hitBtn.disabled = false;

    updateTeamLabel();
    renderScoreboard();
  }

  function initBatsmen(team) {
    team.batsmen = Array.from({ length: batsmenLimit }, (_, i) => ({
      name: `Batsman ${i + 1}`,
      runs: 0,
      balls: 0,
      status: i === 0 ? "Batting" : "Not yet in",
      isDuck: false
    }));
  }

  function spin() {
  hitBtn.disabled = true;

  let cycles = 18;
  let res;

  pitchResult.classList.add("spinning");

  const timer = setInterval(() => {
    res = outcomes[Math.floor(Math.random() * outcomes.length)];
    pitchResult.textContent =
      res.type === "run" ? res.value : res.value.toUpperCase();

    if (--cycles === 0) {
      clearInterval(timer);
      pitchResult.classList.remove("spinning");

      try {
        applyResult(res);
      } finally {
        // ✅ GUARANTEED re-enable unless match is won
        if (
          currentTarget === null ||
          teamTotalRuns(teams[currentTeamIndex]) < currentTarget
        ) {
          hitBtn.disabled = false;
        }
      }
    }
  }, 50);
}


  function applyResult(res) {
  const team = teams[currentTeamIndex];
  const batsman = team.batsmen[currentBatsmanIndex];

  // ✅ If over limit already reached, stop
  if (isOverLimitReached(team)) {
    return endInnings();
  }

  batsman.balls++;

  if (res.type === "run") {
    batsman.runs += res.value;
  } else {
    if (batsman.runs === 0) batsman.isDuck = true;
    batsman.status = res.value;
    currentBatsmanIndex++;

    if (!team.batsmen[currentBatsmanIndex]) return endInnings();
    team.batsmen[currentBatsmanIndex].status = "Batting";
  }

  renderScoreboard();

  // ✅ End innings when balls reach over limit
  if (isOverLimitReached(team)) {
    return endInnings();
  }

  // ✅ Chase completion
  if (currentTarget !== null && teamTotalRuns(team) >= currentTarget) {
    hitBtn.disabled = true;
    showWinner(team.name);
  }
}

  /*************************************************
   * HELPERS
   *************************************************/
  function getBallsPlayed(team) {
    return team.batsmen.reduce((s, b) => s + b.balls, 0);
  }

	function getMatchRequiredRR() {
	  return ((highestScore + 1) / totalOvers).toFixed(2);
	}

	function getCurrentRR(team) {
	  const balls = getBallsPlayed(team);
	  if (balls === 0) return "0.00";
	  return (teamTotalRuns(team) / (balls / 6)).toFixed(2);
	}

	function getOversRemaining(team) {
	  const ballsBowled = getBallsPlayed(team);
	  const totalBalls = totalOvers * 6;
	  return Math.max((totalBalls - ballsBowled) / 6, 0);
	}

	function getRunsRemaining(team) {
	  return Math.max(currentTarget - teamTotalRuns(team), 0);
	}

	function getRequiredRunRate(team) {
	  const oversRemaining = getOversRemaining(team);
	  if (oversRemaining === 0) return "0.00";
	  return (getRunsRemaining(team) / oversRemaining).toFixed(2);
	}
		
	function getOversLeft(team) {
	  const ballsBowled = getBallsPlayed(team);
	  const totalBalls = totalOvers * 6;
	  const ballsLeft = Math.max(totalBalls - ballsBowled, 0);

	  const overs = Math.floor(ballsLeft / 6);
	  const balls = ballsLeft % 6;

	  return `${overs}.${balls}`;
	}

	function showNextTeamModal(teamName, onContinue) {
	  const modal = document.getElementById("nextTeamModal");
	  const text = document.getElementById("nextTeamText");
	  const okBtn = document.getElementById("nextTeamOk");

	  text.textContent = `${teamName.toUpperCase()} is going to bat next 🏏`;
	  modal.classList.remove("hidden");

	  okBtn.onclick = () => {
		modal.classList.add("hidden");
		onContinue();
	  };
	}
	
	
	function isOverLimitReached(team) {
	  return getBallsPlayed(team) >= totalOvers * 6;
	}

  function formatOvers(balls) {
    return `${Math.floor(balls / 6)}.${balls % 6}/${totalOvers}`;
  }

 function endInnings() {
  // ✅ Update highest score
  highestScore = Math.max(
    highestScore,
    teamTotalRuns(teams[currentTeamIndex])
  );

  // ✅ Move to next team
  currentTeamIndex++;
  currentBatsmanIndex = 0;

  // ✅ If no more teams, decide winner
  if (!teams[currentTeamIndex]) {
    showWinner(getWinner());
    return;
  }

  // ✅ Pause transition & show next team modal
  const nextTeamName = teams[currentTeamIndex].name;

  showNextTeamModal(nextTeamName, () => {
    // ✅ Reset pitch display
    pitchResult.textContent = "🏏";

    // ✅ Set target for next team
    currentTarget = highestScore + 1;

    // ✅ Initialize next team's batsmen
    initBatsmen(teams[currentTeamIndex]);

    // ✅ Update UI
    updateTeamLabel();
    renderScoreboard();

    // ✅ Enable HIT only after OK
    hitBtn.disabled = false;
  });
}

 function renderScoreboard() {
  const body = document.getElementById("scoreBody");
  const footer = document.getElementById("scoreFooter");
  const team = teams[currentTeamIndex];

  body.innerHTML = "";
  footer.innerHTML = "";

  let runs = 0;
  let balls = 0;

  team.batsmen.forEach(b => {
    runs += b.runs;
    balls += b.balls;

    const statusText =
      b.status === "Batting"
        ? "Batting"
        : b.status === "Not yet in"
        ? "Not yet in"
        : b.isDuck
        ? `🦆 ${b.status}`
        : b.status;

    const tr = document.createElement("tr");
	
  // ✅ ✅ PLACE IT HERE (RIGHT AFTER tr IS CREATED)
  if (b.status === "Batting") {
    tr.classList.add("batting");
  } else {
    tr.classList.add("non-batting");
  }

    tr.innerHTML = `
      <td>${b.name}</td>
      <td>${statusText}</td>
      <td>${b.runs}</td>
      <td>${b.balls}</td>
    `;
    body.appendChild(tr);
  });

  const oversText = `${Math.floor(balls / 6)}.${balls % 6}/${totalOvers}`;

  // ✅ FIRST INNINGS
  if (currentTarget === null) {
	 footer.innerHTML = `
	  <tr class="score-footer">
		<td colspan="2" class="footer-left">
		  OVERS: ${oversText}
		  <span class="overs-left">LEFT: ${getOversLeft(team)}</span>
		</td>
		<td colspan="2" class="footer-right">
		  <strong>TOTAL: ${runs}</strong>
		</td>
	  </tr>
	`;

  }
  // ✅ CHASING TEAMS
  else {
    footer.innerHTML = `
	  <tr class="score-footer">
		<td colspan="2" class="footer-left">
		  <strong>TARGET: ${currentTarget}</strong> |
		  RRR: ${getRequiredRunRate(team)} |
		  CRR: ${getCurrentRR(team)} |
		  OVERS: ${oversText}
		  <span class="overs-left">LEFT: ${getOversLeft(team)}</span>
		</td>
		<td colspan="2" class="footer-right">
		  <strong>TOTAL: ${runs}</strong>
		</td>
	  </tr>
	`;

  }
}



  function teamTotalRuns(team) {
    return team.batsmen.reduce((s, b) => s + b.runs, 0);
  }

  function updateTeamLabel() {
    document.getElementById("scoreTeamName").textContent =
      teams[currentTeamIndex].name.toUpperCase();
  }

  function getWinner() {
    return teams.reduce((a, b) =>
      teamTotalRuns(b) > teamTotalRuns(a) ? b : a
    ).name;
  }

  function showWinner(name) {
    document.getElementById("winnerText").textContent =
      `${name.toUpperCase()} WON THE MATCH 🏆`;
    document.getElementById("winnerModal").classList.remove("hidden");
  }

  /*************************************************
   * WINNER CONTROLS
   *************************************************/
  document.getElementById("restartGame").onclick = () => {
    document.getElementById("winnerModal").classList.add("hidden");
    hitBtn.disabled = false;
    startMatch();
  };

  document.getElementById("newGame").onclick = () => location.reload();
});
