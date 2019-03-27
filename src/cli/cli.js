const data = require('../data/new900_jichu3.json');
let inquirer = require('inquirer');
var chalkPipe = require('chalk-pipe');

let modeSwitcher = {
    'zh': {
        B: 'en',
        questionPrefix: 'How to express: ',
        answerPrefix: 'You can say: '
    },
    'en': {
        B: 'zh',
        questionPrefix: 'What\'s the mean of: ',
        answerPrefix: 'You can translate it into: '
    }
}
let trimIdxPrefix = (txt) => {
    return txt.replace(/(\d+.*?)(\w.*?$)/, (a, b, c) => (c));
}
let showSentence = (sentences, mode, idx = 0, cb) => {
    sentences = sentences.slice(0);
    let sentence = sentences.splice(idx, 1)[0];
    let A = trimIdxPrefix(sentence[mode]);
    let idxMatched = sentence['en'].match(/(\d+).*?\w.*?$/);
    let idxStr = '';
    if (idxMatched && idxMatched[1].trim()) {
        idxStr = idxMatched[1].trim();
    }
    let q = {
        type: 'input',
        name: 'question' + idx,
        message: (idxStr ? (idxStr + '. ') : '') + modeSwitcher[mode].questionPrefix + chalkPipe('#00c3f1.bold')(A)
    }
    inquirer.prompt(q).then(ans => {
        let targetMode = modeSwitcher[mode].B;
        let B = trimIdxPrefix(sentence[targetMode]);

        console.log(`\n${modeSwitcher[mode].answerPrefix}${chalkPipe('green.bold')(B)}\n`);
        if (!sentences.length) {
            console.log("==========You've finished learning current list==========\n");
            if (cb) {
                cb();
            }
        } else {
            continuePrompter().then(ans => {
                if (ans.isContinue) {
                    showSentence(sentences, mode, idx, cb);
                }
            });
        }
    });
}

function continuePrompter(cfg) {
    return inquirer.prompt(Object.assign({
        type: 'confirm',
        message: 'Continue?',
        name: 'isContinue',
        default: true
    }, cfg));
}

function modePrompter() {
    var modePrompt = {
        type: 'list',
        name: 'mode',
        message: 'Which mode do you want to perform?',
        choices: ['zh->en', 'en->zh'],
        filter: val => {
            return val.split('->')[0];
        }
    };
    return inquirer.prompt(modePrompt);
}

function selectionSelectorPrompter(items, mode) {
    var prompt = {
        type: 'rawlist',
        name: 'selected_item',
        message: 'Which lesson do you want to learn?',
        choices: items.map(item => item.titles[0][mode]),
        default: 0
    };
    return inquirer.prompt(prompt);
}

function learningPerformer(mode, items, idx, cb) {
    showSentence(items, mode, idx, cb);
}

function main() {
    modePrompter().then((ans) => {
        //take one sample from data to testfy
        let sample = data[0];

        let mode = ans.mode;
        if (Object.keys(sample).some(key => Object.keys(modeSwitcher).indexOf(key) < 0)) {
            // if it is not a standart object which contains all the keys(mostly like a/b or zh/en),
            // then we suppose it must have `titles` and `contents` two keys, and the real a/b or zh/en items 
            // located in `contents` of each item
            let performer = () => {
                selectionSelectorPrompter(data, mode).then((selected) => {
                    let idx = data.findIndex(item => item.titles[0][mode] == selected.selected_item);
                    return learningPerformer(mode, data[idx].contents, 0, () => {
                        continuePrompter({ message: 'Do you want continue to learn other lessons?' }).then(c => {
                            if (c.isContinue) {
                                performer();
                            }
                        });
                    });
                });
            }

            performer();
        } else {
            learningPerformer(mode, data);
        }
    });
}


main();