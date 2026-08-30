async function getUser() {
    try {
        const response = await fetch('https://reqres.in/api/unknown/23', {
            headers: {
                'x-api-key': 'reqres_ed0bc748b47748a89442ca5f3a3c04af'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        console.log(data);

    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

getUser();