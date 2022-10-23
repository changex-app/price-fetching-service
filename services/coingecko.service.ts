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
                if(response) {
                    data = response.data;
                }
            })
            .catch(error => {
                throw new Error(`GET: ${url} ERROR: ${error.message}`);
            })
        return data
    }
}
