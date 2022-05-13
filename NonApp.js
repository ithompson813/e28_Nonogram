import {useState, useEffect} from "react";
import {Routes, Route, Link} from "react-router-dom";
import "./nonogram_css.css";

function Game(){

    // define variables used to power the game
    var boxes = [];
    const [feedback, setFeedback] = useState("");
    const [status, setStatus] = useState("Playing");
    const [boardString, setBoardString] = useState(CreateBoardString);
    const [horCluesArray, setHorCluesArray] = useState(GenerateHorizonalClues);
    const [vertCluesArray, setVertCluesArray] = useState(GenerateVerticalClues);
    const [gameString, setGameString] = useState(CreateGameString);
    const [currTime, setTime] = useState(0);
    const [gamesWon, setGamesWon] = useState("0");
    const [totalTime, setTotalTime] = useState("0");


    // the game board is made up a series of boxes
    function Box(k)
    {

        // the classes provide visual feedback of the board state 
        var classes = ['blank', 'filled', 'empty'];

        // box onclick function is used to update the boardString array which represents the player's moves
        function UpdateBoard(e)
        {
            e.preventDefault();

            // do not allow the board to be changed while the game is paused
            if (status === "Playing"){

                // check is box's class and update it to next in the sequence
                for (let i=0; i < classes.length; i++)
                {

                    if (e.target.className === classes[i])
                    {
                        if (i > 1)
                        {
                            // update the gameString to reflect the change
                            e.target.className = classes[0]; 
                            let temp_string = [...gameString];
                            let temp_box_change = [temp_string[e.target.id]];                           
                            temp_box_change = 0;
                            temp_string[e.target.id] = temp_box_change;
                            setGameString(temp_string);

                        } else {
                            e.target.className = classes[i+1];
                            if (i === 1)
                            {
                                // update the gameString
                                let temp_string = [...gameString];
                                let temp_box_change = [temp_string[e.target.id]];                           
                                temp_box_change = 0;
                                temp_string[e.target.id] = temp_box_change;
                                setGameString(temp_string);


                            } else {

                                //update gameString
                                let temp_string = [...gameString];
                                let temp_box_change = [temp_string[e.target.id]];                           
                                temp_box_change = 1;
                                temp_string[e.target.id] = temp_box_change;
                                setGameString(temp_string);

                            }
                        }
                        // ensure only one change is made
                        break;
                    }
                }

            } else {
                setFeedback("Can't make moves while paused!");
            }

        }

        // return a blank button which will be used on the game's board
        return <button className="blank" key = {k} id = {k} onClick={UpdateBoard}></button>
    }

    // a more simple element of the board
    // the clue boxes simply display the game's clues
    function ClueBox(content, k)
    {
        return (
            <button className='header' key={k}>{content}</button>
        );

    }


    // Navigation bar
    function Nav()
    {
        return (
            <>
            <h1>Nonogram_28</h1>
            <ul>
                <li><Link to="/">Play</Link></li>
                <li><Link to="/options">Options</Link></li>
            </ul>
            </>
        );
    }

    // define _timer outside function so countdown can be easily cancelled by other functions
    var _timer;
    
    // function to control the counting timer displayed above board
    function CountTimer()
    {
        useEffect(() => {
            const timer = currTime;
            if (status === "Playing"){
                _timer = setTimeout(() => setTime(timer + 1), 1000);
            }
        });
    }
    CountTimer();

    // helper function to reset timer
    function ResetTimer()
    {
        clearTimeout(_timer);
        setTime(0);
    }

    // Represents the option route
    function Options()
    {

        // calculate a few stats
        let winRatio = 0;
        if (gamesWon > 0)
        {
            winRatio = (totalTime / gamesWon).toFixed(1);
        }

        // collect keys from local storage to be displayed
        let ids = [];
        for (let i = 0, len = localStorage.length; i < len; ++i)
        {
            ids.push('"' + localStorage.key(i) + '"');
        }
   
        // display page shows the stats, stored game ids, and a button to clear the stored data
        return (
            <div id="options">
                <ul>
                    Quick Stats: <br /><br />
                    <li> Games won: {gamesWon} </li><br />
                    <li> Average time to win: {winRatio} seconds </li> <br /> <br />
                </ul>
                Saved Game IDs: <br />
                    {ids.map((item, k) => {
                        return (
                            <li key = {k}> {item} </li>
                        );
                    })}
                <br />
                <button onClick = {(e) => {
                            e.preventDefault();
                            localStorage.clear();
                            setFeedback("Save Data Deleted");
                            }}>Clear Saved Games</button>
            </div>
        );
    }


    // Play/default route
    function Play()
    {

        let k = 25;
        // the drawBoard function creates the game board
        function DrawBoard()
        {

            // create the 5x5 playable area grid
            for (let i = 0; i < 25; i++) //25 could be changed by a size declaring variable
            {
                let b = new Box(i);
                boxes.push(b);
            }

            // add blank leading box to top left
            var lBox = new ClueBox("", k);
            boxes.splice(0,0,lBox);
            k++;
            
            // add vertical clues boxes along the top row
            for (let i = 0; i < 5; i++)
            { 
                let content = vertCluesArray[i].join();
                if (!content)
                {
                    content = 0;
                }
                let c = new ClueBox(content, k);
                boxes.splice(i+1, 0, c)
                k++;
            }


            // add horizontal clues along the left column
            for (let i = 0; i < 5; i++)
            {
                let content = horCluesArray[i].join();
                if (!content)
                {
                    content = 0;
                }
                let c = new ClueBox(content, k);
                boxes.splice(i * 5 + i + 6, 0 , c);
                k++;
            } 

        }

        // The reset functions recalculates solution string, clues, and wipes the board
        function Reset()
        {  
            for (let i = 0; i < 25; i++)
            {
                // clear each box's formatting
                // each box's id determined at creation from 0-24
                document.getElementById(i).className = "blank";
            }

            // update status & alert player
            setStatus("Paused");
            setFeedback("Game reset - press Play to begin")

            // reset game variables
            ResetTimer();
            setHorCluesArray(GenerateHorizonalClues());
            setVertCluesArray(GenerateVerticalClues());
            setBoardString(CreateBoardString());
            setGameString(CreateGameString());
        }

        // The save function utilizes local storage to remember a board state
        function Save()
        {

            // user assigns a key to retrieve data later
            let id = prompt("Please name file:");

            // check if input is valid
            if (id)
            {

                // create format array
                let classArray = [];
                for (let i = 0; i < 25; i++)
                {
                    classArray[i] = document.getElementById(i).className;
                }

                // store game data
                let data = {
                    gs: gameString,
                    bs: boardString,
                    time: currTime,
                    ca: classArray,
                    id: id
                }

                localStorage.setItem(id, JSON.stringify(data));
                setFeedback("Game Stored as: " + id);


            } else {
                setFeedback("Please enter a valid name to save game")
            }

        }

        // the load function prompts user for a game key and brings up a former board from local storage
        function Load()
        {
            // get key
            let id = prompt("Enter file name: ");

            // check if key is valid
            if (localStorage.getItem(id) && id)
            {

                // assign stored variables to current game
                let game = JSON.parse(localStorage.getItem(id));
                setBoardString(game["bs"]);
                setGameString(game["gs"]);
                clearTimeout(_timer);
                setTime(game["time"]);
                setFeedback("Returning to file: " + id);

                for (let i = 0; i < 25; i++)
                {
                    document.getElementById(i).className = game["ca"][i];
                }

            } else {
                setFeedback("Game not found - please try again");
            }

        }

        // helper function to update status to paused
        // left in for future functionality that could be triggered at time of pause
        function Pause()
        {
            setStatus("Paused");
        }

        // helper function to update status to play
        // left in for future functionality that could be triggered at time of resume
        function Resume()
        {
            setStatus("Playing");
        }



        // generate game board
        function GameBoard()
        {

            // create board
            DrawBoard();

            // the compare array function determines if the current input string equals the solution string
            function CompareArray(a1, a2)
            {     
                if (status === "Playing")
                {

                    // loop through both strings checking if each element matches
                    for (let i = 0; i < 25; i++)
                    {
                        if (a1[i] !== a2[i])
                        {
                            // if any element is wrong immediately exit function and inform user
                            setFeedback("There are mistakes in this puzzle!");
                            return;
                        }
                    }

                    // if all elements match, user wins the game
                    // update variables and inform user
                    clearTimeout(_timer);
                    setFeedback("Great job - you solved in " + currTime + " seconds!");
                    setGamesWon(parseInt(gamesWon + 1));
                    setTotalTime(parseInt(totalTime + currTime));
                    setStatus("Paused");
                    return;

                } else {
                    setFeedback("Cannot check answer while paused");
                }
            }

            // the gameBoard returns the html elements which represent the board
            // it also includes the function buttons which the user can use to control the game
            // to reset, save, load, pause, and play
            return (
                <>
                    <div className="board"> 
                        Time: {currTime}
                        <br />
                        {boxes}
                        <br />
                        <button onClick = {(e) => {
                            e.preventDefault(); 
                            CompareArray(boardString, gameString) }}>Check</button> 
                        <button onClick = {(e) => {
                            e.preventDefault();
                            Reset() }}>New</button>
                        <button onClick = {(e) => {
                            e.preventDefault();
                            Save() }}>Save</button>
                        <button onClick = {(e) => {
                            e.preventDefault();
                            Load() }}>Load</button>
                        <button onClick = {(e) => {
                            e.preventDefault();
                            Pause() }}>Pause</button>
                        <button onClick = {(e) => {
                            e.preventDefault();
                            Resume() }}>Play</button><br />
                        Status: {status} <br />
                        {feedback}              
                    </div>
                    
                </>
            );
        }

        // play route returns the board as represented by the GameBoard function
        return (
            GameBoard()
            );
    }

    // 404 page
    function FourOhFour()
    {
        return "404: Page not found!"
    }

    // helper function to generate a new solution string
    // returns a solution string
    function CreateBoardString()
    {

        let temp_board_string = [];

        for (let i = 0; i < 25; i++)
        {
            // solutions are made randomly using a simple probability function
            let n = Math.floor(Math.random()*5);

            // each square has a 60% chance of being filled
            if (n < 3)
            {
                temp_board_string[i] = 1;
            } else {
                temp_board_string[i] = 0;
            }
        }
        
        return temp_board_string; 

    }

    // returns a new game string
    // the game string represents the user's moves
    function CreateGameString(){

        let game_string = [];

        // always returns a blank string
        for (let i = 0; i < 25; i++)
        {
            game_string[i] = 0;
        }
        return game_string;
    }

    // generates the clues for rows based on current solution string
    function GenerateHorizonalClues()
    {

        let counter = 0;
        let clues = [];

        // determines how many filled in squares appear consecutively in a given row
        // each row's solution is assigned to an element of the clues array
        for (let j = 0; j < 5; j++)
        {

            let row = [];
            let x = j * 5;
            for (let i = x; i < x + 5; i++)
            {
                if (boardString[i] === 1)
                {
                    let t = 1;
                    counter = 1;

                    while (boardString[i+t] === 1 && i+t < x + 5)
                    {
                        counter++;
                        t++;
                    }
                    
                     row[i] = counter;
                    i = i + t;
                }       
            }

            // remove empty space
            row = row.filter((n) => {return n != null;})
            clues[j] = row;

        }
        
        // return array
        return clues;
    }

    // generates the clues for columns based on current solution string
    function GenerateVerticalClues()
    {
        let counter = 0;
        let clues = [];

        // determines how many filled in squares appear consecutively in a given column
        // each column's solution is assigned to an element of the clues array
        for (let j = 0; j < 5; j++)
        {

            let column = [];

            for (let i = j; i < 25; i+=5)
            {
                if (boardString[i] === 1)
                {
                    let t = 5;
                    counter = 1;

                    while (boardString[i+t] === 1 &&  i + t < 25)
                    {
                        counter++;
                        t = t + 5;
                    }

                    column[i] = counter;
                    i = i + t;

                }  
            }

            // clear empty space
            column = column.filter((n) => {return n != null;})
            clues[j] = column;

        }

        // return array
        return clues;

    }

    //helper function for useEffect below
    function NewClues()
    {
        setHorCluesArray(GenerateHorizonalClues());
        setVertCluesArray(GenerateVerticalClues());
    }

    // to prevent async problems, update clues when solution string changes
    useEffect(() => {NewClues()}, [gameString]);
    
    // return routes to be exported
    return (    
        <>
            <Nav />
            <Routes>
                <Route path="/" element={Play()} />
                <Route path="/options" element={Options()} />
                <Route path="/*" element={FourOhFour()} />
            </Routes>
        </>

    );
}

// export function
export function NonogramApp()
{
    return (
        <Game />
    );
}