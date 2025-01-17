import type { Room } from "../../entities/index.ts";
import type {
  GetRoomDataAccess,
  GetRoomQuery,
} from "@myty/fresh-workspace-domain/rooms/get";

export class GetRoomDataAccessKv implements GetRoomDataAccess {
  constructor(private kv: Deno.Kv) {}

  async getRoom(query: GetRoomQuery): Promise<Room> {
    const room = await this.kv.get<Room>(["rooms", query.roomId]);

    if (room.value == null) {
      throw new TypeError(`Room not found: ${query.roomId}`);
    }

    return room.value;
  }
}
