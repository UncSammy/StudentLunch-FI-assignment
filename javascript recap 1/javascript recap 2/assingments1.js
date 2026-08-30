const movieCount = Number(prompt('How many movies do you want to rate?'));

const movies = [];

for (let i = 0; i < movieCount; i++) {

    const title = prompt(`Enter the title of movie ${i + 1}:`);

    const rating = Number(
        prompt(`Enter the rating for "${title}" (1-5):`)
    );

    const movie = {
        title: title,
        rating: rating
    };

    movies.push(movie);
}

// Sort from highest rating to lowest
movies.sort((a, b) => b.rating - a.rating);

// Highest-rated movie
const highestRatedMovie = movies[0];

// Display results
const result = document.querySelector('#result');

result.innerHTML = `
    <h2>Movies sorted by rating</h2>

    <ul>
        ${movies.map(movie => `
            <li>${movie.title} - Rating: ${movie.rating}/5</li>
        `).join('')}
    </ul>

    <h2>Highest-rated movie</h2>

    <p>
        <strong>${highestRatedMovie.title}</strong>
        - Rating: ${highestRatedMovie.rating}/5
    </p>
`;