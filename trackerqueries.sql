CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(15) UNIQUE NOT NULL,
    color VARCHAR(15)
);

CREATE TABLE visited_countries (
    id SERIAL PRIMARY KEY,
    country_code CHAR(2) NOT NULL,
    user_id INTEGER REFERENCES users(id)
);

INSERT INTO users 
VALUES ('Angela', 'teal'), ('Jack', 'powderblue')

INSERT INTO visited_countries(country_code, user_id)
VALUES ('FR', 1), ('GB', 1), ('CA', 2), ('FR', 2)

SELECT * FROM users
JOIN visited_countries ON users.id = visited_countries.user_id