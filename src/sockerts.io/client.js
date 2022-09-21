$(function () {
  const $video = $('#video');
  let mystream;
  $('#rec').on('click', function () {

    const isActive = $(this).hasClass('fill');
    $(this).toggleClass('fill', !isActive);

    if (isActive) {
      mystream.getTracks()[0].stop();
    } else {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      }).then((stream) => {
        $video[0].srcObject = mystream = stream;
        $video[0].play();
        startCapture_(stream);
      }).catch(e => {
        console.error(e);
      });
    }
  });

  $('#fps').on('input', function () {
    $('#label_fps').html($(this).val() + 'fps');
  });

  let timer;
  function startCapture_(stream) {
    let fps = Number($('#fps').val());
    timer = setInterval(function () {
      if (Number($('#fps').val()) !== fps) {
        clearInterval(timer);
        return startCapture_(stream);
      }
      try {
        const cvs = document.createElement('canvas');
        cvs.width = 480;
        cvs.height = 480;
        const ctx = cvs.getContext('2d');
        ctx.drawImage($video[0], 0, 0, 480, 480, 0, 0, 480, 480);

        socket.emit('stream', cvs.toDataURL('image/jpeg'));
      } catch (e) {
        console.error(e);
      }
    }, 1000 / fps);
  }

  const socket = io();
  $('#frm_msg').on('submit', function () {
    socket.emit('post_message', $('#msg').val());
    $('#msg').val('');
    return false;
  });
  socket.on('recv_message', (message) => {
    const [id, msg] = message.split(':::');
    const $span1 = $('<span>', {
      style: 'background-color:' + changeColor(id),
      html: id.substring(0, 10),
    });
    const $span2 = $('<span>', {
      html: msg,
    });
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
    const $span = $('<span>', {
      class: 'truncate',
      style: 'color:' + changeColor(id),
      html: id.substring(0, 10),
    });
    if (socket.id !== id && !ids.has(id)) {
      const $tmp = $($('#video_tmp').html());
      $tmp.find('img').attr('id', 'videoout-' + id);
      $tmp.find('.name').html($span.prop('outerHTML'));

      $('#videos').append($tmp);
    } else {
      $('#videos').find('.name').eq(0).html($span.prop('outerHTML'));
    }
    ids.add(id);

    $('#toast_welcome').find('.name').html(id.substring(0, 10),);
    ui('#toast_welcome');
  });
  socket.on('byebye', id => {
    ids.delete(id);
    $('#videoout-' + id).closest('div').remove(); // s6

    $('#toast_byebye').find('.name').html(id.substring(0, 10),);
    ui('#toast_byebye');
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
