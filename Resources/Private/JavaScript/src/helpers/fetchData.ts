type FETCH_METHOD = 'POST' | 'GET';

export default (path: string, body?: object, method: FETCH_METHOD = 'POST'): Promise<any> => {
    if (method === 'GET' && body) {
        Object.keys(body).forEach(key => (path = path.replace(escape('${' + key + '}'), body[key])));
    }

    const options: RequestInit = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body && method === 'POST' ? JSON.stringify(body) : null
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
