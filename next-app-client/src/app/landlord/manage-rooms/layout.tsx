import React from 'react'

type Props = {
    children?: React.ReactNode;
}

export default function LayoutManageRoom({ children }: Props) {
  return (
    <div>{children}</div>
  )
}