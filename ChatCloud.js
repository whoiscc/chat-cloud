import { LiveWS } from 'bilibili-live-ws';
import { Segment, useDefault } from 'segmentit';
import Deque from 'double-ended-queue';
import WordCloud from 'wordcloud';


window.addEventListener('load', function () {
    const live = new LiveWS(92613);
    live.on('live', function () {
        console.log('login to room')
        const cut_chats = new Deque(3000);
        for (let i = 0; i < 3000; i += 1) {
            cut_chats.push([]);
        }
        const words_count = {};
        const segmentit = useDefault(new Segment());
        const canvas = document.querySelector('#cloud')
        live.on('DANMU_MSG', function (data) {
            const chat = data.info[1];
            const cut_chat = segmentit.doSegment(chat);
            for (let { w: word } of cut_chat) {
                if (!words_count[word]) {
                    words_count[word] = 0;
                }
                words_count[word] += 1;
            }
            const evicted = cut_chats.shift();
            for (let word of evicted) {
                words_count[word] -= 1;
            }
            cut_chats.push(cut_chat);
            console.log(words_count)
            WordCloud(canvas, { list: Object.entries(words_count), shuffle: false, shrinkToFit: true, weightFactor: 20 })
        })
    })
})