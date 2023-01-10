// react-kanbanをインポートする
// 型定義ファイル（.d.ts）がないため、`@ts-ignore`を指定することで
// TypeScriptのエラーを抑止している。

//@ts-ignore
import Board from '@asseinfo/react-kanban';
import '@asseinfo/react-kanban/dist/styles.css';
import { useState, useEffect } from 'react';
// Tauriが提供するinvoke関数をインポートする
import { invoke } from '@tauri-apps/api'

type TBoard = {
  columns: [TColumn];
}

type TColumn = {
  id: number;
  title: string;
  cards: [TCard];
}

type TCard = {
  id: number;
  title: string;
  description: string | undefined;
}

type TMovedFrom = {
  fromColumnId: number;
  fromPosition: number;
}

type TMovedTo = {
  toColumnId: number;
  toPosition: number;
}

class CardPos {
  columnId: number;
  position: number;

  constructor(columnId: number, position: number) {
    this.columnId = columnId;
    this.position = position;
  }
}

// カードの追加直後に呼ばれるハンドラ
async function handleAddCard(board: TBoard, column: TColumn, card: TCard) {
  const pos = new CardPos(column.id, 0);
  // IPCでCoreプロセスのhandle_add_cardを呼ぶ（引数はJSON形式）
  await invoke<void>("handle_add_card", { "card": card, "pos": pos })
};

// かんばんボードに最初に表示するデータを作成する
const board = {
  columns: [
    {
      id: 0,
      title: 'バックログ',
      cards: [
        {
          id:0, 
          title: 'かんばんボードを追加する',
          description: 'react-kanbanを使用する。'
        },
      ]
    },
    {
      id: 1,
      title: '開発中',
      cards: []
    }
  ]
}

// かんばんボードコンポーネントを表示する
function App() {
  return(
    <>
      <Board
        // ボードの初期データ
        initialBoard = {board}
        // カードの追加を許可(トップに「＋」ボタンを表示)
        allowAddCard = {{ on: "top" }}
        // カードの削除を許可
        allowRemoveCard
        // カラム（カードのグループ）のドラッグをオフにする
        disableColumnDrag
        // 新しいカードの作成時、idに現在時刻の数値表現をセットする
        onNewCardConfirm = {(draftCard: any) => ({
          // rest parameter
          ...draftCard 
        })}
        // 新しいカードが作成されたら、カード等の内容をコンソールに表示する
        onCardNew = {console.log}
        // カードがドラッグされたら　、カード等の内容をコンソールに表示する
        onCardDragEnd = {console.log}
        // カードが削除されたら、カード等の内容をコンソールに表示する
        onCardRemove={console.log}
      />
    </>
  )
}

export default App;