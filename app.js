const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
app.use(express.json());

const conectserveranddb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`SErver Is Running`);
    });
  } catch (e) {
    console.log(`DB ERROR ${e.message}`);
  }
};

conectserveranddb();

const getobject = (each) => {
  return {
    playerId: each.player_id,
    playerName: each.player_name,
  };
};

const getplayer = (each) => {
  return {
    matchId: each.match_id,
    match: each.match,
    year: each.year,
  };
};

app.get("/players/", async (request, response) => {
  const quary1 = `SELECT * FROM player_details ORDER BY player_id`;
  const result1 = await db.all(quary1);
  const resultobject1 = result1.map((each) => {
    return getobject(each);
  });
  response.send(resultobject1);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * 
  FROM  player_details
  WHERE player_id = ${playerId};`;
  const result2 = await db.get(getPlayerQuery);
  const resultobject2 = getobject(result2);
  response.send(resultobject2);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateplayerQuery = `
  UPDATE
    player_details
  SET
    player_name = '${playerName}'
  WHERE
    player_id = ${playerId}
  `;

  await db.run(updateplayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const quary4 = `SELECT * FROM match_details WHERE match_id = ${matchId}`;
  const result = await db.get(quary4);
  const resultobject4 = getplayer(result);
  response.send(resultobject4);
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const quary5 = `SELECT * 
    FROM player_match_score
    NATURAL JOIN 
    match_details
    WHERE player_id = ${playerId}
  `;
  const result5 = await db.all(quary5);
  const resultobject5 = result5.map((each) => {
    return getplayer(each);
  });
  response.send(resultobject5);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const quary6 = `SELECT *
    FROM player_match_score NATURAL JOIN 
    player_details 
    WHERE match_id = ${matchId}
  `;
  const result6 = await db.all(quary6);
  const resultobject6 = result6.map((each) => {
    return getobject(each);
  });
  response.send(resultobject6);
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const quary7 = `SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const result7 = await db.get(quary7);
  response.send(result7);
});

module.exports = app;
