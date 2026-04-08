const socketHandler = require("../socket/socketHandler");

const {
  cleanupCallState,
  isSocketBusy,
  normalizeRoomId,
  resetPeerRelationship,
  validateCallParticipants,
} = socketHandler.__testing;

const createSocket = (id, roomId) => ({
  id,
  data: {
    roomId,
    activeCallPeerId: null,
    pendingIncomingCallerId: null,
    pendingOutgoingTargetId: null,
  },
  emitted: [],
  emit(eventName, payload) {
    this.emitted.push({ eventName, payload });
  },
});

const createIo = (...sockets) => ({
  sockets: {
    sockets: new Map(sockets.map((socket) => [socket.id, socket])),
  },
});

describe("socketHandler call helpers", () => {
  test("normalizeRoomId trims and lowercases room ids", () => {
    expect(normalizeRoomId("  DemoRoom  ")).toBe("demoroom");
    expect(normalizeRoomId("")).toBe("");
    expect(normalizeRoomId(null)).toBe("");
  });

  test("isSocketBusy ignores the current peer but detects other call state", () => {
    const socket = createSocket("caller", "room-1");
    socket.data.pendingOutgoingTargetId = "callee";

    expect(isSocketBusy(socket, "callee")).toBe(false);

    socket.data.activeCallPeerId = "someone-else";
    expect(isSocketBusy(socket, "callee")).toBe(true);
  });

  test("validateCallParticipants only returns peers from the same room", () => {
    const caller = createSocket("caller", "room-a");
    const callee = createSocket("callee", "room-a");
    const outsider = createSocket("outsider", "room-b");
    const io = createIo(caller, callee, outsider);

    expect(
      validateCallParticipants(io, caller, "ROOM-A", "callee")
    ).toMatchObject({
      normalizedRoomId: "room-a",
      targetSocket: callee,
    });

    expect(
      validateCallParticipants(io, caller, "room-a", "outsider")
    ).toMatchObject({
      normalizedRoomId: "room-a",
      targetSocket: null,
    });
  });

  test("resetPeerRelationship clears any relation to the specified peer", () => {
    const socket = createSocket("caller", "room-1");
    socket.data.activeCallPeerId = "peer";
    socket.data.pendingIncomingCallerId = "peer";
    socket.data.pendingOutgoingTargetId = "peer";

    resetPeerRelationship(socket, "peer");

    expect(socket.data.activeCallPeerId).toBeNull();
    expect(socket.data.pendingIncomingCallerId).toBeNull();
    expect(socket.data.pendingOutgoingTargetId).toBeNull();
  });

  test("cleanupCallState notifies the peer and clears both sides", () => {
    const caller = createSocket("caller", "room-1");
    const callee = createSocket("callee", "room-1");
    const io = createIo(caller, callee);

    caller.data.activeCallPeerId = callee.id;
    callee.data.activeCallPeerId = caller.id;

    cleanupCallState(io, caller, "quit-room");

    expect(caller.data.activeCallPeerId).toBeNull();
    expect(callee.data.activeCallPeerId).toBeNull();
    expect(callee.emitted).toContainEqual({
      eventName: "call-end",
      payload: {
        roomId: "room-1",
        fromSocketId: "caller",
        reason: "quit-room",
      },
    });
  });
});
