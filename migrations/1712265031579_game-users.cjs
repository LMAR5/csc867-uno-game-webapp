/* eslint-disable camelcase */

const TABLE_NAME = "game_users";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(TABLE_NAME, {
    user_id: {
      type: "int",
      references: "users",
    },
    game_id: {
      type: "int",
      references: "games"
    },
    turn_order: {
      type: "int",
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(TABLE_NAME);
};
