CREATE TABLE IF NOT EXISTS Blocks (ip TEXT not null, address TEXT not null, app_name TEXT not null, updated_on timestamp default CURRENT_TIMESTAMP not null);
CREATE TABLE IF NOT EXISTS ApiKeys (app_name TEXT not null, api_key, updated_on timestamp default CURRENT_TIMESTAMP not null);
