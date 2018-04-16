$(function () {
    console.log(document.getElementsByTagName('head')[0].style.display = 'block')
    // productImgMethod()
    function productImgMethod() {
        if (getQueryString('identitycode')) {
            var qrCodeimgUrl = window.location.protocol + '//' + window.location.host + "/telegram/index.html?identitycode=" +getQueryString('identitycode');
        } else {
            window.location.href = window.location.protocol + '//' + window.location.host + "/telegram/index.html"
        }

        var qrcode = $('.qrCode-img-container').qrcode({
            // render: "canvas", //也可以替换为table
            correctLevel:0,
            width: 100,
            height: 100,
            text: qrCodeimgUrl/*可以通过ajax请求动态设置*/
        }).hide();
        //将生成的二维码转换成图片格式
        var canvas = qrcode.find('canvas').get(0);
        $('#qrcodeImg').attr('src', canvas.toDataURL('image/jpg'));
        // htmlFomatCanvasMethod() ;
        imgMethodAjax() ;
        $(document).click(function (event) {
            event.preventDefault();
        }) ;
    }
   function htmlFomatCanvasMethod() {
       html2canvas($("#userActiveSelf"), {
           }).then(function (canvas) {
               $("#userActiveSelf").hide();
               var image = $("#tuiguangImg");
               image.attr({src: canvas.toDataURL("image/jpg")});
           });
   }
    imgMethodAjax()

    function imgMethodAjax() {
       $.ajax({
           url: '../../genposter',
           type: 'post',
           data: {
               identitycode: getQueryString('identitycode')
           },
           success: function(res){
               console.log(JSON.stringify(res));
               $('#tuiguangImg').attr('src', '../../poster/'+res.path);
               // $('#tuiguangImg').attr('src', 'http://192.168.1.141:8890/poster/'+res.path);
           },
           error: function(err){
               console.log(err);
           }
       });
   }
});