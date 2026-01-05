let catName;
let qNum = document.querySelector('.info .quiz-num span');
let answersCont = document.querySelector('.answers');
let subbut = document.querySelector('input[type="submit"]');
let spansBullets;
let rank = document.querySelector('.finish .rank');
let timeLeft;
let countdownAudio = document.querySelector('.countdown-audio');

let qIndex = 0;
let rightAnswers = 0;
let allQuestions = [];
let questions = [];

setTimeout(() => {
    document.querySelector('.splash').classList.add('hidden');
}, 1000)

addCats([['algorithms_practical', 'خوارزميات'], ['microprocessor_practical', 'معالج مصغر']]);

document.querySelector('.start').onclick = () => {
    document.querySelector('.slide-audio').play();
    document.querySelector('.content').style.left = '0';
    let ctgrInps = Array.from(document.querySelectorAll('.ctgrs input'));
    let categorySpn = document.querySelector('.info .category span');
    ctgrInps.forEach((c) => {
        if (c.checked) {
            catName = c.dataset.cat.split(',')[0];
            categorySpn.innerHTML = c.dataset.cat.split(',')[1];
        }
    })
    getQuestions();
    document.querySelector('.choose-ctgr').remove();
}

function addCats(cats) {
    for (let i = 0; i < cats.length; i++) {
        let label = document.createElement('label');
    
        let catInp = document.createElement('input');
        catInp.setAttribute('type', 'radio');
        catInp.setAttribute('name', 'ctgr');
        catInp.dataset.cat = cats[i];
        if (i === 0) catInp.checked = true;
        label.appendChild(catInp);
            
        let dv = document.createElement('div');
        dv.innerHTML = cats[i][1];
        label.appendChild(dv);

        document.querySelector('.ctgrs').appendChild(label);
    }
}

function getQuestions() {
    fetch(`JSON/${catName}_questions.json`)
        .then(res => res.json())
        .then(data => {
            allQuestions = data;

            startNewQuiz();
        });
}

function startNewQuiz() {
    shuffle(allQuestions);
    questions = allQuestions.slice(0, 2); // عدد الأسئلة

    qNum.innerHTML = questions.length;
    document.querySelector('.bullets').innerHTML = '';
    createBullets(questions.length);

    qIndex = 0;
    rightAnswers = 0;

    document.querySelector('.question h2').innerHTML = '';
    answersCont.innerHTML = '';

    document.querySelector('form').style.display = 'block';
    document.querySelector('.finish').style.display = 'none';

    addData(questions[qIndex]);
}

function createBullets (num) {
    for (let i = 0; i < num; i++) {
        let spn = document.createElement('span');
        document.querySelector('.bullets').appendChild(spn);
        if (i === 0) spn.classList.add('on');
        spansBullets = Array.from(document.querySelectorAll('.bullets span'))
    }
}

function addData(obj) {
    timer(20);
    document.querySelector('.question h2').append(obj.title);
    let shf = [1, 2, 3, 4];
    shuffle(shf);
    
    for (let i = 0; i < 4; i++) {
                
        let ans = document.createElement('div');
        ans.className = 'answer';
        
        let inp = document.createElement('input');
        inp.setAttribute('type', 'radio');
        inp.setAttribute('name', 'answers');
        inp.setAttribute('id', `answer_${shf[i]}`);
        inp.dataset.answer = obj[`answer_${shf[i]}`];
        ans.appendChild(inp);

        let label = document.createElement('label');
        label.htmlFor = `answer_${shf[i]}`;
        label.append(obj[`answer_${shf[i]}`]);
        ans.appendChild(label);
        
        answersCont.appendChild(ans);
    }
}

function resetData() {
    document.querySelector('.question h2').innerHTML = '';
    answersCont.innerHTML = '';
}

subbut.onclick = (e) => {
    clearInterval(timeLeft);
    countdownAudio.pause();
    countdownAudio.currentTime = 0;
    e.preventDefault();
    checkAns(questions[qIndex]);
    subbut.style.display = 'none';
    setTimeout(() => {
        qIndex++;
        if (qIndex < questions.length) {
            resetData();
            addData(questions[qIndex]);
            spansBullets[qIndex].className = 'on';
        } else {
            document.querySelector('form').style.display = 'none';
            addResult(questions.length);
            settingTime(0);
        }
        subbut.style.display = 'block';
    }, 1500)
}

function checkAns(obj) {
    let checked = false;
    document.getElementsByName('answers').forEach(ans => {
        if (ans.dataset.answer === obj.correct_ans) {
            ans.classList.add('right');
        }
        if (ans.checked) {
            checked = true;
            if (ans.dataset.answer === obj.correct_ans) {
                rightAnswers++;
                spansBullets[qIndex].className = 'right';
                document.querySelector('.right-audio').play();
            } else {
                spansBullets[qIndex].className = 'wrong';
                ans.classList.add('wrong');
                document.querySelector('.wrong-audio').play();
            }
        }
    });
    if(!checked) {
        document.getElementsByName('answers').forEach(ans => {
            if (ans.dataset.answer === obj.correct_ans) {
                ans.classList.add('right');
            } else {
                spansBullets[qIndex].className = 'wrong';
                ans.classList.add('wrong');
                document.querySelector('.wrong-audio').play();
            }
        })
    }
}

function addResult(from) {
    document.querySelector('.finish').style.display = 'block';
    document.querySelector('.result').classList.add('apear');
    document.querySelector('.finish .r-ans').innerHTML = rightAnswers;
    document.querySelector('.finish .all-ans').innerHTML = from;
    let per = Math.ceil(rightAnswers * 100 / from);
    rank.innerHTML = `${per}%`;
    if (per >= 60) {
        if(rank.classList.contains('failed')) rank.classList.remove('failed');
        rank.classList.add('passed');
        document.querySelector('.tada-audio').play();
    } else {
        if(rank.classList.contains('passed')) rank.classList.remove('passed');
        rank.classList.add('failed');
        document.querySelector('.fail-audio').play();
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function timer(sec) {
    settingTime(sec);
    sec > 0 ? sec-- : subbut.click();
    timeLeft = setInterval(() => {
        settingTime(sec);
        sec > 0 ? sec-- : subbut.click();
    }, 1000)
}

function settingTime(sec) {
    if (sec === 3) countdownAudio.play();
    let minutes = Math.floor(sec / 60);
    let seconds = Math.floor(sec % 60);
    document.querySelector('.min').innerHTML = minutes > 9 ? minutes : `0${minutes}`;
    document.querySelector('.sec').innerHTML = seconds > 9 ? seconds : `0${seconds}`;
    document.querySelector('.more-info .time').style.color = sec > 3 ? 'black' : 'rgb(182, 8, 8)';
}

document.querySelector('.again').onclick = () => {
    startNewQuiz();
};