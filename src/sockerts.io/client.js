$(function () {
  const video = document.getElementById("video")
  $('#rec').on('click', function () {
    $(this).addClass('fill');
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

  const socket = io();
  $('#frm_msg').on('submit', function () {
    socket.emit("post_message", $('#msg').val());
    $('#msg').val('');
    return false;
  });
  socket.on("recv_message", (message) => {
    const [id, msg] = message.split(':::');
    const $span1 = $('<span>', {
      style: 'background-color:' + changeColor(id),
      html: id,
    });
    const $span2 = $('<span>', {
      html: msg,
    });
    console.log($span1.prop('outerHTML'));
    console.log($span2.prop('outerHTML'));
    $('#out').append($('<div>', {
      class: 'row',
      html: $span1.prop('outerHTML') + $span2.prop('outerHTML'),
    }));
  });
  socket.on('count', count => {
    $('#cnt').html(count);
  });

  const ids = new Set();

  socket.on('welcome', id => {
    if (socket.id !== id && !ids.has(id)) {
      const $tmp = $($('#video_tmp').html());
      $tmp.find('img').attr('id', 'videoout-' + id);
      $tmp.find('.name').html(id);
      $('#videos').append($tmp);
    } else {
      $('#videos').find('.name').eq(0).html(id);;
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

  function changeColor(str) {
    const n = Array.from(str).map(ch => ch.charCodeAt(0)).reduce((a, b) => a + b);
    const colorAngle = (n * n) % 360;
    return `hsl(${colorAngle}, 80%, 64%)`;
  }
});
