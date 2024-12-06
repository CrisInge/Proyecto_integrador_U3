
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'ECHEcris1221';
const DB_NAME = process.env.DB_NAME || 'panchitos_db';
const DB_PORT = process.env.DB_PORT || 3306;
const PORT = process.env.PORT || 3000;
const EMAIL_USER = process.env.EMAIL_USER || 'cristianeche222@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'akvewrynhtpopvfa';
const EMAIL_RESTAURANT = process.env.EMAIL_RESTAURANT || 'cristianeche222@gmail.com';

/*mysql://root:aigfIYKeFRcpUJomkBTdAnatWMBlDVNs@autorack.proxy.rlwy.net:21100/railway*/

module.exports = {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
    PORT,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_RESTAURANT
};
