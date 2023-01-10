use std::{collections::BTreeMap, str::FromStr};

use futures::TryStreamExt;
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions, SqliteSynchronous},
    Row, Sqlite, SqlitePool, Transaction,
};

/// このモジュール内の関数の戻り値型
type DbResult<T> = Result<T, Box<dyn std::error::Error>>;

/// SQLiteのコネクションプールを作成して返す
pub(crate) async fn create_sqlite_pool(database_url: &str) -> DbResult<SqlitePool> {
    // コネクションの設定
    let connection_options = SqliteConnectOptions::from_str(database_url)?
        // DBが存在しないなら作成する
        .create_if_missing(true)
        // トランザクション使用時の性能向上のため、WALを使用する
        .journal_mode(SqliteJournalMode::Wal)
        .synchronous(SqliteSynchronous::Normal);

    // 上の設定を使ってコネクションプールを作成する
    let sqlite_pool = SqlitePoolOptions::new()
        .connect_with(connection_options)
        .await?;

    Ok(sqlite_pool)
}

/// マイグレーションを行う
pub(crate) async fn migrate_database(pool: &SqlitePool) -> DbResult<()> {
    sqlx::migrate!("./db").run(pool).await?;
    Ok(())
}

/// posで指定した位置にカードを挿入する
pub(crate) async fn insert_card(pool: &SqlitePool, card: Card, pos: CardPos) -> DbResult<()> {
    // トランザクションを開始する
    let mut tx = pool.begin().await?;

    // cardsテーブルにカードを挿入する
    sqlx::query("INSERT INTO cards (id, title, description) VALUES (?, ?, ?)")
        .bind(card.id)
        .bind(card.title)
        .bind(card.description)
        .execute(&mut tx)
        .await?;

    // columns_cardsテーブルに、カードの位置を表す情報を挿入する
    insert_card_position(&mut tx, pos.column_id, card.id, pos.position).await?;

    // トランザクションをコミットする
    tx.commit().await?;

    Ok(())
}