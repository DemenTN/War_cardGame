//TO-DO
//would like to add some local storage(to the deck id)
//add css and end game conditions
//localStorage.setItem('deckid', its value)
//localStorage.getItem


let deckId = ''
document.querySelector('.dealCards').addEventListener('click', splitDeck)

fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
.then(res => res.json()) 
.then(data => {
  deckId = data.deck_id
})
.catch(err => {
    console.log(`error ${err}`)
});


function splitDeck(){
  let player1CardArray=[]
  let player1CardString=''
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=26`)
  .then(res => res.json()) 
  .then(data => {
    for(let i=0;i<data.cards.length;i++){
      player1CardArray.push(data.cards[i].code)
    }
    player1CardString = player1CardArray.join()

    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/add/?cards=${player1CardString}`)
    .then(res => res.json()) 
    
  })

  let player2CardArray=[]
  let player2CardString=''
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=26`)
  .then(res => res.json()) 
  .then(data => {
    for(let i=0;i<data.cards.length;i++){
      player2CardArray.push(data.cards[i].code)
    }
    player2CardString = player2CardArray.join()
   
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/player2Pile/add/?cards=${player2CardString}`)
    .then(res => res.json()) 

  })

}


document.querySelector('.playRound').addEventListener('click', draw)

//Used a global variable for the draw function because recursion was resetting the value to 0 everytime when block scoped in the function
let spoilsOfWar = [];
function draw(){

  //this sometimes doesn't work and only draws player 1, may be due to too many requests to the API?
  Promise.all([
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/draw/?count=1`),
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/player2Pile/draw/?count=1`)
  ])
  .then(function (responses) {
    
    return Promise.all(responses.map(function (response) {
      return response.json();
    }));
  }).then(data => {

 document.querySelector('#player1').src=data[0].cards[0].image
 document.querySelector('#player2').src=data[1].cards[0].image

let player1Card = data[0].cards[0].code
let player2Card = data[1].cards[0].code

let player1Val = convertToNum(data[0].cards[0].value)
let player2Val = convertToNum(data[1].cards[0].value)

///////////////    PLayer1 win conditions     /////////////////////
if(player1Val>player2Val) {

  document.querySelector('h3').innerText = 'Player 1 Wins'

  if(spoilsOfWar.length !== 0){
    let spoils=spoilsOfWar.join();
    console.log(spoils)
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/add/?cards=${spoils}`)
    .then(res => res.json()) 
    spoilsOfWar=[];
  }

  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/add/?cards=${player1Card},${player2Card}`)
.then(res => res.json()) 

///////////////    PLayer2 win conditions     /////////////////////
} else if (player1Val < player2Val) {

  document.querySelector('h3').innerText = 'Player 2 Wins'

  if(spoilsOfWar.length !== 0){
    let spoils=spoilsOfWar.join();
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/add/?cards=${spoils}`)
    .then(res => res.json())
    spoilsOfWar=[];
  }

  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/player2Pile/add/?cards=${player1Card},${player2Card}`)
.then(res => res.json())

///////////////            WAR!        /////////////////////
} else {

  document.querySelector('h3').innerText = 'WAR!'

  //push first 2 cards of same value to a win pile which is an array called spoilsOfWar
  spoilsOfWar.push(player1Card,player2Card)
  //draw 2 'face-down' cards and add to win pile 
  Promise.all([
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/player1Pile/draw/?count=1`),
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/player2Pile/draw/?count=1`)
  ])
  .then(function (responses) {
    return Promise.all(responses.map(function (response) {
      return response.json();
    }));
  }).then(data => {
    
    spoilsOfWar.push(data[0].cards[0].code,data[1].cards[0].code)
  
  })
  
  //recursive call: draws 2, compares
  // if winner: gets spoilsOfWar 
  //if tie again, loops till winner
  draw()

}
})

.catch(err => {
    console.log(`error ${err}`)
});

}

//////////////////    Callback function: used only once     ///////////////////////////
function convertToNum(val) {
if(val ==='ACE') {
  return 14
}else if (val === 'KING'){
  return 13
}else if (val === 'QUEEN') {
  return 12
}else if (val === 'JACK') {
  return 11
}else  {
  return Number(val)
}
}
