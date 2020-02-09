import React, {useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from 'axios';
import debounce from 'lodash/debounce';

const CancelToken = axios.CancelToken;
let cancel;

const ListMember = (props) => {
  return (
    <div className="player-box">
        <div className="player-image">
          <img src={props.profileImage} alt="player" />
        </div>
        <div className="player-data">
          <div className="player-info">
            <h4 className="player-nickname"><a href="#">{props.nickName}</a></h4>
            <h5 className="player-name">{props.firstName} {props.lastName}</h5>
          </div>

          <div className="save-player">
            <div className="round">
              <input
                type="checkbox"
                className='userStatus'
                name={"player-"+props.id}
                id={props.id}
                checked={props.checked}
                onChange={props.onClick}
              />
              <label htmlFor={props.id}></label>
            </div>
          </div>
        </div>
      </div>
  );
}

const SearchPlayer = () => {
  const content = useSelector(state => state);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [playersList, setPlayersList] = useState([]);
  const [error, setError] = useState(null);
  const [savedPlayerInfo, setSavedPlayer] =
   useState(localStorage.getItem("savedPlayers") === null ? [] : JSON.parse(localStorage.getItem("savedPlayers")))

  const delayedQuery = useRef(debounce(query => getPlayersData(query), 300)).current;

  const toggleCheckboxClick = ({ target: { checked, id }}) => {
    if (checked) {
      const playerIds = [...savedPlayerInfo, id];
      localStorage.setItem('savedPlayers', JSON.stringify(playerIds));
      setSavedPlayer(playerIds)
    } else {
      const playerIds = savedPlayerInfo.filter(searchId => id !== searchId)
      localStorage.setItem('savedPlayers', JSON.stringify(playerIds));
      setSavedPlayer(playerIds);
    }
  }

  const getPlayersData = (query) => {
    axios.get(`https://api-search.win.gg/search?q=${query}&index=player`, {
      cancelToken: new CancelToken((c) => {cancel = c})
    })
      .then(({ data: json }) => {
        setPlayersList(json[0].documents);
        dispatch({
          type:'FETCH_DATA',
          data:json[0].documents
        })
      })
      .catch(err => {
        if (!axios.isCancel(err)) {
          setError(err);
        }
      });

  }

  const handleChange = ({ target: { value }}) => {
    setError(null);
    setSearchTerm(value.toLowerCase());
    if (value.length >= 2) {
      delayedQuery(value.toLowerCase());
    } else {
      cancel && cancel();
      setPlayersList([]);
    }
  };

  const filterArray = (array) => {
    if(array){
      return array.filter(person =>
        person.nick_name.toLowerCase().includes(searchTerm)
      );
    } else {
      return [];
    }
  }

  const resetInput = () => {
    setSearchTerm('');
    setPlayersList([]);
  };

  return (
    <div className="main-wrapper">
      <div className="relative">
        {!!searchTerm.length && <span
          className="close"
          onClick={resetInput}
        >
        </span>}
      </div>
      <input
        type="text"
        className="searchInput"
        placeholder="Search"
        value={searchTerm}
        onChange={handleChange} />
        <div className="players-caption">Players</div>
      <>
      {error && <div className="not-found">No player found</div>}
      {
        playersList &&
        playersList
          .map((item,index)=>{
            const imagePath = 'https://d1wrci9wmi4ouq.cloudfront.net/';
            let image = item.images ? imagePath + item.images.default.filePath : './assets/img/unknown.jpg';

            return <ListMember
                key={`players${index}`}
                id={item.id}
                nickName={item.nick_name}
                firstName={item.first_name}
                profileImage={image}
                checked={savedPlayerInfo.includes(item.id)}
                onClick={toggleCheckboxClick}
            />
          })
      }
      </>
    </div>
  );
}

export default SearchPlayer;
