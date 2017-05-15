import React, { Component } from 'react';
import twemoji from 'twemoji'; 
import './PlayerCard.css';
import * as firebase from 'firebase';

export default class PlayerCard extends Component {
    emojis = [
        {id:'poo',value:'💩'},
        {id:'thumbsDown',value:'👎'},
        {id:'thinking',value:'🤔'},
        {id:'ok',value:'👌'},
        {id:'starPlayer',value:'🌟'},
        {id:'worldClass',value:'🌎'}
    ];

    missingImage = "https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/250x250/Photo-Missing.png"
    
    constructor(props) {
        super(props);
        const { player,team } = this.props;
        this.state = {
            selected: null,
            player,
            team,
            errored: false
        };
    }

    componentDidMount(){
        const {player} = this.state
        const ratingRef = firebase.database().ref(`players/${player.key}/ratings`);
        const userRatingRef = firebase.database().ref(`userRatings/${this.props.uid}/${player.key}/`)
        
        ratingRef.on('child_changed',(snap) =>{
            this.setState(prevState => {
                const {player} = prevState;
                const ratings = Object.assign({},player.ratings);
                
                ratings[snap.key] = snap.val();
                player.ratings = ratings
                
                return {player};
            });
        })
        userRatingRef
            .orderByChild('createdAt')
            .limitToLast(1)
            .once('value',(snap) =>{
                let rating = null;
                if(snap.val()){
                    const key = Object.keys(snap.val())[0];
                    rating =  key ? snap.val()[key].rating : null;
                }

            this.setState(prevState => ({
                selected:rating
            }));
        })
        twemoji.parse(document.body);
    }

    render() {
        const { player, selected, team } = this.state;
        return (
            <div className="player-card card">
                <div className="card-content">
                    <div className="media">
                        <div className="media-left">
                            <figure className="image is-96x96">
                                { this.state.errored ? 
                                   <img  src={this.missingImage} alt=""/>
                                    :
                                    <img onError={() =>this.handleError()} src={player.photo} alt=""/>
                                }
                            </figure>
                        </div>
                        <div className="media-content">
                            <p className="title is-5">{player.firstName} {player.lastName}</p>
                            <p className="subtitle is-6">{player.position}</p>
                        </div>
                    </div>
                </div>
                <footer className="card-footer">
                    { this.emojis.map((emoji)=>{
                    return (
                        <button key={emoji.id} className={"button card-footer-item  is-large fx-col fx-j-c emoji-btn "+
                        (selected === emoji.id ? 'is-active is-primary':'')}
                        onClick={ () =>this.handleClick(emoji.id)}
                        >
                            <span className="icon u-margin-0"><i>{emoji.value}</i></span>
                            {this.renderCount(selected,player.ratings[emoji.id] || 0)}
                        </button>
                    )
                    }) 
                }
                </footer>
            </div>
        );
    }

    handleClick(id){  
        this.setState(prevState => {
            const {player,selected} = prevState;
            const ratings = Object.assign({},player.ratings);
            
            ratings[id]++;
            if(ratings[selected] > 0){
                ratings[selected]--;
            }
            
            player.ratings = ratings
            var updates = {
                new:id,
            };
            var refs ={
                player:`/players/${player.key}/ratings`,
                user:`/userRatings/${this.props.uid}/${player.key}`
            }

            if(selected){
                updates.old = selected;
            }
            
            this.updateRating(player,refs,updates);
            
            return {selected: id, player};
        });
    }

    updateRating(player,refs,updates){
       
        firebase.database().ref(refs.player).transaction(ratings =>{
            if(ratings){
                ratings[updates.new]++;
                if(updates.old){
                    ratings[updates.old]--;
                    ratings[updates.old] = ratings[updates.old] < 0 ? 0 : ratings[updates.old] ;
                }   
            }

            return ratings;
        });


        firebase.database().ref(refs.user).push({
            rating: updates.new,
            createdAt:firebase.database.ServerValue.TIMESTAMP
        });
    }

    renderCount(selected,amount = 0){
        return (selected) ?
            <span className="tag is-small vote-count">{amount}</span>
            :
            <span></span>
    }

    handleError() {
        this.setState(prevState => {
            return {errored: true}
        });
    }
}
