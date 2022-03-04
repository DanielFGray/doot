import { BoardInfo } from "~/types";

export function BoardCard({ board_id, created_at, description }: BoardInfo) {
  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold">{board_id}</h1>
      <div>
        {description}
      </div>
    </div>
  )
}
