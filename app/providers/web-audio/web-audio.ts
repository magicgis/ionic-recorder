import {Injectable} from 'angular2/core';


// NOTE: currently this only works in the latest versions of Firefox
// because Chrome/Chromium cannot handle AudioDestinationNode streams yet


@Injectable()
export class WebAudio {
    // 'instance' is used as part of Singleton pattern implementation
    private static instance: WebAudio = null;

    private audioContext: AudioContext;
    private audioGainNode: AudioGainNode;
    private mediaRecorder: MediaRecorder;
    private analyserNode: AnalyserNode;
    private analyserBuffer: Uint8Array;
    private analyserBufferLength: number;
    private sourceNode: MediaElementAudioSourceNode;
    private blobChunks: Blob[];

    private playbackSource: AudioBufferSourceNode;

    onStop: (blob: Blob) => void;

    /**
     * constructor
     */
    constructor() {
        console.log('constructor():WebAudio');
        this.blobChunks = [];
        this.initAudio();
    }

    /**
     * Access the singleton class instance via WebAudio.Instance
     * @returns {WebAudio} the singleton instance of this class
     */
    static get Instance() {
        if (!this.instance) {
            this.instance = new WebAudio();
        }
        return this.instance;
    }

    /**
     * Initialize audio, get it ready to record
     * @returns {void}
     */
    initAudio() {
        // this.audioContext = new OfflineAudioContext(1, 1024, 44100);
        // OfflineAudioContext unfortunately doesn't work with MediaRecorder
        this.audioContext = new AudioContext();

        if (!this.audioContext) {
            throw Error('AudioContext not available!');
        }

        console.log('SAMPLE RATE: ' + this.audioContext.sampleRate);

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {
            throw Error('mediaDevices.getUserMedia not available!');
        }

        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            .then((stream: MediaStream) => {
                this.initAndConnectNodes(stream);
            })
            .catch((error: any) => {
                // alert('getUserMedia() - ' + error.name + ' - ' + error.message);
                throw Error('getUserMedia() - ' + error.name + ' - ' + error.message);
            });
    }

    /**
     * Create new MediaRecorder and set up its callbacks
     * @param {MediaStream} stream the stream obtained by getUserMedia
     * @returns {void}
     */
    initMediaRecorder(stream: MediaStream) {
        if (!MediaRecorder) {
            alert('MediaRecorder not available!');
            throw Error('MediaRecorder not available!');
        }

        if (MediaRecorder.isTypeSupported('audio/wav')) {
            console.log('audio/wav SUPPORTED!!!!!!!');
        }
        else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            console.log('audio/ogg SUPPORTED!!!!!!!');
        }
        else if (MediaRecorder.isTypeSupported('audio/mp3')) {
            console.log('audio/mp3 SUPPORTED!!!!!!!');
        }
        else if (MediaRecorder.isTypeSupported('audio/m4a')) {
            console.log('audio/m4a SUPPORTED!!!!!!!');
        }
        else if (MediaRecorder.isTypeSupported('audio/webm')) {
            console.log('audio/webm SUPPORTED!!!!!!!');
        }
        else {
            console.log('UNSUPPORTED !!!!!!!!!!!');
            console.dir(MediaRecorder.isTypeSupported);
            console.log(MediaRecorder.isTypeSupported);
        }

        this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm'
        });

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            // console.log('ondataavailable()');
            this.blobChunks.push(event.data);
        };

        this.mediaRecorder.onstop = (event: Event) => {
            console.log('mediaRecorder.onStop() Got ' + this.blobChunks.length + 'chunks');
            if (!this.onStop) {
                throw Error('WebAudio:onStop() not set!');
            }

            let blob: Blob = new Blob(this.blobChunks, {
                type: 'audio/webm'
            });

            this.onStop(blob);

            this.blobChunks = [];
        };
    }

    /**
     * Create Analyser and Gain nodes and connect them to a 
     * MediaStreamDestination node, which is fed to MediaRecorder
     * @param {MediaStream} stream the stream obtained by getUserMedia
     * @returns {void}
     */
    initAndConnectNodes(stream: MediaStream) {
        console.log('WebAudio:initAndConnectNodes()');

        // create the gainNode
        this.audioGainNode = this.audioContext.createGain();

        // create and configure the analyserNode
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.analyserBufferLength = this.analyserNode.frequencyBinCount;
        this.analyserBuffer = new Uint8Array(this.analyserBufferLength);

        // create a source node out of the audio media stream
        this.sourceNode = this.audioContext.createMediaStreamSource(stream);

        // create a destination node
        let dest: MediaStreamAudioDestinationNode =
            this.audioContext.createMediaStreamDestination();

        // sourceNode (microphone) -> gainNode
        this.sourceNode.connect(this.audioGainNode);

        // gainNode -> destination
        this.audioGainNode.connect(dest);

        // gainNode -> analyserNode
        this.audioGainNode.connect(this.analyserNode);

        // this.initMediaRecorder(stream);
        this.initMediaRecorder(dest.stream);
    }

    /**
     * Compute the current latest buffer frame max volume and return it
     * @returns {number} max volume in range of [0,128]
     */
    getBufferMaxVolume() {
        if (!this.analyserNode) {
            return 0;
        }

        let i: number, bufferMax: number = 0, absValue: number;
        this.analyserNode.getByteTimeDomainData(this.analyserBuffer);
        for (i = 0; i < this.analyserBufferLength; i++) {
            absValue = Math.abs(this.analyserBuffer[i] - 128.0);
            if (absValue > bufferMax) {
                bufferMax = absValue;
            }
        }
        // console.log('WebAudio:getBufferMaxVolume(): ' + bufferMax);
        return bufferMax;
    }

    /**
     * Set the multiplier on input volume (gain) effectively changing volume
     * @param {number} factor fraction of volume, where 1.0 is no change
     * @returns {void}
     */
    setGainFactor(factor: number) {
        if (!this.audioGainNode) {
            throw Error('GainNode not initialized!');
        }
        this.audioGainNode.gain.value = factor;
    }

    /**
     * Are we recording right now?
     * @returns {boolean} whether we are recording right now
     */
    isRecording() {
        return this.mediaRecorder &&
            (this.mediaRecorder.state === 'recording');
    }

    /**
     * Is MediaRecorder state inactive now?
     * @returns {boolean} whether MediaRecorder is inactive now
     */
    isInactive() {
        return !this.mediaRecorder ||
            this.mediaRecorder.state === 'inactive';
    }

    /**
     * Start recording
     * @returns {void}
     */
    startRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (1)');
        }
        this.mediaRecorder.start();
    }

    /**
     * Pause recording
     * @returns {void}
     */
    pauseRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (2)');
        }
        this.mediaRecorder.pause();
    }

    /**
     * Resume recording
     * @returns {void}
     */
    resumeRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (3)');
        }
        this.mediaRecorder.resume();
    }

    /**
     * Stop recording
     * @returns {void}
     */
    stopRecording() {
        if (!this.mediaRecorder) {
            throw Error('MediaRecorder not initialized! (4)');
        }
        this.mediaRecorder.stop();
    }
}
