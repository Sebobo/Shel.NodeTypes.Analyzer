export default (path: string, body?: object, method = 'POST'): Promise<any> => {
    const options: RequestInit = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : null
    };

    return fetch(path, options)
        .then(res => res.json())
        .then(async data => {
            if (data.success) {
                return data;
            }
            throw new Error(data.message);
        });
};
