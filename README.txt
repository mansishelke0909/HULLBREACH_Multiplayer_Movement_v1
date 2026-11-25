HULLBREACH - Multiplayer Movement Milestone

This update adds the first real-time gameplay synchronization milestone:
- Create/join a room as before.
- A new START ONLINE MOVEMENT TEST button appears in the lobby.
- Each player starts the same station scene.
- Each player's position is sent to the server about 20 times per second.
- The server relays positions to the other players in that room.
- Other players are drawn using the existing HULLBREACH character graphics.

SETUP
1. Extract this ZIP.
2. Open the extracted HULLBREACH_Online folder in VS Code.
3. Open Terminal > New Terminal.
4. Run: npm install
5. Run: npm start
6. Open http://localhost:3000

TEST WITH TWO PLAYERS
1. Browser A: enter a name, click CREATE ROOM.
2. Browser B: enter a different name, click JOIN ROOM and enter the code.
3. Both lobby screens should list both players.
4. Both players click START ONLINE MOVEMENT TEST, then BEGIN SHIFT.
5. Move with WASD/arrow keys or touch joystick. The other browser should see your character move.

IMPORTANT
- This milestone synchronizes player positions only.
- Tasks, kills, bodies, meetings, voting, roles and win conditions are not yet synchronized.
- For testing on two computers, both need to reach the same server. Localhost only works on the computer running the server.
- The server uses in-memory rooms; restarting it clears all rooms.
