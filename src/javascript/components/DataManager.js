class DataManager {

    constructor() {
        this.ui = {
            videos: document.querySelectorAll('.js-video'),
        }
        this.data = {};
        this._setup();
    }

    _setup() {
        this._setupVideos();
    } 

    _setupVideos() {
        for (let i = 1; i <= this.ui.videos.length; i++) {
            this.data[`video-${i}`] = [];
        }
    }

    _getAgeAndGender(data) {
        if (this.data.age && this.data.gender) return;
        this.data.age = data.age;
        this.data.gender = {
            gender: data.gender,
            genderProbability: data.genderProbability
        };
    }

    pushData(video, data) {
        if (!data) return;
        console.log('recording');
        this._getAgeAndGender(data);

        let videoData = {
            progress: video.currentTime,
            emotions: data.expressions,
            landmarks: data.landmarks,
            unshiftedLandmarks: data.unshiftedLandmarks
        }

        this.data[video.classList[0]].push(videoData);
    }

    sendData() {  
        console.log('send', this.data);
        fetch("http://localhost:5000/score",
          {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({ name: 'Test', score: this.data})
          })
      }

}
 
export default DataManager;