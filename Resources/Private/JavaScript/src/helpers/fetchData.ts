type FETCH_METHOD = 'POST' | 'GET';

function fetchData<T = any>(path: string, body?: Record<string, string>, method: FETCH_METHOD = 'POST'): Promise<T> {
    if (method === 'GET' && body) {
        // TODO: Use Url object here
        Object.keys(body).forEach((key) => (path = path.replace(escape('${' + key + '}'), body[key])));
    }

    const options: RequestInit = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body && method === 'POST' ? JSON.stringify(body) : null,
    };

    return fetch(path, options)
        .then((res) => res.json())
        .then(async (data) => {
            if (data.success) {
                return data;
            }
            throw new Error(data.message);
        });
}

export default fetchData;
