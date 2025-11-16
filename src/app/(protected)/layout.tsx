'use client'

import { useAuth } from "../providers/authProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout(
  {children}:{children:React.ReactNode}
){
  const router = useRouter();
  const { user,loading } = useAuth();


  useEffect(()=>{
    if(!loading && user === null) router.push('/')
  },[loading,user])

  if(loading){
    return(
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin border-4 border-gray-300 border-t-blue-500 rounded-full w-10 h-10"></div>
      </div>
    );
  }

  if(user){
    return(
      <div className="bg-neutral-900">
      {children}
      </div>
    );
  }

  
}