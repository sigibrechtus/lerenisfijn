(() => {
  "use strict";

  const QUESTION_COUNT = 10;
  const limitSelect = document.getElementById("limit");
  const newRoundButton = document.getElementById("new-round");
  const answerForm = document.getElementById("answer-form");
  const answerInput = document.getElementById("answer");
  const submitButton = document.getElementById("submit-button");
  const questionTitle = document.getElementById("question-title");
  const progress = document.getElementById("progress");
  const scoreLabel = document.getElementById("score");
  const feedback = document.getElementById("feedback");
  const quiz = document.getElementById("quiz");
  const summary = document.getElementById("summary");
  const summaryTitle = document.getElementById("summary-title");
  const summaryScore = document.getElementById("summary-score");
  const againButton = document.getElementById("again-button");

  let questionNumber = 0;
  let correctAnswers = 0;
  let currentAnswer = 0;
  let currentQuestionText = "";
  let answered = false;
  let questionId = null;
  let questionStartedAt = 0;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function makeQuestion(limit) {
    if (Math.random() < 0.5) {
      const total = randomInt(2, limit);
      const first = randomInt(0, total);
      const second = total - first;
      return {
        text: first + " + " + second + " = ?",
        answer: total
      };
    }

    const first = randomInt(1, limit);
    const second = randomInt(0, first);
    return {
      text: first + " − " + second + " = ?",
      answer: first - second
    };
  }

  function updateScore() {
    scoreLabel.textContent = "Goed: " + correctAnswers;
  }

  function showQuestion() {
    const limit = Number(limitSelect.value);
    const question = makeQuestion(limit);
    currentAnswer = question.answer;
    questionId = window.lerenProgress ? window.lerenProgress.questionId() : null;
    questionStartedAt = Date.now();
    currentQuestionText = question.text;
    answered = false;

    questionTitle.textContent = currentQuestionText;
    progress.textContent = "Vraag " + (questionNumber + 1) + " van " + QUESTION_COUNT;
    updateScore();
    feedback.textContent = "Vul je antwoord in en druk op Controleer.";
    feedback.className = "feedback";
    answerInput.value = "";
    answerInput.disabled = false;
    submitButton.textContent = "Controleer";
    answerInput.focus();
  }

  function startRound() {
    questionNumber = 0;
    correctAnswers = 0;
    summary.hidden = true;
    quiz.hidden = false;
    showQuestion();
  }

  function showSummary() {
    quiz.hidden = true;
    summary.hidden = false;
    summaryTitle.textContent = correctAnswers === QUESTION_COUNT ? "Perfect gedaan!" : "Reeks klaar!";
    summaryScore.textContent = "Je had " + correctAnswers + " van de " + QUESTION_COUNT + " vragen goed.";
    againButton.focus();
  }

  function handleAnswer(event) {
    event.preventDefault();

    if (answered) {
      if (questionNumber + 1 >= QUESTION_COUNT) {
        showSummary();
      } else {
        questionNumber += 1;
        showQuestion();
      }
      return;
    }

    if (!answerInput.value.trim()) {
      answerInput.focus();
      return;
    }

    const userAnswer = Number(answerInput.value);
    answered = true;
    answerInput.disabled = true;

    const correct = userAnswer === currentAnswer;
    if (questionId && window.lerenProgress) window.lerenProgress.recordQuestion({ exercise_key: "app-wiskunde-plus-min", mode: String(limitSelect.value), question_id: questionId, attempt_count: 1, first_try_correct: correct, assisted: false, duration_ms: Math.max(0, Date.now() - questionStartedAt) });
    if (correct) {
      correctAnswers += 1;
      feedback.textContent = "Juist! " + currentQuestionText.replace(" = ?", "") + " = " + currentAnswer + ".";
      feedback.className = "feedback feedback--good";
    } else {
      feedback.textContent = "Nog niet. Het juiste antwoord is " + currentAnswer + ".";
      feedback.className = "feedback feedback--try";
    }

    updateScore();
    submitButton.textContent = questionNumber + 1 >= QUESTION_COUNT ? "Bekijk resultaat" : "Volgende vraag";
  }

  answerForm.addEventListener("submit", handleAnswer);
  newRoundButton.addEventListener("click", startRound);
  againButton.addEventListener("click", startRound);

  startRound();
})();
