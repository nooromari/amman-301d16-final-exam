CREATE TABLE IF NOT EXISTS
quotes(
  id SERIAL PRIMARY KEY NOT NULL,
  quote VARCHAR(256) NOT NULL,
  character VARCHAR(256) NOT NULL,
  image VARCHAR(256) NOT NULL,
  characterDirection VARCHAR(256) NOT NULL
);