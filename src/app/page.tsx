'use client'
import React, { useState } from "react";
import {supabase} from '@/lib/supabaseClient';
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter()
  const [isSignUp,setIsSignUp] = useState(false)
  const [username,setUsername] = useState<string>('')
  const [email,setEmail] = useState<string>('')
  const [password,setPassword] = useState<string>('')
  const [rePassword,setRePassword] = useState<string>('')

  const inputBoxCss = 'p-2 w-[80%] h-10 bg-white rounded-md outline-none'

  const hundleToggleAuthMode = ()=>{
    setIsSignUp(!isSignUp);
    setUsername('')
    setEmail('')
    setPassword('')
    setRePassword('')
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
  
    if (error) {
      alert(error.message)
      return
    }
    router.push('/memo')
    
  }

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });
  
      if (result.error) throw result.error;
  
      alert("登録完了！確認メールを送信しました。");
    } catch (err: any) {
      alert(`登録失敗: ${err.message}`);
    }
  };
  

  return (
    <div className="w-full h-[calc(100vh-56px)] bg-slate-100 flex items-center justify-center">
      
      {/* ログインとサインアップ */}
      <div className="bg-slate-100 w-[clamp(320px,70vw,400px)] aspect-[1/1.3] rounded-2xl overflow-hidden ring-1 shadow-sm">
        <div className={`w-[200%] h-full flex ${isSignUp ? 'translate-x-[-50%]':''} transition-all`}>

          {/* ログイン側 */}
          <div className="w-full h-full">
            <form
              onSubmit={handleLogin}
              className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
              
              {/* メールアドレス　インプット欄 */}
              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="メールアドレス"
                className={inputBoxCss}
              />

              {/* パスワード　インプット欄 */}
              <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className={inputBoxCss}
              />

              {/* ログインボタン */}
              <button
                type="submit"
                className={inputBoxCss}>
                ログイン
              </button>
              
              {/* 新規作成に変更するボタン */}
              <button
                type="button"
                onClick={hundleToggleAuthMode}
                className={inputBoxCss}>
                新規作成
              </button>
            </form>
          </div>
          
          {/* サインアップ側 */}
          <div className="w-full h-full">
            <form 
              onSubmit={handleSignup}
              className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">

              {/* ユーザー名　インプット欄 */}
              <input
                required
                type="text"
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                placeholder="ユーザー名"
                className={inputBoxCss}
              />
              
              {/* メールアドレス　インプット欄 */}
              <input
                required
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="メールアドレス"
                className={inputBoxCss}
              />

              {/* パスワード　インプット欄 */}
              <input
                required
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="パスワード"
                className={inputBoxCss}
              />
              
              {/* パスワード確認　インプット欄 */}
              <input
                required
                type="password"
                value={rePassword}
                onChange={(e)=>setRePassword(e.target.value)}
                placeholder="パスワードの再確認"
                className={inputBoxCss}
              />

              {/* アカウント作成　ボタン */}
              <button
                type="submit"
                className={inputBoxCss}
              >アカウント作成</button>

              {/* ログイン　ボタン */}
              <button
                type="button"
                onClick={hundleToggleAuthMode}
                className={inputBoxCss}
              >ログイン</button>
            </form>
          </div>
        
        </div>
      </div>
    </div>
  );
};