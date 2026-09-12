ALTER TABLE publications
ADD COLUMN publication_source VARCHAR(20) NOT NULL DEFAULT 'shef';

ALTER TABLE publications
ADD COLUMN publisher_name VARCHAR(255);

ALTER TABLE publications
ADD COLUMN external_link_text VARCHAR(255);