/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumn("games", {
        number_players: {
            type: "int",
            notNull: true,
        } });
};

exports.down = pgm => {
    pgm.dropColumn("games", "number_players");
};
