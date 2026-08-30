const input = prompt('Enter your assessment score:');

const score = Number(input);

let grade;

if (score >= 0 && score <= 39) {
    grade = 0;
} else if (score >= 40 && score <= 51) {
    grade = 1;
} else if (score >= 52 && score <= 63) {
    grade = 2;
} else if (score >= 64 && score <= 75) {
    grade = 3;
} else if (score >= 76 && score <= 87) {
    grade = 4;
} else if (score >= 88 && score <= 100) {
    grade = 5;
} else {
    grade = 'Invalid score';
}

document.querySelector('#result').textContent =
    `Your score is ${score} and your grade is ${grade}.`;