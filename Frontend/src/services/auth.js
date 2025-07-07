
export async function authUser(type, data) {
    return await fetch(`${import.meta.env.VITE_SERVER_URL}/${type}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function logoutUser(){
    return await fetch(`${import.meta.env.VITE_SERVER_URL}/logout`, {
        method: 'delete',
        credentials: 'include',
    })
}