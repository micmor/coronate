import {BLACK, DUMMY_ID, WHITE, types} from "../../data-types";
import {
    __,
    append,
    assoc,
    concat,
    filter,
    findIndex,
    lensPath,
    lensProp,
    map,
    mergeRight,
    move,
    over,
    pipe,
    propEq,
    remove,
    reverse,
    set
} from "ramda";
import {autoPair, manualPair} from "./match-functions";
import t from "tcomb";

// eslint-disable-next-line complexity
export default function tournamentReducer(state, action) {
    switch (action.type) {
    case "ADD_ROUND":
        return over(
            lensProp("roundList"),
            append([]),
            state
        );
    case "DEL_LAST_ROUND":
        return over(
            lensProp("roundList"),
            remove(-1, 1),
            state
        );
    case "ADD_TIEBREAK":
        t.interface({id: t.Number})(action);
        return over(
            lensProp("tieBreaks"),
            append(action.id),
            state
        );
    case "DEL_TIEBREAK":
        t.interface({id: t.Number})(action);
        return over(
            lensProp("tieBreaks"),
            filter((id) => id !== action.id),
            state
        );
    case "MOVE_TIEBREAK":
        t.interface({
            newIndex: t.Number,
            oldIndex: t.Number
        })(action);
        return over(
            lensProp("tieBreaks"),
            move(action.oldIndex, action.newIndex),
            state
        );
    case "SET_TOURNEY_PLAYERS":
        t.interface({playerIds: t.list(types.Id)})(action);
        return assoc("playerIds", action.playerIds, state);
    case "SET_BYE_QUEUE":
        t.interface({byeQueue: t.list(types.Id)})(action);
        return assoc("byeQueue", action.byeQueue, state);
    case "SET_NAME":
        t.interface({name: t.String})(action);
        return assoc("name", action.name, state);
    case "AUTO_PAIR":
        t.interface({
            avoidList: t.list(types.AvoidPair),
            byeValue: t.Number,
            players: t.dict(types.Id, types.Player),
            roundId: t.Number
        })(action);
        return over(
            lensPath(["roundList", action.roundId]),
            concat(
                __,
                autoPair({
                    avoidList: action.avoidList,
                    byeValue: action.byeValue,
                    players: action.players,
                    roundId: action.roundId,
                    tourney: state
                })
            ),
            state
        );
    case "MANUAL_PAIR":
        t.interface({
            byeValue: t.Number,
            pair: t.tuple([types.Player, types.Player]),
            roundId: t.Number
        })(action);
        return over(
            lensPath(["roundList", action.roundId]),
            append(manualPair(action.pair, action.byeValue)),
            state
        );
    case "SET_DATE":
        t.interface({date: Date})(action);
        return assoc("date", action.date, state);
    case "SET_MATCH_RESULT":
        t.interface({
            matchId: t.String,
            newRating: t.tuple([t.Number, t.Number]),
            result: t.tuple([t.Number, t.Number]),
            roundId: t.Number
        })(action);
        return pipe(
            set(
                lensPath([
                    "roundList",
                    action.roundId,
                    findIndex(
                        propEq("id", action.matchId),
                        state.roundList[action.roundId]
                    ),
                    "result"
                ]),
                action.result
            ),
            set(
                lensPath([
                    "roundList",
                    action.roundId,
                    findIndex(
                        propEq("id", action.matchId),
                        state.roundList[action.roundId]
                    ),
                    "newRating"
                ]),
                action.newRating,
            ),
        )(state);
    case "DEL_MATCH":
        t.interface({matchId: types.Id, roundId: t.Number})(action);
        return over(
            lensPath(["roundList", action.roundId]),
            filter((match) => match.id !== action.matchId),
            state
        );
    case "SWAP_COLORS":
        t.interface({matchId: types.Id, roundId: t.Number})(action);
        return over(
            lensPath([
                "roundList",
                action.roundId,
                findIndex(
                    propEq("id", action.matchId),
                    state.roundList[action.roundId]
                )
            ]),
            (match) => mergeRight(
                match,
                {
                    newRating: reverse(match.newRating),
                    origRating: reverse(match.origRating),
                    playerIds: reverse(match.playerIds),
                    result: reverse(match.result)
                }
            ),
            state
        );
    case "MOVE_MATCH":
        t.interface({
            newIndex: t.Number,
            oldIndex: t.Number,
            roundId: t.Number
        })(action);
        return over(
            lensPath(["roundList", action.roundId]),
            move(action.oldIndex, action.newIndex),
            state
        );
    case "UPDATE_BYE_SCORES":
        t.interface({value: t.Number})(action);
        return assoc(
            "roundList",
            map(
                map(
                    function (match) {
                        if (match.playerIds[WHITE] === DUMMY_ID) {
                            return assoc("result", [0, action.value], match);
                        } else if (match.playerIds[BLACK] === DUMMY_ID) {
                            return assoc("result", [action.value, 0], match);
                        } else {
                            return match;
                        }
                    }
                ),
                state.roundList
            ),
            state
        );
    case "SET_STATE":
        console.log("setting state:", action.state);
        return action.state;
    default:
        throw new Error("Unexpected action type " + action.type);
    }
}