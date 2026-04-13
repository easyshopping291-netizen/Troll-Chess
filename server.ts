import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Chess } from "chess.js";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", slots: slots.filter(s => s.occupied).length });
  });

  // In-memory state
  const slots = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `TROLL-${String(i + 1).padStart(2, '0')}`,
    socketId: null as string | null,
  }));

  const games = new Map<string, {
    fen: string;
    white: string | null;
    black: string | null;
    whiteSlot: number;
    blackSlot: number;
    history: any[];
  }>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send current slots status
    socket.emit("slots_update", slots.map(s => ({ id: s.id, name: s.name, occupied: !!s.socketId })));

    socket.on("select_slot", (slotId: number) => {
      const slot = slots.find(s => s.id === slotId);
      if (slot && !slot.socketId) {
        // Clear any previous slot for this socket
        const prevSlot = slots.find(s => s.socketId === socket.id);
        if (prevSlot) prevSlot.socketId = null;

        slot.socketId = socket.id;
        socket.emit("slot_confirmed", { id: slot.id, name: slot.name });
        io.emit("slots_update", slots.map(s => ({ id: s.id, name: s.name, occupied: !!s.socketId })));
      } else {
        socket.emit("error", "Slot already taken or invalid.");
      }
    });

    socket.on("challenge_player", (targetSlotId: number) => {
      const challengerSlot = slots.find(s => s.socketId === socket.id);
      const targetSlot = slots.find(s => s.id === targetSlotId);

      if (challengerSlot && targetSlot && targetSlot.socketId) {
        io.to(targetSlot.socketId).emit("challenge_received", {
          fromSlotId: challengerSlot.id,
          fromName: challengerSlot.name
        });
      }
    });

    socket.on("accept_challenge", (challengerSlotId: number) => {
      const acceptorSlot = slots.find(s => s.socketId === socket.id);
      const challengerSlot = slots.find(s => s.id === challengerSlotId);

      if (acceptorSlot && challengerSlot && challengerSlot.socketId) {
        const gameId = `game_${Math.random().toString(36).substring(7)}`;
        const isChallengerWhite = Math.random() > 0.5;

        const gameData = {
          fen: new Chess().fen(),
          white: isChallengerWhite ? challengerSlot.socketId : acceptorSlot.socketId,
          black: isChallengerWhite ? acceptorSlot.socketId : challengerSlot.socketId,
          whiteSlot: isChallengerWhite ? challengerSlot.id : acceptorSlot.id,
          blackSlot: isChallengerWhite ? acceptorSlot.id : challengerSlot.id,
          history: [],
        };

        games.set(gameId, gameData);

        io.to(challengerSlot.socketId).emit("match_found", {
          gameId,
          color: isChallengerWhite ? "w" : "b",
          opponentName: acceptorSlot.name
        });
        io.to(acceptorSlot.socketId).emit("match_found", {
          gameId,
          color: isChallengerWhite ? "b" : "w",
          opponentName: challengerSlot.name
        });
      }
    });

    socket.on("move", ({ gameId, move }) => {
      const game = games.get(gameId);
      if (!game) return;

      const chess = new Chess(game.fen);
      try {
        const result = chess.move(move);
        if (result) {
          game.fen = chess.fen();
          game.history.push(result);
          
          io.to(game.white!).to(game.black!).emit("move_made", {
            fen: game.fen,
            move: result,
            isCheck: chess.isCheck(),
            isCheckmate: chess.isCheckmate(),
            isDraw: chess.isDraw(),
          });

          if (chess.isGameOver()) {
            games.delete(gameId);
          }
        }
      } catch (e) {
        console.error("Invalid move attempted:", move);
      }
    });

    socket.on("disconnect", () => {
      const slot = slots.find(s => s.socketId === socket.id);
      if (slot) {
        slot.socketId = null;
        io.emit("slots_update", slots.map(s => ({ id: s.id, name: s.name, occupied: !!s.socketId })));
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
