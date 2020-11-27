DROP TABLE IF EXISTS resource_reviews CASCADE;
CREATE TABLE resource_reviews (
    id SERIAL PRIMARY KEY NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    liking BOOLEAN DEFAULT FALSE,
    resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
    comment TEXT,
    rating SMALLINT,
    pin BOOLEAN DEFAULT FALSE
);
