const input = prompt('Enter a positive integer:');

const number = Number(input);

const target = document.querySelector('#target');

let table = '<table>';

for (let row = 1; row <= number; row++) {

    table += '<tr>';

    for (let column = 1; column <= number; column++) {

        const product = row * column;

        table += `<td>${product}</td>`;
    }

    table += '</tr>';
}

table += '</table>';

target.innerHTML = table;