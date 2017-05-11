import React, { Component } from 'react';
import * as firebase from 'firebase';
import twemoji from 'twemoji'; 

import './App.css';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      teams:[],
      selected: 'null',
    };
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
  selectTeam(name){
    this.setState(prevState => ({
      selected: name
    }));
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
      </div>
    );
  }
}
