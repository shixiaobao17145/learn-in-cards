let sentences = require('../data/new900_jichu.json');
let inquirer = require('inquirer');
var chalkPipe = require('chalk-pipe');

let modeSwitcher = {
    'zh':{
        B:'en',
        questionPrefix:'How to express: ',
        answerPrefix:'You can say: '
    },
    'en':{
        B:'zh',
        questionPrefix:'What\'s the mean of: ',
        answerPrefix:'You can translate it into: '
    }
}
let trimIdxPrefix = (txt)=>{
    return txt.replace(/(\d+.*?)(\w.*?$)/, (a, b, c) => (c));
}
let showSentence = (idx, mode='zh') => {
    let sentence = sentences.splice(idx,1)[0];
    let A = trimIdxPrefix(sentence[mode]);
    let idxMatched = sentence['en'].match(/(\d+).*?\w.*?$/);
    let idxStr='';
    if(idxMatched && idxMatched[1].trim()){
        idxStr = idxMatched[1].trim();
    }
    let q = {
        type:'input',
        name:'question'+idx,
        message:(idxStr?(idxStr+'. '):'') + modeSwitcher[mode].questionPrefix + chalkPipe('#00c3f1.bold')(A)
    }
    inquirer.prompt(q).then(ans=>{
        let targetMode = modeSwitcher[mode].B;
        let B = trimIdxPrefix(sentence[targetMode]);
        
        console.log(`\n${modeSwitcher[mode].answerPrefix}${chalkPipe('green.bold')(B)}\n`);
        if(!sentences.length)return;
        inquirer.prompt({
            type:'confirm',
            message:'Continue?',
            name:'isContinue',
            default:true
        }).then(ans=>{
            if(ans.isContinue){
                showSentence(idx, mode);
            }
        });
    });
}

let startIdx = 0;
sentences = sentences.slice(startIdx);
startIdx = 0;
var modePrompt = {
    type: 'list',
    name: 'mode',
    message: 'Which mode do you want to perform?',
    choices: ['zh->en', 'en->zh']
};
inquirer.prompt(modePrompt).then(ans=>{
    let mode = ans.mode.split('->')[0];
    showSentence(startIdx,mode);
});