async function createUser() {
    const response = await fetch('https://reqres.in/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'reqres_ed0bc748b47748a89442ca5f3a3c04af'
        },
        body: JSON.stringify({
            name: 'Khalid',
            job: 'Student'
        })
    });

    const data = await response.json();

    console.log(data);
}

createUser();