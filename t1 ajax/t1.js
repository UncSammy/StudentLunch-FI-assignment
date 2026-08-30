async function getUser() {
    const response = await fetch('https://reqres.in/api/users/1', {
        headers: {
            'x-api-key': 'YOUR_API_KEY'
        }
    });

    const data = await response.json();

    console.log(data);
}

getUser();