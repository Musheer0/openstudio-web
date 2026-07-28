"use client"
import Header from "@/components/records/header";
import Links from "@/components/records/links";

import dynamic from "next/dynamic";
const VideoCardList = dynamic(
  () => import("@/components/videos/video-card-list"),
  {
    loading: () => <div>Loading videos...</div>,
    ssr: false, // only if it depends on browser APIs like IndexedDB, window, etc.
  }
);
import React from 'react'

const page = () => {
 return(
  <>
  <Header/>
  <VideoCardList/>
  </>
 )
}

export default page