import type { MusicItem as MusicItemType } from "@/types/event"

interface MusicItemProps {
  item: MusicItemType
}

export function MusicItem({ item }: MusicItemProps) {
  return (
    <div className="text-gray-700">
      {item.type && <span className="font-medium">{item.type}: </span>}
      <span>{item.title}</span>
      {item.composer && <span className="text-gray-500 italic ml-1"> - {item.composer}</span>}
    </div>
  )
}