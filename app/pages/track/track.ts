// Copyright (c) 2016 Tracktunes Inc

import {
    Component
} from '@angular/core';

import {
    formatTime
} from '../../services/utils/utils';

import {
    AudioPlayer
} from '../../components/audio-player/audio-player';

// import {
//     TreeNode
// } from '../../services/idb/idb-fs'

// const treeNode: TreeNode = {
//     name: '2016-7-13 -- 7:04:20 PM',
//     parentKey: 2,
//     timeStamp: 1468451068739,
//     data: {
//         dbStartKey: 1,
//         nSamples: 378112,
//         sampleRate: 44100,
//         startTime: 1
//     }
// };

/**
 * @name TrackPage
 * @description
 */
@Component({
    templateUrl: 'build/pages/track/track.html',
    directives: [AudioPlayer]
})
export class TrackPage {
    private fileName: string;
    private folderPath: string;
    private title: string;
    private dateCreated: string;
    private size: number;
    private samplingRate: number;
    private encoding: string;
    private nSamples: number;
    private duration: number;
    private displayDuration: string;

    /**
     * TrackPage constructor
     */
    constructor() {
        console.log('constructor():TrackPage');
        this.fileName = '2016-07-09 - 12:00 AM';
        this. folderPath = '/Unfiled';
        this.title = this.fileName;
        this.dateCreated = this.fileName;
        this.size = 30123;
        this.samplingRate = 44100;
        this.encoding = 'audio/wav';
        this.nSamples = 1561;
        this.duration = 4.3;
        this.displayDuration = formatTime(this.duration, this.duration);
    }

    /**
     * UI callback handling cancellation of this modal
     * @returns {void}
     */
    public onClickCancel(): void {
        console.log('onClickCancel()');
    }
}
