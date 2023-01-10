-- columnテーブルを作成する
CREATE TABLE IF NOT EXISTS columns (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL
);

-- cardsテーブルを作成する
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT
);

-- columns_cardsテーブルを作成する

-- サンプルデータを挿入する

