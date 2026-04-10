const ROOM_ID_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const DISALLOWED_ROOM_ID_CHARS = /[01ilo]/g;

export const generateRoomId = (length = 6) => {
  let roomId = "";

  for (let index = 0; index < length; index += 1) {
    roomId += ROOM_ID_ALPHABET[Math.floor(Math.random() * ROOM_ID_ALPHABET.length)];
  }

  return roomId;
};

export const normalizeRoomId = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(DISALLOWED_ROOM_ID_CHARS, "")
    .replace(/[^a-z2-9-]/g, "");
