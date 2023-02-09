import cookie from 'cookie';

const cookieOpts = {
    sameSite: 'none',
    secure: false
};

const cookies = {
    add: (name, value) => {
        document.cookie = cookie.serialize(name, value, cookieOpts);
    },
    remove: (name) => {
        document.cookie = cookie.serialize(name, '', cookieOpts);
    }
};

export default cookies;