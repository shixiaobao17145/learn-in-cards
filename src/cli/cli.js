let sentences = require('../data/new900_jichu.json');
let inquirer = require('inquirer');
var chalkPipe = require('chalk-pipe');

let modeSwitcher = {
    'zh':'en',
    'en':'zh'
}
let showSentence = (idx, mode='zh') => {
    let sentence = sentences.splice(idx,1)[0];
    let A = sentence[mode];
    let idxMatched = sentence['en'].match(/(\d+).*?\w.*?$/);
    let idxStr='';
    if(idxMatched && idxMatched[1].trim()){
        idxStr = idxMatched[1].trim();
    }
    let q = {
        type:'input',
        name:'question'+idx,
        message:(idxStr?(idxStr+'. '):'') + 'How to express: ' + chalkPipe('#00c3f1.bold')(A)
    }
    inquirer.prompt(q).then(ans=>{
        let targetMode = modeSwitcher[mode];
        let B = sentence[targetMode];
        if(targetMode=='en'){
            B = B.replace(/(\d+.*?)(\w.*?$)/,(a,b,c)=>(c));
        }
        console.log(`\nYou can say: ${chalkPipe('green.bold')(B)}\n`);
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
    choices: ['zh->en', 'en-zh']
};
inquirer.prompt(modePrompt).then(ans=>{
    let mode = ans.mode.split('->')[0];
    showSentence(startIdx,mode);
});