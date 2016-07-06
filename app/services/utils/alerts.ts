// Copyright (c) 2016 Tracktunes Inc

import {
    Alert
} from 'ionic-angular';

/**
 * Helper function to pop up questions and act upon user choice
 * @param {string} question
 * @param {string} button1Text
 * @param {() => void} action1
 * @param {string} button2Text
 * @param {() => void} action2
 * @returns {Alert}
 */
export function askAndDo(
    question: string,
    button1Text: string,
    action1: () => void,
    button2Text?: string,
    action2?: () => void
): Alert {
    'use strict';

    console.log('askAndDo(' + question + ')');
    // console.log('question: ' + question);
    // console.log('button1Text: ' + button1Text);
    // console.log('action1: ' + action1);
    // console.log('button2Text: ' + button2Text);
    // console.log('action2: ' + action2);

    let alert: Alert = Alert.create();

    alert.setTitle(question);

    if (!action2) {
        alert.addButton('Cancel');
    }

    alert.addButton({
        text: button1Text,
        handler: action1
    });

    if (action2) {
        alert.addButton({
            text: button2Text,
            handler: action2
        });
        alert.addButton('Cancel');
    }

    return alert;
}
