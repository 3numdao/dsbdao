CREATE TABLE IF NOT EXISTS Blocks (updated_on timestamp default CURRENT_TIMESTAMP not null, ip TEXT not null, address TEXT not null, app_name TEXT not null, msg TEXT);
CREATE TABLE IF NOT EXISTS ApiKeys (updated_on timestamp default CURRENT_TIMESTAMP not null, app_name TEXT not null, api_key);
