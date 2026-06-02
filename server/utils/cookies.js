const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE_MS
});

const getClearCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
});

module.exports = { getAuthCookieOptions, getClearCookieOptions, COOKIE_MAX_AGE_MS };
