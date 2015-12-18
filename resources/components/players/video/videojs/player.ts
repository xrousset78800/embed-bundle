/// <reference path="../../../../embed/embed.d.ts" />
/**
 * VideoJS Player for Embed Videos
 */

// require('html5shiv');
(<any>window).HELP_IMPROVE_VIDEOJS = false;
let videojs = require('../../../../../node_modules/video.js/dist/video.js');


import * as _ from 'underscore';
import ConfigService from '../../../embed/config/service';
import ResizeEl from '../../../utils/resizeEl';
let playerTemplate:any = require('./player.html');

export default class VideoPlayer {
    private configService;
    private resourceOriginalWidth;
    private resourceOriginalHeight;
    private $embedContainer;
    private $embedVideoResource;
    private resizer;
    private $playerContainer;
    constructor() {
        this.configService = new ConfigService();

        let videoContainers =  document.getElementsByClassName('video-player'); //$('.video-player');
        this.$playerContainer = videoContainers[0];
        this.$playerContainer.insertAdjacentHTML('afterbegin', playerTemplate( this.configService.get('resource') ));

        this.$embedContainer = document.getElementById('embed-content'); //$('#embed-content');
        this.$embedVideoResource = document.getElementById('embed-video'); //$('#embed-video');

        this.resourceOriginalWidth = this.configService.get('resource.width');
        this.resourceOriginalHeight = this.configService.get('resource.height');

        this.resizer = new ResizeEl({
            target: this.$embedVideoResource,
            container: this.$embedContainer,
            resizeOnWindowChange: this.configService.get('resource.fitIn') === true ? true : false,
            resizeCallback: (dimensions) => {
                this.$playerContainer.style.width = dimensions.width + 'px';
                this.$playerContainer.style.height = dimensions.height + 'px';

                this.$playerContainer.firstChild.style.width = dimensions.width + 'px';
                this.$playerContainer.firstChild.style.height = dimensions.height + 'px';
                // this.$playerContainer.setAttribute('style', 'width: '+dimensions.width+'px; height: '+dimensions.height+'px');
                // this.$playerContainer.firstChild.setAttribute('style', 'width: '+dimensions.width+'px; height: '+dimensions.height+'px');
            }
        });
        this.resizer.setContainerDimensions({
            width:  <any>window.innerWidth,
            height: <any>window.innerHeight
        });
        this.resizer.setTargetDimensions({
            width:  this.resourceOriginalWidth,
            height: this.resourceOriginalHeight
        });
        this.resizer.resize();

        this.setupVideo();

    }

    setupVideo() {
        let aspectRatio = this.configService.get('resource.aspectRatio'),
            options: VideoJSOptions = {
            playbackRates: [],
            fluid: true
        };

        if( this.configService.get('resource.aspectRatio') !== null ) {
            options.aspectRatio = this.configService.get('resource.aspectRatio');
        }

        if( this.configService.get('resource.autoplay') !== null ) {
            options.autoplay = this.configService.get('resource.autoplay');
        }

        if( this.configService.get('resource.playbackRates') !== null ) {
            options.playbackRates = this.configService.get('resource.playbackRates');
        }

        options.techOrder = ['html5', 'flash'];

        (<any>options).flash = {
            swf: '/assets/vendors/alchemy-embed-medias/players/videojs/video-js.swf'
        };

        let player: VideoJSPlayer = this.initVideo('embed-video', options, () => {

            let metadatas = player.on('loadedmetadata', () => {

                let videoWidth = this.$embedVideoResource.videoWidth,
                    videoHeight = this.$embedVideoResource.videoHeight;

                if (videoWidth > 0 && videoHeight > 0) {
                    this.resizer.setTargetDimensions({
                        width: videoWidth,
                        height: videoHeight
                    });
                    this.resizer.resize();
                }
            });

        });
    }

    initVideo(...args): VideoJSPlayer {
        return (<any>videojs).apply(this, args);
    }
}
(<any>window).embedPlugin = new VideoPlayer();
