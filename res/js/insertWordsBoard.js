import boardWords from "./wordsBoard.js";

const boardContentBx = document.querySelector('.board__content');

boardWords.forEach((word) => {
    let badGrammar = word.badGrammar;
    let badSpeach = word.badSpeach;
    let correctGrammar = word.correctGrammar;
    let correctSpeach = word.correctSpeach;

    let boardContentHtml = `
        <div class="board__bx">
            <div class="board__left board__text">
                <p class="board__badGrammar board__grammar">${badGrammar}</p>
                <p class="board__badSpeach board__speach">${badSpeach}</p>
            </div>
            <p class="board__vs">vs</p>
            <div class="board__right board__text">
                <p class="board__correctGrammar board__grammar">${correctGrammar}</p>
                <p class="board__correctSpeach board__speach">${correctSpeach}</p>
            </div>
        </div>
    `;

    boardContentBx.insertAdjacentHTML('beforeend', boardContentHtml)
})