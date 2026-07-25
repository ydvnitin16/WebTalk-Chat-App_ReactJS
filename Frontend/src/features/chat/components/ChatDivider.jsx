import React from 'react'

const ChatDivider = ({value}) => {
  return (
    <div className="flex justify-center my-3">
    <div className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 shadow-sm">
        {value}
    </div>
</div>
  )
}

export default ChatDivider