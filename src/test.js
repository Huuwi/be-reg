const axios = require("axios")


const main = async () => {
    let apiKey = "AK_CS.eb37917083ed11ef92ba87773ecade6b.dR34Nndd3FsxExokokSV0kaN32gWo2nmQXRvPkIrRdQdCuklGL39ahJ6mDxhsODV1Ko4OUaI"
    let url = "https://oauth.casso.vn/v2/transactions?fromDate=2021-04-01&toDate=2024-10-10"
    await axios.get(url, {
        headers: {
            Authorization: `apikey ${apiKey}`,
            "Content-Type": "application/json"
        }
    })
        .then((res) => {
            console.log(res.data.data.records);

        })
}

main()