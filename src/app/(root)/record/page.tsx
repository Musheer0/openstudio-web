"use client"
import dynamic from "next/dynamic";

const ScreenRecorderDialog = dynamic(
  () => import("@/components/screen-recorder/screen-record-dialog"),
  {
    ssr: false,
  }
);
import React from 'react'

const page = () => {
  return (
    <ScreenRecorderDialog>
        Sart
    </ScreenRecorderDialog>
  )
}

export default page