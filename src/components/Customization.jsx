import { useState } from "react";

import styles from "../styles/Customization.module.css";
import { client, useClient } from "../server/client.js";


const Customization = ({
  player, setPlayer
}) => {

  const {test, setTest} = useClient('test', 0);


  const setInformation = (e) => {
    e.preventDefault();
    const elems = e.target.elements;

    setPlayer({
      ...player,
      name: elems.name.value || player.name,
      boatNames: player.boatNames.map((boatName, i) => {
        return elems.boatName[i].value || boatName;
      })
    })
  };

  // return (
  //   <div className={styles.customization}>
  //     {!character && <div className={styles.characterselect}>
  //       <div onClick={() => {
  //         setCharacter('orangeman')
  //         if (!cookies.get('user').name) setDisplay('name')
  //         else setDisplay('done')
  //       }}><h5>orange mode</h5>
  //         <ul>
  //           <li>Your shots protect the equivalent square on your board</li>
  //           <li>Can bluff: when bluffing you can't see the results
  //             of your shots, if the enemy doesn't call your bluff you
  //             can return 3 shots for each turn since you started bluffing.</li>
  //         </ul>
  //       </div>
  //       <div onClick={() => {
  //         setCharacter('lineman')
  //         if (!cookies.get('user').name) setDisplay('name')
  //         else setDisplay('done')
  //       }}><h5>line mode</h5>
  //         <ul>
  //           <li>has 4 ability usages total </li>
  //           <li>can fire the opponents last two shots back</li>
  //           <li>can connect a line and fire at all squares in between two of your misses,
  //             if an opponent's shot is not in between.</li>
  //         </ul>
  //       </div>
  //       <div onClick={() => {
  //         setCharacter('cornerman')
  //         if (!cookies.get('user')) setDisplay('name')
  //         else setDisplay('done')
  //       }}><h5>corner mode</h5>
  //         <ul>
  //           <li>can build around the edges of the board</li>
  //           <li>if you hit both the rear and head of a boat you sink the boat immediately.</li>
  //         </ul>
  //       </div>
  //       {/* <div onClick={() => {
  //               setCharacter('none')
  //               if (!cookies.get('user')) setDisplay('name')
  //               else setDisplay('done')
  //           }}><h5>default mode</h5>
  //               <ul>
  //                   <li>can build around the edges of the board</li>
  //                   <li>if you hit both the rear and head of a boat you sink the boat immediately.</li>
  //               </ul>
  //           </div> */}
  //     </div>}
  //     <div onClick={() => {
  //       setName(null)
  //       setDisplay('name')
  //     }}> {name || (!cookies.get('user') ? cookies.get('user').name : null)} {cookies.get('user').name && <span> wins/losses: {cookies.get('user').wins} / {cookies.get('user').losses}</span>}</div>
  //     <div className={styles.boatform}>
  //       {(name && display === 'name') && <p className={styles.chooseBoatNames}>choose Boat names?</p>}
  //       <form onSubmit={(e) => setInformation(e)}>
  //         {(display === 'name' && !cookies.get('user').name) && <div>
  //           <div>
  //             <label htmlFor='name'>name</label>
  //           </div>
  //           <input name='name' onChange={(e) => setName(e.target.value)}
  //             onBlur={() => { if (name) setDisplay('boats') }} />
  //         </div>}
  //         {display === 'boats' && <div className={styles.boatfields}>
  //           <h4>Choose your Boat Names:</h4>
  //           <input name='name' value={name || cookies.get('user').name} hidden />
  //           <label htmlFor='boat1'>destroyer</label>
  //           <input name='boat1' defaultValue={boatNames[0]} />
  //           <label htmlFor='boat2'>cruiser</label>
  //           <input name='boat2' defaultValue={boatNames[1]} />
  //           <label htmlFor='boat3'>battleship</label>
  //           <input name='boat3' defaultValue={boatNames[2]} />
  //           <label htmlFor='boat4'>carrier</label>
  //           <input name='boat4' defaultValue={boatNames[3]} />
  //           <button>submit</button> </div>}
  //       </form>
  //     </div>
  //     {(cookies.get('user').name !== 'noName' && character) && <div>
  //       {display === 'done' && <div>
  //         <button onClick={() => {
  //           let periods = () => {
  //             setTimeout(() => {
  //               setWaiting(prev => {
  //                 if (prev.match(/\.\.\./)) return 'waiting for match'
  //                 return prev + '.'
  //               })
  //               if (cookies.get('user').state === 'matching') periods()
  //             }, 1000)
  //           }
  //           periods()

  //           setWaiting('waiting for match')
  //           socket.current.send(JSON.stringify({ ...cookies.get('user'), character, boatNames }))
  //         }}>find game</button>
  //         <button onClick={() => {
  //           setDisplay('boats')
  //         }}>rename boats
  //         </button>
  //         <button onClick={() => {
  //           setCharacter(false)
  //         }}>change character
  //         </button>
  //         {waiting && <p>{waiting}</p>}
  //       </div>}</div>}
  //   </div>
  // );

  return (
    <div>
      <div>{player.name} --- {player.wins}/{player.losses}</div>
      <form onSubmit={setInformation}>
        <label htmlFor='name'>Name</label>
        <input type='text' name='name' placeholder={player.name} />
        {player.boatNames.map((boatName, i) => {
          return (
            <div key={i}>
              <label htmlFor='boatName'>{player.boatNames[i]}</label>
              <input type='text' name='boatName' placeholder={boatName} />
            </div>
          );
        })}
        <input type="submit" value="Submit" />
      </form>
    </div>
  );


}

export default Customization;