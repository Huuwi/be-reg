// Lấy thời gian hiện tại
let now = new Date(Date.now());

console.log(now);

// Hàm định dạng
function formatDate(date) {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    let year = date.getFullYear();
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// Chuyển đổi
let formattedDate = formatDate(now);
console.log(formattedDate);
