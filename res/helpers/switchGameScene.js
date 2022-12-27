export function switchGameScene(){
    const home = document.getElementById('home');
    const game = document.getElementById('game');
    const homeTwoDRenderer = document.querySelector('.homeTwoDRenderer');
    const brumbalHealthBar = document.querySelector('.brumbalHealth__bx');
    const gameSection = document.querySelector('.gameSection');


    let homeDisplay = window.getComputedStyle(home, null).display;


    if(homeDisplay === "block"){
        home.style.display = "none";
        game.style.display = "block";

        homeTwoDRenderer.style.display = "none";
        brumbalHealthBar.style.display = "block";
    }
    else{
        home.style.display = "block";
        game.style.display = "none";

        gameSection.classList.remove('playerWin', 'gameIsOver');

        homeTwoDRenderer.style.display = "block";
        brumbalHealthBar.style.display = "none";
    }
}