export default (path: string, body?: any, method: string = 'POST'): Promise<any> => {
    return fetch(path, {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: body && JSON.stringify(body),
    })
        .then(res => res.json())
        .then(async data => {
            if (data.success) {
                return data;
            }
            throw new Error(data.message);
        });
};
