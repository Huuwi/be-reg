khi truy cập vào url api/getNewAccessToken phải gửi lên 2 giá trị :
-thứ nhất là refesh token
-thứ 2 là 1 verifyCode : là sha256(userName + randomnumber + secrect_key)
-thứ 3 randomnumber // công thức tạo : Date.now() + Math.random()
-thứ 4 là rsn //rsaNumber tạo bằng công thức Date.now() + Math.random()
-thứ 5 là rsne // chính là rsn sau khi đã được mã hóa bằng khóa công khai RSA

server tiến hành kiểm tra verifyCode bằng cách :
-từ refesh token lấy ra userId
-từ userId lấy ra user trong DB
-từ user lấy ra username
-lấy ra verifyCode từ req.body
-lấy rsn và rsne trong req.body

-return ( sha256(userName + randomnumber + secrect_key) ==  verifyCode && rsne == RSA(rsn) )


//login Haui

-lấy mã sinh viên và mật khẩu từ username