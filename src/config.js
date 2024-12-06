const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'ECHEcris1221';
const DB_NAME = process.env.DB_NAME || 'panchitos_db';
const DB_PORT = process.env.DB_PORT || 3306;
/*mysql://root:aigfIYKeFRcpUJomkBTdAnatWMBlDVNs@autorack.proxy.rlwy.net:21100/railway                        mysql://root:aigfIYKeFRcpUJomkBTdAnatWMBlDVNs@autorack.proxy.rlwy.net:21100/railway*/
module.exports = {
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT
};