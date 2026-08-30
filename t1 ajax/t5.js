const API_URL =
    'https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants';

const restaurantList = document.querySelector('#restaurant-list');
const modal = document.querySelector('#restaurant-modal');
const modalContent = document.querySelector('#modal-content');
const closeModal = document.querySelector('#close-modal');


// Fetch restaurants when the page loads
async function getRestaurants() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const restaurants = await response.json();

        console.log(restaurants);

        displayRestaurants(restaurants);

    } catch (error) {

        console.error('Error fetching restaurants:', error);

        restaurantList.innerHTML = `
            <p class="error">
                Failed to load restaurants.
                Please check your network connection or VPN.
            </p>
        `;
    }
}


// Display restaurants
function displayRestaurants(restaurants) {

    restaurantList.innerHTML = '';

    restaurants.forEach(restaurant => {

        const restaurantElement = document.createElement('article');

        restaurantElement.classList.add('restaurant');

        restaurantElement.innerHTML = `
            <h2>${restaurant.name}</h2>
            <p>${restaurant.address || ''}</p>
        `;

        restaurantElement.addEventListener('click', () => {
            getRestaurantMenu(restaurant);
        });

        restaurantList.appendChild(restaurantElement);
    });
}


// Fetch menu for selected restaurant
async function getRestaurantMenu(restaurant) {

    try {

        modalContent.innerHTML = `
            <h2>${restaurant.name}</h2>
            <p>Loading today's menu...</p>
        `;

        modal.showModal();

        const response = await fetch(
            `${API_URL}/${restaurant.id}/dishes`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const menu = await response.json();

        console.log(menu);

        displayRestaurantDetails(restaurant, menu);

    } catch (error) {

        console.error('Error fetching menu:', error);

        modalContent.innerHTML = `
            <h2>${restaurant.name}</h2>
            <p class="error">
                Failed to load today's menu.
            </p>
        `;
    }
}


// Display restaurant information and menu
function displayRestaurantDetails(restaurant, menu) {

    modalContent.innerHTML = `
        <h2>${restaurant.name}</h2>

        <p>
            <strong>Address:</strong>
            ${restaurant.address || 'Not available'}
        </p>

        <h3>Today's Menu</h3>

        <div id="menu-list"></div>
    `;

    const menuList = document.querySelector('#menu-list');

    if (!menu || menu.length === 0) {

        menuList.innerHTML = `
            <p>No menu available for today.</p>
        `;

        return;
    }

    menu.forEach(item => {

        const menuItem = document.createElement('div');

        menuItem.classList.add('menu-item');

        menuItem.innerHTML = `
            <h4>${item.name}</h4>
            <p>${item.description || ''}</p>
        `;

        menuList.appendChild(menuItem);
    });
}


// Close modal
closeModal.addEventListener('click', () => {
    modal.close();
});


// Start application
getRestaurants();