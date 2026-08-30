const restaurantRow = (restaurant) => {
    const { name, company } = restaurant;

    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td>${name}</td>
        <td>${company}</td>
    `;

    return tr;
};


const restaurantModal = (restaurant, menu) => {
    const {
        name,
        address,
        postalCode,
        city,
        phone,
        company
    } = restaurant;

    const { courses } = menu;

    let menuHtml = '<ul>';

    courses.forEach(({ name, price, diets }) => {
        menuHtml += `
            <li>
                ${name}, ${price ?? '?€'}. ${diets ?? ''}
            </li>
        `;
    });

    menuHtml += '</ul>';

    return `
        <h1>${name}</h1>
        <p>${address}</p>
        <p>${postalCode}, ${city}</p>
        <p>${phone}</p>
        <p>${company}</p>
        ${menuHtml}
    `;
};


export { restaurantRow, restaurantModal };