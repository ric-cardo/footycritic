import React, { Component } from 'react';
import * as firebase from 'firebase';
import twemoji from 'twemoji'; 

import './App.css';
import PlayerCard from './PlayerCard';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      teams:[],
      selected: 'null',
      players:[],
      uid:null
    };
  }

  componentWillMount(){
    
    if(!window.localStorage.getItem('uid')){
      firebase.auth().signInAnonymously().catch((error)=> {
        alert('problem signing in refresh to try again ')  
      });
    }


    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const {uid} = user;
        window.localStorage.setItem('uid',uid)
        this.setState(prevState => ({uid}));
      }

    });
  }

  componentDidMount(){
    const rootRef = firebase.database().ref();
    const teamRef = rootRef.child('teams');

    teamRef.on('value',snap =>{
      const teamsObj = snap.val();
      const teams =  Object.keys(teamsObj)
        .map(key =>{
          return Object.assign({key},teamsObj[key])
        })
        .sort((a,b) => a.name.localeCompare(b.name))
        
      this.setState(prevState => ({teams}));
    })
  }

  render() {
    const {selected,teams} = this.state
    const team = teams.filter(team => team.name === selected)[0];
    return (
      <div className="fx-col">
        <div className="tabs is-toggle tabs-list-container">
          <ul className="tabs-list">
            { this.state.teams.map((team)=>{
              return (
                <li key={team.key} 
                  className={(selected === team.name ? 'is-active':'')}
                  onClick={() =>this.selectTeam(team.name)}>
                  <a>
                    <figure className="image is-32x32 fx-row fx-a-c fx-j-c">
                      <img src={team.badge} alt=""/>
                    </figure>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="players-list">
          { 
            this.state.players.map((player,i)=>{
              return (<PlayerCard key={player.key} team={team} player={player} uid={this.state.uid}/>);
            })
          }
        </div>
      </div>
    );
  }

  selectTeam(name){
    this.getPlayers(name);
    this.setState(prevState => ({
      selected: name
    }));
  }

  getPlayers(name){
    let players = [];
    const playerRef = firebase.database().ref('players').orderByChild('team').equalTo(name);
    playerRef.on('value',snap =>{
      const playerObj = snap.val();
      if(playerObj){
         players =  Object.keys(playerObj)
          .map(key =>{
            return Object.assign({key,},playerObj[key])
          })
      }
      
      this.setState(prevState => ({players}));
    })
  }
}
