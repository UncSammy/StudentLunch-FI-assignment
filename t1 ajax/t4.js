async function fetchData(url, options) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
}

async function testFetch() {
    try {
        const user = {
            name: 'John Doe',
            job: 'Developer'
        };

        const url = 'https://reqres.in/api/users';

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'reqres_ed0bc748b47748a89442ca5f3a3c04af'
            },
            body: JSON.stringify(user)
        };

        const userData = await fetchData(url, options);

        console.log(userData);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

testFetch();