khi truy cập vào url api/getNewAccessToken phải gửi lên các giá trị :
-thứ 1 là refesh token //trong cookie
-thứ 2 là 1 verifyCode : là sha256(rdn + secrect_key) //trong req.body
-thứ 3 rdn // công thức tạo : Date.now() + Math.random() //trong req.body
-thứ 4 là rsn //rsaNumber tạo bằng công thức Date.now() + Math.random() //trong req.body
-thứ 5 là rsne // chính là rsn sau khi đã được mã hóa bằng khóa công khai RSA //trong req.body

server tiến hành kiểm tra verifyCode bằng cách :
-từ refesh token lấy ra userId
-từ userId lấy ra user trong DB
-từ user lấy ra username
-lấy ra verifyCode từ req.body
-lấy rsn và rsne trong req.body

-return ( sha256(  rdn + secrect_key) ==  verifyCode && rsne == RSA(rsn) )


//login Haui

-lấy mã sinh viên và mật khẩu từ username
-get token_url
-đăng nhập bằng token_url lấy về enKC = services.encodeAES( JSON.stringify({ Cookie, kverify }) );
-set vào Cookie cho client, client đăng ký thì {Cookie,kverify} = services.decodeAES( JSON.parse(req.cookies.enKC) );


//refund

-thêm thuộc tính tên HAUI cho bảng classRegisted // done
-FE gửi yêu cầu backend trả dữ liệu về, loại bỏ studentCode và userId // done

-giao diện FE cho phép người dùng đăng nhập tài khoản , mật khẩu HAUi để refund tiền
-người dùng nhập tài khoản mật khẩu haui bấm refund
-BE:

-truy vấn bảng registedHaui lấy ra dữ liệu của bản ghi có id bằng id và userId = userId đc gửi lên {moduleCode , classCode , className , time}
-nếu không tìm thấy bản ghi hợp lệ , báo userId và id môn học không khớp
-kiểm tra nêu refund rồi thì k làm gì cả , trả về là đã refund vs message là : "cheat"


-lấy tài khoản mật khẩu HAUi thực hiện login HAUI , sau đó lấy dữ liệu môn học đã đăng ký (5-50 đối tượng là căng)

-tìm mảng môn học thỏa mãn : trùng tên module(mc = moduleCode) , trùng mã lớp (cc = classCode) , trùng tên lớp (cn = className)
-từ mảng đó , tìm ra phần tử có thời gian gần date.now nhất (dùng hàm chuyển định dạng tm dang date.now() , find((e) => {return e = Min(classesInfor.map((el) => { return abs(servcies.convert(el.tm) - time) }) )  }) )
-check status xem có đăng ký thành công chưa , nếu chưa thì refund cho userId , nếu rồi thì bỏ qua
-chuyển is refund thành true
