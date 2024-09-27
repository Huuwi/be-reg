khi truy cập vào url api/getNewAccessToken phải gửi lên 2 giá trị :
-thứ 1 là refesh token //trong cookie
-thứ 2 là 1 verifyCode : là sha256(userName + randomnumber + secrect_key) //trong req.body
-thứ 3 randomnumber // công thức tạo : Date.now() + Math.random() //trong req.body
-thứ 4 là rsn //rsaNumber tạo bằng công thức Date.now() + Math.random() //trong req.body
-thứ 5 là rsne // chính là rsn sau khi đã được mã hóa bằng khóa công khai RSA //trong req.body

server tiến hành kiểm tra verifyCode bằng cách :
-từ refesh token lấy ra userId
-từ userId lấy ra user trong DB
-từ user lấy ra username
-lấy ra verifyCode từ req.body
-lấy rsn và rsne trong req.body

-return ( sha256(userName + randomnumber + secrect_key) ==  verifyCode && rsne == RSA(rsn) )


//login Haui

-lấy mã sinh viên và mật khẩu từ username
-get token_url
-đăng nhập bằng token_url lấy về enKC = services.encodeAES( JSON.stringify({ Cookie, kverify }) );
-set vào Cookie cho client, client đăng ký thì {Cookie,kverify} = services.decodeAES( JSON.parse(req.cookies.enKC) );


