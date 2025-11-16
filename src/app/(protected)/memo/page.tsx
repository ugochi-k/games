"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import WritingMemo from "@/components/WritingMemo"

type MemoRow = {
  id: number
  title: string | null
  content: string | null
  created_at: string
}

const Memo = () => {
  const defaultBtnCss =
    "bg-white/10 rounded-full transition-all h-fit p-3 cursor-pointer flex items-center gap-1 text-sm font-bold"

  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)

  const [memos, setMemos] = useState<MemoRow[]>([])
  const [selectedMemoIds, setSelectedMemoIds] = useState<number[]>([])
  const [editingMemo, setEditingMemo] = useState<MemoRow | null>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // ------------------------------------------------------------
  // memos の取得
  // ------------------------------------------------------------
  const fetchMemos = async () => {
    setErrorMessage("")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setErrorMessage("ログインが切れています。")
      return
    }

    const { data, error } = await supabase
      .from("memos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      setErrorMessage("めもの取得に失敗しました: " + error.message)
      return
    }

    setMemos((data ?? []) as MemoRow[])
  }

  useEffect(() => {
    fetchMemos()
  }, [])

  const hasMemo = memos.length > 0

  // ------------------------------------------------------------
  // 新規作成 / 更新 保存
  // ------------------------------------------------------------
  const handleSave = async () => {
    setIsSaving(true)
    setErrorMessage("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setErrorMessage("ログインが切れています。")
      setIsSaving(false)
      return
    }

    if (isEditing && editingMemo) {
      // 更新
      const { error } = await supabase
        .from("memos")
        .update({
          title,
          content,
        })
        .eq("id", editingMemo.id)
        .eq("user_id", user.id)

      if (error) {
        setErrorMessage("更新に失敗しました: " + error.message)
        setIsSaving(false)
        return
      }
    } else {
      // 新規挿入
      const { error } = await supabase.from("memos").insert({
        user_id: user.id,
        title,
        content,
      })

      if (error) {
        setErrorMessage("保存に失敗しました: " + error.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)

    // 共通の後処理
    setTitle("")
    setContent("")
    setEditingMemo(null)
    setIsEditing(false)
    setIsCreating(false)

    fetchMemos()
  }

  // ------------------------------------------------------------
  // 削除モード：選択トグル
  // ------------------------------------------------------------
  const toggleSelectMemo = (id: number) => {
    setSelectedMemoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  // ------------------------------------------------------------
  // 削除確定
  // ------------------------------------------------------------
  const handleDeleteSelected = async () => {
    if (selectedMemoIds.length === 0) {
      setIsDeleteMode(false)
      return
    }

    setIsSaving(true)
    setErrorMessage("")

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setErrorMessage("ログインが切れています。")
      setIsSaving(false)
      return
    }

    const { error } = await supabase
      .from("memos")
      .delete()
      .in("id", selectedMemoIds)
      .eq("user_id", user.id)

    if (error) {
      setErrorMessage("削除に失敗しました: " + error.message)
      setIsSaving(false)
      return
    }

    setIsSaving(false)
    setSelectedMemoIds([])
    setIsDeleteMode(false)

    fetchMemos()
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <main className="h-screen w-full flex flex-col">
      {/* メニュー欄 */}
      <div className="w-full h-14 flex justify-between p-1 items-center gap-1 transition-all">
        <div>
          {(isCreating || isDeleteMode) && (
            <button
              className={`${defaultBtnCss} hover:text-white/50`}
              onClick={() => {
                setIsCreating(false)
                setIsEditing(false)
                setEditingMemo(null)
                setIsDeleteMode(false)
                setSelectedMemoIds([])
                setTitle("")
                setContent("")
              }}
            >
              もどる
            </button>
          )}
        </div>

        <div className="flex gap-1">
          {/* 作成 or 更新 ボタン */}
          {isCreating && !isDeleteMode && (
            <button
              className={`${defaultBtnCss} hover:text-green-500`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? isEditing
                  ? "更新中…"
                  : "保存中…"
                : isEditing
                  ? "更新"
                  : "ほぞん"}
            </button>
          )}

          {/* つくるボタン：作成中・編集中・削除モード以外で表示 */}
          {!isCreating && !isEditing && !isDeleteMode && (
            <button
              className={`${defaultBtnCss} hover:text-green-500`}
              onClick={() => {
                setIsCreating(true)
                setIsEditing(false)
                setEditingMemo(null)
                setTitle("")
                setContent("")
              }}
            >
              つくる
            </button>
          )}

          {/* すてる / 確定 ボタン */}
          <button
            className={`${defaultBtnCss} ${
              isDeleteMode ? "hover:text-green-500" : "hover:text-red-500"
            }`}
            disabled={isSaving}
            onClick={() => {
              if (isDeleteMode) {
                handleDeleteSelected()
              } else {
                setIsDeleteMode(true)
                setIsCreating(false)
                setIsEditing(false)
                setEditingMemo(null)
                setSelectedMemoIds([])
              }
            }}
          >
            {isDeleteMode ? "確定" : "すてる"}
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {errorMessage && (
        <p className="px-4 text-xs text-red-400">{errorMessage}</p>
      )}

      {/* メインエリア */}
      <div className="flex-1">
        {isCreating ? (
          <WritingMemo
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
          />
        ) : hasMemo ? (
          <div className="h-full w-full flex flex-col gap-2 p-4 overflow-auto">
            {memos.map((memo) => {
              const isSelected = selectedMemoIds.includes(memo.id)

              const handleClickMemo = () => {
                if (isDeleteMode) {
                  toggleSelectMemo(memo.id)
                } else {
                  setEditingMemo(memo)
                  setTitle(memo.title ?? "")
                  setContent(memo.content ?? "")
                  setIsCreating(true)
                  setIsEditing(true)
                }
              }

              return (
                <div
                  key={memo.id}
                  onClick={handleClickMemo}
                  className={`
                    w-full rounded-lg p-3 border cursor-pointer transition-all
                    ${isDeleteMode ? "border-red-500/50" : "border-white/10"}
                    ${isSelected ? "bg-red-500/30" : "bg-white/5"}
                    ${isDeleteMode ? "" : "hover:bg-white/10"}
                  `}
                >
                  <h3 className="font-bold mb-1">
                    {memo.title || "（無題）"}
                  </h3>
                  <p className="text-sm text-white/80 whitespace-pre-wrap line-clamp-3">
                    {memo.content}
                  </p>
                  <p className="mt-1 text-[10px] text-white/40">
                    {new Date(memo.created_at).toLocaleString()}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-full w-full flex justify-center items-center">
            めもがありません
          </div>
        )}
      </div>
    </main>
  )
}

export default Memo