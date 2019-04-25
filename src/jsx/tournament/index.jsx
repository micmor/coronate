// @ts-check
import React, {Fragment, useContext, useState} from "react";
import {Tabs, TabList, Tab, TabPanels, TabPanel} from "@reach/tabs";
import {BackButton} from "../utility";
import {getPlayer, dummyPlayer} from "../../chess-tourney/player";
import createTournament from "../../chess-tourney/tournament";
import {calcStandings} from "../../chess-tourney/scores";
import {calcNumOfRounds} from "../../chess-tourney/utility";
import Round from "./round";
import PlayerSelect from "./player-select";
import {DataContext} from "../../global-state";

export function TournamentList() {
    const {data, dispatch} = useContext(DataContext);
    const tourneyList = data.tourneys;
    const [openTourney, setOpenTourney] = useState(null);
    const [newTourneyName, setNewTourneyName] = useState("");
    function updateNewName(event) {
        setNewTourneyName(event.target.value);
    }
    function makeTournament(event) {
        event.preventDefault();
        dispatch({
            type: "ADD_TOURNEY",
            tourney: createTournament({name: newTourneyName})
        });
        setNewTourneyName("");
    }
    let content = <Fragment></Fragment>;
    if (openTourney !== null) {
        content = (
            <TournamentTabs
                tourneyId={openTourney}
                setOpenTourney={setOpenTourney}
                backButton={<BackButton action={() => setOpenTourney(null)}/>}
                />
        );
    } else {
        content = (
            <div>
            {(
                (tourneyList.length > 0)
                ?
                    <ol>
                    {tourneyList.map((tourney, i) =>
                        <li key={i}>
                            <button
                                className="tourney-select"
                                onClick={() => setOpenTourney(i)}>
                                {tourney.name}
                            </button>
                            <button
                                className="danger"
                                onClick={
                                    () => dispatch({
                                        type: "DEL_TOURNEY",
                                        index: i
                                    })
                                }>
                                delete
                            </button>
                        </li>
                    )}
                    </ol>
                :
                    <p>
                        No tournaments added yet.
                    </p>
            )}
                <form onSubmit={makeTournament}>
                    <fieldset>
                        <legend>Make a new tournament</legend>
                        <input
                            type="text"
                            placeholder="tournament name"
                            value={newTourneyName}
                            onChange={updateNewName}
                            required={true}/>
                        <input type="submit" value="Create" />
                    </fieldset>
                </form>
            </div>
        );
    }
    return (
        <div>
            {content}
        </div>
    );
}

/**
 *
 * @param {Object} props
 */
export function TournamentTabs({tourneyId, backButton}) {
    const {data, dispatch} = useContext(DataContext);
    const playerList = data.players;
    const tourney = data.tourneys[tourneyId];
    const players = tourney.players;
    const [defaultTab, setDefaultTab] = useState(0);
    const [standingTree, tbMethods] = calcStandings(
        tourney.tieBreaks,
        tourney.roundList
    );
    function newRound() {
        dispatch({type: "ADD_ROUND", tourneyId: tourneyId});
        setDefaultTab(tourney.roundList.length + 1);
    }
    return (
        <Tabs defaultIndex={defaultTab}>
            {backButton}
            <div>
                <h2>{tourney.name}</h2>
                Round progress: {tourney.roundList.length}/
                {calcNumOfRounds(players.length)}
                <button onClick={() => newRound()}>New Round</button>
                <button
                    onClick={
                        () => dispatch({
                            type: "DEL_LAST_ROUND",
                            tourneyId: tourneyId
                        })
                    }
                    disabled={tourney.roundList.length === 0}>
                    Remove last round
                </button>
            </div>
            <TabList>
                <Tab>Players</Tab>
                <Tab>Scores</Tab>
                {Object.keys(tourney.roundList).map((id) =>
                    <Tab key={id}>Round {Number(id) + 1}</Tab>
                )}
            </TabList>
            <TabPanels>
            <TabPanel>
                <PlayerSelect tourneyId={tourneyId} />
            </TabPanel>
            <TabPanel>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Score</th>
                                {tbMethods.map((name, i) =>
                                    <th key={i}>{name}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                        {standingTree.map((standingsFlat, rank) =>
                            standingsFlat.filter(
                                (p) => p.id !== dummyPlayer.id
                            ).map((standing) =>
                                <tr key={standing.id}>
                                    <td className="table__number">
                                        {rank + 1}
                                    </td>
                                    <td>
                                        {getPlayer(
                                            standing.id,
                                            playerList
                                        ).firstName}
                                    </td>
                                    <td className="table__number">
                                        {standing.score}
                                    </td>
                                    {standing.tieBreaks.map((score, i) =>
                                        <td key={i} className="table__number">
                                            {score}
                                        </td>
                                    )}
                                </tr>
                            )
                        )}
                        </tbody>
                    </table>
            </TabPanel>
            {Object.keys(tourney.roundList).map((id) =>
                <TabPanel key={id}>
                    <Round
                        roundId={Number(id)}
                        tourneyId={tourneyId} />
                </TabPanel>
            )}
            </TabPanels>
        </Tabs>
    );
}