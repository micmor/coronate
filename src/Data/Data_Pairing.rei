/**
 * This handles all of the logic for calculating pairings. It requires data
 * taken from past tournament scores and player ratings.
 */
type t = {
  id: Data_Id.t,
  avoidIds: list(Data_Id.t),
  colorScores: list(float),
  colors: list(Data_Scoring.Color.t),
  halfPos: int,
  isUpperHalf: bool,
  opponents: list(Data_Id.t),
  rating: int,
  score: float,
};

/**
 * This is useful for dividing against a calculated priority, to inspect how
 * "compatible" two players may be.
 */
let maxPriority: float;

/**
 * Given two `PairingData` objects, this assigns a number for how much they
 * should be matched. The number gets fed to the `blossom` algorithm.
 */
let calcPairIdeal: (t, t) => float;

/**
 * This determines what "half" each player is in: upper half or lower half. It
 * also determines their "position" within each half.
 * USCF § 29C1
 */
let setUpperHalves: Data_Id.Map.t(t) => Data_Id.Map.t(t);

/**
 * This this returns a tuple of two objects: The modified array of player data
 * without the player assigned a bye, and the player assigned a bye.
 * If no player is assigned a bye, the second object is `null`.
 * After calling this, be sure to add the bye round after the non-bye'd
 * players are paired.
 */
let setByePlayer:
  (array(Data_Id.t), Data_Id.t, Data_Id.Map.t(t)) =>
  (Data_Id.Map.t(t), option(t));

/**
 * Create pairings according to the rules specified in USCF § 27, § 28,  and
 * § 29. This is a work in progress and does not account for all of the rules
 * yet.
 */
let pairPlayers: Data_Id.Map.t(t) => list((Data_Id.t, Data_Id.t));
