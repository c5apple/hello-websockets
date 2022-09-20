$(function () {
  const video = document.getElementById("video")
  document.getElementById('rec').addEventListener('click', () => {
    // navigator.mediaDevices.getUserMedia('video', startCapture_, error_);

    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    }).then((stream) => {
      // console.log(stream);
      video.srcObject = stream;
      video.play();
      startCapture_(stream);

    }).catch(e => {
      console.log(e)
    });
  });

  function startCapture_(stream) {
    // video要素に対して、カメラからのストリームを設定
    // video.src = stream;

    // 30fpsでJPEG画像を取得
    timer = setInterval(function () {
      try {
        // キャンバスノードの生成
        // var cvs = document.createElement('canvas');
        var cvs = document.getElementById('canvas');
        // cvs.width = video.width;
        // cvs.height = video.height;
        var ctx = cvs.getContext('2d');

        // キャンバスに描画
        ctx.drawImage(video, 0, 0, 480, 480, 0, 0, cvs.width, cvs.height);

        // DataURLを取得し、イベントを発行する
        var data = cvs.toDataURL('image/jpeg');
        // console.log(data);
        $(window).trigger("imageupdate", data);
      } catch (e) {
        // エラー時
        error_(e);
      }
    }, 33);
  }
  $(window).bind("imageupdate", function (e, data) {
    // カメラ画像をWebSocketで送信する
    socket.emit("stream", data);
  });
  function error_(e) {
    console.error(e);
  }
  var out = document.getElementById("out");
  var msg = document.getElementById("msg");
  var btn = document.getElementById("btn");
  var cnt = document.getElementById("cnt");
  var socket = io();
  btn.addEventListener("click", (e) => {
    socket.emit("post_message", msg.value);
  });
  socket.on("recv_message", (message) => {
    out.innerText += message + "\n";
    msg.value = "";
    msg.focus();
  });
  socket.on('count', count => {
    cnt.innerText = count;
  });

  const ids = new Set();

  socket.on('welcome', id => {
    if (socket.id !== id && !ids.has(id)) {
      const $tmp = $($('#video_tmp').html());
      $tmp.find('img').attr('id', 'videoout-' + id);
      $('#videos').append($tmp);
    }
    ids.add(id);
  });
  socket.on('byebye', id => {
    ids.delete(id);
    $('#videoout-' + id).closest('div').remove(); // s6
  });

  socket.on('stream', (stream) => {
    const [id, s] = stream.split(':::');
    const $out = $('#videoout-' + id);
    if ($out.length > 0) {
      $out.attr('src', s);
    }
  });
});
