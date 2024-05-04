/* eslint-disable camelcase */

const TABLE_NAME = "game_cards";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createType("card_status", ["deck", "player", "discard"]);
  pgm.createTable(TABLE_NAME, {
    user_id: {
      type: "int",
    },
    game_id: {
      type: "int",
      references: "games",
    },
    card_id: {
      type: "int",
      references: "standard_deck_cards",
    },
    card_order: {
      type: "int",
    },
    status: {
      type: "card_status"
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropColumn(TABLE_NAME, "status");
  pgm.dropType("card_status");
  pgm.dropTable(TABLE_NAME);
};
