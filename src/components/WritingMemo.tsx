'use client'

type Props={
  title:string,
  setTitle:React.Dispatch<React.SetStateAction<string>>,
  content:string,
  setContent:React.Dispatch<React.SetStateAction<string>>
}

export default function WritingMemo({title,setTitle,content,setContent}:Props){
  return(
    <form className='w-full h-full flex flex-col p-2 gap-2'>
      <input 
        type="text"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
        className='h-14 outline-none font-bold text-2xl border-b-2 border-white/10'
        placeholder='タイトル'
      />
      <textarea 
        name=""
        id=""
        value={content}
        onChange={(e)=>setContent(e.target.value)}
        className='outline-none resize-none flex-1 no-scrollbar'
        placeholder='本文'
      ></textarea>
    </form>
  );
}