import axios from "axios";

export class CoingeckoService {

    public async getCoingeckoData(url: string): Promise<any>{
        let data;
        let urlConfig = {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic`
            }
        }
        await axios.get(url, urlConfig)
            .then((response)=> {
                data = response.data;
            })
            .catch(error => {
                console.log(error.message)
            })
        return data
    }
}
