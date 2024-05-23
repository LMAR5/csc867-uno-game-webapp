import db, { pgp } from "../connection.js";
import { randomBytes } from "crypto";

const Sql = {
  CREATE: "INSERT INTO games (game_socket_id, creator_id, description, status, current_turn, number_players) VALUES ($1, $2, $3, 'Waiting',1, $4) RETURNING id",
  UPDATE_DESCRIPTION: "UPDATE games SET description=$1 WHERE id=$2 RETURNING description",
  UPDATE_GAME_IS_INIT: "UPDATE games SET is_initialized = true, status = 'In Progress' WHERE id=$1",
  ADD_PLAYER: "INSERT INTO game_users (game_id, user_id, turn_order) VALUES ($1, $2, $3)",
  IS_PLAYER_IN_GAME:
    "SELECT * FROM game_users WHERE game_users.game_id=$1 AND game_users.user_id=$2",
  GET_GAME: "SELECT g.*, count(gu.user_id) FROM games g JOIN game_users gu ON gu.game_id = g.id WHERE g.id=$1 GROUP BY g.id",
  GET_USERS:
    "SELECT users.id, users.email, users.first_name, users.last_name, users.gravatar, game_users.turn_order FROM users, game_users, games WHERE games.id=$1 AND game_users.game_id=games.id AND game_users.user_id=users.id ORDER BY game_users.turn_order",
  GET_AVAILABLE: `
    SELECT games.*, users.email, users.gravatar, temp.count FROM games
    INNER JOIN (
        SELECT game_users.game_id, COUNT(game_users.user_id)
        FROM game_users 
        JOIN games ON games.id = game_users.game_id
        GROUP BY game_id, games.number_players
        HAVING COUNT(*) < games.number_players
    ) AS temp ON games.id=temp.game_id
    LEFT JOIN users ON users.id=games.creator_id
    WHERE games.id > $[game_id_start]
    AND users.id != $[user_id]
    ORDER BY games.id
    LIMIT $[limit]
    OFFSET $[offset]
  `,
  GET_GAMES_REJOIN: `SELECT g.*, u.id AS user_id, u.email, u.first_name, u.last_name, u.gravatar, u2.id AS creator_id, u2.email AS creator_email, u2.gravatar AS creator_gravatar FROM games g JOIN game_users gu ON gu.game_id = g.id JOIN users u ON u.id = gu.user_id JOIN users u2 ON u2.id = g.creator_id WHERE u.id=$1`,
  SHUFFLED_DECK: "SELECT *, random() AS rand FROM standard_deck_cards ORDER BY rand",
  ASSIGN_CARDS: "UPDATE game_cards SET user_id=$1 WHERE game_id=$2 AND user_id=-1",
  GET_CARDS: `
    SELECT * FROM game_cards, standard_deck_cards
    WHERE game_cards.game_id=$1 AND game_cards.card_id=standard_deck_cards.id
    ORDER BY game_cards.card_order`,
  GET_CARDS_FROM_USER: `SELECT * FROM game_cards gc, standard_deck_cards sdc WHERE gc.game_id=$1 AND gc.card_id=sdc.id AND gc.user_id=$2 ORDER BY gc.card_order`,
  GET_CURRENT_USERS_TURN: `SELECT u.id, u.email, u.first_name, u.last_name, gu.game_id, gu.turn_order FROM users u JOIN game_users gu ON gu.user_id = u.id JOIN games g ON g.id = gu.game_id AND g.current_turn = gu.turn_order WHERE g.id = $1`,
  GET_USER_COUNT: `SELECT COUNT(*) FROM game_users WHERE game_id=$1`,
  SET_CURRENT_TURN: `UPDATE games SET current_turn=$1 WHERE id=$2`,
  VALIDATE_NEW_TURN_ORDER: `SELECT * FROM game_users WHERE game_id=$1 AND turn_order=$2`,
  IS_CURRENT_PLAYER: `SELECT current_turn FROM games WHERE id=$1`,
  GET_USER_TURN_IN_GAME: `SELECT gu.turn_order FROM users u JOIN game_users gu ON gu.user_id = u.id WHERE gu.game_id=$1 AND u.id=$2`,
  IS_CARD_PLAY_VALID: `SELECT COUNT(*) FROM (SELECT p_cards.* FROM standard_deck_cards p_cards WHERE p_cards.id = $1) pc JOIN (SELECT d_cards.* FROM standard_deck_cards d_cards WHERE d_cards.id = $2) dc ON pc.suit = dc.suit or pc.value = dc.value or pc.type=2`,
  IS_CARD_SKIP_TYPE: `SELECT COUNT(sdc.id) FROM standard_deck_cards sdc WHERE sdc.value=12 AND sdc.id=$1`,
  GET_TOP_DISCARD_CARD: `SELECT * FROM game_cards gc JOIN standard_deck_cards sdc ON sdc.id = gc.card_id WHERE gc.game_id=$1 AND gc.status='discard' ORDER BY gc.card_order DESC LIMIT 1`,
  DRAW_ONE_CARD: `SELECT * FROM game_cards gc, standard_deck_cards sdc WHERE gc.game_id=$1 AND gc.user_id IS NULL AND gc.status = 'deck' AND gc.card_id=sdc.id ORDER BY gc.card_order LIMIT 1`,
  DRAW_ONE_CARD_FROM_DISCARD:`SELECT * FROM game_cards gc, standard_deck_cards sdc WHERE gc.game_id=$1 AND gc.user_id IS NULL AND gc.status = 'discard' AND gc.card_id=sdc.id ORDER BY gc.card_order LIMIT 1`,
  ASSIGN_NEW_TOP_DISCARD: `UPDATE game_cards SET user_id=NULL, status='discard', card_order=$1 WHERE game_id=$2 AND card_id=$3`,
  SET_GAME_WINNER: `UPDATE games SET winner_id=$1, status='Completed' WHERE id=$2`,
  GET_GAME_WINNER: `SELECT u.id, u.email, u.gravatar, u.first_name, u.last_name FROM users u JOIN games g ON g.winner_id = u.id WHERE g.id=$1`
};

const create = async (creatorId, gameDescription, numberPlayers) => {
  try {    
    const newGameSocketId = randomBytes(20).toString("hex");
    const { id, description, number_players } = await db.one(Sql.CREATE, [
      newGameSocketId,
      creatorId,
      gameDescription || "placeholder",
      numberPlayers,
    ]);    
    let finalDescription = gameDescription;
    if (gameDescription === undefined || gameDescription.length === 0) {
      finalDescription = (await db.one(Sql.UPDATE_DESCRIPTION, [`Game ${id}`, id])).description;
    }

    await db.none(Sql.ADD_PLAYER, [id, creatorId, 1]);

    // await initialize(id, creatorId);

    return { id, description: finalDescription, numberPlayers };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const get = async (gameId) => {
  const [game, users, cards, curr_turn] = await Promise.all([
    db.one(Sql.GET_GAME, [gameId]),
    db.any(Sql.GET_USERS, [gameId]),
    db.any(Sql.GET_CARDS, [gameId]),
    db.any(Sql.GET_CURRENT_USERS_TURN, [gameId]),
  ]);
  
  const userData = [];
  users.forEach((item, idx) => {
    let playerCards = cards.filter((card) => card.user_id === item.id );    
    userData.push({ ...item, cards: playerCards, cardCount: playerCards.length });
  });
  let firstDiscardCard = cards.filter((card) => card.status === 'discard');
  
  return {
    ...game,
    users: userData,
    user_turn: curr_turn,
    first_discard: firstDiscardCard[firstDiscardCard.length-1],
  };
};

const available = async (user_id, game_id_start = 0, limit = 10, offset = 0) => {
  const games = await db.any(Sql.GET_AVAILABLE, {
    user_id,
    game_id_start,
    limit,
    offset,
  });

  return games;
};

const getGamesToRejoin = async (userId) => {
  const games = await db.any(Sql.GET_GAMES_REJOIN, [userId]);  
  return games;
}

const userCount = async (gameId) =>  {
  const usersNum = await db.one(Sql.GET_USER_COUNT, [gameId]).then(({ count }) => parseInt(count));
  if (usersNum === null) {
    throw "Cannot generate number of users for game";
  } else {
    return usersNum;
  }
};

const getUsersByGameId = async (gameId) => {
  const usersLst = await db.any(Sql.GET_USERS, [gameId]);
  if (usersLst === null) {
    throw "No users in this game";
  } else {
    return usersLst;
  }
}

const getCurrentUserByGameId = async (gameId) => {
  const currPlayer = await db.one(Sql.GET_CURRENT_USERS_TURN, [gameId]);
  if (currPlayer === null) {
    throw "No current player in game";
  } else {
    return currPlayer;
  }
}

const getWinnerByGameId = async (gameId) => {
  const winner = await db.oneOrNone(Sql.GET_GAME_WINNER, [gameId]);
  if (winner === null) {
    throw "No winner in this game"
  } else {
    return winner;
  }
}

const isThereWinnerByGameId = async (gameId) => {  
  const isThereWinner = await db.any(Sql.GET_GAME_WINNER, [gameId]);
  if (isThereWinner.length === 0) {
    return false;
  } else {
    return true;
  } 
}

const isSkipCard = (playerCardId) => 
  db.one(Sql.IS_CARD_SKIP_TYPE, [playerCardId]).then(({ count }) => parseInt(count) === 1);

const setWinnerByGameId = async (winnerId, gameId) => {
  await db.none(Sql.SET_GAME_WINNER, [winnerId, gameId]);
}

const getCardsByUser = async (gameId, userId) => {
  const userCards = await db.any(Sql.GET_CARDS_FROM_USER, [gameId, userId]);  
  if (userCards === null) {    
    throw "Couldn't find cards for the provided user";
  } else {
    return userCards;
  }
}

const getHandsByGame = async (gameId) => {
  const hands = await db.any(Sql.GET_CARDS, [gameId]);
  if (hands === null) {
    throw "No cards found in this game"
  } else {
    return {
      hands: hands.reduce((item, entry) => {
        if (entry.user_id !== null) {
          item[entry.user_id] = item[entry.user_id] || []
          item[entry.user_id].push(entry)
        }
        return item;
      }, {})
    }
  }
}

const drawOneCardFromDeck = async (gameId) => {
  const newCard = await db.oneOrNone(Sql.DRAW_ONE_CARD, [gameId]);
  if (newCard === null) {
    throw "No new card found in deck";
  } else {
    return newCard;
  }
}

const dealCardToPlayer = (userId, newCardId, gameId, currPlayerHandLength) => {
  const dealtCard = {
    user_id: userId,
    game_id: gameId,
    card_id: newCardId,
    card_order: currPlayerHandLength + 1,
    status: 'player'
  }

  const columns = new pgp.helpers.ColumnSet([
    "user_id",
    "?game_id",
    "?card_id",
    "card_order",
    "status",
  ]);

  const condition = pgp.as.format('WHERE card_id = ${card_id} AND game_id = ${game_id}', dealtCard);
  const query = pgp.helpers.update(dealtCard, columns, "game_cards") + condition;
  return db.none(query).then((_) => dealtCard);
}

const getUserTurnInGame = async (gameId, userId) => {
  const turnUser = await db.one(Sql.GET_USER_TURN_IN_GAME, [gameId, userId]);
  if (turnUser === null) {
    return "No turn of user in game";
  } else {
    return turnUser;
  }
}

const getTopDiscardCard = async (gameId) => {
  const discardCard = await db.one(Sql.GET_TOP_DISCARD_CARD, [gameId]);
  if (discardCard === null) {
    return "No discard pile found";
  } else {
    return discardCard;
  }
}

const isGameInitialized = async (gameId) => {  
  const gameStarted = await db.any(Sql.GET_CARDS, [gameId]);
  if (gameStarted.length === 0) {
    return false;
  } else {
    return true;
  }  
}

const updateGameCurrentTurn = async (gameId, userId) => {  
  const currentTurn = await getUserTurnInGame(gameId, userId);
    // Validate if next turn exists, else assign 1
    const turnExists = await db.oneOrNone(Sql.VALIDATE_NEW_TURN_ORDER, [gameId, currentTurn.turn_order+1]);    
    if (turnExists === null) {
      // Previously reached last turn, so restart at 1
      await db.none(Sql.SET_CURRENT_TURN, [1, gameId]);
    } else {
      await db.none(Sql.SET_CURRENT_TURN, [currentTurn.turn_order+1, gameId]);
    }     
}

const addNewTopDiscardCard = async (oldDiscardOrder, gameId, cardId) => {
  await db.none(Sql.ASSIGN_NEW_TOP_DISCARD, [oldDiscardOrder+1, gameId, cardId]);
}

const isCardPlayValid = (playerCardId, discardCardId) => //{return true;}
  db.one(Sql.IS_CARD_PLAY_VALID, [playerCardId, discardCardId]).then(({ count }) => parseInt(count) === 1);

const isCurrentPlayerTurn = async (gameId, userId) => {
  const { turn_order: userTurn } = await getUserTurnInGame(gameId, userId);  
  const result = await db.one(Sql.IS_CURRENT_PLAYER, [gameId]).then(({ current_turn: playerTurn }) => playerTurn === userTurn);  
  return result;
}  

const join = async (gameId, userId) => {
  // This will throw if the user is in the game since I have chosen the `none` method:
  await db.none(Sql.IS_PLAYER_IN_GAME, [gameId, userId]);
  const usersNum = await userCount(gameId);
  await db.none(Sql.ADD_PLAYER, [gameId, userId, usersNum+1]);
  //await db.none(Sql.ASSIGN_CARDS, [userId, gameId]);
};

const initialize = async (gameId) => {
  const deck = await db.any(Sql.SHUFFLED_DECK);
  const users = await getUsersByGameId(gameId);

  const columns = new pgp.helpers.ColumnSet(["user_id", "game_id", "card_id", "card_order", "status"], {
    table: "game_cards",
  });

  // Assign 7 cards to each player in the Game session (7 * number of players)
  // The remaining cards will be part of the [deck] pile, and only 1 card starts in the [discard] pile
  let idxUser = 0;
  const size = 7;
  const maxNumAssign = users.length * size;  
  let values = [];
  for (let i = 0; i < maxNumAssign; i += size) {
    let playerCards = deck.slice(i, i + size).map(({ id }, idx) => ({
      user_id: users[idxUser].id,
      game_id: gameId,
      card_id: id,
      card_order: idx + 1,
      status: "player",
    }));
    idxUser++;
    playerCards.forEach((item) => {
      values.push(item);
    });    
  }  

  // There must be only 1 card to start in the [discard] pile, the rest are part of the [deck] pile
  const deckCards = deck.slice(maxNumAssign, deck.length).map(({id}, idx) => ({
    user_id: null,
    game_id: gameId,
    card_id: id,
    card_order: idx+1,
    status: idx === 0 ? "discard" : "deck",
  }));
  deckCards.forEach((item) => {
    values.push(item);
  });

  const query = pgp.helpers.insert(values, columns);

  await db.none(query);

  // Send each player their cards
  // Send current state of the game: Current player's turn, Deck pile
  const currentPlayer = await getCurrentUserByGameId(gameId);
  // Send user state: each player's hand
  const hands = await db.any(Sql.GET_CARDS, [gameId]);  
  // Update "is_initialized" field to true, and "status" field to "In Progress" in games table
  await db.none(Sql.UPDATE_GAME_IS_INIT, [gameId]);  

  return {
    current_player: currentPlayer,
    hands: hands.reduce((item, entry) => {
      if (entry.user_id !== null) {
        item[entry.user_id] = item[entry.user_id] || []
        item[entry.user_id].push(entry)
      }
      return item;
    }, {})
  } 
};

const getGameById = (gameId) => db.one(Sql.GET_GAME, gameId);

const isPlayerInGame = async (gameId, userId) => {
  const result = await db.oneOrNone(Sql.IS_PLAYER_IN_GAME, [gameId, userId]);

  if (result === null) {
    return false;
  } else {
    return true;
  }
}

export default {
  create,
  get,
  available,
  join,
  userCount,
  getGameById,
  isCurrentPlayerTurn,
  initialize,
  isPlayerInGame,
  isCardPlayValid,
  getTopDiscardCard,
  drawOneCardFromDeck,
  dealCardToPlayer,
  getCardsByUser,
  getHandsByGame,
  isGameInitialized,
  addNewTopDiscardCard,
  getCurrentUserByGameId,
  updateGameCurrentTurn,
  getWinnerByGameId,
  setWinnerByGameId,
  isThereWinnerByGameId,
  getGamesToRejoin,
  isSkipCard
};
