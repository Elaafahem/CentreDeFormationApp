export const authHeader = () => {
    const token = localStorage.getItem('eduflow_token');
    if (token) {
        return { 'Authorization': 'Bearer ' + token };
    } else {
        return {};
    }
};

export const apiFetch = async (url: string, options: any = {}) => {
    const headers = {
        ...options.headers,
        ...authHeader()
    };

    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    return fetch(url, {
        ...options,
        headers
    });
};
