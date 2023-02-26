import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Menu.module.scss';

const Menu = () => {
  const [links, setLinks] = useState([
    <Link to='/current'>Current Games</Link>,
    <></>,
    <Link to='/finished'>Finished Games</Link>,
    <Link to='/open'>Open Games</Link>,
    <Link to='/play'>Play</Link>,
    <></>,
    <></>,
    <></>,
    <></>
  ]);

  return (
    <div className={styles.boardmockmenu}>
      {links.map((elem, i) => (
        <div key={i} className={styles.mocksquare}>
          {elem}
        </div>
      ))}
    </div>
  );
};

export default Menu;
