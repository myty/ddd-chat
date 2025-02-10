import type { Room } from "../../entities/index.ts";
import type {
  CreateRoomCommand,
  CreateRoomDataAccess,
  CreateRoomResponse,
} from "../../../domain/rooms/create-room/index.ts";
import * as keys from "../keys.ts";

export class CreateRoomDataAccessKv implements CreateRoomDataAccess {
  constructor(private kv: Deno.Kv) {}

  async createRoom(command: CreateRoomCommand): Promise<CreateRoomResponse> {
    const room: Room = {
      id: command.roomId,
      name: command.name,
      ownerHandle: command.ownerHandle,
    };

    const roomKey = keys.roomKey(room.id);
    const roomActiveUsersKey = keys.roomActiveUsersKey(room.id);
    const userRoomKey = keys.userRoomKey(room.ownerHandle, room.id);

    const res = await this.kv.atomic()
      .check({ key: roomKey, versionstamp: null })
      .check({ key: userRoomKey, versionstamp: null })
      .set(roomKey, room)
      .set(userRoomKey, room)
      .mutate({
        type: "sum",
        key: roomActiveUsersKey,
        value: new Deno.KvU64(1n),
      })
      .commit();

    if (!res.ok) {
      throw new TypeError("Room already exists");
    }

    return {
      ...room,
      activeUserCount: 1,
    };
  }
}
