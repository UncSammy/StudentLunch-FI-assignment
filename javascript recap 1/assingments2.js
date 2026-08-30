const input = prompt('Enter a positive integer:');

const number = Number(input);

let sum = 0;

for (let i = 1; i <= number; i++) {
    sum += i;
}

document.querySelector('#result').textContent =
    `The sum of natural numbers from 1 to ${number} is ${sum}.`;