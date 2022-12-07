const leftArrow = document.querySelector('.help__arrow.leftArrow');
const rightArrow = document.querySelector('.help__arrow.rightArrow');

const helpContent = document.querySelectorAll('.help__contentBx');

let currentIndex = 0;
let changingContent = false;


leftArrow.addEventListener('click', () => {
    if(!changingContent){
        changingContent = true;
    
        helpContent[currentIndex].style.animation = "helpAniLeftOut 400ms ease-in-out forwards";
    
        currentIndex--
    
        if(helpContent.length === currentIndex){
            currentIndex = 0;
        }
        else if(currentIndex < 0){
            currentIndex = (helpContent.length - 1);
        }
    
        helpContent[currentIndex].style.animation = "helpAniLeftIn 400ms ease-in-out forwards";

        setTimeout(() => {
            changingContent = false;
        }, 500);
    }
})

rightArrow.addEventListener('click', () => {
    if(!changingContent){
        changingContent = true
    
        helpContent[currentIndex].style.animation = "helpAniRightOut 400ms ease-in-out forwards";
    
        currentIndex++
    
        if(helpContent.length === currentIndex){
            currentIndex = 0;
        }
        else if(currentIndex < 0){
            currentIndex = (helpContent.length - 1);
        }
    
        helpContent[currentIndex].style.animation = "helpAniRightIn 400ms ease-in-out forwards";

        setTimeout(() => {
            changingContent = false;
        }, 500);
    }
})